/**
 * DynamoDB Service
 * 
 * Handles reading telemetry data from AWS DynamoDB.
 * The bridge sends raw MAVLink data, we transform it to match our Telemetry type.
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

// Get credentials from environment variables (for local development)
// In production (EKS), credentials come from IAM role
const getAwsConfig = () => {
  const region = import.meta.env.VITE_AWS_REGION || 'us-east-1';
  
  // For browser/local dev: use explicit credentials from env vars
  const accessKeyId = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
  const secretAccessKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;
  
  const config: any = {
    region,
  };
  
  // Only add credentials if they're provided (for local dev)
  // In production (EKS), AWS SDK will use IAM role automatically
  if (accessKeyId && secretAccessKey) {
    config.credentials = {
      accessKeyId,
      secretAccessKey,
    };
    // Debug: Log that credentials are being used (only first time)
    if (!(window as any).__aws_creds_logged) {
      console.log('🔑 Using AWS credentials from .env file');
      console.log('🔑 Access Key ID:', accessKeyId.substring(0, 8) + '...');
      (window as any).__aws_creds_logged = true;
    }
  } else {
    console.warn('⚠️ No AWS credentials found in .env file. Will use IAM role (EKS) or default credential chain.');
  }
  
  return config;
};

const dynamoClient = DynamoDBDocumentClient.from(
  new DynamoDBClient(getAwsConfig())
);

const TABLE_NAME = import.meta.env.VITE_DYNAMODB_TABLE || 'drone-telemetry';

export interface DynamoDBTelemetryItem {
  timestamp: number;
  messageId?: number;
  sysid?: number;
  compid?: number;
  data: {
    type: 'battery' | 'altitude' | 'state' | string;
    timestamp: number;
    [key: string]: any; // Type-specific fields
  };
}

/**
 * Get the latest telemetry from DynamoDB
 * Returns the latest item of each type (battery, altitude, state) to build complete telemetry
 * 
 * Note: Using Scan with Limit=100 to get recent items, then grouping by type.
 * For better performance with large tables, consider adding a GSI with timestamp as sort key.
 */
export async function getLatestTelemetry(): Promise<DynamoDBTelemetryItem[]> {
  try {
    // Scan to get recent items
    const result = await dynamoClient.send(new ScanCommand({
      TableName: TABLE_NAME,
      Limit: 100, // Get more items to find latest of each type
    }));

    if (result.Items && result.Items.length > 0) {
      // Sort by timestamp descending
      const sorted = result.Items.sort((a, b) => {
        const aTime = (a.data?.timestamp || a.timestamp || 0) as number;
        const bTime = (b.data?.timestamp || b.timestamp || 0) as number;
        return bTime - aTime;
      });
      
      // Group by type and get the latest of each type
      const latestByType = new Map<string, DynamoDBTelemetryItem>();
      
      for (const item of sorted) {
        const itemData = item.data || item;
        const type = itemData.type || 'unknown';
        
        // Only keep the latest item of each type
        if (!latestByType.has(type)) {
          latestByType.set(type, item as DynamoDBTelemetryItem);
        }
        
        // Stop once we have all three main types
        if (latestByType.has('battery') && latestByType.has('altitude') && latestByType.has('state')) {
          break;
        }
      }
      
      const items = Array.from(latestByType.values());
      
      // Log first successful fetch for debugging
      if (!(window as any).__dynamodb_first_fetch) {
        console.log('✅ Successfully fetched from DynamoDB. Found types:', Array.from(latestByType.keys()));
        console.log('📊 Sample items:', items.slice(0, 3).map(i => ({ type: i.data?.type, timestamp: i.data?.timestamp || i.timestamp })));
        (window as any).__dynamodb_first_fetch = true;
      }
      
      return items;
    }
    
    return [];
  } catch (error) {
    console.error('❌ Error fetching telemetry from DynamoDB:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    return [];
  }
}

/**
 * Transform multiple DynamoDB items (by type) into a single Telemetry object
 * Combines battery, altitude, and state messages into complete telemetry
 */
export function transformMavlinkToTelemetry(items: DynamoDBTelemetryItem[]): any {
  // Log raw data structure for debugging (only first time)
  if (!(window as any).__dynamodb_logged && items.length > 0) {
    console.log('📊 Raw DynamoDB data structure:', JSON.stringify(items, null, 2));
    (window as any).__dynamodb_logged = true;
  }
  
  // Extract data from each type
  const batteryData = items.find(item => item.data?.type === 'battery')?.data;
  const altitudeData = items.find(item => item.data?.type === 'altitude')?.data;
  const stateData = items.find(item => item.data?.type === 'state')?.data;
  
  // Get the most recent timestamp from all items
  const timestamps = items.map(item => item.data?.timestamp || item.timestamp || 0);
  const latestTimestamp = Math.max(...timestamps, Date.now());
  
  // Extract battery information
  const batteryRemaining = batteryData?.remaining;
  const batteryVoltage = batteryData?.voltage;
  // Use remaining percentage if available, otherwise estimate from voltage (16.2V ≈ 100%, 12V ≈ 0%)
  const batteryPercent = batteryRemaining !== undefined 
    ? batteryRemaining 
    : batteryVoltage 
      ? Math.max(0, Math.min(100, ((batteryVoltage - 12) / 4.2) * 100))
      : 100;
  
  // Extract altitude information
  const relativeAlt = altitudeData?.relative;
  const amslAlt = altitudeData?.amsl;
  // Convert string to number if needed
  const altitude = relativeAlt !== undefined 
    ? (typeof relativeAlt === 'string' ? parseFloat(relativeAlt) : relativeAlt)
    : amslAlt !== undefined
      ? (typeof amslAlt === 'string' ? parseFloat(amslAlt) : amslAlt)
      : 0;
  
  // Extract state information
  const armed = stateData?.armed ?? false;
  const mode = stateData?.mode ?? 0;
  
  // Map mode number to flight mode string (common MAVLink modes)
  const modeMap: Record<number, string> = {
    0: 'STABILIZE',
    1: 'ACRO',
    2: 'ALT_HOLD',
    3: 'AUTO',
    4: 'GUIDED',
    5: 'LOITER',
    6: 'RTL',
    7: 'CIRCLE',
    8: 'LAND',
    9: 'OF_LOITER',
    10: 'TAKEOFF',
  };
  const flightMode = modeMap[mode] || `MODE_${mode}`;
  
  // Default position (you may need to get this from a GPS message type)
  // For now, using defaults - you can add a 'position' or 'gps' type later
  const defaultLat = 37.7749;
  const defaultLon = -122.4194;
  
  return {
    droneId: `drone-${items[0]?.sysid || 1}`,
    timestamp: latestTimestamp,
    position: {
      lat: defaultLat,
      lon: defaultLon,
      alt: altitude,
    },
    velocity: {
      vx: 0, // Not available in current message types
      vy: 0,
      vz: 0,
    },
    attitude: {
      roll: 0, // Not available in current message types
      pitch: 0,
      yaw: 0,
    },
    battery: Math.max(0, Math.min(100, batteryPercent)),
    flightMode: flightMode,
    armed: Boolean(armed),
  };
}


/**
 * API Service
 * 
 * Calls the Lambda/API Gateway endpoint instead of DynamoDB directly.
 * This is the secure way to access DynamoDB from a browser application.
 */

import type { Telemetry } from '@/types/telemetry';

// API Gateway URL - set via environment variable or use default
const API_URL = import.meta.env.VITE_API_URL || 'https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/telemetry';

/**
 * Get the latest telemetry from the API Gateway endpoint
 */
export async function getLatestTelemetry(): Promise<Telemetry | null> {
  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Log first successful fetch for debugging
    if (!(window as any).__api_first_fetch) {
      console.log('✅ Successfully fetched from API Gateway');
      console.log('📊 Telemetry data:', data);
      (window as any).__api_first_fetch = true;
    }
    
    return data.telemetry || null;
  } catch (error) {
    console.error('❌ Error fetching telemetry from API:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    return null;
  }
}

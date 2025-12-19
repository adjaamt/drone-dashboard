/**
 * useDynamoDB Hook
 * 
 * Custom React hook for polling telemetry from DynamoDB.
 * Polls every 2 seconds for latest telemetry data.
 */

import { useEffect, useState } from 'react';
import { getLatestTelemetry, transformMavlinkToTelemetry } from '@/services/dynamodb';
import type { Telemetry } from '@/types/telemetry';

export function useDynamoDB() {
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let isMounted = true;

    const pollTelemetry = async () => {
      try {
        const items = await getLatestTelemetry();
        
        if (!isMounted) return;

        if (items && items.length > 0) {
          // Transform multiple items (by type) into single Telemetry format
          const transformed = transformMavlinkToTelemetry(items);
          setTelemetry(transformed);
          setIsConnected(true);
          setError(null);
        } else {
          // No data yet, but connection is working (table exists, just empty)
          setIsConnected(true);
          setError(null);
          // Keep existing telemetry if available, don't clear it
        }
      } catch (err) {
        if (!isMounted) return;
        
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        setIsConnected(false);
        console.error('Error polling DynamoDB:', err);
      }
    };

    // Poll immediately, then every 2 seconds
    pollTelemetry();
    intervalId = setInterval(pollTelemetry, 2000);

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  return {
    telemetry,
    isConnected,
    error,
  };
}


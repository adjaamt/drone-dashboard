/**
 * useDynamoDB Hook
 * 
 * Custom React hook for polling telemetry from API Gateway (which calls Lambda -> DynamoDB).
 * Polls every 2 seconds for latest telemetry data.
 */

import { useEffect, useState } from 'react';
import { getLatestTelemetry } from '@/services/api';
import type { Telemetry } from '@/types/telemetry';

export function useDynamoDB() {
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;
    let isMounted = true;

    const pollTelemetry = async () => {
      try {
        const data = await getLatestTelemetry();
        
        if (!isMounted) return;

        if (data) {
          // API already returns transformed telemetry
          setTelemetry(data);
          setIsConnected(true);
          setError(null);
        } else {
          // No data yet, but connection is working
          setIsConnected(true);
          setError(null);
          // Keep existing telemetry if available, don't clear it
        }
      } catch (err) {
        if (!isMounted) return;
        
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        setIsConnected(false);
        console.error('Error polling API:', err);
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


/**
 * useWebSocket Hook
 * 
 * Custom React hook for managing WebSocket connections.
 * Automatically handles connection lifecycle and provides telemetry data.
 */

import { useEffect, useState, useCallback } from 'react';
import type { Telemetry, Alert } from '@/types/telemetry';
import { mockWebSocket } from '@/services/mockWebSocket';
import { webSocket } from '@/services/websocket';

const useMock = import.meta.env.VITE_USE_MOCK === 'true' || !import.meta.env.VITE_WS_ENDPOINT;
const wsService = useMock ? mockWebSocket : webSocket;

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  useEffect(() => {
    const handleStatus = (data: { status: string }) => {
      setIsConnected(data.status === 'connected');
    };

    const handleTelemetry = (data: Telemetry) => {
      setTelemetry(data);
      setLastUpdate(Date.now());
    };

    const handleAlertTriggered = (data: Alert) => {
      setAlerts((prev) => [data, ...prev.filter((a) => a.alertId !== data.alertId)]);
    };

    const handleAlertResolved = (data: Alert) => {
      setAlerts((prev) =>
        prev.map((alert) =>
          alert.alertId === data.alertId ? { ...alert, resolved: true, resolvedAt: data.resolvedAt } : alert
        )
      );
    };

    wsService.on('system_status', handleStatus);
    wsService.on('telemetry_update', handleTelemetry);
    wsService.on('alert_triggered', handleAlertTriggered);
    wsService.on('alert_resolved', handleAlertResolved);

    wsService.connect();

    return () => {
      wsService.off('system_status', handleStatus);
      wsService.off('telemetry_update', handleTelemetry);
      wsService.off('alert_triggered', handleAlertTriggered);
      wsService.off('alert_resolved', handleAlertResolved);
      wsService.disconnect();
    };
  }, []);

  const sendCommand = useCallback(
    async (command: string, parameters?: Record<string, any>): Promise<void> => {
      await wsService.sendCommand(command, parameters);
    },
    []
  );

  return {
    isConnected,
    telemetry,
    alerts,
    lastUpdate,
    sendCommand,
  };
}


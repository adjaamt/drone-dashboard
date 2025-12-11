/**
 * API Service
 * 
 * Handles REST API calls to the backend for commands and other operations.
 * This will be used when the backend is available.
 */

import type { Command, CommandAck } from '@/types/telemetry';

const API_BASE_URL = import.meta.env.VITE_API_ENDPOINT || 'http://localhost:3000/api/v1';

export async function sendCommand(
  droneId: string,
  command: string,
  parameters?: Record<string, any>
): Promise<CommandAck> {
  try {
    const response = await fetch(`${API_BASE_URL}/command`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        droneId,
        command,
        parameters,
      } as Command),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending command:', error);
    throw error;
  }
}

export async function getTelemetryHistory(
  droneId: string,
  startTime?: number,
  endTime?: number
) {
  try {
    const params = new URLSearchParams({ droneId });
    if (startTime) params.append('startTime', startTime.toString());
    if (endTime) params.append('endTime', endTime.toString());

    const response = await fetch(`${API_BASE_URL}/telemetry?${params}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching telemetry history:', error);
    throw error;
  }
}


/**
 * Mock WebSocket Service
 * 
 * This service simulates a real WebSocket connection for development.
 * It emits fake telemetry data at regular intervals to test the UI
 * without needing a backend connection.
 * 
 * Usage: Set REACT_APP_USE_MOCK=true in .env to use this service
 */

import type { Telemetry, Alert, CommandAck } from '@/types/telemetry';

type WebSocketCallback = (data: any) => void;

class MockWebSocketService {
  private listeners: Map<string, Set<WebSocketCallback>> = new Map();
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private isConnected = false;
  private homePosition = { lat: 37.7749, lon: -122.4194 }; // San Francisco

  connect() {
    if (this.isConnected) return;
    
    this.isConnected = true;
    console.log('🔌 Mock WebSocket: Connected');
    
    // Simulate connection delay
    setTimeout(() => {
      this.emit('system_status', { status: 'connected' });
      this.startTelemetryStream();
    }, 500);
  }

  disconnect() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isConnected = false;
    console.log('🔌 Mock WebSocket: Disconnected');
  }

  private startTelemetryStream() {
    let battery = 85;
    let altitude = 0;
    let lat = this.homePosition.lat;
    let lon = this.homePosition.lon;
    let yaw = 0;
    let armed = false;
    let flightMode = 'STABILIZE';

    this.intervalId = setInterval(() => {
      // Simulate drone movement
      const speed = 0.0001; // degrees
      lat += (Math.random() - 0.5) * speed;
      lon += (Math.random() - 0.5) * speed;
      altitude = Math.max(0, altitude + (Math.random() - 0.5) * 2);
      yaw = (yaw + (Math.random() - 0.5) * 5) % 360;
      battery = Math.max(10, battery - 0.01); // Slowly drain battery

      // Simulate arming after a few seconds
      if (!armed && Date.now() % 10000 < 100) {
        armed = true;
        flightMode = 'GUIDED';
      }

      const telemetry: Telemetry = {
        droneId: 'drone-001',
        timestamp: Date.now(),
        position: {
          lat,
          lon,
          alt: altitude,
        },
        velocity: {
          vx: (Math.random() - 0.5) * 5,
          vy: (Math.random() - 0.5) * 5,
          vz: (Math.random() - 0.5) * 2,
        },
        attitude: {
          roll: (Math.random() - 0.5) * 10,
          pitch: (Math.random() - 0.5) * 10,
          yaw,
        },
        battery,
        flightMode,
        armed,
        groundSpeed: Math.sqrt(
          Math.pow((Math.random() - 0.5) * 5, 2) +
          Math.pow((Math.random() - 0.5) * 5, 2)
        ),
        distanceFromHome: this.calculateDistance(
          { lat, lon },
          this.homePosition
        ),
      };

      this.emit('telemetry_update', telemetry);

      // Simulate alerts
      if (battery < 20 && battery > 19.9) {
        this.emit('alert_triggered', {
          alertId: `alert-${Date.now()}`,
          droneId: 'drone-001',
          type: 'BATTERY_LOW',
          severity: 'WARNING',
          timestamp: Date.now(),
          message: 'Battery level is low (20%)',
          resolved: false,
        } as Alert);
      }
    }, 100); // Update every 100ms (10 Hz)
  }

  private calculateDistance(
    pos1: { lat: number; lon: number },
    pos2: { lat: number; lon: number }
  ): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (pos1.lat * Math.PI) / 180;
    const φ2 = (pos2.lat * Math.PI) / 180;
    const Δφ = ((pos2.lat - pos1.lat) * Math.PI) / 180;
    const Δλ = ((pos2.lon - pos1.lon) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  on(event: string, callback: WebSocketCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: WebSocketCallback) {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in ${event} callback:`, error);
      }
    });
  }

  sendCommand(command: string, _params?: any): Promise<CommandAck> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const ack: CommandAck = {
          commandId: `cmd-${Date.now()}`,
          droneId: 'drone-001',
          command,
          status: 'accepted',
          message: `Command ${command} accepted`,
        };
        this.emit('command_ack', ack);
        resolve(ack);
      }, 500);
    });
  }
}

export const mockWebSocket = new MockWebSocketService();


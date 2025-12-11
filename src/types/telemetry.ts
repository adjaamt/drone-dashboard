/**
 * Telemetry Types
 * 
 * This file defines all TypeScript interfaces for drone telemetry data.
 * Used throughout the application for type safety.
 */

export interface Position {
  lat: number;
  lon: number;
  alt: number; // altitude in meters
}

export interface Velocity {
  vx: number; // velocity x component (m/s)
  vy: number; // velocity y component (m/s)
  vz: number; // velocity z component (m/s)
}

export interface Attitude {
  roll: number;  // degrees
  pitch: number; // degrees
  yaw: number;   // degrees
}

export interface Telemetry {
  droneId: string;
  timestamp: number;
  position: Position;
  velocity: Velocity;
  attitude: Attitude;
  battery: number; // percentage (0-100)
  flightMode: string;
  armed: boolean;
  groundSpeed?: number; // calculated from velocity
  distanceFromHome?: number; // calculated distance
}

export interface Alert {
  alertId: string;
  droneId: string;
  type: 'BATTERY_LOW' | 'GEOFENCE_BREACH' | 'CONNECTION_LOST' | 'ALTITUDE_HIGH';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  timestamp: number;
  message: string;
  resolved: boolean;
  resolvedAt?: number;
}

export interface Command {
  droneId: string;
  command: 'ARM' | 'DISARM' | 'TAKEOFF' | 'LAND' | 'RTL' | 'LOITER';
  parameters?: Record<string, any>;
}

export interface CommandAck {
  commandId: string;
  droneId: string;
  command: string;
  status: 'accepted' | 'rejected' | 'executed';
  message: string;
}


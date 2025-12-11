/**
 * Formatter Utilities
 * 
 * Functions for formatting telemetry data for display.
 * Ensures consistent formatting throughout the application.
 */

/**
 * Format coordinates (latitude/longitude) to 6 decimal places
 */
export function formatCoordinate(value: number): string {
  return value.toFixed(6);
}

/**
 * Format altitude in meters, with unit
 */
export function formatAltitude(meters: number): string {
  return `${meters.toFixed(1)} m`;
}

/**
 * Format battery percentage with icon indicator
 */
export function formatBattery(percentage: number): string {
  return `${percentage.toFixed(1)}%`;
}

/**
 * Get battery color based on percentage
 */
export function getBatteryColor(percentage: number): string {
  if (percentage > 50) return 'text-green-400';
  if (percentage > 20) return 'text-yellow-400';
  return 'text-red-400';
}

/**
 * Format velocity in m/s
 */
export function formatVelocity(mps: number): string {
  return `${mps.toFixed(2)} m/s`;
}

/**
 * Format angle in degrees
 */
export function formatAngle(degrees: number): string {
  return `${degrees.toFixed(1)}°`;
}

/**
 * Format distance in meters or kilometers
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters.toFixed(0)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}

/**
 * Format timestamp to readable time
 */
export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString();
}

/**
 * Format timestamp to relative or absolute time
 */
export function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  if (diff < 60000) {
    return 'Just now';
  }
  if (diff < 3600000) {
    const mins = Math.floor(diff / 60000);
    return `${mins}m ago`;
  }
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format flight mode for display
 */
export function formatFlightMode(mode: string): string {
  return mode
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Get alert severity color
 */
export function getAlertColor(severity: 'INFO' | 'WARNING' | 'CRITICAL'): string {
  switch (severity) {
    case 'CRITICAL':
      return 'text-red-400 bg-red-400/10 border-red-400/20';
    case 'WARNING':
      return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    case 'INFO':
      return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    default:
      return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
  }
}


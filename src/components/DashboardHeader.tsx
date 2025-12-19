/**
 * DashboardHeader Component
 * 
 * Professional header with clean design and key metrics.
 */

import { Activity, Signal, Wifi, WifiOff } from 'lucide-react';
import type { Telemetry } from '@/types/telemetry';
import { formatBattery } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface DashboardHeaderProps {
  isConnected: boolean;
  telemetry: Telemetry | null;
}

export function DashboardHeader({ isConnected, telemetry }: DashboardHeaderProps) {
  const currentTime = new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });

  // Use actual armed status from telemetry if state data exists
  // Only default to armed=true for presentation when no state data is available
  const displayArmed = telemetry?.hasStateData === true 
    ? telemetry.armed  // Use actual value from DynamoDB state messages
    : (telemetry?.armed ?? true); // Default to armed for presentation if no state data

  return (
    <div className="h-14 bg-[#161a1f] border-b border-[#2a2f36] flex items-center justify-between px-4 md:px-6 shrink-0">
      {/* Left - Logo & Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary-500/20">
            <Activity className="h-4 w-4 text-primary-400" />
          </div>
          <span className="text-sm font-bold text-white">Drone Surveillance</span>
          <span className="text-sm font-bold text-primary-400">Control Panel</span>
        </div>
      </div>

      {/* Center - Status Pills */}
      <div className="hidden md:flex items-center gap-3">
        {telemetry && (
          <>
            <div className="flex items-center gap-2 bg-[#1c2127] px-3 py-1.5 rounded-full">
              <Signal className="h-3.5 w-3.5 text-primary-400" />
              <span className="text-xs text-gray-300">{telemetry.flightMode}</span>
            </div>
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full",
              displayArmed ? "bg-green-500/20" : "bg-[#1c2127]"
            )}>
              <div className={cn(
                "w-2 h-2 rounded-full",
                displayArmed ? "bg-green-400 animate-pulse" : "bg-gray-500"
              )} />
              <span className={cn(
                "text-xs font-medium",
                displayArmed ? "text-green-400" : "text-gray-400"
              )}>
                {displayArmed ? "Armed" : "Disarmed"}
                {telemetry.hasStateData === false && (
                  <span className="text-gray-500 ml-1" title="Status inferred from altitude">*</span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-[#1c2127] px-3 py-1.5 rounded-full">
              <span className={cn(
                "text-xs font-medium",
                telemetry.battery > 50 ? "text-green-400" : 
                telemetry.battery > 20 ? "text-yellow-400" : "text-red-400"
              )}>
                {formatBattery(telemetry.battery)}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Right - Connection & Time */}
      <div className="flex items-center gap-4">
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full",
          isConnected ? "bg-green-500/20" : "bg-red-500/20"
        )}>
          {isConnected ? (
            <Wifi className="h-3.5 w-3.5 text-green-400" />
          ) : (
            <WifiOff className="h-3.5 w-3.5 text-red-400" />
          )}
          <span className={cn(
            "text-xs font-medium",
            isConnected ? "text-green-400" : "text-red-400"
          )}>
            {isConnected ? "Connected" : "Offline"}
          </span>
        </div>
        <span className="text-sm font-medium text-white">{currentTime}</span>
      </div>
    </div>
  );
}

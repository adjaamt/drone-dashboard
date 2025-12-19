/**
 * ProfessionalTelemetry Component
 * 
 * Ultra-compact grid - icon + value with tooltips.
 * Professional dark design with orange accents.
 */

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Gauge,
  TrendingUp,
  Clock,
  Battery,
  Radio,
  Power,
} from 'lucide-react';
import type { Telemetry } from '@/types/telemetry';
import { formatBattery } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ProfessionalTelemetryProps {
  telemetry: Telemetry | null;
}

const TelemetryItem = ({ icon: Icon, label, value, unit, iconColor = "text-primary-400", highlight = false }: any) => (
  <TooltipProvider delayDuration={100}>
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.03 }}
          className={cn(
            "bg-[#161a1f] border border-[#2a2f36] rounded-xl p-3 cursor-pointer transition-all",
            "hover:border-[#3a4046] hover:bg-[#1c2127]",
            highlight && "border-primary-500/50"
          )}
        >
          <div className="flex items-center gap-2">
            <Icon className={cn("h-4 w-4 flex-shrink-0", iconColor)} />
            <div className="flex items-baseline gap-1">
              <span className="text-base font-bold text-white">{value}</span>
              {unit && <span className="text-xs text-gray-400">{unit}</span>}
            </div>
          </div>
        </motion.div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="bg-[#1c2127] border-[#2a2f36] text-white">
        <p className="text-xs font-medium">{label}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export function ProfessionalTelemetry({ telemetry }: ProfessionalTelemetryProps) {
  // Use actual armed status from telemetry if state data exists
  // Only default to armed=true for presentation when no state data is available
  const displayArmed = telemetry?.hasStateData === true 
    ? telemetry.armed  // Use actual value from DynamoDB state messages
    : (telemetry?.armed ?? true); // Default to armed for presentation if no state data
  
  if (!telemetry) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-[#161a1f] border border-[#2a2f36] rounded-xl p-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-[#2a2f36] animate-pulse" />
              <div className="w-12 h-4 rounded bg-[#2a2f36] animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const flightTime = "5h 34m";
  const groundSpeed = telemetry.groundSpeed || Math.sqrt(
    telemetry.velocity.vx ** 2 + telemetry.velocity.vy ** 2
  );

  const batteryColor = telemetry.battery > 50 
    ? "text-green-400" 
    : telemetry.battery > 20 
      ? "text-yellow-400" 
      : "text-red-400";

  return (
    <div className="grid grid-cols-3 gap-2">
      <TelemetryItem
        icon={Gauge}
        label="Speed"
        value={groundSpeed.toFixed(1)}
        unit="m/s"
      />
      <TelemetryItem
        icon={TrendingUp}
        label="Altitude"
        value={telemetry.position.alt.toFixed(1)}
        unit="m"
      />
      <TelemetryItem
        icon={Clock}
        label="Flight Time"
        value={flightTime}
      />
      <TelemetryItem
        icon={Battery}
        label="Battery"
        value={formatBattery(telemetry.battery)}
        iconColor={batteryColor}
        highlight={telemetry.battery < 30}
      />
      <TelemetryItem
        icon={Radio}
        label="Mode"
        value={telemetry.flightMode}
        iconColor="text-primary-400"
      />
      <TelemetryItem
        icon={Power}
        label="Status"
        value={`${displayArmed ? "ARMED" : "DISARMED"}${telemetry.hasStateData === false ? "*" : ""}`}
        iconColor={displayArmed ? "text-green-400" : "text-gray-400"}
        highlight={displayArmed}
      />
    </div>
  );
}

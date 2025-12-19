/**
 * FullScreenDashboard Component
 * 
 * Professional drone surveillance dashboard with AG.Drone inspired design.
 * Clean layout: Map left, telemetry + controls + alerts right.
 */

import { useDynamoDB } from '@/hooks/useDynamoDB';
import { ProfessionalTelemetry } from './ProfessionalTelemetry';
import { EnhancedMap } from './EnhancedMap';
import { CircularCommandDial } from './CircularCommandDial';
import { CompactAlerts } from './CompactAlerts';
import { DashboardHeader } from './DashboardHeader';

export function FullScreenDashboard() {
  const { isConnected, telemetry } = useDynamoDB();
  const alerts: any[] = []; // Alerts can be added later
  const sendCommand = async (command: string, parameters?: Record<string, any>) => {
    // Command sending will be implemented later
    console.log('Command:', command, parameters);
  };

  // Use actual armed status from telemetry if state data exists
  // Only default to armed=true for presentation when no state data is available
  const displayArmed = telemetry?.hasStateData === true 
    ? telemetry.armed  // Use actual value from DynamoDB state messages
    : (telemetry?.armed ?? true); // Default to armed for presentation if no state data

  const homePosition = telemetry
    ? { lat: telemetry.position.lat - 0.001, lon: telemetry.position.lon - 0.001 }
    : { lat: 37.7749, lon: -122.4194 };

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#0d0f12]">
      {/* Main Content */}
      <div className="h-full w-full flex flex-col relative">
        {/* Header */}
        <DashboardHeader 
          isConnected={isConnected} 
          telemetry={telemetry}
        />

        {/* Main Content Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 overflow-hidden min-h-0">
          {/* Left - Large Map (7 cols) */}
          <div className="col-span-1 lg:col-span-7 min-h-0 overflow-hidden">
            <EnhancedMap 
              telemetry={telemetry} 
              homePosition={homePosition} 
            />
          </div>

          {/* Right Column (5 cols) */}
          <div className="col-span-1 lg:col-span-5 flex flex-col gap-4 min-h-0 overflow-hidden">
            {/* Telemetry Cards - Compact Grid */}
            <div className="flex-shrink-0">
              <ProfessionalTelemetry telemetry={telemetry} />
            </div>

            {/* Bottom Row: Commands (left) + Alerts (right) */}
            <div className="flex-1 grid grid-cols-2 gap-4 min-h-0 overflow-hidden">
              {/* Circular Command Dial */}
              <div className="min-h-0 overflow-hidden">
                <CircularCommandDial
                  onCommand={sendCommand}
                  isConnected={isConnected}
                  isArmed={displayArmed}
                />
              </div>

              {/* Alerts */}
              <div className="min-h-0 overflow-hidden">
                <CompactAlerts alerts={alerts} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

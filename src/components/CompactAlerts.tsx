/**
 * CompactAlerts Component
 * 
 * Professional alerts panel with clean design.
 */

import { AlertCircle, Info, TriangleAlert, XCircle } from 'lucide-react';
import type { Alert } from '@/types/telemetry';
import { formatTimestamp } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

interface CompactAlertsProps {
  alerts: Alert[];
}

const getSeverityStyles = (severity: Alert['severity']) => {
  switch (severity) {
    case 'CRITICAL':
      return {
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        text: 'text-red-400',
        icon: XCircle,
      };
    case 'WARNING':
      return {
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/30',
        text: 'text-yellow-400',
        icon: TriangleAlert,
      };
    case 'INFO':
    default:
      return {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        text: 'text-blue-400',
        icon: Info,
      };
  }
};

export function CompactAlerts({ alerts }: CompactAlertsProps) {
  const activeAlerts = alerts.filter((alert) => !alert.resolved);

  return (
    <div className="h-full bg-[#161a1f] border border-[#2a2f36] rounded-xl p-4 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-primary-400" />
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Alerts</span>
        </div>
        <span className="text-xs text-gray-500">
          {activeAlerts.length} active
        </span>
      </div>

      {/* Alerts List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 min-h-0">
        <AnimatePresence>
          {activeAlerts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-gray-500"
            >
              <Info className="h-6 w-6 mb-2 opacity-50" />
              <p className="text-xs">No active alerts</p>
            </motion.div>
          ) : (
            activeAlerts.map((alert) => {
              const styles = getSeverityStyles(alert.severity);
              const IconComponent = styles.icon;
              
              return (
                <motion.div
                  key={alert.alertId}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={cn(
                    'p-2.5 rounded-lg border',
                    styles.bg,
                    styles.border
                  )}
                >
                  <div className="flex items-start gap-2">
                    <IconComponent className={cn("h-3.5 w-3.5 mt-0.5 flex-shrink-0", styles.text)} />
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-xs font-medium leading-tight", styles.text)}>
                        {alert.message}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-1">
                        {formatTimestamp(alert.timestamp)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * CircularCommandDial Component
 * 
 * Professional circular dial control inspired by AG.Drone interface.
 * Features directional arrows and central power button.
 */

import { useState } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Power,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface CircularCommandDialProps {
  onCommand: (command: string, params?: Record<string, any>) => Promise<void>;
  isConnected: boolean;
  isArmed?: boolean;
}

export function CircularCommandDial({ onCommand, isConnected, isArmed }: CircularCommandDialProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [activeCommand, setActiveCommand] = useState<string | null>(null);

  const handleCommand = async (command: string, params?: Record<string, any>) => {
    if (!isConnected || loading) return;
    setLoading(command);
    setActiveCommand(command);
    try {
      await onCommand(command, params);
    } catch (error) {
      console.error('Command error:', error);
    } finally {
      setLoading(null);
      setTimeout(() => setActiveCommand(null), 200);
    }
  };

  const DirectionalButton = ({ 
    command, 
    icon: Icon, 
    disabled,
    className 
  }: any) => {
    const isActive = activeCommand === command;
    const isLoading = loading === command;
    
    return (
      <motion.button
        whileHover={!disabled ? { scale: 1.1 } : {}}
        whileTap={!disabled ? { scale: 0.9 } : {}}
        onClick={() => handleCommand(command)}
        disabled={disabled}
        className={cn(
          "absolute w-10 h-10 rounded-full flex items-center justify-center",
          "bg-[#2a2f36] hover:bg-[#3a4046] transition-all",
          "text-gray-300 hover:text-white",
          "focus:outline-none focus:ring-2 focus:ring-primary-500/50",
          isActive && "bg-primary-500 text-white",
          disabled && "opacity-40 cursor-not-allowed hover:bg-[#2a2f36]",
          className
        )}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Icon className="h-5 w-5" />
        )}
      </motion.button>
    );
  };

  return (
    <div className="h-full bg-[#161a1f] border border-[#2a2f36] rounded-xl p-4 flex flex-col">
      {/* Title */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Controls</span>
        <div className={cn(
          "w-2 h-2 rounded-full",
          isConnected ? "bg-green-400" : "bg-red-400"
        )} />
      </div>

      {/* Circular Dial */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-40 h-40">
          {/* Outer ring with orange arc */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#2a2f36"
              strokeWidth="4"
            />
            {/* Orange arc indicator */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#f97316"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="70 283"
              strokeDashoffset="0"
              className="transition-all duration-300"
            />
          </svg>

          {/* Inner dark circle */}
          <div className="absolute inset-4 rounded-full bg-[#1c2127] border border-[#2a2f36]" />

          {/* Direction buttons */}
          <DirectionalButton
            command="TAKEOFF"
            icon={ChevronUp}
            disabled={!isConnected || loading !== null}
            className="top-0 left-1/2 -translate-x-1/2"
          />
          <DirectionalButton
            command="LAND"
            icon={ChevronDown}
            disabled={!isConnected || loading !== null}
            className="bottom-0 left-1/2 -translate-x-1/2"
          />
          <DirectionalButton
            command="RTL"
            icon={ChevronLeft}
            disabled={!isConnected || loading !== null}
            className="left-0 top-1/2 -translate-y-1/2"
          />
          <DirectionalButton
            command="LOITER"
            icon={ChevronRight}
            disabled={!isConnected || loading !== null}
            className="right-0 top-1/2 -translate-y-1/2"
          />

          {/* Center ARM/DISARM button */}
          <motion.button
            whileHover={isConnected && !loading ? { scale: 1.1 } : {}}
            whileTap={isConnected && !loading ? { scale: 0.95 } : {}}
            onClick={() => handleCommand(isArmed ? 'DISARM' : 'ARM')}
            disabled={!isConnected || loading !== null}
            className={cn(
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
              "w-14 h-14 rounded-full flex items-center justify-center",
              "transition-all focus:outline-none focus:ring-2",
              isArmed 
                ? "bg-red-500 hover:bg-red-600 focus:ring-red-500/50" 
                : "bg-green-500 hover:bg-green-600 focus:ring-green-500/50",
              "text-white shadow-lg",
              (!isConnected || loading) && "opacity-50 cursor-not-allowed"
            )}
          >
            {loading === 'ARM' || loading === 'DISARM' ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Power className="h-6 w-6" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Command labels */}
      <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] text-gray-500">
        <div className="text-center">↑ Takeoff</div>
        <div className="text-center">↓ Land</div>
        <div className="text-center">← RTL</div>
        <div className="text-center">→ Loiter</div>
      </div>
    </div>
  );
}


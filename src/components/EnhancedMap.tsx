/**
 * EnhancedMap Component
 * 
 * Satellite map using Leaflet with ESRI World Imagery.
 * Professional drone surveillance style.
 */

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Telemetry } from '@/types/telemetry';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom drone icon - orange to match theme
const droneIcon = L.divIcon({
  className: 'drone-marker',
  html: `
    <svg width="40" height="40" viewBox="0 0 40 40" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">
      <circle cx="20" cy="20" r="8" fill="#f97316" stroke="white" stroke-width="2"/>
      <polygon points="20,6 16,14 24,14" fill="#f97316" stroke="white" stroke-width="1.5"/>
      <line x1="8" y1="8" x2="14" y2="14" stroke="white" stroke-width="2"/>
      <line x1="32" y1="8" x2="26" y2="14" stroke="white" stroke-width="2"/>
      <line x1="8" y1="32" x2="14" y2="26" stroke="white" stroke-width="2"/>
      <line x1="32" y1="32" x2="26" y2="26" stroke="white" stroke-width="2"/>
      <circle cx="6" cy="6" r="4" fill="white" fill-opacity="0.9"/>
      <circle cx="34" cy="6" r="4" fill="white" fill-opacity="0.9"/>
      <circle cx="6" cy="34" r="4" fill="white" fill-opacity="0.9"/>
      <circle cx="34" cy="34" r="4" fill="white" fill-opacity="0.9"/>
    </svg>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const homeIcon = L.divIcon({
  className: 'home-marker',
  html: `
    <div style="display: flex; flex-direction: column; align-items: center;">
      <div style="width: 16px; height: 16px; background: #22c55e; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>
      <div style="font-size: 9px; color: white; background: rgba(0,0,0,0.7); padding: 1px 4px; border-radius: 2px; margin-top: 2px;">HOME</div>
    </div>
  `,
  iconSize: [40, 30],
  iconAnchor: [20, 8],
});

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

interface EnhancedMapProps {
  telemetry: Telemetry | null;
  homePosition?: { lat: number; lon: number };
}

export function EnhancedMap({ telemetry, homePosition }: EnhancedMapProps) {
  const [flightPath, setFlightPath] = useState<[number, number][]>([]);

  useEffect(() => {
    if (telemetry) {
      setFlightPath((prev) => {
        const newPath = [...prev, [telemetry.position.lat, telemetry.position.lon] as [number, number]];
        return newPath.slice(-100);
      });
    }
  }, [telemetry]);

  // Default to a nice agricultural area (France farmland) for realistic demo
  const defaultCenter: [number, number] = telemetry
    ? [telemetry.position.lat, telemetry.position.lon]
    : [48.8566, 2.3522]; // Paris area - has nice farmland nearby

  const home: [number, number] | null = homePosition
    ? [homePosition.lat, homePosition.lon]
    : null;

  const heading = telemetry?.attitude.yaw || 0;

  return (
    <div className="h-full bg-[#161a1f] border border-[#2a2f36] rounded-xl overflow-hidden relative">
      <MapContainer
        center={defaultCenter}
        zoom={16}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        {/* ESRI World Imagery - Satellite view (FREE, no API key needed) */}
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
        />
        
        {telemetry && (
          <>
            <MapUpdater center={[telemetry.position.lat, telemetry.position.lon]} />
            
            {/* Drone marker */}
            <Marker
              position={[telemetry.position.lat, telemetry.position.lon]}
              icon={droneIcon}
            >
              <Popup>
                <div className="text-sm p-1">
                  <p className="font-semibold text-gray-900">Drone Position</p>
                  <p className="text-gray-600">Lat: {telemetry.position.lat.toFixed(6)}</p>
                  <p className="text-gray-600">Lon: {telemetry.position.lon.toFixed(6)}</p>
                  <p className="text-gray-600">Alt: {telemetry.position.alt.toFixed(1)} m</p>
                </div>
              </Popup>
            </Marker>

            {/* Flight path */}
            {flightPath.length > 1 && (
              <Polyline
                positions={flightPath}
                pathOptions={{ 
                  color: '#f97316', 
                  weight: 3, 
                  opacity: 0.8,
                }}
              />
            )}
          </>
        )}

        {/* Home marker */}
        {home && (
          <Marker position={home} icon={homeIcon}>
            <Popup>Home Position</Popup>
          </Marker>
        )}
      </MapContainer>
      
      {/* Top Left Overlay - Speed & Alt */}
      {telemetry && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-3 left-3 bg-[#161a1f]/95 backdrop-blur border border-[#2a2f36] rounded-lg p-2.5 z-[1000]"
        >
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Speed:</span>
              <span className="text-white font-semibold">
                {telemetry.groundSpeed?.toFixed(1) || '0.0'} m/s
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Alt:</span>
              <span className="text-white font-semibold">
                {telemetry.position.alt.toFixed(1)} m
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Heading:</span>
              <span className="text-white font-semibold">
                {heading.toFixed(0)}°
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Crosshair in center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[999] pointer-events-none">
        <div className="relative">
          <div className="w-16 h-16 border-2 border-white/40 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-primary-400 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-px bg-white/30" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-24 bg-white/30" />
        </div>
      </div>

      {/* Bottom Right - Compass */}
      {telemetry && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute bottom-3 right-3 bg-[#161a1f]/95 backdrop-blur border border-[#2a2f36] rounded-full p-2 z-[1000]"
        >
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 border-2 border-[#2a2f36] rounded-full" />
            {/* Compass needle */}
            <div
              className="absolute top-1/2 left-1/2 origin-center"
              style={{ transform: `translate(-50%, -50%) rotate(${heading}deg)` }}
            >
              <div className="w-1 h-6 bg-primary-400 rounded-full -translate-y-1/2" />
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-b-[8px] border-l-transparent border-r-transparent border-b-primary-400" />
            </div>
            {/* Cardinal directions */}
            <div className="absolute top-0.5 left-1/2 -translate-x-1/2 text-[10px] text-white font-bold">N</div>
            <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 font-semibold">S</div>
            <div className="absolute left-0.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-semibold">W</div>
            <div className="absolute right-0.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-semibold">E</div>
            {/* Heading display */}
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-primary-400 font-bold">
              {heading.toFixed(0)}°
            </div>
          </div>
        </motion.div>
      )}

      {/* Top Right - Status Badge */}
      {telemetry && (
        <div className="absolute top-3 right-3 z-[1000]">
          <div className={cn(
            "flex items-center gap-2 bg-[#161a1f]/95 backdrop-blur border rounded-full px-2.5 py-1",
            telemetry.armed ? "border-green-500/50" : "border-[#2a2f36]"
          )}>
            <div className={cn(
              "w-2 h-2 rounded-full",
              telemetry.armed ? "bg-green-400 animate-pulse" : "bg-gray-500"
            )} />
            <span className="text-[10px] font-medium text-gray-300">
              {telemetry.armed ? "ARMED" : "DISARMED"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

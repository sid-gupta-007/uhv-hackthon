import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useRaksha } from '../../context/RakshaContext';
import { HexSector, Incident, ResponderUnit } from '../../core/types';
import { 
  Map as MapIcon, 
  Layers, 
  Flame, 
  Truck, 
  Crosshair, 
  Play, 
  Pause, 
  Zap
} from 'lucide-react';

export const LiveLeafletMap: React.FC = () => {
  const { 
    sectors, 
    responders, 
    incidents, 
    selectedSectorId, 
    setSelectedSectorId 
  } = useRaksha();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupsRef = useRef<{
    sectors: L.LayerGroup;
    heatzones: L.LayerGroup;
    responders: L.LayerGroup;
    incidents: L.LayerGroup;
    routes: L.LayerGroup;
  } | null>(null);

  // Layer Toggles
  const [showHexSectors, setShowHexSectors] = useState(true);
  const [showHeatzones, setShowHeatzones] = useState(true);
  const [showResponders, setShowResponders] = useState(true);
  const [showIncidents, setShowIncidents] = useState(true);
  const [showBackupRoutes, setShowBackupRoutes] = useState(true);

  // Live Vehicle Movement Simulation State
  const [isSimulatingMovement, setIsSimulatingMovement] = useState(false);
  const [vehicleOffsets, setVehicleOffsets] = useState<Record<string, { lat: number; lng: number }>>({});
  const animationFrameRef = useRef<number | null>(null);

  // Helper to generate geographic hex polygon vertices around a center (lat, lng)
  const createGeoHexagon = (centerLat: number, centerLng: number, radiusKm: number = 3.8): [number, number][] => {
    const coords: [number, number][] = [];
    const latRadius = radiusKm / 111.32;
    const lngRadius = radiusKm / (111.32 * Math.cos((centerLat * Math.PI) / 180));

    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 180) * (60 * i + 30);
      const lat = centerLat + latRadius * Math.sin(angle);
      const lng = centerLng + lngRadius * Math.cos(angle);
      coords.push([lat, lng]);
    }
    return coords;
  };

  // Custom SVG Markers Builder
  const createAmbulanceIcon = (unit: ResponderUnit) => {
    let iconEmoji = '🚑';
    let bgGradient = 'from-sky-500 to-indigo-600';

    if (unit.type === 'RED_CROSS_VOLUNTEER') {
      iconEmoji = '🏍️';
      bgGradient = 'from-rose-500 to-red-600';
    } else if (unit.type === 'DRONE_MEDIC') {
      iconEmoji = '🛸';
      bgGradient = 'from-purple-500 to-violet-600';
    } else if (unit.type === 'COMMUNITY_FIRST_AID') {
      iconEmoji = '🚐';
      bgGradient = 'from-amber-500 to-orange-600';
    }

    const html = `
      <div class="relative group cursor-pointer" style="transform: translate(-50%, -50%);">
        <div class="w-9 h-9 rounded-2xl bg-gradient-to-tr ${bgGradient} p-0.5 shadow-xl flex items-center justify-center border-2 border-slate-900 animate-pulse">
          <div class="w-full h-full bg-slate-950 rounded-[12px] flex items-center justify-center text-sm">
            ${iconEmoji}
          </div>
        </div>
        <div class="absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${unit.status === 'AVAILABLE' ? 'bg-emerald-500' : 'bg-amber-500'} border-2 border-slate-900 shadow"></div>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-vehicle-marker',
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });
  };

  const createIncidentIcon = (incident: Incident) => {
    let iconEmoji = '❤️';
    let pulseColor = 'rgba(239, 68, 68, 0.5)';
    if (incident.category === 'CRASH') { iconEmoji = '🚗'; pulseColor = 'rgba(245, 158, 11, 0.5)'; }
    if (incident.category === 'MATERNAL') { iconEmoji = '👶'; pulseColor = 'rgba(236, 72, 153, 0.5)'; }
    if (incident.category === 'FIRE') { iconEmoji = '🔥'; pulseColor = 'rgba(249, 115, 22, 0.5)'; }

    const html = `
      <div class="relative cursor-pointer" style="transform: translate(-50%, -50%);">
        <div class="absolute -inset-1.5 rounded-full animate-ping" style="background-color: ${pulseColor};"></div>
        <div class="w-10 h-10 rounded-2xl bg-rose-600 p-0.5 shadow-2xl flex items-center justify-center border-2 border-white">
          <div class="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-sm">
            ${iconEmoji}
          </div>
        </div>
        <div class="absolute -top-1.5 -right-1.5 px-1 py-0.1 rounded bg-rose-950 text-rose-300 font-mono text-[8.5px] font-bold border border-rose-600">
          ${incident.aiPriorityScore}
        </div>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-incident-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });
  };

  // 1. Initialize Leaflet Map Instance
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [12.9550, 77.6350],
      zoom: 11,
      zoomControl: true,
      attributionControl: false
    });

    // Dark Matter Carto Tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    // Layer Groups
    const layers = {
      sectors: L.layerGroup().addTo(map),
      heatzones: L.layerGroup().addTo(map),
      responders: L.layerGroup().addTo(map),
      incidents: L.layerGroup().addTo(map),
      routes: L.layerGroup().addTo(map)
    };

    layerGroupsRef.current = layers;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Render Layers
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupsRef.current) return;

    const { sectors: sectorGroup, heatzones: heatzoneGroup, responders: responderGroup, incidents: incidentGroup, routes: routeGroup } = layerGroupsRef.current;

    sectorGroup.clearLayers();
    heatzoneGroup.clearLayers();
    responderGroup.clearLayers();
    incidentGroup.clearLayers();
    routeGroup.clearLayers();

    // A. Hexagon Sectors
    if (showHexSectors) {
      sectors.forEach(sec => {
        const hexCoords = createGeoHexagon(sec.center.lat, sec.center.lng, 4.2);
        const isSelected = sec.id === selectedSectorId;

        let color = '#10b981';
        let fillColor = '#10b981';
        if (sec.status === 'CRITICAL_SURGE') {
          color = '#ef4444';
          fillColor = '#ef4444';
        } else if (sec.status === 'ELEVATED') {
          color = '#f59e0b';
          fillColor = '#f59e0b';
        }

        const polygon = L.polygon(hexCoords, {
          color: isSelected ? '#38bdf8' : color,
          weight: isSelected ? 3 : 1.5,
          fillColor: fillColor,
          fillOpacity: isSelected ? 0.22 : 0.08,
          dashArray: isSelected ? undefined : '4 3'
        });

        const popupContent = `
          <div class="p-2 text-xs">
            <div class="font-bold text-white text-sm"><span class="text-sky-400 font-mono">[${sec.code}]</span> ${sec.name}</div>
            <div class="text-slate-300 mt-1">Active Incidents: <strong class="text-amber-400">${sec.activeIncidentsCount}</strong> • Units: ${sec.primaryUnitIds.length}</div>
            <div class="text-[11px] text-slate-400 mt-0.5">Connectivity: ${sec.connectivityTier}</div>
          </div>
        `;

        polygon.bindPopup(popupContent);
        polygon.on('click', () => setSelectedSectorId(sec.id));
        sectorGroup.addLayer(polygon);

        // Center Sector Label
        const labelHtml = `
          <div class="text-center pointer-events-none select-none" style="transform: translate(-50%, -50%);">
            <div class="text-[10px] font-black text-slate-200 drop-shadow">${sec.name.split(' - ')[0]}</div>
          </div>
        `;
        const labelMarker = L.marker([sec.center.lat, sec.center.lng], {
          icon: L.divIcon({ html: labelHtml, className: 'sector-center-label' })
        });
        sectorGroup.addLayer(labelMarker);
      });
    }

    // B. Heatzones
    if (showHeatzones) {
      const heatzonesData = [
        { lat: 12.9784, lng: 77.6408, radius: 2400, color: '#ef4444', label: 'Indiranagar Critical Cluster' },
        { lat: 12.9352, lng: 77.6245, radius: 2800, color: '#f59e0b', label: 'Koramangala High Crash Corridor' },
        { lat: 13.0285, lng: 77.5197, radius: 2000, color: '#eab308', label: 'Peenya Industrial Zone' },
        { lat: 12.7107, lng: 77.6974, radius: 3200, color: '#8b5cf6', label: 'Anekal Rural Transit Belt' }
      ];

      heatzonesData.forEach(hz => {
        const circle = L.circle([hz.lat, hz.lng], {
          radius: hz.radius,
          color: hz.color,
          weight: 1,
          fillColor: hz.color,
          fillOpacity: 0.15
        });
        circle.bindTooltip(`🔥 ${hz.label}`, { className: 'text-xs' });
        heatzoneGroup.addLayer(circle);
      });
    }

    // C. Ambulances & Responders
    if (showResponders) {
      responders.forEach(unit => {
        const offset = vehicleOffsets[unit.id] || { lat: 0, lng: 0 };
        const lat = unit.currentLat + offset.lat;
        const lng = unit.currentLng + offset.lng;

        const marker = L.marker([lat, lng], {
          icon: createAmbulanceIcon(unit)
        });

        const popupHtml = `
          <div class="p-2 text-xs">
            <div class="font-bold text-white">${unit.name}</div>
            <div class="text-sky-400 text-[11px] font-semibold">${unit.organization}</div>
            <div class="text-slate-300 mt-1">Crew: ${unit.crew} • Status: <strong class="text-emerald-400">${unit.status}</strong></div>
          </div>
        `;

        marker.bindPopup(popupHtml);
        responderGroup.addLayer(marker);
      });
    }

    // D. Incidents & Routes
    if (showIncidents) {
      incidents.forEach(inc => {
        const marker = L.marker([inc.location.lat, inc.location.lng], {
          icon: createIncidentIcon(inc)
        });

        const popupHtml = `
          <div class="p-2 text-xs">
            <div class="font-bold text-white">${inc.categoryLabel} <span class="text-emerald-400">(${inc.aiPriorityScore} pts)</span></div>
            <div class="text-slate-300 text-[11px]">${inc.location.landmark}</div>
            <div class="text-slate-400 mt-1">ETA: ~${inc.etaMinutes} mins • Status: ${inc.status}</div>
          </div>
        `;

        marker.bindPopup(popupHtml);
        incidentGroup.addLayer(marker);

        if (showBackupRoutes) {
          const assignedUnitId = inc.assignedUnitId || inc.recommendedUnitId;
          const assignedUnit = responders.find(r => r.id === assignedUnitId);
          if (assignedUnit) {
            const offset = vehicleOffsets[assignedUnit.id] || { lat: 0, lng: 0 };
            const uLat = assignedUnit.currentLat + offset.lat;
            const uLng = assignedUnit.currentLng + offset.lng;

            const routeLine = L.polyline(
              [
                [uLat, uLng],
                [(uLat + inc.location.lat) / 2 + 0.002, (uLng + inc.location.lng) / 2 - 0.002],
                [inc.location.lat, inc.location.lng]
              ],
              {
                color: '#38bdf8',
                weight: 3,
                opacity: 0.85,
                dashArray: '6 4'
              }
            );
            routeGroup.addLayer(routeLine);
          }
        }
      });
    }

    // E. Dynamic Backup Vector
    if (showBackupRoutes) {
      sectors.forEach(sec => {
        if (!sec.isBackupActive || !sec.backupSectorId) return;
        const target = sectors.find(s => s.id === sec.backupSectorId);
        if (!target) return;

        const backupLine = L.polyline(
          [
            [sec.center.lat, sec.center.lng],
            [target.center.lat, target.center.lng]
          ],
          {
            color: '#f59e0b',
            weight: 2.5,
            opacity: 0.85,
            dashArray: '5 5'
          }
        );
        routeGroup.addLayer(backupLine);
      });
    }

  }, [
    sectors, 
    responders, 
    incidents, 
    selectedSectorId, 
    showHexSectors, 
    showHeatzones, 
    showResponders, 
    showIncidents, 
    showBackupRoutes,
    vehicleOffsets
  ]);

  // 3. Animation Loop
  useEffect(() => {
    if (!isSimulatingMovement) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    let progress = 0;
    const animateVehicles = () => {
      progress += 0.02;
      const offsets: Record<string, { lat: number; lng: number }> = {};

      responders.forEach((r, idx) => {
        const incident = incidents.find(i => (i.assignedUnitId || i.recommendedUnitId) === r.id);
        if (incident) {
          const dLat = incident.location.lat - r.currentLat;
          const dLng = incident.location.lng - r.currentLng;
          const factor = (Math.sin(progress + idx) + 1) / 2 * 0.75;
          offsets[r.id] = {
            lat: dLat * factor,
            lng: dLng * factor
          };
        } else {
          offsets[r.id] = {
            lat: Math.sin(progress + idx) * 0.003,
            lng: Math.cos(progress + idx) * 0.003
          };
        }
      });

      setVehicleOffsets(offsets);
      animationFrameRef.current = requestAnimationFrame(animateVehicles);
    };

    animationFrameRef.current = requestAnimationFrame(animateVehicles);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isSimulatingMovement, responders, incidents]);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col gap-3">
      
      {/* Map Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <MapIcon className="w-4 h-4 text-sky-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100">
            Geographic Live Map
          </h2>
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
            LIVE GPS
          </span>
        </div>

        {/* Live Simulation Button */}
        <button
          onClick={() => setIsSimulatingMovement(!isSimulatingMovement)}
          className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
            isSimulatingMovement
              ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
              : 'bg-slate-800 hover:bg-slate-700 text-sky-300 border-sky-500/40'
          }`}
        >
          {isSimulatingMovement ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isSimulatingMovement ? 'Pause Fleet' : 'Move Fleet GPS'}</span>
        </button>
      </div>

      {/* Layer Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
        <button
          onClick={() => setShowHexSectors(!showHexSectors)}
          className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 border transition-all ${
            showHexSectors ? 'bg-sky-950 text-sky-300 border-sky-600' : 'bg-slate-950 text-slate-500 border-slate-800'
          }`}
        >
          <Layers className="w-3 h-3" />
          <span>Hex Sectors</span>
        </button>

        <button
          onClick={() => setShowHeatzones(!showHeatzones)}
          className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 border transition-all ${
            showHeatzones ? 'bg-rose-950 text-rose-300 border-rose-600' : 'bg-slate-950 text-slate-500 border-slate-800'
          }`}
        >
          <Flame className="w-3 h-3" />
          <span>Heatzones</span>
        </button>

        <button
          onClick={() => setShowResponders(!showResponders)}
          className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 border transition-all ${
            showResponders ? 'bg-emerald-950 text-emerald-300 border-emerald-600' : 'bg-slate-950 text-slate-500 border-slate-800'
          }`}
        >
          <Truck className="w-3 h-3" />
          <span>Ambulances ({responders.length})</span>
        </button>

        <button
          onClick={() => setShowBackupRoutes(!showBackupRoutes)}
          className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 border transition-all ${
            showBackupRoutes ? 'bg-amber-950 text-amber-300 border-amber-600' : 'bg-slate-950 text-slate-500 border-slate-800'
          }`}
        >
          <Zap className="w-3 h-3" />
          <span>Dynamic Backup</span>
        </button>
      </div>

      {/* Map Canvas */}
      <div className="relative w-full h-[440px] rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Dynamic Backup Badge on Map */}
        <div className="absolute bottom-3 left-3 z-[1000] bg-slate-900/90 border border-amber-500/50 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs text-amber-200 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          <span>Dynamic Cross-Sector Backup: Sector H2 backing up Sector H1</span>
        </div>
      </div>

    </div>
  );
};

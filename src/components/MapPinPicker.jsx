import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

// Custom Map Pin SVG Icon
const escapeHtml = (str) => String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const createCustomPinIcon = (label = 'Meetup Spot') => {
  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        transform: translate(-50%, -100%);
      ">
        <div style="
          background: #1A1816;
          color: #FDFBF7;
          font-weight: 800;
          font-size: 11px;
          padding: 4px 8px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          white-space: nowrap;
          border: 1px solid #D97706;
          margin-bottom: 2px;
          display: flex;
          align-items: center;
          gap: 4px;
        ">
          <span>📍</span> ${escapeHtml(label)}
        </div>
        <div style="
          width: 24px;
          height: 24px;
          background: #F59E0B;
          border: 3px solid #FFFFFF;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 10px rgba(0,0,0,0.35);
        "></div>
        <div style="
          width: 8px;
          height: 4px;
          background: rgba(0,0,0,0.25);
          border-radius: 50%;
          margin-top: 1px;
        "></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
};

export const MapPinPicker = ({
  lat,
  lng,
  onLocationChange,
  venueLabel = 'Meetup Location',
  userCoords
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialLat = lat || (userCoords?.lat ?? 12.9344);
    const initialLng = lng || (userCoords?.lng ?? 77.6288);

    // Initialize Leaflet Map
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 14,
        zoomControl: true,
        attributionControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(map);

      // Create Draggable Marker
      const marker = L.marker([initialLat, initialLng], {
        draggable: true,
        icon: createCustomPinIcon(venueLabel)
      }).addTo(map);

      // Drag event
      marker.on('dragend', () => {
        const position = marker.getLatLng();
        if (onLocationChange) {
          onLocationChange(Number(position.lat.toFixed(6)), Number(position.lng.toFixed(6)));
        }
      });

      // Map Click event (reposition pin)
      map.on('click', (e) => {
        const { lat: clickLat, lng: clickLng } = e.latlng;
        marker.setLatLng([clickLat, clickLng]);
        if (onLocationChange) {
          onLocationChange(Number(clickLat.toFixed(6)), Number(clickLng.toFixed(6)));
        }
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      // Invalidate size after render to fix grey tiles
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    } else {
      // If lat/lng changes externally (e.g. from search selection)
      if (lat && lng && markerRef.current && mapInstanceRef.current) {
        markerRef.current.setLatLng([lat, lng]);
        markerRef.current.setIcon(createCustomPinIcon(venueLabel));
        mapInstanceRef.current.setView([lat, lng], 14, { animate: true });
      }
    }

    return () => {
      // Keep instance or cleanup on unmount
    };
  }, [lat, lng, venueLabel]);

  // Clean up map on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleUseCurrentLocation = () => {
    if (userCoords?.lat && userCoords?.lng && mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([userCoords.lat, userCoords.lng]);
      mapInstanceRef.current.setView([userCoords.lat, userCoords.lng], 15, { animate: true });
      if (onLocationChange) {
        onLocationChange(userCoords.lat, userCoords.lng);
      }
    }
  };

  return (
    <div className="space-y-1.5 animate-fade-in">
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-bold text-stone-700 flex items-center gap-1">
          <span>🗺️</span> <strong>Tap anywhere on map or drag pin</strong> to adjust exact spot:
        </span>
        {userCoords && (
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            className="text-[10px] font-extrabold text-amber-800 hover:text-amber-950 bg-amber-100/90 px-2 py-0.5 rounded-lg transition-colors"
          >
            🎯 Pin at my GPS
          </button>
        )}
      </div>

      <div className="relative w-full h-48 rounded-2xl overflow-hidden border-2 border-stone-200 shadow-inner z-0">
        <div ref={mapContainerRef} className="w-full h-full" />
        
        {/* Helper bottom overlay */}
        <div className="absolute bottom-1.5 left-2 right-2 z-[400] bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-stone-200/80 text-[10px] font-semibold text-stone-600 flex items-center justify-between pointer-events-none">
          <span className="truncate">Pin: {venueLabel}</span>
          <span className="text-[9px] text-stone-400 font-mono flex-shrink-0 ml-1">
            {lat?.toFixed(4)}, {lng?.toFixed(4)}
          </span>
        </div>
      </div>
    </div>
  );
};

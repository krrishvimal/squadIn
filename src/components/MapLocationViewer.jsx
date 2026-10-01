import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';

// Custom Map Pin for Attendees
const createViewerPinIcon = (categoryLabel = 'Meetup Spot', iconEmoji = '📍') => {
  return L.divIcon({
    className: 'custom-viewer-map-pin',
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
          box-shadow: 0 4px 12px rgba(0,0,0,0.35);
          white-space: nowrap;
          border: 1.5px solid #F59E0B;
          margin-bottom: 2px;
          display: flex;
          align-items: center;
          gap: 4px;
        ">
          <span>${iconEmoji}</span> ${categoryLabel}
        </div>
        <div style="
          width: 26px;
          height: 26px;
          background: #D97706;
          border: 3px solid #FFFFFF;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 10px rgba(0,0,0,0.4);
        "></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
};

export const MapLocationViewer = ({
  lat,
  lng,
  venueName,
  neighborhood,
  categoryLabel,
  categoryIcon = '📍',
  distanceStr
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const finalLat = lat || 12.9344;
  const finalLng = lng || 77.6288;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [finalLat, finalLng],
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(map);

      // Place Pinned Marker
      const marker = L.marker([finalLat, finalLng], {
        icon: createViewerPinIcon(venueName, categoryIcon)
      }).addTo(map);

      mapInstanceRef.current = map;

      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    } else {
      mapInstanceRef.current.setView([finalLat, finalLng], 15, { animate: true });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [finalLat, finalLng, venueName, categoryIcon]);

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${finalLat},${finalLng}`;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm space-y-2.5 p-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="p-1.5 rounded-lg bg-amber-100 text-amber-900">
            <MapPin size={15} />
          </div>
          <div>
            <span className="text-xs font-extrabold text-espresso">Host's Pinned Location</span>
            {distanceStr && (
              <span className="ml-2 text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-200">
                {distanceStr} away
              </span>
            )}
          </div>
        </div>

        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-extrabold text-amber-900 hover:text-amber-950 bg-amber-200/80 hover:bg-amber-300 px-2.5 py-1 rounded-xl flex items-center gap-1 transition-all shadow-xs"
        >
          <span>Directions</span>
          <ExternalLink size={12} />
        </a>
      </div>

      {/* Interactive visual mini-map */}
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block w-full h-44 rounded-xl overflow-hidden border border-stone-200 z-0 group cursor-pointer"
        title="Tap to open venue directions in Google Maps"
      >
        <div ref={mapContainerRef} className="w-full h-full pointer-events-none" />
        
        {/* Click to open maps floating banner */}
        <div className="absolute bottom-2 left-2 right-2 z-[400] bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-stone-200 shadow-sm flex items-center justify-between group-hover:bg-stone-50 transition-colors">
          <div className="truncate text-left pr-2">
            <div className="text-[11px] font-extrabold text-espresso truncate">{venueName}</div>
            <div className="text-[10px] text-stone-500 truncate">{neighborhood}</div>
          </div>
          <span className="text-[10px] font-bold text-blue-600 flex-shrink-0 group-hover:underline">
            Open in Google Maps ↗
          </span>
        </div>
      </a>
    </div>
  );
};

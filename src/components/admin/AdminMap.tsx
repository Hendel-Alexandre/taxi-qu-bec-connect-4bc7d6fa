"use client";

import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Ride {
  id: string;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_lat: number;
  dropoff_lng: number;
  pickup_address: string;
  dropoff_address: string;
  status: string;
}

interface AdminMapProps {
  selectedRide: Ride | null;
}

export default function AdminMap({ selectedRide }: AdminMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const routeLayerId = 'route-layer';

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-71.2080, 46.8139], // Quebec City
      zoom: 12,
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current || !selectedRide) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Remove existing route layer
    if (map.current.getLayer(routeLayerId)) {
      map.current.removeLayer(routeLayerId);
    }
    if (map.current.getSource(routeLayerId)) {
      map.current.removeSource(routeLayerId);
    }

    const pickupLat = selectedRide.pickup_lat || 46.8139;
    const pickupLng = selectedRide.pickup_lng || -71.2080;
    const dropoffLat = selectedRide.dropoff_lat || 46.82;
    const dropoffLng = selectedRide.dropoff_lng || -71.22;

    // Add pickup marker (blue)
    const pickupEl = document.createElement('div');
    pickupEl.className = 'pickup-marker';
    pickupEl.innerHTML = `
      <div style="width: 32px; height: 32px; background: #3B82F6; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
        </svg>
      </div>
    `;
    const pickupMarker = new mapboxgl.Marker({ element: pickupEl })
      .setLngLat([pickupLng, pickupLat])
      .addTo(map.current);
    markersRef.current.push(pickupMarker);

    // Add dropoff marker (green)
    const dropoffEl = document.createElement('div');
    dropoffEl.className = 'dropoff-marker';
    dropoffEl.innerHTML = `
      <div style="width: 32px; height: 32px; background: #22C55E; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
      </div>
    `;
    const dropoffMarker = new mapboxgl.Marker({ element: dropoffEl })
      .setLngLat([dropoffLng, dropoffLat])
      .addTo(map.current);
    markersRef.current.push(dropoffMarker);

    // Add taxi marker (yellow) if in transit
    if (selectedRide.status === 'in_transit') {
      const taxiLat = (pickupLat + dropoffLat) / 2;
      const taxiLng = (pickupLng + dropoffLng) / 2;
      
      const taxiEl = document.createElement('div');
      taxiEl.className = 'taxi-marker';
      taxiEl.innerHTML = `
        <div style="width: 40px; height: 40px; background: #FFD60A; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 20px;">
          🚕
        </div>
      `;
      const taxiMarker = new mapboxgl.Marker({ element: taxiEl })
        .setLngLat([taxiLng, taxiLat])
        .addTo(map.current);
      markersRef.current.push(taxiMarker);
    }

    // Fit bounds to show both markers
    const bounds = new mapboxgl.LngLatBounds()
      .extend([pickupLng, pickupLat])
      .extend([dropoffLng, dropoffLat]);

    map.current.fitBounds(bounds, {
      padding: { top: 100, bottom: 100, left: 50, right: 380 },
      maxZoom: 14,
    });

    // Draw route line
    const routeCoordinates = [
      [pickupLng, pickupLat],
      [dropoffLng, dropoffLat],
    ];

    map.current.on('load', () => {
      if (!map.current) return;
      
      if (!map.current.getSource(routeLayerId)) {
        map.current.addSource(routeLayerId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: routeCoordinates,
            },
          },
        });

        map.current.addLayer({
          id: routeLayerId,
          type: 'line',
          source: routeLayerId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#3B82F6',
            'line-width': 4,
            'line-dasharray': [2, 2],
          },
        });
      }
    });

    // If map already loaded, add route immediately
    if (map.current.loaded()) {
      if (!map.current.getSource(routeLayerId)) {
        map.current.addSource(routeLayerId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: routeCoordinates,
            },
          },
        });

        map.current.addLayer({
          id: routeLayerId,
          type: 'line',
          source: routeLayerId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#3B82F6',
            'line-width': 4,
            'line-dasharray': [2, 2],
          },
        });
      } else {
        (map.current.getSource(routeLayerId) as mapboxgl.GeoJSONSource).setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: routeCoordinates,
          },
        });
      }
    }
  }, [selectedRide]);

  return (
    <div ref={mapContainer} className="w-full h-full" />
  );
}

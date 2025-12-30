"use client";

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import Map, { Marker, Source, Layer, MapRef } from 'react-map-gl/mapbox';
import type { LayerProps } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapboxMapProps {
  pickupLocation?: { lat: number; lng: number } | null;
  destinationLocation?: { lat: number; lng: number } | null;
  onRouteData?: (data: { distance: string; duration: string; price: number }) => void;
}

const isValidCoord = (v: any): v is { lat: number; lng: number } => {
  if (!v || typeof v !== 'object') return false;
  const lat = Number(v.lat);
  const lng = Number(v.lng);
  return (
    typeof v.lat === 'number' &&
    typeof v.lng === 'number' &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat !== 0 &&
    lng !== 0
  );
};

const routeLayerStyle: LayerProps = {
  id: 'route',
  type: 'line',
  paint: {
    'line-color': '#2563eb',
    'line-width': 5,
    'line-opacity': 0.8,
  },
  layout: {
    'line-join': 'round',
    'line-cap': 'round',
  },
};

export const MapboxMap = ({ pickupLocation, destinationLocation, onRouteData }: MapboxMapProps) => {
  const mapRef = useRef<MapRef>(null);
  const [routeGeoJson, setRouteGeoJson] = useState<GeoJSON.Feature<GeoJSON.Geometry> | null>(null);
  const DEFAULT_CENTER = useMemo(() => ({ lat: 45.5019, lng: -73.5674 }), []);

  const fetchRoute = useCallback(async () => {
    if (!isValidCoord(pickupLocation) || !isValidCoord(destinationLocation)) {
      setRouteGeoJson(null);
      return;
    }

    const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!accessToken) {
      console.error('Mapbox access token not found');
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${pickupLocation.lng},${pickupLocation.lat};${destinationLocation.lng},${destinationLocation.lat}?geometries=geojson&overview=full&access_token=${accessToken}`
      );

      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        
        setRouteGeoJson({
          type: 'Feature',
          properties: {},
          geometry: route.geometry,
        });

        if (onRouteData) {
          const distanceKm = route.distance / 1000;
          const durationMin = Math.round(route.duration / 60);
          const price = 5 + distanceKm * 2;

          onRouteData({
            distance: `${distanceKm.toFixed(1)} km`,
            duration: `${durationMin} min`,
            price: Math.round(price * 100) / 100,
          });
        }

        if (mapRef.current) {
          const coordinates = route.geometry.coordinates;
          const bounds = coordinates.reduce(
            (bounds: [[number, number], [number, number]], coord: [number, number]) => {
              return [
                [Math.min(bounds[0][0], coord[0]), Math.min(bounds[0][1], coord[1])],
                [Math.max(bounds[1][0], coord[0]), Math.max(bounds[1][1], coord[1])],
              ];
            },
            [[coordinates[0][0], coordinates[0][1]], [coordinates[0][0], coordinates[0][1]]]
          );

          mapRef.current.fitBounds(bounds, {
            padding: { top: 100, bottom: 100, left: 100, right: 100 },
            duration: 1000,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching route:', error);
    }
  }, [pickupLocation, destinationLocation, onRouteData]);

  useEffect(() => {
    fetchRoute();
  }, [fetchRoute]);

  useEffect(() => {
    if (pickupLocation || destinationLocation) {
      console.log('pickup coords', pickupLocation);
      console.log('destination coords', destinationLocation);
    }
  }, [pickupLocation, destinationLocation]);

  const mapCenter = useMemo(() => {
    return isValidCoord(pickupLocation)
      ? { latitude: pickupLocation.lat, longitude: pickupLocation.lng }
      : { latitude: DEFAULT_CENTER.lat, longitude: DEFAULT_CENTER.lng };
  }, [pickupLocation, DEFAULT_CENTER]);

  return (
    <div className="absolute inset-0 z-0">
      <Map
        ref={mapRef}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        initialViewState={{
          ...mapCenter,
          zoom: isValidCoord(pickupLocation) ? 14 : 12,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
      >
        {routeGeoJson && (
          <Source id="route" type="geojson" data={routeGeoJson}>
            <Layer {...routeLayerStyle} />
          </Source>
        )}

        {isValidCoord(pickupLocation) && (
          <Marker latitude={pickupLocation.lat} longitude={pickupLocation.lng} anchor="center">
            <div className="w-8 h-8 bg-blue-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
          </Marker>
        )}

        {isValidCoord(destinationLocation) && (
          <Marker latitude={destinationLocation.lat} longitude={destinationLocation.lng} anchor="center">
            <div className="w-8 h-8 bg-slate-900 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-sm" />
            </div>
          </Marker>
        )}
      </Map>
    </div>
  );
};

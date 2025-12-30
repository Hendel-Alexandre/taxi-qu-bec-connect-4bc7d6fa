"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { 
  Map, 
  useMapsLibrary, 
  useMap,
  AdvancedMarker,
  Pin
} from '@vis.gl/react-google-maps';

interface GoogleMapProps {
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

const SafePin = (props: any) => {
  const pinProps = Object.fromEntries(
    Object.entries(props).filter(([key]) => !key.startsWith('data-'))
  );
  return <Pin {...pinProps} />;
};

const MapContent = ({ pickupLocation, destinationLocation, onRouteData }: GoogleMapProps) => {
  const map = useMap();
  const routesLibrary = useMapsLibrary('routes');
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);

  // Defensive logging as requested
  useEffect(() => {
    if (pickupLocation || destinationLocation) {
      console.log('pickup coords', pickupLocation);
      console.log('destination coords', destinationLocation);
    }
  }, [pickupLocation, destinationLocation]);

  useEffect(() => {
    if (!routesLibrary || !map) return;
    setDirectionsService(new routesLibrary.DirectionsService());
    setDirectionsRenderer(new routesLibrary.DirectionsRenderer({
      map,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#2563eb',
        strokeWeight: 5,
        strokeOpacity: 0.8
      }
    }));
  }, [routesLibrary, map]);

  useEffect(() => {
    if (!directionsService || !directionsRenderer || !isValidCoord(pickupLocation) || !isValidCoord(destinationLocation)) {
      if (directionsRenderer) directionsRenderer.setDirections({ routes: [] });
      return;
    }

    directionsService.route(
      {
        origin: { lat: pickupLocation.lat, lng: pickupLocation.lng },
        destination: { lat: destinationLocation.lat, lng: destinationLocation.lng },
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          directionsRenderer.setDirections(result);
          
          const route = result.routes[0].legs[0];
          if (route && onRouteData) {
            const distanceValue = route.distance?.value || 0; // in meters
            const price = 5 + (distanceValue / 1000) * 2;
            
            onRouteData({
              distance: route.distance?.text || '',
              duration: route.duration?.text || '',
              price: Math.round(price * 100) / 100
            });
          }

          const bounds = new google.maps.LatLngBounds();
          bounds.extend({ lat: pickupLocation.lat, lng: pickupLocation.lng });
          bounds.extend({ lat: destinationLocation.lat, lng: destinationLocation.lng });
          map?.fitBounds(bounds, { top: 100, bottom: 100, left: 100, right: 100 });
        }
      }
    );
  }, [directionsService, directionsRenderer, pickupLocation, destinationLocation, map, onRouteData]);

  return (
    <>
      {isValidCoord(pickupLocation) && (
        <AdvancedMarker position={{ lat: pickupLocation.lat, lng: pickupLocation.lng }}>
          <SafePin background={'#2563eb'} borderColor={'#ffffff'} glyphColor={'#ffffff'} scale={1.2} />
        </AdvancedMarker>
      )}
      {isValidCoord(destinationLocation) && (
        <AdvancedMarker position={{ lat: destinationLocation.lat, lng: destinationLocation.lng }}>
          <SafePin background={'#000000'} borderColor={'#ffffff'} glyphColor={'#ffffff'} scale={1.2} />
        </AdvancedMarker>
      )}
    </>
  );
};

export const GoogleMap = ({ pickupLocation, destinationLocation, onRouteData }: GoogleMapProps) => {
  const DEFAULT_CENTER = useMemo(() => ({ lat: 45.5019, lng: -73.5674 }), []); // Montréal

  const mapCenter = useMemo(() => {
    return isValidCoord(pickupLocation) 
      ? { lat: pickupLocation.lat, lng: pickupLocation.lng } 
      : DEFAULT_CENTER;
  }, [pickupLocation, DEFAULT_CENTER]);

  return (
    <div className="absolute inset-0 z-0">
      <Map
        center={mapCenter}
        zoom={isValidCoord(pickupLocation) ? 14 : 12}
        mapId="bf506051662973f7"
        disableDefaultUI={true}
        gestureHandling="greedy"
        style={{ width: '100%', height: '100%' }}
      >
        <MapContent 
          pickupLocation={pickupLocation} 
          destinationLocation={destinationLocation} 
          onRouteData={onRouteData}
        />
      </Map>
    </div>
  );
};

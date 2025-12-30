"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, MapPin, Loader2, AlertCircle, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import debounce from 'lodash.debounce';

interface MapboxAddressSearchProps {
  onSelect?: (address: string, location: { lat: number; lng: number }) => void;
  onOutOfBounds?: () => void;
  placeholder?: string;
  defaultValue?: string;
  className?: string;
  userLocation?: { lat: number; lng: number } | null;
}

interface SearchBoxSuggestion {
  mapbox_id: string;
  name: string;
  full_address?: string;
  place_formatted?: string;
  feature_type: string;
  address?: string;
  context?: {
    place?: { name: string };
    region?: { name: string };
    country?: { name: string };
    postcode?: { name: string };
    street?: { name: string };
  };
}

interface Suggestion {
  id: string;
  place_name: string;
  text: string;
  center: [number, number];
  feature_type: string;
  mapbox_id?: string;
}

const QUEBEC_CITY_BOUNDS = {
  minLat: 46.65,
  maxLat: 47.05,
  minLng: -71.55,
  maxLng: -70.85,
};

const isInQuebecCity = (lat: number, lng: number): boolean => {
  return (
    lat >= QUEBEC_CITY_BOUNDS.minLat &&
    lat <= QUEBEC_CITY_BOUNDS.maxLat &&
    lng >= QUEBEC_CITY_BOUNDS.minLng &&
    lng <= QUEBEC_CITY_BOUNDS.maxLng
  );
};

export const MapboxAddressSearch = ({
  onSelect,
  onOutOfBounds,
  placeholder = "Rechercher une adresse...",
  defaultValue = '',
  className,
  userLocation
}: MapboxAddressSearchProps) => {
  const [inputValue, setInputValue] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [outOfBoundsError, setOutOfBoundsError] = useState(false);
  const [currentUserLocation, setCurrentUserLocation] = useState<{ lat: number; lng: number } | null>(userLocation || null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get user's current location on mount
  useEffect(() => {
    if (!userLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (isInQuebecCity(latitude, longitude)) {
            setCurrentUserLocation({ lat: latitude, lng: longitude });
          }
        },
        () => {
          // Silently fail - will use default Quebec City center
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, [userLocation]);

  // Update location if prop changes
  useEffect(() => {
    if (userLocation) {
      setCurrentUserLocation(userLocation);
    }
  }, [userLocation]);

  useEffect(() => {
    if (defaultValue !== undefined) {
      setInputValue(defaultValue);
    }
  }, [defaultValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [sessionToken] = useState(() => crypto.randomUUID());

  const fetchSuggestions = useCallback(
    debounce(async (value: string, userLoc: { lat: number; lng: number } | null) => {
      if (!value || value.length < 2) {
        setSuggestions([]);
        return;
      }

      const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
      if (!accessToken) {
        console.error('Mapbox access token not found');
        return;
      }

      setIsLoading(true);
      setOutOfBoundsError(false);
      try {
        // Use Search Box API for better POI/business search
        const searchBoxUrl = new URL('https://api.mapbox.com/search/searchbox/v1/suggest');
        searchBoxUrl.searchParams.set('q', value);
        searchBoxUrl.searchParams.set('access_token', accessToken);
        searchBoxUrl.searchParams.set('session_token', sessionToken);
        searchBoxUrl.searchParams.set('language', 'fr');
        searchBoxUrl.searchParams.set('limit', '10');
        searchBoxUrl.searchParams.set('country', 'CA');
        
        // Use user's location for proximity if available, otherwise default to Quebec City center
        const proximityLng = userLoc?.lng ?? -71.2082;
        const proximityLat = userLoc?.lat ?? 46.8139;
        searchBoxUrl.searchParams.set('proximity', `${proximityLng},${proximityLat}`);
        
        searchBoxUrl.searchParams.set('bbox', '-71.55,46.65,-70.85,47.05');
        searchBoxUrl.searchParams.set('types', 'poi,address,street,place');

        const response = await fetch(searchBoxUrl.toString());
        const data = await response.json();

        if (data.suggestions && data.suggestions.length > 0) {
          // Transform Search Box suggestions to our format
          const transformedSuggestions: Suggestion[] = data.suggestions.map((s: SearchBoxSuggestion) => ({
            id: s.mapbox_id,
            mapbox_id: s.mapbox_id,
            text: s.name,
            place_name: s.full_address || s.place_formatted || s.name,
            feature_type: s.feature_type,
            center: [0, 0] as [number, number], // Will be fetched on selection
          }));
          
          setSuggestions(transformedSuggestions);
          setIsOpen(transformedSuggestions.length > 0);
        } else {
          setSuggestions([]);
          setIsOpen(false);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [sessionToken]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    fetchSuggestions(value, currentUserLocation);
  };

  const handleSelectSuggestion = async (suggestion: Suggestion) => {
    const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    
    if (suggestion.mapbox_id && accessToken) {
      try {
        // Use retrieve endpoint to get coordinates
        const retrieveUrl = new URL(`https://api.mapbox.com/search/searchbox/v1/retrieve/${suggestion.mapbox_id}`);
        retrieveUrl.searchParams.set('access_token', accessToken);
        retrieveUrl.searchParams.set('session_token', sessionToken);
        
        const response = await fetch(retrieveUrl.toString());
        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
          const feature = data.features[0];
          const [lng, lat] = feature.geometry.coordinates;
          
          if (!isInQuebecCity(lat, lng)) {
            setOutOfBoundsError(true);
            if (onOutOfBounds) onOutOfBounds();
            return;
          }
          
          setIsOpen(false);
          setInputValue(suggestion.place_name);
          setOutOfBoundsError(false);

          if (onSelect) {
            onSelect(suggestion.place_name, { lat, lng });
          }
        }
      } catch (error) {
        console.error("Error retrieving location:", error);
      }
    } else {
      // Fallback for suggestions with coordinates already
      const lat = suggestion.center[1];
      const lng = suggestion.center[0];
      
      if (!isInQuebecCity(lat, lng)) {
        setOutOfBoundsError(true);
        if (onOutOfBounds) onOutOfBounds();
        return;
      }
      
      setIsOpen(false);
      setInputValue(suggestion.place_name);
      setOutOfBoundsError(false);

      if (onSelect) {
        onSelect(suggestion.place_name, { lat, lng });
      }
    }
  };

  const clearInput = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInputValue('');
    setSuggestions([]);
    setIsOpen(false);
    setOutOfBoundsError(false);
    if (onSelect) onSelect('', { lat: 46.8139, lng: -71.2082 });
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative group">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => inputValue.length >= 3 && suggestions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className={cn(
            "w-full h-12 pl-10 pr-10 bg-slate-50 border-2 border-transparent rounded-xl font-medium",
            "focus:outline-none focus:bg-white focus:border-blue-600/20 focus:shadow-sm transition-all text-sm",
            "group-hover:bg-slate-100",
            outOfBoundsError && "border-red-300 bg-red-50"
          )}
          autoComplete="off"
        />
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </div>

        {inputValue && (
          <button
            type="button"
            onClick={clearInput}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 text-slate-400 transition-colors z-10"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {outOfBoundsError && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-red-50 border border-red-200 rounded-xl p-3 z-[100] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-xs font-medium text-red-600">Service disponible uniquement dans la région de Québec</p>
        </div>
      )}

        {isOpen && suggestions.length > 0 && !outOfBoundsError && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-[100] max-h-[300px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
            {suggestions.map((suggestion) => {
                const isPOI = suggestion.feature_type === 'poi';
                const primaryText = suggestion.text;
                const secondaryText = suggestion.place_name !== suggestion.text ? suggestion.place_name : null;
                
                return (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0"
                  >
                    <div className={cn(
                      "p-2 rounded-lg shrink-0",
                      isPOI ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-400"
                    )}>
                      {isPOI ? <Building2 className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-slate-900 line-clamp-1">
                        {primaryText}
                      </div>
                      {secondaryText && (
                        <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {secondaryText}
                        </div>
                      )}
                    </div>
                  </button>
                );
            })}
          </div>
        )}
    </div>
  );
};

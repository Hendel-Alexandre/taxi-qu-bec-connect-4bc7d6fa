"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { Search, X, MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import debounce from 'lodash.debounce';

interface GoogleAddressSearchProps {
  onSelect?: (address: string, location: { lat: number; lng: number }) => void;
  placeholder?: string;
  defaultValue?: string;
  className?: string;
}

export const GoogleAddressSearch = ({ 
  onSelect, 
  placeholder = "Rechercher une adresse...", 
  defaultValue = '',
  className
}: GoogleAddressSearchProps) => {
  const [inputValue, setInputValue] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([]);
  const [sessionToken, setSessionToken] = useState<google.maps.places.AutocompleteSessionToken | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const placesLibrary = useMapsLibrary('places');

  useEffect(() => {
    if (placesLibrary && !sessionToken) {
      setSessionToken(new placesLibrary.AutocompleteSessionToken());
    }
  }, [placesLibrary, sessionToken]);

  useEffect(() => {
    if (defaultValue !== undefined) {
      setInputValue(defaultValue);
    }
  }, [defaultValue]);

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(
    debounce(async (value: string) => {
      if (!placesLibrary || !value || value.length < 3) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
        try {
          // Use the Places API (New) fetching method with clear bounds and session token
          const { suggestions } = await placesLibrary.AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input: value,
            region: 'ca',
            sessionToken: sessionToken || undefined,
            locationBias: {
              north: 46.9,
              south: 46.7,
              east: -71.1,
              west: -71.4
            }, // Quebec City area
          });
          
          setSuggestions(suggestions);
        setIsOpen(suggestions.length > 0);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [placesLibrary]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    fetchSuggestions(value);
  };

  const handleSelectSuggestion = async (suggestion: google.maps.places.AutocompleteSuggestion) => {
    setIsOpen(false);
    setInputValue(suggestion.placePrediction.text.text);
    
    if (placesLibrary) {
      try {
        setIsLoading(true);
        // Fetch place details using the new API
        const place = suggestion.placePrediction.toPlace();
        await place.fetchFields({
          fields: ['location', 'formattedAddress', 'displayName']
        });

          if (place.location) {
            const latValue = typeof place.location.lat === 'function' ? place.location.lat() : (place.location as any).lat;
            const lngValue = typeof place.location.lng === 'function' ? place.location.lng() : (place.location as any).lng;
            
            const lat = Number(latValue);
            const lng = Number(lngValue);
            
            if (!isNaN(lat) && !isNaN(lng)) {
              const address = place.formattedAddress || suggestion.placePrediction.text.text;
              if (onSelect) onSelect(address, { lat, lng });
            }
          }
      } catch (error) {
        console.error("Error fetching place details:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const clearInput = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInputValue('');
    setSuggestions([]);
    setIsOpen(false);
    if (onSelect) onSelect('', { lat: 46.8139, lng: -71.2082 }); // Using Quebec City as a safe default instead of 0,0
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
            !placesLibrary && "opacity-50 cursor-not-allowed"
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

      {/* Custom Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-[100] max-h-[300px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSelectSuggestion(suggestion)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0"
            >
              <div className="p-2 rounded-lg bg-slate-100 text-slate-400 shrink-0">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-900 truncate">
                  {suggestion.placePrediction.text.text}
                </div>
                {suggestion.placePrediction.structuredFormat?.secondaryText?.text && (
                  <div className="text-[10px] text-slate-400 font-medium truncate">
                    {suggestion.placePrediction.structuredFormat.secondaryText.text}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

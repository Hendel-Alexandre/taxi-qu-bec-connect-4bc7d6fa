"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Search, 
  X,
  ChevronRight,
  MapPin,
  Clock,
  Phone,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Truck,
  Navigation,
  Layers,
  ZoomIn,
  ZoomOut,
  Locate
} from "lucide-react";
import dynamic from 'next/dynamic';

const AdminMap = dynamic(() => import('@/components/admin/AdminMap'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 animate-pulse" />
});

type RideStatus = 'requested' | 'in_transit' | 'completed' | 'cancelled';

interface Ride {
  id: string;
  passenger_name: string;
  pickup_address: string;
  dropoff_address: string;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_lat: number;
  dropoff_lng: number;
  status: RideStatus;
  driver_name: string;
  driver_phone: string;
  created_at: string;
  dispatched_at: string;
  completed_at: string;
}

export default function AdminDashboard() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'in_transit' | 'completed'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchRides() {
      const { data } = await supabase
        .from('rides')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      setRides(data || []);
      if (data && data.length > 0) {
        setSelectedRide(data[0]);
      }
      setIsLoading(false);
    }
    fetchRides();
  }, [supabase]);

  const filteredRides = rides.filter(ride => {
    if (activeTab === 'all') return true;
    if (activeTab === 'in_transit') return ride.status === 'in_transit' || ride.status === 'requested';
    if (activeTab === 'completed') return ride.status === 'completed';
    return true;
  });

  const stats = {
    all: rides.length,
    in_transit: rides.filter(r => r.status === 'in_transit' || r.status === 'requested').length,
    completed: rides.filter(r => r.status === 'completed').length,
  };

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      {/* Left Panel - Tracking List */}
      <div className="w-[380px] bg-white border-r border-gray-200 flex flex-col shrink-0">
        {/* Header */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">Suivi des courses</h1>
            <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'all' 
                ? 'bg-gray-900 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Toutes {stats.all}
          </button>
          <button
            onClick={() => setActiveTab('in_transit')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'in_transit' 
                ? 'bg-[#FFD60A] text-black' 
                : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
            }`}
          >
            En cours {stats.in_transit}
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'completed' 
                ? 'bg-green-600 text-white' 
                : 'bg-green-50 text-green-700 hover:bg-green-100'
            }`}
          >
            Livrées {stats.completed}
          </button>
        </div>

        {/* Rides List */}
        <div className="flex-1 overflow-y-auto">
          {filteredRides.map((ride) => (
            <div
              key={ride.id}
              onClick={() => setSelectedRide(ride)}
              className={`p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-gray-50 ${
                selectedRide?.id === ride.id ? 'bg-yellow-50/50 border-l-2 border-l-yellow-500' : ''
              }`}
            >
              {/* Ride Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
                    <Truck className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold text-gray-900 text-sm">#{ride.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                  ride.status === 'completed' ? 'bg-green-100 text-green-700' :
                  ride.status === 'in_transit' ? 'bg-yellow-100 text-yellow-700' :
                  ride.status === 'requested' ? 'bg-blue-100 text-blue-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {ride.status === 'completed' ? 'Terminée' :
                   ride.status === 'in_transit' ? 'En transit' :
                   ride.status === 'requested' ? 'En attente' : 'Annulée'}
                </span>
              </div>

              {/* Route Progress */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0" />
                  <span className="text-xs text-gray-500 truncate">{ride.pickup_address?.split(',')[0] || 'Départ'}</span>
                </div>
                <div className="flex-1 border-t border-dashed border-gray-300 relative">
                  {ride.status === 'in_transit' && (
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-yellow-500 rounded-full border-2 border-white shadow-sm" />
                  )}
                </div>
                <div className="flex items-center gap-1 flex-1 min-w-0 justify-end">
                  <span className="text-xs text-gray-500 truncate">{ride.dropoff_address?.split(',')[0] || 'Arrivée'}</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full shrink-0" />
                </div>
              </div>

              {/* Driver Info */}
              {ride.driver_name && (
                <div className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {ride.driver_name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{ride.driver_name}</p>
                    <p className="text-xs text-gray-500">Chauffeur</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors">
                      <Phone className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors">
                      <MessageSquare className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {filteredRides.length === 0 && (
            <div className="p-8 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Truck className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">Aucune course trouvée</p>
            </div>
          )}
        </div>

        {/* Add Load Button */}
        <div className="p-4 border-t border-gray-100">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl font-medium text-sm hover:bg-gray-800 transition-colors">
            <Plus className="w-4 h-4" />
            Nouvelle course
          </button>
        </div>
      </div>

      {/* Right Panel - Map & Details */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Map Header */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
          {/* Ride ID Badge */}
          {selectedRide && (
            <div className="bg-white rounded-xl shadow-lg px-4 py-2.5 pointer-events-auto">
              <span className="text-xs text-gray-500">No:</span>
              <span className="ml-1 font-bold text-gray-900">#{selectedRide.id.slice(0, 8).toUpperCase()}</span>
            </div>
          )}

          {/* Map Controls */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <button className="px-4 py-2 bg-white rounded-xl shadow-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Map
            </button>
            <button className="px-4 py-2 bg-gray-100 rounded-xl shadow-lg text-sm font-medium text-gray-500 hover:bg-gray-200 transition-colors">
              Satellite
            </button>
            <button className="p-2 bg-white rounded-xl shadow-lg hover:bg-gray-50 transition-colors">
              <Layers className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <AdminMap selectedRide={selectedRide} />

          {/* Map Zoom Controls */}
          <div className="absolute right-4 bottom-32 flex flex-col gap-1 z-10">
            <button className="p-2.5 bg-white rounded-xl shadow-lg hover:bg-gray-50 transition-colors">
              <ZoomIn className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-2.5 bg-white rounded-xl shadow-lg hover:bg-gray-50 transition-colors">
              <ZoomOut className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-2.5 bg-white rounded-xl shadow-lg hover:bg-gray-50 transition-colors">
              <Navigation className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-2.5 bg-white rounded-xl shadow-lg hover:bg-gray-50 transition-colors">
              <Locate className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Ride Details Panel */}
        {selectedRide && (
          <div className="absolute right-4 top-20 w-[320px] bg-white rounded-2xl shadow-xl z-10 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-100">
              <button className="flex-1 px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                Infos
              </button>
              <button className="flex-1 px-4 py-3 text-sm font-semibold text-gray-900 border-b-2 border-yellow-500">
                Suivi
              </button>
              <button className="flex-1 px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                Docs
              </button>
            </div>

            {/* Timeline */}
            <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
              {/* Pickup */}
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <div className="w-0.5 h-full bg-gray-200 mt-1" />
                </div>
                <div className="flex-1 pb-4">
                  <p className="text-xs font-semibold text-blue-600 mb-1">Prise en charge</p>
                  <p className="text-sm font-medium text-gray-900">{selectedRide.pickup_address || 'Adresse de départ'}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {selectedRide.created_at ? new Date(selectedRide.created_at).toLocaleString('fr-CA') : '---'}
                  </p>
                </div>
              </div>

              {/* In Transit */}
              {selectedRide.status === 'in_transit' && (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
                    <div className="w-0.5 h-full bg-gray-200 mt-1" />
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-xs font-semibold text-yellow-600 mb-1">En transit</p>
                    <p className="text-sm font-medium text-gray-900">En route vers la destination</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {selectedRide.dispatched_at ? new Date(selectedRide.dispatched_at).toLocaleString('fr-CA') : 'En cours...'}
                    </p>
                  </div>
                </div>
              )}

              {/* Dropoff */}
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${selectedRide.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`} />
                </div>
                <div className="flex-1">
                  <p className={`text-xs font-semibold mb-1 ${selectedRide.status === 'completed' ? 'text-green-600' : 'text-gray-400'}`}>
                    Destination
                  </p>
                  <p className="text-sm font-medium text-gray-900">{selectedRide.dropoff_address || 'Adresse d\'arrivée'}</p>
                  {selectedRide.completed_at && (
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(selectedRide.completed_at).toLocaleString('fr-CA')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

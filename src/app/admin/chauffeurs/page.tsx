"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Search, 
  Filter, 
  Plus, 
  Phone, 
  Mail,
  MoreVertical,
  MapPin,
  Car,
  ShieldCheck
} from "lucide-react";

export default function ChauffeursPage() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchDrivers() {
      const { data } = await supabase
        .from('drivers')
        .select('*')
        .order('full_name', { ascending: true });
      
      setDrivers(data || []);
      setIsLoading(false);
    }
    fetchDrivers();
  }, [supabase]);

  const stats = {
    total: drivers.length,
    available: drivers.filter(d => d.status === 'available').length,
    busy: drivers.filter(d => d.status === 'busy' || d.status === 'in_transit').length,
    offline: drivers.filter(d => d.status === 'offline').length,
  };

  return (
    <div className="flex-1 bg-white p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Chauffeurs</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez votre flotte de chauffeurs</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-[#FFD60A] text-black rounded-xl font-medium text-sm hover:bg-yellow-400 transition-colors">
          <Plus className="w-4 h-4" />
          Nouveau chauffeur
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", value: stats.total, color: "gray" },
          { label: "Disponibles", value: stats.available, color: "green" },
          { label: "En course", value: stats.busy, color: "yellow" },
          { label: "Hors ligne", value: stats.offline, color: "gray" },
        ].map((stat, i) => (
          <div key={i} className="bg-gray-50 rounded-xl p-4">
            <span className="text-xs font-medium text-gray-500">{stat.label}</span>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${
                stat.color === 'green' ? 'bg-green-500' :
                stat.color === 'yellow' ? 'bg-yellow-500' : 'bg-gray-400'
              }`} />
              <span className="text-xl font-bold text-gray-900">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un chauffeur..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100">
          <Filter className="w-4 h-4" />
          Filtres
        </button>
      </div>

      {/* Drivers List */}
      <div className="space-y-3">
        {drivers.map((driver) => (
          <div 
            key={driver.id} 
            className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                  {(driver.full_name || 'C').charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{driver.full_name || 'Chauffeur'}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      driver.status === 'available' ? 'bg-green-100 text-green-700' :
                      driver.status === 'busy' || driver.status === 'in_transit' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-200 text-gray-500'
                    }`}>
                      {driver.status === 'available' ? 'Disponible' :
                       driver.status === 'busy' || driver.status === 'in_transit' ? 'En course' : 'Hors ligne'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {driver.phone || 'Non renseigné'}
                    </span>
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      {driver.license_number || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        ))}

        {drivers.length === 0 && (
          <div className="py-12 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Car className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">Aucun chauffeur trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
}

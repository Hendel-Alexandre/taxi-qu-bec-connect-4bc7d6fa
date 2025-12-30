"use client";

import React from 'react';
import { Users, Search, Filter, Plus, MoreHorizontal, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const drivers = [
  { id: 'DR-001', name: 'Marc L.', status: 'En service', vehicle: 'Toyota Camry (B-12)', rating: 4.9, rides: 1240 },
  { id: 'DR-002', name: 'Julie B.', status: 'Occupé', vehicle: 'Honda Civic (A-45)', rating: 4.8, rides: 856 },
  { id: 'DR-003', name: 'Luc P.', status: 'En pause', vehicle: 'Tesla Model 3 (E-02)', rating: 4.9, rides: 2105 },
  { id: 'DR-004', name: 'Mélanie S.', status: 'Hors service', vehicle: 'Hyundai Ioniq (C-09)', rating: 4.7, rides: 543 },
  { id: 'DR-005', name: 'Antoine G.', status: 'En service', vehicle: 'Toyota Prius (B-33)', rating: 5.0, rides: 128 },
];

export default function DriversPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion des Chauffeurs</h1>
          <p className="text-slate-500">Gérez votre base de données de chauffeurs et surveillez leurs performances.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" />
          Ajouter un Chauffeur
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Rechercher par nom, ID ou véhicule..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all">
              <Filter className="w-4 h-4" />
              Filtres
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Chauffeur</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Véhicule</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Note</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Courses</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {drivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold">
                        {driver.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{driver.name}</p>
                        <p className="text-xs text-slate-500">{driver.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {driver.status === 'En service' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      {driver.status === 'Occupé' && <Clock className="w-4 h-4 text-blue-500" />}
                      {driver.status === 'En pause' && <AlertCircle className="w-4 h-4 text-orange-500" />}
                      {driver.status === 'Hors service' && <div className="w-4 h-4 rounded-full bg-slate-300" />}
                      <span className="text-sm font-medium text-slate-700">{driver.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{driver.vehicle}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">⭐ {driver.rating}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{driver.rides}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-all text-slate-400">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

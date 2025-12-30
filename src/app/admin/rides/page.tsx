"use client";

import React from 'react';
import { Car, Search, Filter, MoreHorizontal, MapPin, Calendar, Clock, DollarSign } from 'lucide-react';

const rides = [
  { id: 'RD-8921', customer: 'Jean Dupont', driver: 'Marc L.', pickup: 'Aéroport Jean-Lesage', dropoff: 'Château Frontenac', status: 'En cours', amount: '45.00$', time: '14:30' },
  { id: 'RD-8920', customer: 'Sarah Martin', driver: 'Julie B.', pickup: 'Université Laval', dropoff: 'Gare du Palais', status: 'Terminé', amount: '18.50$', time: '13:15' },
  { id: 'RD-8919', customer: 'Pierre Tremblay', driver: 'Luc P.', pickup: 'Place Ste-Foy', dropoff: 'Vieux-Limoilou', status: 'Terminé', amount: '22.00$', time: '12:45' },
  { id: 'RD-8918', customer: 'Sophie Roy', driver: 'Mélanie S.', pickup: 'Galeries de la Capitale', dropoff: 'Beauport', status: 'Annulé', amount: '0.00$', time: '11:20' },
  { id: 'RD-8917', customer: 'Thomas K.', driver: 'Marc L.', pickup: 'Lebourgneuf', dropoff: 'Aéroport Jean-Lesage', status: 'Terminé', amount: '38.00$', time: '10:05' },
];

export default function RidesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Historique des Courses</h1>
          <p className="text-slate-500">Consultez et gérez toutes les courses effectuées par votre flotte.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all">
            <Calendar className="w-4 h-4" />
            Cette semaine
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Rechercher par client, chauffeur ou ID..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all w-full md:w-auto">
            <Filter className="w-4 h-4" />
            Filtres avancés
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Course ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Client / Chauffeur</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Trajet</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Heure / Montant</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rides.map((ride) => (
                <tr key={ride.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-900">{ride.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-slate-900">{ride.customer}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Car className="w-3 h-3" /> {ride.driver}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1 max-w-[200px]">
                      <p className="text-xs text-slate-600 truncate flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-500" /> {ride.pickup}
                      </p>
                      <p className="text-xs text-slate-600 truncate flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-rose-500" /> {ride.dropoff}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      ride.status === 'En cours' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                      ride.status === 'Terminé' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                      'bg-rose-50 text-rose-600 border border-rose-100'
                    }`}>
                      {ride.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-900">{ride.amount}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {ride.time}
                      </p>
                    </div>
                  </td>
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

"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Car, 
  TrendingUp, 
  Clock, 
  MapPin, 
  ArrowUpRight, 
  ArrowDownRight,
  MoreVertical,
  Calendar
} from 'lucide-react';

const stats = [
  { label: 'Chauffeurs Actifs', value: '42', change: '+5%', trend: 'up', icon: Users, color: 'blue' },
  { label: 'Courses Aujourd\'hui', value: '156', change: '+12%', trend: 'up', icon: Car, color: 'green' },
  { label: 'Revenu Journalier', value: '3,240$', change: '+8%', trend: 'up', icon: TrendingUp, color: 'purple' },
  { label: 'Temps d\'Attente Moyen', value: '4.2 min', change: '-2%', trend: 'down', icon: Clock, color: 'orange' },
];

const recentRides = [
  { id: 'RD-8921', customer: 'Jean Dupont', driver: 'Marc L.', destination: 'Aéroport Jean-Lesage', status: 'En cours', amount: '45.00$' },
  { id: 'RD-8920', customer: 'Sarah Martin', driver: 'Julie B.', destination: 'Vieux-Québec', status: 'Terminé', amount: '18.50$' },
  { id: 'RD-8919', customer: 'Pierre Tremblay', driver: 'Luc P.', destination: 'Université Laval', status: 'Terminé', amount: '22.00$' },
  { id: 'RD-8918', customer: 'Sophie Roy', driver: 'Mélanie S.', destination: 'Place Ste-Foy', status: 'Annulé', amount: '0.00$' },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
          <p className="text-slate-500">Bienvenue, M. Dardari. Voici un aperçu de votre flotte aujourd&apos;hui.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all">
            <Calendar className="w-4 h-4" />
            Aujourd&apos;hui
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
            Exporter Rapport
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                stat.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {stat.change}
                {stat.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Rides Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Courses Récentes</h2>
            <button className="text-primary text-sm font-medium hover:underline">Voir tout</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Chauffeur</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentRides.map((ride) => (
                  <tr key={ride.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{ride.id}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{ride.customer}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{ride.driver}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        ride.status === 'En cours' ? 'bg-blue-50 text-blue-600' :
                        ride.status === 'Terminé' ? 'bg-emerald-50 text-emerald-600' :
                        'bg-rose-50 text-rose-600'
                      }`}>
                        {ride.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">{ride.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Map Preview / Fleet Status */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100">
            <h2 className="font-bold text-slate-900 text-lg">État de la Flotte</h2>
          </div>
          <div className="flex-1 p-6 space-y-6">
            <div className="relative h-48 bg-slate-100 rounded-xl overflow-hidden group">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40 group-hover:scale-110 transition-transform duration-700"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="bg-white/90 backdrop-blur px-4 py-2 rounded-lg text-sm font-bold text-slate-900 shadow-lg hover:bg-white transition-all">
                  Ouvrir Live Map
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-600">En service</span>
                </div>
                <span className="text-sm font-bold text-slate-900">32</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-slate-600">Occupé (En course)</span>
                </div>
                <span className="text-sm font-bold text-slate-900">18</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-slate-600">Pause</span>
                </div>
                <span className="text-sm font-bold text-slate-900">6</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                  <span className="text-sm text-slate-600">Hors service</span>
                </div>
                <span className="text-sm font-bold text-slate-900">14</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

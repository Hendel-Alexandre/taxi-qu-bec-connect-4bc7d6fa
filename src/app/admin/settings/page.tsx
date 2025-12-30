"use client";

import React from "react";
import { Settings as SettingsIcon, User, Bell, Shield, CreditCard } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex-1 bg-white p-6 overflow-y-auto">
      <div className="max-w-2xl">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">Paramètres</h1>

        <div className="space-y-6">
          {/* Profile Section */}
          <div className="bg-gray-50 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-gray-600" />
              <h2 className="font-medium text-gray-900">Profil</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Nom de l&apos;entreprise</label>
                <input 
                  type="text" 
                  defaultValue="Taxi Québec" 
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Email</label>
                <input 
                  type="email" 
                  defaultValue="admin@taxiquebec.ca" 
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500"
                />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-gray-50 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-5 h-5 text-gray-600" />
              <h2 className="font-medium text-gray-900">Notifications</h2>
            </div>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Nouvelles courses</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-yellow-500" />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Alertes chauffeurs</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-yellow-500" />
              </label>
            </div>
          </div>

          {/* Security */}
          <div className="bg-gray-50 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-gray-600" />
              <h2 className="font-medium text-gray-900">Sécurité</h2>
            </div>
            <button className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
              Changer le mot de passe
            </button>
          </div>

          <button className="w-full px-4 py-3 bg-[#FFD60A] text-black rounded-xl font-medium text-sm hover:bg-yellow-400 transition-colors">
            Enregistrer les modifications
          </button>
        </div>
      </div>
    </div>
  );
}

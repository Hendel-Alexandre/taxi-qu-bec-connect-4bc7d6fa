"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  MapPin, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Search,
  User
} from 'lucide-react';
import Image from 'next/image';

const menuItems = [
  { icon: LayoutDashboard, label: 'Tableau de bord', href: '/admin' },
  { icon: Users, label: 'Chauffeurs', href: '/admin/drivers' },
  { icon: Car, label: 'Courses', href: '/admin/rides' },
  { icon: MapPin, label: 'Live Map', href: '/admin/map' },
  { icon: Settings, label: 'Paramètres', href: '/admin/settings' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-slate-900 text-white transition-all duration-300 flex flex-col fixed inset-y-0 z-50`}
      >
        <div className="p-6 flex items-center gap-4 border-b border-slate-800">
          <div className="w-8 h-8 relative shrink-0">
             <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/taxi-quebec-logo-removebg-preview-1-1766792742115.png?width=8000&height=8000&resize=contain"
              alt="TQ"
              fill
              className="object-contain"
            />
          </div>
          {isSidebarOpen && <span className="font-bold text-lg whitespace-nowrap">Admin Portal</span>}
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {isSidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => router.push('/auth')}
            className="flex items-center gap-4 px-4 py-3 w-full rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all"
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-all"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Rechercher..."
                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 w-64 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-all">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">M. Dardari</p>
                <p className="text-xs text-slate-500">Administrateur</p>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
                <User className="w-6 h-6" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

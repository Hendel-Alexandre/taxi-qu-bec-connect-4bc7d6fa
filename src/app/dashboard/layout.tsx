"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  MapPin, 
  Bell, 
  History, 
  User, 
  HelpCircle, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const navItems = [
      { href: '/dashboard', icon: Home, label: 'Accueil' },
      { href: '/dashboard/history', icon: History, label: 'Historique' },
      { href: '/dashboard/addresses', icon: MapPin, label: 'Favoris' },
      { href: '/dashboard/notifications', icon: Bell, label: 'Alertes' },
      { href: '/dashboard/profile', icon: User, label: 'Profil' },
      { href: '/dashboard/help', icon: HelpCircle, label: 'Aide' },
    ];

    const pathname = usePathname();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const supabase = createClient();
  
    useEffect(() => {
      const getUser = async () => {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, email')
            .eq('id', authUser.id)
            .single();
          
          if (profile) {
            setUser(profile);
          } else {
            setUser({ email: authUser.email });
          }
  
          const { count } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', authUser.id)
            .eq('is_read', false);
          
          setUnreadCount(count || 0);
        }
      };
      getUser();
    }, [supabase]);
  
    const handleLogout = async () => {
      await supabase.auth.signOut();
      router.push('/auth');
    };
  
    return (
      <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100">
        {/* Slim Desktop Sidebar */}
        <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-20 bg-white border-r border-slate-100 flex-col items-center py-6 z-50 shadow-sm">
          <div className="mb-10">
            <Link href="/dashboard" className="block relative w-12 h-12 transition-transform hover:scale-105">
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/taxi-quebec-logo-removebg-preview-1-1766792742115.png?width=8000&height=8000&resize=contain"
                alt="Taxi Québec Logo"
                fill
                priority
                className="object-contain"
              />
            </Link>
          </div>
  
          <nav className="flex-1 flex flex-col gap-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'stroke-[2]' : 'stroke-[1.5]'}`} />
                  
                  {/* Tooltip */}
                  <div className="absolute left-16 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl">
                    {item.label}
                  </div>
  
                  {item.href === '/dashboard/notifications' && unreadCount > 0 && (
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-600 rounded-full border-2 border-white" />
                  )}
  
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute -left-4 w-1 h-6 bg-slate-900 rounded-r-full"
                    />
                  )}
                </Link>
              );
            })}
          </nav>
  
          <div className="mt-auto flex flex-col gap-5 items-center">
            <button
              onClick={handleLogout}
              className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
            >
              <LogOut className="w-5 h-5" />
            </button>
            <Link href="/dashboard/profile" className="w-10 h-10 rounded-full overflow-hidden border border-slate-100 hover:border-slate-900 transition-colors shadow-sm">
              <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{user?.name?.charAt(0) || 'U'}</span>
              </div>
            </Link>
          </div>
        </aside>
  
        {/* Mobile Header */}
        <header className="lg:hidden fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-b border-gray-100 z-50 px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/taxi-quebec-logo-removebg-preview-1-1766792742115.png?width=8000&height=8000&resize=contain"
                alt="Taxi Québec Logo"
                fill
                priority
                className="object-contain"
              />
            </div>
            <span className="font-bold tracking-tight text-lg text-slate-900 uppercase">Taxi Québec</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-900"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>
  
        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="lg:hidden fixed right-0 top-0 bottom-0 w-72 bg-white z-50 shadow-2xl p-6 flex flex-col"
              >
                <div className="flex items-center justify-between mb-8">
                  <span className="text-lg font-bold tracking-tight uppercase text-slate-900">Menu</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-1.5">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-lg transition-all ${
                          isActive
                            ? 'bg-slate-900 text-white'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium text-sm">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
  
                <div className="mt-auto pt-6 border-t border-slate-100">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3.5 w-full text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium text-sm">Déconnexion</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
  
        {/* Mobile Bottom Nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-40 pb-safe shadow-lg">
          <div className="flex items-center justify-around py-3">
            {navItems.slice(0, 5).map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 px-4 transition-all ${
                    isActive ? 'text-slate-900' : 'text-slate-300'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'stroke-[2]' : 'stroke-[1.5]'}`} />
                </Link>
              );
            })}
          </div>
        </nav>
  
        <main className="lg:ml-20 min-h-screen relative overflow-hidden bg-white">
          {children}
        </main>
      </div>
    );
}

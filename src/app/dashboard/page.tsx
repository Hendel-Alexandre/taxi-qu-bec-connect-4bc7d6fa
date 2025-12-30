"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  User, 
  Navigation, 
  Clock, 
  Car,
  X,
  ArrowRight,
  Check,
  Phone
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { GoogleMap } from '@/components/ui/google-map';
import { GoogleAddressSearch } from '@/components/ui/google-address-search';

type Ride = {
  id: string;
  pickup_address: string;
  dropoff_address: string;
  status: string;
  driver_name: string | null;
  vehicle_plate: string | null;
  driver_phone: string | null;
  created_at: string;
  estimated_price?: number;
};

type Profile = {
  name: string;
  email: string;
  phone: string | null;
};

type Location = { lat: number; lng: number };

export default function DashboardPage() {
  const [activeRide, setActiveRide] = useState<Ride | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupLocation, setPickupLocation] = useState<Location | null>(null);
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState<Location | null>(null);
  
  const [routeData, setRouteData] = useState<{ distance: string; duration: string; price: number } | null>(null);
  const [isBooked, setIsBooked] = useState(false);
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [isTimerActive, setIsTimerActive] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/auth');
          return;
        }

        const { data: profileData } = await supabase
          .from('profiles')
          .select('name, email, phone')
          .eq('id', user.id)
          .single();
        
        if (profileData) setProfile(profileData);

        const { data: activeRideData } = await supabase
          .from('rides')
          .select('*')
          .eq('user_id', user.id)
          .in('status', ['pending', 'confirmed', 'in_progress'])
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (activeRideData) {
          setActiveRide(activeRideData);
          setIsBooked(true);
          setIsTimerActive(true);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase, router]);

  const handleBook = async () => {
    if (!pickupAddress || !dropoffAddress || !routeData) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('rides')
        .insert({
          user_id: user.id,
          pickup_address: pickupAddress,
          dropoff_address: dropoffAddress,
          status: 'pending',
          estimated_price: routeData.price,
          pickup_lat: pickupLocation?.lat,
          pickup_lng: pickupLocation?.lng,
          dropoff_lat: dropoffLocation?.lat,
          dropoff_lng: dropoffLocation?.lng,
        })
        .select()
        .single();

      if (error) throw error;

      setActiveRide(data);
      setIsBooked(true);
      setIsTimerActive(true);
      setTimeLeft(300);
    } catch (error) {
      console.error('Error booking ride:', error);
    }
  };

  const handleReset = () => {
    setIsBooked(false);
    setIsTimerActive(false);
    setPickupAddress('');
    setPickupLocation(null);
    setDropoffAddress('');
    setDropoffLocation(null);
    setRouteData(null);
    setActiveRide(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full bg-slate-50 text-slate-900 overflow-hidden flex flex-col">
      {/* INTERACTIVE MAP */}
      <GoogleMap 
        pickupLocation={pickupLocation}
        destinationLocation={dropoffLocation}
        onRouteData={setRouteData}
      />

      {/* TOP OVERLAY (Compact Profile) */}
      <header className="relative z-20 flex items-center justify-between px-6 py-6 pointer-events-none lg:px-10">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
            <span className="text-sm font-black text-blue-600">{profile?.name?.charAt(0) || 'A'}</span>
          </div>
          <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-200 shadow-sm hidden sm:block">
            <p className="text-xs font-bold text-slate-900 tracking-tight">Bonjour, {profile?.name?.split(' ')[0] || 'Alex'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 pointer-events-auto">
          <Link href="/dashboard/notifications">
            <button className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200 flex items-center justify-center hover:bg-white transition-colors shadow-sm">
              <Bell className="w-4 h-4 text-slate-600" />
            </button>
          </Link>
        </div>
      </header>

      {/* MAIN UI CARDS (CENTERED) */}
      <div className="relative z-30 flex-1 flex items-center justify-center px-6 pointer-events-none pb-20 lg:pb-0">
        <AnimatePresence mode="wait">
          {!isBooked ? (
              <motion.div 
                key="booking-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-[1.5rem] p-5 shadow-2xl border border-slate-100 w-full max-w-[360px] pointer-events-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black italic tracking-tighter uppercase leading-none">Où allez-vous ?</h2>
                  <div className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border border-blue-100">Direct</div>
                </div>
                
                <div className="space-y-3 relative">
                  <div className="absolute left-[19px] top-8 bottom-8 w-[1.5px] bg-slate-100 z-0" />
                  
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-blue-600 ring-4 ring-blue-50" />
                    </div>
                    <div className="flex-1">
                      <GoogleAddressSearch 
                        placeholder="Point de départ"
                        onSelect={(addr, loc) => {
                          setPickupAddress(addr);
                          setPickupLocation(loc);
                        }}
                        defaultValue={pickupAddress}
                      />
                    </div>
                  </div>
  
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shrink-0 shadow-lg">
                      <div className="w-2 h-2 bg-white rounded-sm" />
                    </div>
                    <div className="flex-1">
                      <GoogleAddressSearch 
                        placeholder="Votre destination"
                        onSelect={(addr, loc) => {
                          setDropoffAddress(addr);
                          setDropoffLocation(loc);
                        }}
                        defaultValue={dropoffAddress}
                      />
                    </div>
                  </div>
                </div>

                {routeData && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-6 pt-5 border-t border-slate-100"
                  >
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">ESTIMATION</p>
                        <p className="text-2xl font-black italic tracking-tighter text-blue-600">${routeData.price.toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">TRAJET</p>
                        <p className="text-xs font-black italic text-slate-900">{routeData.distance} • {routeData.duration}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <button 
                  onClick={handleBook}
                  disabled={!pickupLocation || !dropoffLocation}
                  className="w-full bg-blue-600 text-white h-14 rounded-xl font-black text-base italic tracking-tighter uppercase mt-6 hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-100 disabled:opacity-50 disabled:shadow-none"
                >
                  Confirmer
                </button>
              </motion.div>
          ) : (
            <motion.div
              key="confirmation-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2rem] p-6 shadow-2xl border border-slate-100 w-full max-w-[400px] pointer-events-auto"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-xl shadow-blue-100">
                  <Check className="w-8 h-8" strokeWidth={3} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-black italic tracking-tighter uppercase leading-tight">Demande envoyée</h3>
                  <p className="text-xs text-slate-500 font-bold">Transmission à la centrale en cours...</p>
                </div>
                <button 
                  onClick={handleReset}
                  className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="bg-slate-50 rounded-[1.5rem] p-5 space-y-5 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 italic">Traitement de la demande</span>
                  <span className="text-base font-black text-blue-600 tabular-nums">{formatTime(timeLeft)}</span>
                </div>
                
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: '100%' }}
                    animate={{ width: `${(timeLeft / 300) * 100}%` }}
                    transition={{ duration: 1, ease: "linear" }}
                    className="h-full bg-blue-600 rounded-full"
                  />
                </div>

                {timeLeft === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 border border-red-100 rounded-2xl space-y-3"
                  >
                    <p className="text-xs font-bold text-red-600 leading-snug">
                      Désolé pour l'attente. Vous pouvez nous appeler directement pour accélérer la prise en charge.
                    </p>
                    <a 
                      href="tel:+14184764442"
                      className="flex items-center justify-center gap-2 w-full bg-red-600 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-colors shadow-lg shadow-red-100"
                    >
                      <Phone size={16} /> Appeler maintenant
                    </a>
                  </motion.div>
                ) : (
                  <div className="flex items-center gap-2 px-1">
                    <Car size={16} className="text-slate-400" />
                    <p className="text-xs font-bold text-slate-500 italic">Recherche d'un chauffeur disponible...</p>
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-100">
                 <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                    <p className="text-xs font-bold truncate text-slate-900">{pickupAddress}</p>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-slate-900" />
                    <p className="text-xs font-bold truncate text-slate-900">{dropoffAddress}</p>
                 </div>
              </div>
              
              <div className="mt-8 flex items-center justify-between">
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">TAXI LOCAL AGRÉÉ</span>
                 <button 
                  onClick={handleReset}
                  className="text-[11px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors"
                 >
                   Annuler la demande
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

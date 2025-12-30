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
  Phone,
  AlertTriangle,
  Home,
  Briefcase,
  Building2,
  Plane,
  Users,
  Truck,
  Tag,
  MapPin
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { MapboxMap } from '@/components/ui/mapbox-map';
import { MapboxAddressSearch } from '@/components/ui/mapbox-address-search';

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
  vehicle_type?: string;
};

type Profile = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  accessibility_wheelchair: boolean;
  accessibility_visual: boolean;
  accessibility_hearing: boolean;
  driver_notes: string | null;
};

type FavoriteAddress = {
  id: string;
  label: string;
  address: string;
  address_type: string;
  lat?: number;
  lng?: number;
};

type Location = { lat: number; lng: number };

type VehicleType = {
  id: string;
  name: string;
  icon: React.ReactNode;
  capacity: string;
  priceMultiplier: number;
};

const VEHICLE_TYPES: VehicleType[] = [
  { id: 'berline', name: 'Berline', icon: <Car className="w-6 h-6" />, capacity: '1-4 passagers', priceMultiplier: 1 },
  { id: 'van', name: 'Van', icon: <Truck className="w-6 h-6" />, capacity: '1-6 passagers', priceMultiplier: 1.3 },
  { id: 'familiale', name: 'Familiale', icon: <Users className="w-6 h-6" />, capacity: '1-7 passagers', priceMultiplier: 1.5 },
];

const STATIC_DESTINATIONS = [
  { id: 'chul', label: 'CHUL', icon: <Building2 className="w-4 h-4" />, address: '2705 Boul Laurier, Québec, QC G1V 4G2', lat: 46.7812, lng: -71.2761 },
  { id: 'airport', label: 'Aéroport', icon: <Plane className="w-4 h-4" />, address: '505 Rue Principale, Québec, QC G2G 0J4', lat: 46.7912, lng: -71.3933 },
];

const getAddressIcon = (type: string) => {
  switch (type) {
    case 'home': return <Home className="w-4 h-4" />;
    case 'work': return <Briefcase className="w-4 h-4" />;
    case 'airport': return <Plane className="w-4 h-4" />;
    default: return <Tag className="w-4 h-4" />;
  }
};

export default function DashboardPage() {
  const [activeRide, setActiveRide] = useState<Ride | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [favoriteAddresses, setFavoriteAddresses] = useState<FavoriteAddress[]>([]);
  
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupLocation, setPickupLocation] = useState<Location | null>(null);
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState<Location | null>(null);
  
  const [routeData, setRouteData] = useState<{ distance: string; duration: string; price: number } | null>(null);
  const [isBooked, setIsBooked] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [showVehicleSelection, setShowVehicleSelection] = useState(false);
  
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressModalType, setAddressModalType] = useState<'home' | 'work'>('home');
  const [newAddressValue, setNewAddressValue] = useState('');
  const [newAddressLocation, setNewAddressLocation] = useState<Location | null>(null);
  const [savingAddress, setSavingAddress] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState(300);
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

  const fetchData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, name, email, phone, accessibility_wheelchair, accessibility_visual, accessibility_hearing, driver_notes')
        .eq('id', user.id)
        .single();
      
      if (profileData) setProfile(profileData);

      const { data: favAddresses } = await supabase
        .from('favorite_addresses')
        .select('*')
        .eq('user_id', user.id);
      
      if (favAddresses) setFavoriteAddresses(favAddresses);

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
        setPickupAddress(activeRideData.pickup_address);
        setDropoffAddress(activeRideData.dropoff_address);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleQuickDestination = (dest: any) => {
    if (dest.address && dest.lat && dest.lng) {
      setDropoffAddress(dest.address);
      setDropoffLocation({ lat: dest.lat, lng: dest.lng });
    } else if (dest.type === 'home' || dest.type === 'work') {
      // For empty home/work, show setup modal
      setAddressModalType(dest.type as 'home' | 'work');
      setShowAddressModal(true);
    }
  };

  const handleSaveAddress = async () => {
    if (!newAddressValue || !newAddressLocation || !profile) return;
    
    setSavingAddress(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const existingAddress = favoriteAddresses.find(a => a.address_type === addressModalType);
    
    if (existingAddress) {
      await supabase
        .from('favorite_addresses')
        .update({
          address: newAddressValue,
          lat: newAddressLocation.lat,
          lng: newAddressLocation.lng,
          label: addressModalType === 'home' ? 'Maison' : 'Travail',
        })
        .eq('id', existingAddress.id);
    } else {
      await supabase.from('favorite_addresses').insert({
        user_id: user.id,
        label: addressModalType === 'home' ? 'Maison' : 'Travail',
        address: newAddressValue,
        address_type: addressModalType,
        lat: newAddressLocation.lat,
        lng: newAddressLocation.lng,
      });
    }

    setDropoffAddress(newAddressValue);
    setDropoffLocation(newAddressLocation);
    
    const { data: updatedAddresses } = await supabase
      .from('favorite_addresses')
      .select('*')
      .eq('user_id', user.id);
    if (updatedAddresses) setFavoriteAddresses(updatedAddresses);

    setSavingAddress(false);
    setShowAddressModal(false);
    setNewAddressValue('');
    setNewAddressLocation(null);
  };

  const handleProceedToVehicleSelection = () => {
    if (!pickupAddress || !dropoffAddress || !routeData) return;
    setShowVehicleSelection(true);
  };

  const handleBook = async () => {
    if (!pickupAddress || !dropoffAddress || !routeData || !selectedVehicle) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const vehicleType = VEHICLE_TYPES.find(v => v.id === selectedVehicle);
      const finalPrice = routeData.price * (vehicleType?.priceMultiplier || 1);

      let notes = '';
      if (profile) {
        const accessibilityNeeds: string[] = [];
        if (profile.accessibility_wheelchair) accessibilityNeeds.push('Fauteuil roulant');
        if (profile.accessibility_visual) accessibilityNeeds.push('Déficience visuelle');
        if (profile.accessibility_hearing) accessibilityNeeds.push('Déficience auditive');
        if (accessibilityNeeds.length > 0) {
          notes += `Besoins d'accessibilité: ${accessibilityNeeds.join(', ')}. `;
        }
        if (profile.driver_notes) {
          notes += `Notes: ${profile.driver_notes}`;
        }
      }

      const { data, error } = await supabase
        .from('rides')
        .insert({
          user_id: user.id,
          pickup_address: pickupAddress,
          dropoff_address: dropoffAddress,
          status: 'pending',
          estimated_price: finalPrice,
          pickup_lat: pickupLocation?.lat,
          pickup_lng: pickupLocation?.lng,
          dropoff_lat: dropoffLocation?.lat,
          dropoff_lng: dropoffLocation?.lng,
          notes: notes || null,
        })
        .select()
        .single();

      if (error) throw error;

      setActiveRide(data);
      setIsBooked(true);
      setIsTimerActive(true);
      setTimeLeft(300);
      setShowVehicleSelection(false);
    } catch (error) {
      console.error('Error booking ride:', error);
    }
  };

  const handleCancelBooking = async () => {
    if (!activeRide) {
      handleReset();
      return;
    }

    try {
      const { error } = await supabase
        .from('rides')
        .update({ status: 'cancelled' })
        .eq('id', activeRide.id);

      if (error) throw error;
      
      handleReset();
    } catch (error) {
      console.error('Error cancelling ride:', error);
      handleReset();
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
    setShowCancelConfirm(false);
    setSelectedVehicle(null);
    setShowVehicleSelection(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-screen bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Combine saved favorites and static destinations for quick options
  const quickOptions = [
    // Ensure Maison and Travail are always shown first (either saved or for setup)
    { 
      id: 'home', 
      label: 'Maison', 
      icon: <Home className="w-4 h-4" />, 
      type: 'home',
      address: favoriteAddresses.find(a => a.address_type === 'home')?.address,
      lat: favoriteAddresses.find(a => a.address_type === 'home')?.lat,
      lng: favoriteAddresses.find(a => a.address_type === 'home')?.lng,
      isSaved: favoriteAddresses.some(a => a.address_type === 'home')
    },
    { 
      id: 'work', 
      label: 'Travail', 
      icon: <Briefcase className="w-4 h-4" />, 
      type: 'work',
      address: favoriteAddresses.find(a => a.address_type === 'work')?.address,
      lat: favoriteAddresses.find(a => a.address_type === 'work')?.lat,
      lng: favoriteAddresses.find(a => a.address_type === 'work')?.lng,
      isSaved: favoriteAddresses.some(a => a.address_type === 'work')
    },
    // Add other custom favorites
    ...favoriteAddresses
      .filter(a => a.address_type !== 'home' && a.address_type !== 'work')
      .map(a => ({
        id: a.id,
        label: a.label,
        icon: getAddressIcon(a.address_type),
        type: a.address_type,
        address: a.address,
        lat: a.lat,
        lng: a.lng,
        isSaved: true
      })),
    // Add static common places if not already in favorites
    ...STATIC_DESTINATIONS
  ];

  return (
    <div className="relative h-screen w-full bg-slate-50 text-slate-900 overflow-hidden flex flex-col">
        <MapboxMap 
          pickupLocation={pickupLocation}
          destinationLocation={dropoffLocation}
          onRouteData={setRouteData}
        />

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

      <div className="relative z-30 flex-1 flex items-center justify-center px-6 pointer-events-none pb-20 lg:pb-0">
        <AnimatePresence mode="wait">
          {!isBooked && !showVehicleSelection ? (
              <motion.div 
                key="booking-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-[1.5rem] p-5 shadow-2xl border border-slate-100 w-full max-w-[360px] pointer-events-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-black italic tracking-tighter uppercase leading-none">Où allez-vous ?</h2>
                  <div className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border border-blue-100">Direct</div>
                </div>

                <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                  {quickOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleQuickDestination(opt)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0",
                        (opt.isSaved || (opt as any).address)
                          ? "bg-slate-100 text-slate-700 hover:bg-slate-200" 
                          : "bg-slate-50 text-slate-400 border border-dashed border-slate-200 hover:border-slate-300"
                      )}
                    >
                      {opt.icon}
                      {opt.label}
                    </button>
                  ))}
                </div>
                
                <div className="space-y-3 relative">
                  <div className="absolute left-[19px] top-8 bottom-8 w-[1.5px] bg-slate-100 z-0" />
                  
                    <div className="flex items-center gap-4 relative z-20">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-blue-600 ring-4 ring-blue-50" />
                      </div>
                      <div className="flex-1">
                      <MapboxAddressSearch 
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
                        <MapboxAddressSearch 
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
                  onClick={handleProceedToVehicleSelection}
                  disabled={!pickupLocation || !dropoffLocation}
                  className="w-full bg-blue-600 text-white h-14 rounded-xl font-black text-base italic tracking-tighter uppercase mt-6 hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-100 disabled:opacity-50 disabled:shadow-none"
                >
                  Choisir véhicule
                </button>
              </motion.div>
          ) : !isBooked && showVehicleSelection ? (
            <motion.div 
              key="vehicle-selection-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[1.5rem] p-5 shadow-2xl border border-slate-100 w-full max-w-[400px] pointer-events-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <button 
                  onClick={() => setShowVehicleSelection(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </button>
                <h2 className="text-lg font-black italic tracking-tighter uppercase">Type de véhicule</h2>
                <div className="w-8" />
              </div>
              
              <div className="space-y-3 mb-6">
                {VEHICLE_TYPES.map((vehicle) => {
                  const price = routeData ? (routeData.price * vehicle.priceMultiplier).toFixed(2) : '0.00';
                  return (
                    <button
                      key={vehicle.id}
                      onClick={() => setSelectedVehicle(vehicle.id)}
                      className={cn(
                        "w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all",
                        selectedVehicle === vehicle.id 
                          ? "border-blue-600 bg-blue-50" 
                          : "border-slate-100 hover:border-slate-200 bg-white"
                      )}
                    >
                      <div className={cn(
                        "w-14 h-14 rounded-xl flex items-center justify-center shrink-0",
                        selectedVehicle === vehicle.id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                      )}>
                        {vehicle.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-black text-slate-900">{vehicle.name}</p>
                        <p className="text-xs text-slate-500 font-medium">{vehicle.capacity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-lg text-blue-600">${price}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="bg-slate-50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-blue-600" />
                  <p className="font-bold text-slate-600 truncate flex-1">{pickupAddress}</p>
                </div>
                <div className="flex items-center gap-3 text-xs mt-2">
                  <div className="w-2 h-2 bg-slate-900" />
                  <p className="font-bold text-slate-600 truncate flex-1">{dropoffAddress}</p>
                </div>
              </div>
              
              <button 
                onClick={handleBook}
                disabled={!selectedVehicle}
                className="w-full bg-blue-600 text-white h-14 rounded-xl font-black text-base italic tracking-tighter uppercase hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-100 disabled:opacity-50 disabled:shadow-none"
              >
                Confirmer la réservation
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
                    onClick={() => setShowCancelConfirm(true)}
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
                  onClick={() => setShowCancelConfirm(true)}
                  className="text-[11px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors"
                 >
                   Annuler la demande
                 </button>
              </div>
            </motion.div>
          )}

          {showCancelConfirm && (
            <motion.div
              key="cancel-confirm-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center px-6 pointer-events-auto"
            >
              <motion.div
                key="cancel-confirm-card"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-[2rem] p-8 shadow-2xl border border-slate-100 w-full max-w-[400px] text-center"
              >
                <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle size={40} strokeWidth={2.5} />
                </div>
                
                <h3 className="text-2xl font-black italic tracking-tighter uppercase leading-tight mb-3">
                  Are you sure you want to cancel this taxi booking?
                </h3>
                
                <p className="text-slate-500 font-bold text-sm mb-8 leading-relaxed">
                  The taxi will be cancelled and the driver will be notified
                </p>
                
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleCancelBooking}
                    className="w-full bg-red-600 text-white h-14 rounded-xl font-black text-base italic tracking-tighter uppercase hover:bg-red-700 active:scale-[0.98] transition-all shadow-lg shadow-red-100"
                  >
                    Cancel Booking
                  </button>
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="w-full bg-slate-100 text-slate-900 h-14 rounded-xl font-black text-base italic tracking-tighter uppercase hover:bg-slate-200 active:scale-[0.98] transition-all"
                  >
                    Keep Booking
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {showAddressModal && (
            <motion.div
              key="address-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center px-6 pointer-events-auto"
              onClick={() => setShowAddressModal(false)}
            >
              <motion.div
                key="address-modal-card"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-[2rem] p-6 shadow-2xl border border-slate-100 w-full max-w-[400px]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black italic tracking-tighter uppercase">
                    {addressModalType === 'home' ? 'Créer votre adresse de maison' : 'Créer votre adresse de travail'}
                  </h3>
                  <button 
                    onClick={() => setShowAddressModal(false)}
                    className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900"
                  >
                    <X size={16} />
                  </button>
                </div>
                
                <div className="mb-6">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Adresse</label>
                  <MapboxAddressSearch 
                    placeholder="Rechercher une adresse..."
                    onSelect={(addr, loc) => {
                      setNewAddressValue(addr);
                      setNewAddressLocation(loc);
                    }}
                    defaultValue={newAddressValue}
                  />
                </div>
                
                <button 
                  onClick={handleSaveAddress}
                  disabled={!newAddressValue || !newAddressLocation || savingAddress}
                  className="w-full bg-blue-600 text-white h-14 rounded-xl font-black text-base italic tracking-tighter uppercase hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-100 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                >
                  {savingAddress ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check size={20} />
                      Enregistrer et utiliser
                    </>
                  )}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

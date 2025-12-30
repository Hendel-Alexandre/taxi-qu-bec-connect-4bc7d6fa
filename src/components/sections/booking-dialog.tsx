"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  IconCar, IconUser, IconUsers, 
  IconCalendar, IconClock, IconCheck, IconChevronRight,
  IconPlane, IconTool, IconWheelchair, IconBox, IconBolt,
  IconX
} from '@tabler/icons-react';
import { useLanguage } from '@/lib/language-context';
import { useBooking } from '@/hooks/use-booking';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from '@/lib/utils';
import { MapboxAddressSearch } from '@/components/ui/mapbox-address-search';
import { AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BookingDialog: React.FC = () => {
  const { t } = useLanguage();
  const { isOpen, close, initialData } = useBooking();
  const [mounted, setMounted] = useState(false);
  
    const [isBooked, setIsBooked] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [selectedService, setSelectedService] = useState('taxi');
  const [selectedCar, setSelectedCar] = useState('standard');
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingTime, setBookingTime] = useState('12:00');
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(2);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (initialData?.pickupAddress) {
      setPickupAddress(initialData.pickupAddress);
    }
  }, [initialData]);

  useEffect(() => {
    if (isBooked) {
      const timer = setInterval(() => {
        setProgress(prev => (prev < 100 ? prev + 1 : 100));
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [isBooked]);

  if (!mounted) return null;

  const services = [
    { id: 'taxi', name: t.services.immediateTaxi, icon: <IconBolt size={20} /> },
    { id: 'airport', name: t.services.airport, icon: <IconPlane size={20} /> },
    { id: 'assistance', name: "ASSISTANCE ROUTIÈRE", icon: <IconTool size={20} /> },
    { id: 'adapted', name: t.services.specialized, icon: <IconWheelchair size={20} /> },
    { id: 'delivery', name: t.services.delivery, icon: <IconBox size={20} /> },
  ];

  const carOptions = [
    { id: 'standard', name: t.hero.carOptions.standard, icon: <IconCar size={24} />, capacity: 4, price: "39.10" },
    { id: 'comfort', name: t.hero.carOptions.comfort, icon: <IconUser size={24} />, capacity: 4, price: "55.00" },
    { id: 'van', name: t.hero.carOptions.van, icon: <IconUsers size={24} />, capacity: 6, price: "75.00" },
  ];

  const handleConfirmInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBooked(true);
  };

    const handleReset = () => {
      setIsBooked(false);
      setShowCancelConfirm(false);
      close();
      setStep(1);
      setProgress(2);
    };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleReset()}>
      <DialogContent className={cn(
        "sm:max-w-[520px] p-0 border-none shadow-2xl overflow-hidden flex flex-col transition-all duration-500",
        isBooked ? "bg-white rounded-[3rem]" : "bg-white rounded-[2rem] max-h-[90vh]"
      )}>
          {isBooked ? (
            <div className="p-6 flex flex-col items-center animate-in zoom-in duration-300">
                <button 
                  onClick={() => setShowCancelConfirm(true)}
                  className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 hover:text-slate-600"
                >
                  <IconX size={16} />
                </button>

              <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-100">
                <IconCheck size={20} strokeWidth={3} />
              </div>

              <h3 className="text-xl font-black italic tracking-tighter uppercase mb-1">Demande envoyée</h3>
              <p className="text-slate-400 font-bold text-[10px] mb-6">Transmission à la centrale de répartition</p>

              <div className="w-full bg-slate-50 rounded-2xl p-4 text-left mb-6 space-y-4">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-slate-300 uppercase tracking-widest italic">Trajet</span>
                  <span className="text-blue-600 italic">Estimation: $39.10</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <p className="text-[10px] font-black truncate text-slate-600 flex-1">{pickupAddress || "Position"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-slate-900" />
                  <p className="text-[10px] font-black truncate text-slate-600 flex-1">{dropoffAddress || "Destination"}</p>
                </div>
                
                <div className="pt-3 border-t border-slate-200/50 flex justify-between items-center">
                   <p className="text-[9px] font-bold italic text-blue-600">⚠️ Estimation sujette à variation</p>
                   <span className="text-[9px] font-black text-slate-900 uppercase italic tracking-tighter">STANDARD</span>
                </div>
              </div>

              <div className="w-full space-y-3">
                 <div className="flex justify-between items-end mb-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Temps estimé</p>
                    <p className="text-2xl font-black italic tracking-tighter text-blue-600 leading-none">15 min</p>
                 </div>
                 <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-full bg-blue-600 rounded-full"
                    />
                 </div>
              </div>

                <div className="mt-8 flex items-center justify-between w-full">
                   <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">TAXI LOCAL AGRÉÉ</span>
                   <button 
                    onClick={() => setShowCancelConfirm(true)}
                    className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline"
                   >
                     Fermer
                   </button>
                </div>

                <AnimatePresence>
                  {showCancelConfirm && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-[100] bg-white/95 backdrop-blur-md flex items-center justify-center p-8 text-center"
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="max-w-[320px]"
                      >
                        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                          <AlertTriangle size={32} strokeWidth={2.5} />
                        </div>
                        
                        <h3 className="text-xl font-black italic tracking-tighter uppercase leading-tight mb-3 text-slate-900">
                          Are you sure you want to cancel this taxi booking?
                        </h3>
                        
                        <p className="text-slate-500 font-bold text-[10px] mb-8 leading-relaxed uppercase tracking-widest">
                          The taxi will be cancelled and the driver will be notified
                        </p>
                        
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={handleReset}
                            className="w-full bg-red-600 text-white h-12 rounded-xl font-black text-xs italic tracking-tighter uppercase hover:bg-red-700 active:scale-[0.98] transition-all shadow-lg shadow-red-100"
                          >
                            Cancel Booking
                          </button>
                          <button
                            onClick={() => setShowCancelConfirm(false)}
                            className="w-full bg-slate-100 text-slate-900 h-12 rounded-xl font-black text-xs italic tracking-tighter uppercase hover:bg-slate-200 active:scale-[0.98] transition-all"
                          >
                            Keep Booking
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
          ) : (
          <div className="flex flex-col overflow-hidden">
            {/* Header with brand color */}
            <div className="bg-[#121212] p-8 text-white shrink-0 relative">
                <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase leading-none">{t.hero.modal.title}</DialogTitle>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-2">Configuration du trajet</p>
                <button 
                  onClick={close}
                  className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors border border-white/5"
                >
                  <IconX size={20} />
                </button>
            </div>

            <div className="p-8 space-y-8 overflow-y-auto no-scrollbar">
              {step === 1 ? (
                <>
                  {/* Service Type Selection */}
                  <div className="space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Type de service</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {services.map((service) => (
                        <button
                          key={service.id}
                          onClick={() => setSelectedService(service.id)}
                          className={cn(
                            "flex flex-col items-center justify-center p-4 rounded-2xl transition-all border-2 gap-3 text-center group",
                            selectedService === service.id 
                              ? "bg-slate-900 border-slate-900 text-white" 
                              : "bg-white border-slate-50 hover:border-slate-200 text-slate-500"
                          )}
                        >
                          <div className={cn("p-2 rounded-xl transition-colors", selectedService === service.id ? "bg-white/10" : "bg-slate-50")}>
                            {service.icon}
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-tighter leading-tight">
                            {service.name.split(' — ')[0]}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Route Inputs */}
                    <div className="relative space-y-4">
                      <div className="absolute left-[23px] top-10 bottom-10 w-0.5 bg-slate-100 z-0" />
                      
                      <div className="flex items-center gap-4 relative z-20">
                        <div className="w-12 h-12 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center shadow-sm">
                          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-blue-50" />
                        </div>
                        <div className="flex-1">
                            <MapboxAddressSearch 
                              placeholder={t.hero.pickupPlaceholder}
                              onSelect={(address) => setPickupAddress(address)}
                              defaultValue={pickupAddress}
                            />
                        </div>
                      </div>
  
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center shadow-sm">
                          <div className="w-2.5 h-2.5 bg-black" />
                        </div>
                          <div className="flex-1 min-w-0">
                            <MapboxAddressSearch 
                              placeholder={t.hero.dropoffPlaceholder}
                              onSelect={(address) => setDropoffAddress(address)}
                              defaultValue={dropoffAddress}
                            />
                          </div>
                      </div>
                    </div>

                  {/* Car selection */}
                  <div className="space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Choix du véhicule</span>
                    <div className="grid grid-cols-1 gap-3">
                      {carOptions.map((car) => (
                        <button
                          key={car.id}
                          onClick={() => setSelectedCar(car.id)}
                          className={cn(
                            "flex items-center justify-between p-4 rounded-2xl transition-all border-2 group",
                            selectedCar === car.id ? "bg-slate-50 border-slate-900" : "bg-white border-slate-50 hover:border-slate-100"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-colors", selectedCar === car.id ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-400")}>
                              {car.icon}
                            </div>
                            <div className="text-left">
                              <div className="font-black text-sm uppercase italic tracking-tighter">{car.name}</div>
                              <div className="text-[9px] text-slate-400 font-bold flex items-center gap-1 uppercase tracking-widest">
                                <IconUsers size={12} /> {car.capacity} places
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-3">
                            <div className="text-sm font-black italic tracking-tighter">${car.price}</div>
                            {selectedCar === car.id && (
                              <div className="w-5 h-5 bg-slate-900 rounded-full flex items-center justify-center text-white">
                                <IconCheck size={12} strokeWidth={4} />
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button 
                    disabled={!pickupAddress || !dropoffAddress}
                    onClick={() => setStep(2)}
                    className="w-full bg-[#121212] hover:bg-black text-white h-16 rounded-2xl font-black uppercase italic tracking-tighter text-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 shadow-xl shadow-slate-200"
                  >
                    CONTINUER <IconChevronRight size={20} />
                  </Button>
                </>
              ) : (
                <form onSubmit={handleConfirmInfo} className="space-y-8 animate-in slide-in-from-right duration-500">
                  <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service</span>
                      <span className="bg-slate-900 text-white px-4 py-1 rounded-full text-[9px] font-black uppercase italic tracking-tighter">
                        {services.find(s => s.id === selectedService)?.name.split(' — ')[0]}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Véhicule</span>
                      <span className="text-slate-900 font-black uppercase italic tracking-tighter text-sm">{carOptions.find(c => c.id === selectedCar)?.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Planifié pour</span>
                      <span className="text-slate-900 font-black text-sm uppercase italic tracking-tighter">{bookingDate} — {bookingTime}</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid gap-2">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.hero.modal.name}</Label>
                      <Input required placeholder="Jean Dupont" className="h-14 rounded-2xl bg-slate-50 border-none text-sm font-black focus:ring-2 ring-slate-100 placeholder:text-slate-300" />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.hero.modal.phone}</Label>
                      <Input type="tel" required placeholder="(418) 000-0000" className="h-14 rounded-2xl bg-slate-50 border-none text-sm font-black focus:ring-2 ring-slate-100 placeholder:text-slate-300" />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button type="button" variant="ghost" onClick={() => setStep(1)} className="flex-1 h-16 rounded-2xl text-[10px] font-black text-slate-400 uppercase hover:bg-slate-50 tracking-widest">RETOUR</Button>
                    <Button type="submit" className="flex-[2] bg-slate-900 hover:bg-black text-white h-16 rounded-2xl font-black uppercase italic tracking-tighter text-lg shadow-2xl active:scale-[0.98] transition-all">
                      CONFIRMER
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;


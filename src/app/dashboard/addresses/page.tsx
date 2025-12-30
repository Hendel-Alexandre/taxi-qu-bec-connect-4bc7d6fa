"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Home, 
  Briefcase, 
  Plane, 
  Plus, 
  Trash2, 
  Edit2,
  X,
  Check,
  Tag,
  Search,
  ChevronRight,
  ArrowRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

import { MapboxAddressSearch } from '@/components/ui/mapbox-address-search';

type Address = {
  id: string;
  label: string;
  address: string;
  address_type: string;
  lat?: number;
  lng?: number;
};

const addressIcons: Record<string, React.ReactNode> = {
  home: <Home className="w-5 h-5" />,
  work: <Briefcase className="w-5 h-5" />,
  airport: <Plane className="w-5 h-5" />,
  custom: <Tag className="w-5 h-5" />,
};

const addressLabels: Record<string, string> = {
  home: 'Maison',
  work: 'Travail',
  airport: 'Aéroport',
  custom: 'Personnalisé',
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    label: '',
    address: '',
    address_type: 'custom',
    lat: null as number | null,
    lng: null as number | null,
  });
  const supabase = createClient();
  const router = useRouter();

  const fetchAddresses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('favorite_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (data) setAddresses(data);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }

      // If it's home or work and we're not editing an existing one of that type, 
      // check if one already exists to update it instead of inserting a duplicate
      if (!editingAddress && (formData.address_type === 'home' || formData.address_type === 'work')) {
        const existing = addresses.find(a => a.address_type === formData.address_type);
        if (existing) {
          const { error: updateErr } = await supabase
            .from('favorite_addresses')
            .update({
              label: formData.label,
              address: formData.address,
              lat: formData.lat,
              lng: formData.lng,
            })
            .eq('id', existing.id);
          
          if (updateErr) throw updateErr;
          setShowModal(false);
          fetchAddresses();
          return;
        }
      }

      if (editingAddress) {
        const { error: updateErr } = await supabase
          .from('favorite_addresses')
          .update({
            label: formData.label,
            address: formData.address,
            address_type: formData.address_type,
            lat: formData.lat,
            lng: formData.lng,
          })
          .eq('id', editingAddress.id);
        
        if (updateErr) throw updateErr;
      } else {
        const { error: insertErr } = await supabase.from('favorite_addresses').insert({
          user_id: user.id,
          label: formData.label,
          address: formData.address,
          address_type: formData.address_type,
          lat: formData.lat,
          lng: formData.lng,
        });
        
        if (insertErr) throw insertErr;
      }

      setShowModal(false);
      setEditingAddress(null);
      setFormData({ label: '', address: '', address_type: 'custom', lat: null, lng: null });
      fetchAddresses();
    } catch (err: any) {
      console.error('Error saving address:', err);
      setError(err.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('favorite_addresses').delete().eq('id', id);
      if (error) throw error;
      fetchAddresses();
    } catch (err) {
      console.error('Error deleting address:', err);
    }
  };

  const openEditModal = (address: Address) => {
    setError(null);
    setEditingAddress(address);
    setFormData({
      label: address.label,
      address: address.address,
      address_type: address.address_type,
      lat: address.lat || null,
      lng: address.lng || null,
    });
    setShowModal(true);
  };

  const openNewModal = (type: string = 'custom') => {
    setError(null);
    setEditingAddress(null);
    setFormData({
      label: type === 'custom' ? '' : addressLabels[type],
      address: '',
      address_type: type,
      lat: null,
      lng: null,
    });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const hasHome = addresses.some(a => a.address_type === 'home');
  const hasWork = addresses.some(a => a.address_type === 'work');

  return (
    <div className="py-8 max-w-4xl mx-auto space-y-8">
      <header className="flex items-center justify-between px-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">Lieux favoris</h1>
          <p className="text-gray-500 text-sm font-medium">Gérez vos adresses enregistrées</p>
        </div>
        <button
          onClick={() => openNewModal('custom')}
          className="bg-black text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors shadow-sm"
        >
          Ajouter
        </button>
      </header>

      {/* Quick Setup */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {!hasHome && (
          <button 
            onClick={() => openNewModal('home')}
            className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-gray-100 border-dashed hover:border-black transition-colors text-left"
          >
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
              <Home className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <p className="font-bold text-sm">Ajouter mon domicile</p>
              <p className="text-xs text-gray-400">Pour des trajets plus rapides</p>
            </div>
          </button>
        )}
        {!hasWork && (
          <button 
            onClick={() => openNewModal('work')}
            className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-gray-100 border-dashed hover:border-black transition-colors text-left"
          >
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <p className="font-bold text-sm">Ajouter mon travail</p>
              <p className="text-xs text-gray-400">Gagnez du temps le matin</p>
            </div>
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-50">
          {addresses.map((address) => (
            <motion.div
              key={address.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-5 flex items-center justify-between group hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#F3F3F3] rounded-xl flex items-center justify-center text-black">
                  {addressIcons[address.address_type] || addressIcons.custom}
                </div>
                <div>
                  <h3 className="font-bold text-black flex items-center gap-2">
                    {address.label}
                    {address.address_type !== 'custom' && (
                      <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded-full uppercase tracking-tight">
                        {addressLabels[address.address_type]}
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-500 font-medium">{address.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEditModal(address)}
                  className="p-2 text-gray-400 hover:text-black transition-colors"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(address.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}

          {addresses.length === 0 && (
            <div className="p-16 text-center">
              <div className="w-16 h-16 bg-[#F3F3F3] rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-bold text-lg mb-1">Aucune adresse</h3>
              <p className="text-gray-500 text-sm max-w-[240px] mx-auto">
                Enregistrez vos adresses pour commander en un clin d'œil.
              </p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-black">
                  {editingAddress ? 'Modifier' : 'Nouveau favori'}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-black">
                  <X className="w-6 h-6" />
                </button>
              </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm font-medium">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Nom du lieu</label>
                    <input
                      type="text"
                      value={formData.label}
                      onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                      className="w-full p-4 bg-[#F3F3F3] border-none rounded-xl text-black placeholder:text-gray-400 focus:ring-2 focus:ring-black outline-none"
                      placeholder="Ex: Maison, Bureau..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Adresse</label>
                    <MapboxAddressSearch
                      placeholder="Rechercher une adresse..."
                      defaultValue={formData.address}
                      onSelect={(addr, loc) => {
                        setFormData({ 
                          ...formData, 
                          address: addr,
                          lat: loc.lat,
                          lng: loc.lng
                        });
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!formData.address || !formData.label || saving}
                    className="w-full bg-black text-white rounded-xl py-4 font-bold transition-all hover:bg-gray-800 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Check className="w-5 h-5" />
                    )}
                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

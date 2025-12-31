import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Home, 
  Briefcase, 
  Plane, 
  Trash2, 
  Edit2,
  X,
  Check,
  Tag,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

type Address = {
  id: string;
  label: string;
  address: string;
  lat?: number | null;
  lng?: number | null;
  is_favorite?: boolean | null;
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

export default function Addresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    label: '',
    address: '',
    lat: null as number | null,
    lng: null as number | null,
  });
  const navigate = useNavigate();

  const fetchAddresses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('saved_addresses')
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
        navigate('/auth');
        return;
      }

      if (editingAddress) {
        const { error: updateErr } = await supabase
          .from('saved_addresses')
          .update({
            label: formData.label,
            address: formData.address,
            lat: formData.lat,
            lng: formData.lng,
          })
          .eq('id', editingAddress.id);
        
        if (updateErr) throw updateErr;
      } else {
        const { error: insertErr } = await supabase.from('saved_addresses').insert({
          user_id: user.id,
          label: formData.label,
          address: formData.address,
          lat: formData.lat,
          lng: formData.lng,
        });
        
        if (insertErr) throw insertErr;
      }

      setShowModal(false);
      setEditingAddress(null);
      setFormData({ label: '', address: '', lat: null, lng: null });
      fetchAddresses();
    } catch (err: unknown) {
      console.error('Error saving address:', err);
      setError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('saved_addresses').delete().eq('id', id);
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
      lat: address.lat || null,
      lng: address.lng || null,
    });
    setShowModal(true);
  };

  const openNewModal = (label: string = '') => {
    setError(null);
    setEditingAddress(null);
    setFormData({
      label: label,
      address: '',
      lat: null,
      lng: null,
    });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const hasHome = addresses.some(a => a.label.toLowerCase() === 'maison');
  const hasWork = addresses.some(a => a.label.toLowerCase() === 'travail');

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Lieux favoris</h1>
          <p className="text-muted-foreground text-sm font-medium">Gérez vos adresses enregistrées</p>
        </div>
        <button
          onClick={() => openNewModal()}
          className="bg-foreground text-background px-6 py-3 rounded-xl font-bold text-sm hover:bg-foreground/90 transition-colors shadow-sm"
        >
          Ajouter
        </button>
      </header>

      {/* Quick Setup */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {!hasHome && (
          <button 
            onClick={() => openNewModal('Maison')}
            className="flex items-center gap-4 p-6 bg-card rounded-2xl border border-dashed border-border hover:border-foreground transition-colors text-left"
          >
            <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
              <Home className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">Ajouter mon domicile</p>
              <p className="text-xs text-muted-foreground">Pour des trajets plus rapides</p>
            </div>
          </button>
        )}
        {!hasWork && (
          <button 
            onClick={() => openNewModal('Travail')}
            className="flex items-center gap-4 p-6 bg-card rounded-2xl border border-dashed border-border hover:border-foreground transition-colors text-left"
          >
            <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">Ajouter mon travail</p>
              <p className="text-xs text-muted-foreground">Gagnez du temps le matin</p>
            </div>
          </button>
        )}
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="divide-y divide-border">
          {addresses.map((address) => (
            <motion.div
              key={address.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-5 flex items-center justify-between group hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center text-foreground">
                  {addressIcons[address.label.toLowerCase()] || addressIcons.custom}
                </div>
                <div>
                  <h3 className="font-bold text-foreground flex items-center gap-2">
                    {address.label}
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium">{address.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEditModal(address)}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(address.id)}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}

          {addresses.length === 0 && (
            <div className="p-16 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-bold text-lg mb-1 text-foreground">Aucune adresse</h3>
              <p className="text-muted-foreground text-sm max-w-[240px] mx-auto">
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
            className="fixed inset-0 bg-foreground/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-card rounded-[2rem] p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  {editingAddress ? 'Modifier' : 'Nouveau favori'}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 text-muted-foreground hover:text-foreground">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3 text-destructive text-sm font-medium">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Nom du lieu</label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    className="w-full p-4 bg-muted border-none rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-foreground outline-none"
                    placeholder="Ex: Maison, Bureau..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Adresse</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full p-4 bg-muted border-none rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-foreground outline-none"
                    placeholder="Rechercher une adresse..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={!formData.address || !formData.label || saving}
                  className="w-full bg-foreground text-background rounded-xl py-4 font-bold transition-all hover:bg-foreground/90 flex items-center justify-center gap-2 disabled:opacity-50"
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

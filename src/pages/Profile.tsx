import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Accessibility,
  Save,
  Check,
  MessageSquare,
  Camera,
  Shield,
  Bell,
  CreditCard,
  ChevronRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

type Profile = {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
};

export default function Profile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth');
          return;
        }

        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (data) {
          setProfile(data);
          setFormData({
            name: data.full_name || '',
            email: data.email || '',
            phone: data.phone || '',
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.name,
        phone: formData.phone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id);

    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Compte</h1>
        <p className="text-muted-foreground text-sm font-medium">Gérez vos informations et préférences</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card rounded-3xl p-8 border border-border shadow-sm text-center">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="w-full h-full rounded-full bg-muted border border-border flex items-center justify-center text-3xl font-bold text-foreground">
                {formData.name.charAt(0) || 'U'}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-foreground text-background rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <h2 className="text-xl font-bold text-foreground">{formData.name}</h2>
            <p className="text-sm text-muted-foreground mb-6">{formData.email}</p>
            <div className="flex items-center justify-center gap-2 py-2 px-4 bg-primary/10 rounded-full border border-primary/20 w-fit mx-auto">
              <Shield className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Compte vérifié</span>
            </div>
          </div>

          <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Paramètres</h3>
            </div>
            <div className="divide-y divide-border">
              <button className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-bold text-foreground">Notifications</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
              <button className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-bold text-foreground">Paiements</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
              <h3 className="text-lg font-bold text-foreground mb-8">Informations personnelles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Nom complet</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-4 bg-muted border-none rounded-xl text-foreground outline-none focus:ring-2 focus:ring-foreground transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Téléphone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-4 bg-muted border-none rounded-xl text-foreground outline-none focus:ring-2 focus:ring-foreground transition-all"
                    placeholder="+1 (418) 000-0000"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-5 bg-foreground hover:bg-foreground/90 text-background rounded-2xl font-bold transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {saving ? (
                <div className="w-6 h-6 border-2 border-background border-t-transparent rounded-full animate-spin" />
              ) : saved ? (
                <>
                  <Check className="w-6 h-6" />
                  Modifications enregistrées
                </>
              ) : (
                <>
                  <Save className="w-6 h-6" />
                  Mettre à jour le profil
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History as HistoryIcon, 
  Car,
  X,
  Star,
  Navigation,
  ChevronDown
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

type Ride = {
  id: string;
  pickup_address: string;
  dropoff_address: string;
  status: string | null;
  created_at: string | null;
  estimated_price?: number | null;
};

export default function History() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingRide, setRatingRide] = useState<Ride | null>(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const navigate = useNavigate();

  const fetchRides = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: ridesData } = await supabase
        .from('rides')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (ridesData) setRides(ridesData);
    } catch (error) {
      console.error('Error fetching rides:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, []);

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'completed': return 'bg-primary/10 text-primary border-primary/20';
      case 'cancelled': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      case 'in_progress': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      case 'pending': return 'En attente';
      case 'in_progress': return 'En cours';
      default: return status || 'Inconnu';
    }
  };

  const openRating = (ride: Ride) => {
    setRatingRide(ride);
    setRatingValue(5);
    setRatingComment('');
    setShowRatingModal(true);
  };

  const submitRating = async () => {
    if (!ratingRide) return;
    setSubmittingRating(true);
    // Rating submission would go here
    setTimeout(() => {
      setSubmittingRating(false);
      setShowRatingModal(false);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Activité</h1>
          <p className="text-muted-foreground text-sm font-medium">Historique de vos trajets</p>
        </div>
        <div className="bg-card px-4 py-2 rounded-xl border border-border shadow-sm text-sm font-bold text-foreground">
          {rides.length} Courses
        </div>
      </header>

      <div className="space-y-4">
        {rides.map((ride, index) => (
          <motion.div
            key={ride.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className={`bg-card rounded-2xl border transition-all overflow-hidden ${
              selectedRide?.id === ride.id ? 'border-foreground shadow-md' : 'border-border hover:border-muted-foreground/30 shadow-sm'
            }`}
          >
            <div 
              className="p-5 cursor-pointer flex items-center justify-between"
              onClick={() => setSelectedRide(selectedRide?.id === ride.id ? null : ride)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
                  <Car className="w-6 h-6 text-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground flex items-center gap-2">
                    {ride.dropoff_address.split(',')[0]}
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${selectedRide?.id === ride.id ? 'rotate-180' : ''}`} />
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase tracking-tight">
                    <span>{ride.created_at ? new Date(ride.created_at).toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' }) : ''}</span>
                    <span>•</span>
                    <span className={`px-2 py-0.5 rounded-full border ${getStatusColor(ride.status)}`}>
                      {getStatusLabel(ride.status)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-foreground">${ride.estimated_price || '15'}</p>
              </div>
            </div>

            <AnimatePresence>
              {selectedRide?.id === ride.id && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="bg-muted/50 border-t border-border overflow-hidden"
                >
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center gap-1 mt-1">
                          <div className="w-2 h-2 rounded-full bg-foreground" />
                          <div className="w-0.5 h-8 bg-border" />
                          <div className="w-2 h-2 bg-foreground" />
                        </div>
                        <div className="space-y-4">
                          <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Départ</p>
                            <p className="text-sm font-medium text-foreground">{ride.pickup_address}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Arrivée</p>
                            <p className="text-sm font-medium text-foreground">{ride.dropoff_address}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center items-center text-center p-6 bg-card rounded-2xl border border-border">
                      {ride.status === 'completed' && (
                        <>
                          <Star className="w-8 h-8 text-yellow-400 mb-2" />
                          <h4 className="font-bold text-sm mb-1 text-foreground">Évaluer ce trajet</h4>
                          <p className="text-xs text-muted-foreground mb-4">Votre avis aide à améliorer le service</p>
                          <button 
                            onClick={() => openRating(ride)}
                            className="bg-foreground text-background text-xs font-bold px-6 py-2 rounded-full hover:bg-foreground/90 transition-colors"
                          >
                            Évaluer
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}

        {rides.length === 0 && (
          <div className="bg-card rounded-3xl p-16 text-center border border-border shadow-sm">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <HistoryIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-foreground">Pas encore de courses</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-8">
              Vos trajets terminés apparaîtront ici.
            </p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-foreground text-background px-8 py-3 rounded-xl font-bold hover:bg-foreground/90 transition-colors"
            >
              Commander maintenant
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showRatingModal && ratingRide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
            onClick={() => setShowRatingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-card rounded-[2rem] p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Votre avis</h2>
                <button onClick={() => setShowRatingModal(false)} className="p-2 text-muted-foreground hover:text-foreground">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-1 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRatingValue(star)}
                      className="p-1 transition-transform hover:scale-125"
                    >
                      <Star
                        className={`w-10 h-10 transition-all ${
                          star <= ratingValue ? 'text-foreground fill-foreground' : 'text-muted-foreground/30 hover:text-muted-foreground/50'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <textarea
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  className="w-full p-6 bg-muted border-none rounded-2xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-foreground outline-none resize-none min-h-[120px]"
                  placeholder="Qu'est-ce qui vous a plu ?"
                />
              </div>

              <button
                onClick={submitRating}
                disabled={submittingRating}
                className="w-full bg-foreground text-background rounded-xl py-4 font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submittingRating ? <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" /> : 'Envoyer'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

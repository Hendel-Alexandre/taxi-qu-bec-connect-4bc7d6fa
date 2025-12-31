import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Building2, Lock, ArrowRight, Mail, Phone, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

type AuthMode = 'select' | 'login' | 'register';

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>('select');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            phone: formData.phone,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setIsLoading(false);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        setError(signInError.message);
        setIsLoading(false);
        return;
      }

      navigate('/dashboard');
    } catch {
      setError('Une erreur est survenue');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary/50 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-card/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-primary/10 border border-border/50 p-8">
          <div className="flex justify-center mb-8">
            <img
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/taxi-quebec-logo-removebg-preview-1-1766792742115.png?width=8000&height=8000&resize=contain"
              alt="Taxi Québec"
              width={140}
              height={70}
              className="object-contain"
            />
          </div>

          {mode === 'select' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <h1 className="text-2xl font-bold text-center text-foreground mb-2">
                Bienvenue
              </h1>
              <p className="text-center text-muted-foreground mb-8">
                Sélectionnez votre type de portail
              </p>

              <button
                onClick={() => setMode('login')}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl p-5 flex items-center justify-between transition-all duration-300 group shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-foreground/20 rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-lg">Portail Client</div>
                    <div className="text-primary-foreground/70 text-sm">Réservez et suivez vos courses</div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setMode('login')}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl p-5 flex items-center justify-between transition-all duration-300 group shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-foreground/20 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-lg">Portail Organisation</div>
                    <div className="text-primary-foreground/70 text-sm">Gérez votre flotte et vos chauffeurs</div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}

          {mode === 'login' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <button
                onClick={() => setMode('select')}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </button>

              <h1 className="text-2xl font-bold text-foreground mb-2">Connexion</h1>
              <p className="text-muted-foreground mb-6">Accédez à votre espace client</p>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Adresse courriel"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-4 bg-muted border-2 border-transparent rounded-xl focus:border-primary focus:bg-background transition-all outline-none"
                    required
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Mot de passe"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-12 py-4 bg-muted border-2 border-transparent rounded-xl focus:border-primary focus:bg-background transition-all outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {error && (
                  <p className="text-destructive text-sm text-center">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-4 font-semibold transition-all shadow-lg shadow-primary/20 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Connexion...' : 'Se connecter'}
                </button>
              </form>

              <p className="text-center text-muted-foreground mt-6">
                Pas encore de compte?{' '}
                <button
                  onClick={() => setMode('register')}
                  className="text-primary font-semibold hover:underline"
                >
                  Créer un compte
                </button>
              </p>
            </motion.div>
          )}

          {mode === 'register' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <button
                onClick={() => setMode('login')}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </button>

              <h1 className="text-2xl font-bold text-foreground mb-2">Créer un compte</h1>
              <p className="text-muted-foreground mb-6">Rejoignez Taxi Québec</p>

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Nom complet"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-4 bg-muted border-2 border-transparent rounded-xl focus:border-primary focus:bg-background transition-all outline-none"
                    required
                  />
                </div>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Adresse courriel"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-4 bg-muted border-2 border-transparent rounded-xl focus:border-primary focus:bg-background transition-all outline-none"
                    required
                  />
                </div>

                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Numéro de téléphone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-4 bg-muted border-2 border-transparent rounded-xl focus:border-primary focus:bg-background transition-all outline-none"
                    required
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Mot de passe"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-12 py-4 bg-muted border-2 border-transparent rounded-xl focus:border-primary focus:bg-background transition-all outline-none"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {error && (
                  <p className="text-destructive text-sm text-center">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-4 font-semibold transition-all shadow-lg shadow-primary/20 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Création...' : 'Créer mon compte'}
                </button>
              </form>

              <p className="text-center text-muted-foreground mt-6">
                Déjà un compte?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-primary font-semibold hover:underline"
                >
                  Se connecter
                </button>
              </p>
            </motion.div>
          )}
        </div>

        <p className="text-center text-muted-foreground text-sm mt-6">
          © {new Date().getFullYear()} Taxi Québec. Tous droits réservés.
        </p>
      </motion.div>
    </div>
  );
}

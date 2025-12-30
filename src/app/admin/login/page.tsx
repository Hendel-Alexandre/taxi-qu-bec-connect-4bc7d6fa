"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Lock, Mail, Eye, EyeOff, ArrowLeft, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
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

    // Special restriction for admin portal
    if (formData.email !== 'm.dardari@hotmail.com') {
      setError('Accès restreint aux administrateurs autorisés.');
      setIsLoading(false);
      return;
    }

    // Simulate login for now - in production use Supabase Auth
    if (formData.password === 'admin123') {
      router.push('/admin');
    } else {
      setError('Mot de passe incorrect.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
          <div className="flex justify-center mb-8">
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/taxi-quebec-logo-removebg-preview-1-1766792742115.png?width=8000&height=8000&resize=contain"
              alt="Taxi Québec Admin"
              width={140}
              height={70}
              className="object-contain"
            />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Taxi Québec Admin</h1>
            <p className="text-slate-500">Portail Organisation</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                name="email"
                placeholder="Adresse courriel admin"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all outline-none"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Mot de passe"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center font-medium">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-4 font-semibold transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {isLoading ? 'Vérification...' : (
                <>
                  Continuer
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <button
            onClick={() => router.push('/auth')}
            className="w-full mt-6 text-slate-500 hover:text-slate-700 text-sm flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux portails
          </button>
        </div>
      </motion.div>
    </div>
  );
}

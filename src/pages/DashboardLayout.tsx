import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
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
import { supabase } from '@/integrations/supabase/client';

export default function DashboardLayout() {
  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Accueil' },
    { href: '/dashboard/history', icon: History, label: 'Historique' },
    { href: '/dashboard/addresses', icon: MapPin, label: 'Favoris' },
    { href: '/dashboard/notifications', icon: Bell, label: 'Alertes' },
    { href: '/dashboard/profile', icon: User, label: 'Profil' },
    { href: '/dashboard/help', icon: HelpCircle, label: 'Aide' },
  ];

  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', authUser.id)
          .single();
        
        if (profile) {
          setUser({ name: profile.full_name || '', email: profile.email });
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
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/10">
      {/* Slim Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-20 bg-card border-r border-border flex-col items-center py-6 z-50 shadow-sm">
        <div className="mb-10">
          <Link to="/dashboard" className="block relative w-12 h-12 transition-transform hover:scale-105">
            <img
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/taxi-quebec-logo-removebg-preview-1-1766792742115.png?width=8000&height=8000&resize=contain"
              alt="Taxi Québec Logo"
              className="w-full h-full object-contain"
            />
          </Link>
        </div>

        <nav className="flex-1 flex flex-col gap-4">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`group relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${
                  active
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <item.icon className={`w-5 h-5 ${active ? 'stroke-[2]' : 'stroke-[1.5]'}`} />
                
                {/* Tooltip */}
                <div className="absolute left-16 px-3 py-1.5 bg-foreground text-background text-[10px] font-bold uppercase tracking-wider rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl">
                  {item.label}
                </div>

                {item.href === '/dashboard/notifications' && unreadCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-card" />
                )}

                {active && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute -left-4 w-1 h-6 bg-foreground rounded-r-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-5 items-center">
          <button
            onClick={handleLogout}
            className="w-12 h-12 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
          </button>
          <Link to="/dashboard/profile" className="w-10 h-10 rounded-full overflow-hidden border border-border hover:border-foreground transition-colors shadow-sm">
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">{user?.name?.charAt(0) || 'U'}</span>
            </div>
          </Link>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-b border-border z-50 px-4 py-3 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="relative w-10 h-10">
            <img
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/taxi-quebec-logo-removebg-preview-1-1766792742115.png?width=8000&height=8000&resize=contain"
              alt="Taxi Québec Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-bold tracking-tight text-lg text-foreground uppercase">Taxi Québec</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-foreground"
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
              className="lg:hidden fixed inset-0 bg-foreground/40 backdrop-blur-sm z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="lg:hidden fixed right-0 top-0 bottom-0 w-72 bg-card z-50 shadow-2xl p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="text-lg font-bold tracking-tight uppercase text-foreground">Menu</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-muted-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-1.5">
                {navItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-lg transition-all ${
                        active
                          ? 'bg-foreground text-background'
                          : 'text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium text-sm">{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-auto pt-6 border-t border-border">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3.5 w-full text-muted-foreground hover:text-destructive transition-colors"
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
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t border-border z-40 pb-safe shadow-lg">
        <div className="flex items-center justify-around py-3">
          {navItems.slice(0, 5).map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex flex-col items-center gap-1 px-4 transition-all ${
                  active ? 'text-foreground' : 'text-muted-foreground/50'
                }`}
              >
                <item.icon className={`w-5 h-5 ${active ? 'stroke-[2]' : 'stroke-[1.5]'}`} />
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="lg:ml-20 min-h-screen relative overflow-hidden bg-background pt-16 lg:pt-0 pb-20 lg:pb-0">
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

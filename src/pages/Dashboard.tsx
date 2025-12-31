import { useNavigate } from 'react-router-dom';
import { Bell, Car } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Tableau de bord</h1>
          <p className="text-muted-foreground text-sm font-medium">Bienvenue sur votre espace client</p>
        </div>
        <button 
          onClick={() => navigate('/dashboard/notifications')}
          className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors shadow-sm"
        >
          <Bell className="w-4 h-4 text-muted-foreground" />
        </button>
      </header>

      <div className="bg-card rounded-3xl p-8 border border-border shadow-sm text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
          <Car className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold mb-2 text-foreground">Prêt à commander ?</h2>
        <p className="text-muted-foreground mb-6">
          Réservez votre prochain trajet en quelques clics.
        </p>
        <button 
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl font-bold transition-colors"
        >
          Commander un taxi
        </button>
      </div>
    </div>
  );
}

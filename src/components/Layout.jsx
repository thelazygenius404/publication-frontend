import { useState, useEffect } from 'react';
// Ajout de useNavigate dans les imports
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PenTool, Settings, LogOut, Moon, Sun } from 'lucide-react';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate(); // Initialisation de la navigation
  
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Fonction de déconnexion
  const handleLogout = () => {
    // Plus tard, vous ajouterez ici le code pour supprimer le token JWT du localStorage
    // localStorage.removeItem('token');
    navigate('/login');
  };

  const menu = [
    { name: 'Tableau de bord', icon: LayoutDashboard, path: '/' },
    { name: 'Nouvelle Publication', icon: PenTool, path: '/editor' },
    { name: 'Paramètres', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <aside className="w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 shadow-sm flex flex-col transition-colors duration-200">
        <div className="p-6">
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">AutoPublisher</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {menu.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.name} to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}>
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t dark:border-gray-700 space-y-2">
          <button 
            onClick={() => setIsDark(!isDark)}
            className="flex items-center gap-3 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 w-full transition-colors"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
            <span className="font-medium">{isDark ? 'Mode Clair' : 'Mode Sombre'}</span>
          </button>

          {/* Ajout de l'événement onClick sur le bouton de déconnexion */}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 w-full transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8 text-gray-900 dark:text-gray-100">
        <Outlet />
      </main>
    </div>
  );
}
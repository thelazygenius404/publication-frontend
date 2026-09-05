import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Sparkles, Moon, Sun } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  // État local pour le mode sombre
  const [isDark, setIsDark] = useState(false);

  // Applique la classe "dark" au document HTML
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200 p-4 relative">
      
      {/* Bouton de bascule du thème en haut à droite */}
      <button 
        onClick={() => setIsDark(!isDark)}
        className="absolute top-6 right-6 p-2.5 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors shadow-sm"
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg border dark:border-gray-700 p-8 transition-colors">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
            <Sparkles size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AutoPublisher</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Connectez-vous pour gérer vos publications</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Adresse email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-400" />
              </div>
              <input 
                type="email" 
                defaultValue="admin@emsi.ma"
                required
                className="w-full pl-10 pr-4 py-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white dark:placeholder-gray-500" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input 
                type="password" 
                defaultValue="••••••••"
                required
                className="w-full pl-10 pr-4 py-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white dark:placeholder-gray-500" 
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-sm dark:text-gray-300">
              <input type="checkbox" className="rounded text-blue-600 w-4 h-4 bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-600" />
              <span>Se souvenir de moi</span>
            </label>
            <a href="#" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
              Mot de passe oublié ?
            </a>
          </div>

          <button 
            type="submit" 
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            <LogIn size={18} />
            Se connecter
          </button>
        </form>
        
      </div>
    </div>
  );
}
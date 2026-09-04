import { Link } from 'lucide-react';

export default function Settings() {
  const accounts = [
    { platform: 'LinkedIn', status: 'DISCONNECTED', color: 'bg-blue-600' },
    { platform: 'WordPress', status: 'CONNECTED', color: 'bg-slate-800' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Comptes & Intégrations</h2>
      <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 shadow-sm p-6 space-y-4 transition-colors">
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Connectez vos plateformes pour autoriser l'API à publier en votre nom.</p>
        
        {accounts.map((acc) => (
          <div key={acc.platform} className="flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-md text-white ${acc.color}`}>
                <Link size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white">{acc.platform}</h3>
                <p className={`text-xs ${acc.status === 'CONNECTED' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                  {acc.status === 'CONNECTED' ? 'Connecté et authentifié' : 'Non connecté'}
                </p>
              </div>
            </div>
            <button
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                acc.status === 'CONNECTED'
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800'
              }`}
            >
              {acc.status === 'CONNECTED' ? 'Déconnecter' : `Connecter ${acc.platform}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
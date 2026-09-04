import { Activity, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function Dashboard() {
  const mockPublications = [
    { id: 1, title: 'Annonce de la nouvelle architecture MVP', platform: 'LinkedIn', status: 'PUBLISHED', date: '2026-09-04 10:00' },
    { id: 2, title: 'Tutoriel : Intégration React et Spring Boot', platform: 'WordPress', status: 'PENDING', date: '2026-09-05 14:30' },
    { id: 3, title: 'Brouillon - Stratégie de contenu', platform: 'LinkedIn', status: 'DRAFT', date: '-' },
    { id: 4, title: 'Mise à jour des règles de sécurité', platform: 'WordPress', status: 'FAILED', date: '2026-09-03 09:15' },
  ];

  const getStatusBadge = (status) => {
    const styles = {
      PUBLISHED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      PENDING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      DRAFT: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      FAILED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    };
    return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>{status}</span>;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Tableau de bord</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[ 
          { label: 'Total', value: '24', icon: Activity, color: 'text-gray-600 dark:text-gray-400' },
          { label: 'Publiés', value: '18', icon: CheckCircle, color: 'text-green-600 dark:text-green-400' },
          { label: 'En attente', value: '4', icon: Clock, color: 'text-blue-600 dark:text-blue-400' },
          { label: 'Échoués', value: '2', icon: XCircle, color: 'text-red-600 dark:text-red-400' }
        ].map((kpi, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 shadow-sm flex items-center justify-between transition-colors">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{kpi.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{kpi.value}</p>
            </div>
            <kpi.icon className={kpi.color} size={32} />
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 shadow-sm overflow-hidden transition-colors">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-800/50 border-b dark:border-gray-700">
            <tr>
              <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">Titre</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">Plateforme</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">Statut</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">Date prévue</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700">
            {mockPublications.map((pub) => (
              <tr key={pub.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{pub.title}</td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{pub.platform}</td>
                <td className="px-6 py-4">{getStatusBadge(pub.status)}</td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{pub.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
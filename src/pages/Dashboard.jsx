import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  Filter, 
  Download, 
  X,
  FileSpreadsheet
} from 'lucide-react';

const INITIAL_PUBLICATIONS = [
  {
    id: 1,
    title: 'Annonce de la nouvelle architecture MVP',
    platform: 'LinkedIn',
    status: 'PUBLISHED',
    scheduledDate: '2026-09-04 10:00',
  },
  {
    id: 2,
    title: 'Tutoriel : Intégration React et Spring Boot',
    platform: 'WordPress',
    status: 'PENDING',
    scheduledDate: '2026-09-05 14:30',
  },
  {
    id: 3,
    title: 'Brouillon - Stratégie de contenu Q4',
    platform: 'LinkedIn',
    status: 'DRAFT',
    scheduledDate: '-',
  },
  {
    id: 4,
    title: 'Mise à jour des règles de sécurité et chiffrement AES',
    platform: 'WordPress',
    status: 'FAILED',
    scheduledDate: '2026-09-03 09:15',
  },
  {
    id: 5,
    title: 'Présentation des flux automatisés avec n8n',
    platform: 'LinkedIn',
    status: 'PUBLISHED',
    scheduledDate: '2026-09-01 11:00',
  },
  {
    id: 6,
    title: 'Guide complet sur Spring AI et LLM',
    platform: 'WordPress',
    status: 'PENDING',
    scheduledDate: '2026-09-08 16:00',
  }
];

export default function Dashboard() {
  const [publications] = useState(INITIAL_PUBLICATIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedPlatform, setSelectedPlatform] = useState('ALL');

  // Stats calculation
  const totalCount = publications.length;
  const publishedCount = publications.filter((p) => p.status === 'PUBLISHED').length;
  const pendingCount = publications.filter((p) => p.status === 'PENDING').length;
  const failedCount = publications.filter((p) => p.status === 'FAILED').length;

  // Search & Filter Logic
  const filteredPublications = useMemo(() => {
    return publications.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.platform.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedStatus === 'ALL' || item.status === selectedStatus;

      const matchesPlatform =
        selectedPlatform === 'ALL' || item.platform.toLowerCase() === selectedPlatform.toLowerCase();

      return matchesSearch && matchesStatus && matchesPlatform;
    });
  }, [publications, searchQuery, selectedStatus, selectedPlatform]);

  // CSV Export
  const handleExportCSV = () => {
    if (filteredPublications.length === 0) {
      alert('Aucune donnée à exporter avec les filtres actuels.');
      return;
    }

    const headers = ['ID', 'Titre', 'Plateforme', 'Statut', 'Date Prevue'];
    const csvRows = [
      headers.join(';'),
      ...filteredPublications.map((item) =>
        [
          item.id,
          `"${item.title.replace(/"/g, '""')}"`,
          item.platform,
          item.status,
          `"${item.scheduledDate}"`,
        ].join(';')
      ),
    ];

    const blob = new Blob(['\uFEFF' + csvRows.join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `publications_export_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('ALL');
    setSelectedPlatform('ALL');
  };

  const getStatusBadge = (status) => {
    const config = {
      PUBLISHED: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      PENDING: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      DRAFT: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
      FAILED: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    };
    return (
      <span
        className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
          config[status] || 'bg-slate-100 text-slate-700'
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
          Tableau de bord
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Suivi, planification et gestion de l'historique des publications.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total
            </p>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {totalCount}
            </h3>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Publiés
            </p>
            <h3 className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              {publishedCount}
            </h3>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              En attente
            </p>
            <h3 className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
              {pendingCount}
            </h3>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Échoués
            </p>
            <h3 className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
              {failedCount}
            </h3>
          </div>
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Filters & Export */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par titre, mot-clé..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filters & Export button group */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="ALL">Tous les statuts</option>
                <option value="PUBLISHED">PUBLISHED</option>
                <option value="PENDING">PENDING</option>
                <option value="DRAFT">DRAFT</option>
                <option value="FAILED">FAILED</option>
              </select>
            </div>

            {/* Platform Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2">
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="ALL">Toutes les plateformes</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="WordPress">WordPress</option>
              </select>
            </div>

            {/* Reset Filters button if active */}
            {(searchQuery || selectedStatus !== 'ALL' || selectedPlatform !== 'ALL') && (
              <button
                onClick={resetFilters}
                className="px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
              >
                Réinitialiser
              </button>
            )}

            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm hover:shadow transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Exporter CSV</span>
            </button>
          </div>
        </div>

        {/* Results indicator */}
        <div className="text-xs text-slate-500 dark:text-slate-400 pt-1 flex items-center justify-between border-t border-slate-100 dark:border-slate-700/40">
          <span>
            Affichage de <strong>{filteredPublications.length}</strong> publication(s) sur <strong>{totalCount}</strong>
          </span>
        </div>
      </div>

      {/* Publications Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40">
                <th className="py-3.5 px-5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Titre
                </th>
                <th className="py-3.5 px-5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Plateforme
                </th>
                <th className="py-3.5 px-5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Statut
                </th>
                <th className="py-3.5 px-5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Date prévue
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredPublications.length > 0 ? (
                filteredPublications.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/75 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="py-4 px-5 text-sm font-medium text-slate-800 dark:text-slate-100">
                      {item.title}
                    </td>
                    <td className="py-4 px-5 text-sm text-slate-600 dark:text-slate-300">
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            item.platform === 'LinkedIn'
                              ? 'bg-[#0077B5]'
                              : 'bg-[#21759B]'
                          }`}
                        />
                        {item.platform}
                      </span>
                    </td>
                    <td className="py-4 px-5">{getStatusBadge(item.status)}</td>
                    <td className="py-4 px-5 text-sm text-slate-500 dark:text-slate-400 font-mono text-xs">
                      {item.scheduledDate}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="py-12 text-center text-slate-400 dark:text-slate-500 text-sm"
                  >
                    <FileSpreadsheet className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    Aucune publication ne correspond à vos critères de recherche.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
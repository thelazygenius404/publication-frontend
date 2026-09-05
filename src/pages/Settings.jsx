import React, { useState } from 'react';
import {
  Link2,
  Sparkles,
  Workflow,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Save,
  KeyRound,
  Sliders,
  Bell,
  Trash2
} from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('accounts');

  // Account states
  const [accounts, setAccounts] = useState({
    linkedin: { connected: false, expiresAt: null, user: null },
    wordpress: { connected: true, url: 'https://monblog-tech.ma', user: 'admin_emsi' },
  });

  // Spring AI states
  const [aiSettings, setAiSettings] = useState({
    defaultTone: 'professionnel',
    defaultLength: 'medium',
    brandPrompt: 'Rédige toujours en adoptant une voix d’ingénieur logiciel axée sur les meilleures pratiques d’architecture logicielle et de sécurité.',
    autoHashtags: true,
  });

  // n8n states
  const [n8nSettings, setN8nSettings] = useState({
    maxRetries: 3,
    timezone: 'Africa/Casablanca',
    webhookStatus: 'idle', // idle | testing | success | error
  });

  // Security states
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleTestWebhook = () => {
    setN8nSettings((prev) => ({ ...prev, webhookStatus: 'testing' }));
    setTimeout(() => {
      setN8nSettings((prev) => ({ ...prev, webhookStatus: 'success' }));
      setTimeout(() => {
        setN8nSettings((prev) => ({ ...prev, webhookStatus: 'idle' }));
      }, 3000);
    }, 1200);
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
          Paramètres du système
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Gérez vos intégrations externes, configurez l'IA et sécurisez votre compte.
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700/80 gap-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('accounts')}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'accounts'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Link2 className="w-4 h-4" />
          Comptes & Intégrations
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'ai'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Assistance IA (Spring AI)
        </button>

        <button
          onClick={() => setActiveTab('orchestration')}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'orchestration'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Workflow className="w-4 h-4" />
          Orchestration n8n
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'security'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Sécurité & Mot de passe
        </button>
      </div>

      {/* TAB 1: ACCOUNTS & INTEGRATIONS */}
      {activeTab === 'accounts' && (
        <div className="space-y-4">
          {/* LinkedIn Card */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#0077B5]/10 text-[#0077B5] flex items-center justify-center font-bold text-lg">
                in
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-800 dark:text-white">
                    Compte LinkedIn
                  </h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      accounts.linkedin.connected
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {accounts.linkedin.connected ? 'Connecté' : 'Non connecté'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Protocole OAuth 2.0 (Scopes : w_member_social, r_liteprofile).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
              {accounts.linkedin.connected ? (
                <button
                  onClick={() =>
                    setAccounts((prev) => ({
                      ...prev,
                      linkedin: { connected: false, expiresAt: null, user: null },
                    }))
                  }
                  className="px-4 py-2 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 text-xs font-semibold rounded-xl transition-all"
                >
                  Déconnecter
                </button>
              ) : (
                <button
                  onClick={() =>
                    setAccounts((prev) => ({
                      ...prev,
                      linkedin: { connected: true, expiresAt: '2026-11-01', user: 'Bilal Elakry' },
                    }))
                  }
                  className="px-4 py-2 bg-[#0077B5] hover:bg-[#006097] text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
                >
                  Connecter LinkedIn
                </button>
              )}
            </div>
          </div>

          {/* WordPress Card */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#21759B]/10 text-[#21759B] flex items-center justify-center font-bold text-lg">
                W
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-800 dark:text-white">
                    Site WordPress
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    Connecté et authentifié
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                  {accounts.wordpress.url} (Utilisateur: {accounts.wordpress.user})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
              <button
                onClick={() =>
                  setAccounts((prev) => ({
                    ...prev,
                    wordpress: { connected: false, url: '', user: '' },
                  }))
                }
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/40 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-xl transition-all"
              >
                Déconnecter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SPRING AI PREFERENCES */}
      {activeTab === 'ai' && (
        <form onSubmit={handleSaveSettings} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              Directives par défaut pour Spring AI
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Personnalisez les paramètres envoyés au modèle LLM lors de la génération assistée.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Tonalité par défaut
              </label>
              <select
                value={aiSettings.defaultTone}
                onChange={(e) => setAiSettings({ ...aiSettings, defaultTone: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="professionnel">Professionnel & Formel</option>
                <option value="storytelling">Storytelling & Engageant</option>
                <option value="technique">Technique & Didactique</option>
                <option value="direct">Direct & Synthétique</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Longueur moyenne cible
              </label>
              <select
                value={aiSettings.defaultLength}
                onChange={(e) => setAiSettings({ ...aiSettings, defaultLength: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="short">Court (&lt; 100 mots - Idéal micro-post)</option>
                <option value="medium">Moyen (150-300 mots - LinkedIn standard)</option>
                <option value="long">Long (&gt; 500 mots - Article WordPress)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Contexte de marque / Prompt système
            </label>
            <textarea
              rows={3}
              value={aiSettings.brandPrompt}
              onChange={(e) => setAiSettings({ ...aiSettings, brandPrompt: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="Ex : Mentionne toujours l'expertise de notre entreprise en cybersécurité..."
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="hashtags"
              checked={aiSettings.autoHashtags}
              onChange={(e) => setAiSettings({ ...aiSettings, autoHashtags: e.target.checked })}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="hashtags" className="text-xs text-slate-700 dark:text-slate-300">
              Générer automatiquement 3 à 5 hashtags pertinents à la fin du texte
            </label>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-700/60">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer les préférences</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: n8n ORCHESTRATION */}
      {activeTab === 'orchestration' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              Configuration de l'orchestrateur de flux
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Paramètres d'exécution des nœuds d'attente (Wait) et gestion des politiques de retry.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Tentatives automatiques en cas d'échec API (Retry)
              </label>
              <select
                value={n8nSettings.maxRetries}
                onChange={(e) => setN8nSettings({ ...n8nSettings, maxRetries: Number(e.target.value) })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value={1}>1 tentative (aucun retry)</option>
                <option value={3}>3 tentatives (backoff exponentiel - Recommandé)</option>
                <option value={5}>5 tentatives</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Fuseau horaire de planification
              </label>
              <input
                type="text"
                disabled
                value={n8nSettings.timezone}
                className="w-full bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-500 cursor-not-allowed font-mono"
              />
            </div>
          </div>

          {/* Webhook Connectivity Ping Test */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700/60 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-white">
                Test de liaison Webhook (Spring Boot ↔ n8n)
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Vérifie que l'endpoint `/api/n8n/callback` répond avec le secret partagé.
              </p>
            </div>

            <button
              onClick={handleTestWebhook}
              disabled={n8nSettings.webhookStatus === 'testing'}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all text-slate-700 dark:text-slate-200"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  n8nSettings.webhookStatus === 'testing' ? 'animate-spin text-indigo-600' : ''
                }`}
              />
              <span>
                {n8nSettings.webhookStatus === 'testing'
                  ? 'Test en cours...'
                  : n8nSettings.webhookStatus === 'success'
                  ? 'Connecté (200 OK)'
                  : 'Tester la liaison'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: SECURITY & CREDENTIALS */}
      {activeTab === 'security' && (
        <form onSubmit={handleSaveSettings} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              Sécurité et authentification
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Mettez à jour le mot de passe de votre compte et vérifiez la conformité de chiffrement.
            </p>
          </div>

          <div className="space-y-3 max-w-md">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Mot de passe actuel
              </label>
              <input
                type="password"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Confirmer le nouveau mot de passe
              </label>
              <input
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-700/60">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
            >
              <KeyRound className="w-4 h-4" />
              <span>Changer le mot de passe</span>
            </button>
          </div>
        </form>
      )}

      {/* Feedback Alert Toast */}
      {saveSuccess && (
        <div className="fixed bottom-6 right-6 bg-emerald-600 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>Paramètres mis à jour avec succès !</span>
        </div>
      )}
    </div>
  );
}
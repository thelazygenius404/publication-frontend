import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  AlertCircle,
  Ban,
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  Download,
  Eye,
  FileText,
  Filter,
  Globe2,
  Link2,
  LoaderCircle,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';

import {
  getAccounts,
} from '../api/accounts';

import {
  getContents,
} from '../api/contents';

import {
  cancelPublication,
  getPublications,
} from '../api/publications';

const PUBLICATION_STATUSES = [
  'PENDING',
  'SCHEDULED',
  'PROCESSING',
  'PUBLISHED',
  'FAILED',
  'CANCELLED',
];

const STATUS_LABELS = {
  PENDING: 'En attente',
  SCHEDULED: 'Planifiée',
  PROCESSING: 'En cours',
  PUBLISHED: 'Publiée',
  FAILED: 'Échec',
  CANCELLED: 'Annulée',
};

const STATUS_STYLES = {
  PENDING:
    'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',

  SCHEDULED:
    'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',

  PROCESSING:
    'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',

  PUBLISHED:
    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',

  FAILED:
    'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',

  CANCELLED:
    'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
};

function getErrorMessage(
  error,
) {
  return (
    error.response?.data?.message ||
    error.message ||
    'Une erreur est survenue.'
  );
}

function formatDate(
  value,
) {
  if (!value) {
    return '—';
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return '—';
  }

  return new Intl.DateTimeFormat(
    'fr-FR',
    {
      dateStyle: 'medium',
      timeStyle: 'short',
    },
  ).format(date);
}

function destinationLabel(
  destination,
) {
  if (
    destination ===
    'LINKEDIN'
  ) {
    return 'LinkedIn';
  }

  if (
    destination ===
    'WORDPRESS'
  ) {
    return 'WordPress';
  }

  return destination || '—';
}

function connectionLabel(
  account,
) {
  if (!account) {
    return 'Indisponible';
  }

  if (
    account.status ===
    'EXPIRED'
  ) {
    return 'Expiré';
  }

  if (account.connected) {
    return 'Connecté';
  }

  return 'Non connecté';
}

function canCancelPublication(
  publication,
) {
  return [
    'PENDING',
    'SCHEDULED',
  ].includes(
    publication.status,
  );
}

function StatusBadge({
  status,
}) {
  return (
    <span
      className={`
        inline-flex
        shrink-0
        rounded-full
        border
        px-2.5
        py-1
        text-xs
        font-semibold
        ${
          STATUS_STYLES[
            status
          ] ||
          'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
        }
      `}
    >
      {STATUS_LABELS[
        status
      ] || status}
    </span>
  );
}

function AccountIndicator({
  name,
  account,
  icon: Icon,
}) {
  const connected =
    account?.connected;

  const expired =
    account?.status ===
    'EXPIRED';

  return (
    <div
      className="
        flex
        min-w-0
        items-center
        justify-between
        gap-3
        rounded-xl
        border
        border-slate-200
        bg-slate-50
        px-4
        py-3
        dark:border-slate-700
        dark:bg-slate-900/50
      "
    >
      <div
        className="
          flex
          min-w-0
          items-center
          gap-3
        "
      >
        <div
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-lg
            border
            border-slate-200
            bg-white
            dark:border-slate-700
            dark:bg-slate-800
          "
        >
          <Icon size={18} />
        </div>

        <div className="min-w-0">
          <p
            className="
              text-sm
              font-semibold
              text-slate-800
              dark:text-white
            "
          >
            {name}
          </p>

          {account?.siteUrl && (
            <p
              className="
                truncate
                text-xs
                text-slate-500
                dark:text-slate-400
              "
              title={
                account.siteUrl
              }
            >
              {account.siteUrl}
            </p>
          )}
        </div>
      </div>

      <span
        className={`
          shrink-0
          rounded-full
          border
          px-2.5
          py-1
          text-xs
          font-semibold
          ${
            connected
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : expired
                ? 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : 'border-slate-500/20 bg-slate-500/10 text-slate-600 dark:text-slate-400'
          }
        `}
      >
        {connectionLabel(
          account,
        )}
      </span>
    </div>
  );
}

export default function Dashboard() {
  const [
    publications,
    setPublications,
  ] = useState([]);

  const [
    contents,
    setContents,
  ] = useState([]);

  const [
    accounts,
    setAccounts,
  ] = useState(null);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState('');

  const [
    success,
    setSuccess,
  ] = useState('');

  const [
    reloadKey,
    setReloadKey,
  ] = useState(0);

  const [
    searchQuery,
    setSearchQuery,
  ] = useState('');

  const [
    selectedStatus,
    setSelectedStatus,
  ] = useState('ALL');

  const [
    selectedDestination,
    setSelectedDestination,
  ] = useState('ALL');

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const [
    itemsPerPage,
    setItemsPerPage,
  ] = useState(5);

  const [
    selectedPublication,
    setSelectedPublication,
  ] = useState(null);

  const [
    publicationToCancel,
    setPublicationToCancel,
  ] = useState(null);

  const [
    cancellingId,
    setCancellingId,
  ] = useState(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      getPublications(),
      getContents(),
      getAccounts(),
    ])
      .then(
        ([
          publicationsData,
          contentsData,
          accountsData,
        ]) => {
          if (cancelled) {
            return;
          }

          setPublications(
            Array.isArray(
              publicationsData,
            )
              ? publicationsData
              : [],
          );

          setContents(
            Array.isArray(
              contentsData,
            )
              ? contentsData
              : [],
          );

          setAccounts(
            accountsData,
          );

          setError('');
        },
      )
      .catch(
        (exception) => {
          if (cancelled) {
            return;
          }

          setError(
            getErrorMessage(
              exception,
            ),
          );
        },
      )
      .finally(() => {
        if (!cancelled) {
          setIsLoading(
            false,
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const publishedCount =
    publications.filter(
      (publication) =>
        publication.status ===
        'PUBLISHED',
    ).length;

  const activeCount =
    publications.filter(
      (publication) =>
        [
          'PENDING',
          'SCHEDULED',
          'PROCESSING',
        ].includes(
          publication.status,
        ),
    ).length;

  const failedCount =
    publications.filter(
      (publication) =>
        publication.status ===
        'FAILED',
    ).length;

  const draftCount =
    contents.filter(
      (content) =>
        content.status ===
        'DRAFT',
    ).length;

  const readyCount =
    contents.filter(
      (content) =>
        content.status ===
        'READY',
    ).length;

  const filteredPublications =
    useMemo(() => {
      const normalizedSearch =
        searchQuery
          .trim()
          .toLowerCase();

      return publications.filter(
        (publication) => {
          const matchesSearch =
            !normalizedSearch ||
            publication.title
              ?.toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            publication.destination
              ?.toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            publication.status
              ?.toLowerCase()
              .includes(
                normalizedSearch,
              );

          const matchesStatus =
            selectedStatus ===
              'ALL' ||
            publication.status ===
              selectedStatus;

          const matchesDestination =
            selectedDestination ===
              'ALL' ||
            publication.destination ===
              selectedDestination;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesDestination
          );
        },
      );
    }, [
      publications,
      searchQuery,
      selectedStatus,
      selectedDestination,
    ]);

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredPublications.length /
          itemsPerPage,
      ),
    );

  const displayedPage =
    Math.min(
      currentPage,
      totalPages,
    );

  const paginatedPublications =
    useMemo(() => {
      const startIndex =
        (displayedPage - 1) *
        itemsPerPage;

      return filteredPublications.slice(
        startIndex,
        startIndex +
          itemsPerPage,
      );
    }, [
      filteredPublications,
      displayedPage,
      itemsPerPage,
    ]);

  const startRecord =
    filteredPublications.length ===
    0
      ? 0
      : (displayedPage - 1) *
          itemsPerPage +
        1;

  const endRecord =
    Math.min(
      displayedPage *
        itemsPerPage,
      filteredPublications.length,
    );

  const handleRetry = () => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    setReloadKey(
      (value) =>
        value + 1,
    );
  };

  const handleCancelPublication =
    async (publication) => {
      if (
        !canCancelPublication(
          publication,
        )
      ) {
        return;
      }

      setError('');
      setSuccess('');

      setCancellingId(
        publication.id,
      );

      try {
        const updated =
          await cancelPublication(
            publication.id,
          );

        setPublications(
          (current) =>
            current.map(
              (item) =>
                item.id ===
                updated.id
                  ? updated
                  : item,
            ),
        );

        setSelectedPublication(
          (current) =>
            current?.id ===
            updated.id
              ? updated
              : current,
        );

        setSuccess(
          `Publication #${updated.id} annulée avec succès.`,
        );

        setPublicationToCancel(
          null,
        );
      } catch (exception) {
        setError(
          getErrorMessage(
            exception,
          ),
        );
      } finally {
        setCancellingId(
          null,
        );
      }
    };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('ALL');
    setSelectedDestination(
      'ALL',
    );
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    if (
      filteredPublications.length ===
      0
    ) {
      return;
    }

    const headers = [
      'ID',
      'Contenu',
      'Titre',
      'Destination',
      'Statut',
      'Planifiée',
      'Publiée',
      'External ID',
      'Erreur',
    ];

    const rows =
      filteredPublications.map(
        (publication) => [
          publication.id,
          publication.contentId,
          publication.title,
          publication.destination,
          publication.status,
          publication.scheduledAt ||
            '',
          publication.publishedAt ||
            '',
          publication.externalId ||
            '',
          publication.errorMessage ||
            '',
        ],
      );

    const escapeCsv = (
      value,
    ) =>
      `"${String(
        value ?? '',
      ).replace(
        /"/g,
        '""',
      )}"`;

    const csv = [
      headers
        .map(escapeCsv)
        .join(';'),

      ...rows.map(
        (row) =>
          row
            .map(escapeCsv)
            .join(';'),
      ),
    ].join('\n');

    const blob =
      new Blob(
        [
          '\uFEFF',
          csv,
        ],
        {
          type:
            'text/csv;charset=utf-8;',
        },
      );

    const url =
      URL.createObjectURL(
        blob,
      );

    const link =
      document.createElement(
        'a',
      );

    link.href = url;

    link.download =
      `publications_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

    document.body.appendChild(
      link,
    );

    link.click();
    link.remove();

    URL.revokeObjectURL(
      url,
    );
  };

  if (isLoading) {
    return (
      <div
        className="
          flex
          min-h-[60vh]
          items-center
          justify-center
        "
      >
        <div
          className="
            flex
            flex-col
            items-center
            gap-3
            text-slate-500
            dark:text-slate-400
          "
        >
          <LoaderCircle
            className="
              h-8
              w-8
              animate-spin
              text-indigo-600
            "
          />

          <p className="text-sm">
            Chargement du tableau
            de bord...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div
        className="
          flex
          flex-col
          gap-3
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div>
          <h1
            className="
              text-2xl
              font-bold
              text-slate-800
              dark:text-white
            "
          >
            Tableau de bord
          </h1>

          <p
            className="
              mt-1
              text-sm
              text-slate-500
              dark:text-slate-400
            "
          >
            Données synchronisées
            avec Publication API.
          </p>
        </div>

        <button
          type="button"
          onClick={
            handleRetry
          }
          className="
            inline-flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-slate-200
            bg-white
            px-4
            py-2.5
            text-sm
            font-medium
            text-slate-700
            transition-colors
            hover:bg-slate-50
            dark:border-slate-700
            dark:bg-slate-800
            dark:text-slate-200
            dark:hover:bg-slate-700
            sm:w-auto
          "
        >
          <RefreshCw
            size={16}
          />

          Actualiser
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="
            flex
            flex-col
            gap-3
            rounded-xl
            border
            border-rose-200
            bg-rose-50
            px-4
            py-3
            dark:border-rose-900
            dark:bg-rose-950/30
            sm:flex-row
            sm:items-start
            sm:justify-between
          "
        >
          <div
            className="
              flex
              items-start
              gap-3
            "
          >
            <AlertCircle
              className="
                mt-0.5
                h-5
                w-5
                shrink-0
                text-rose-600
              "
            />

            <div>
              <p
                className="
                  text-sm
                  font-semibold
                  text-rose-800
                  dark:text-rose-300
                "
              >
                Erreur
              </p>

              <p
                className="
                  mt-1
                  text-sm
                  text-rose-700
                  dark:text-rose-400
                "
              >
                {error}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={
              handleRetry
            }
            className="
              self-start
              text-sm
              font-semibold
              text-rose-700
              hover:underline
              dark:text-rose-300
            "
          >
            Réessayer
          </button>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="
            flex
            items-start
            gap-3
            rounded-xl
            border
            border-emerald-200
            bg-emerald-50
            px-4
            py-3
            text-emerald-700
            dark:border-emerald-900
            dark:bg-emerald-950/30
            dark:text-emerald-300
          "
        >
          <CheckCircle2
            size={19}
            className="
              mt-0.5
              shrink-0
            "
          />

          <p className="text-sm">
            {success}
          </p>
        </div>
      )}

      <div
        className="
          grid
          grid-cols-1
          gap-4
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >
        <KpiCard
          label="Publications"
          value={
            publications.length
          }
          icon={BarChart3}
          variant="indigo"
        />

        <KpiCard
          label="Publiées"
          value={
            publishedCount
          }
          icon={
            CheckCircle2
          }
          variant="emerald"
        />

        <KpiCard
          label="En cours"
          value={
            activeCount
          }
          icon={Clock}
          variant="blue"
        />

        <KpiCard
          label="Échouées"
          value={
            failedCount
          }
          icon={
            AlertCircle
          }
          variant="rose"
        />
      </div>

      <div
        className="
          grid
          grid-cols-1
          gap-4
          xl:grid-cols-2
        "
      >
        <section
          className="
            rounded-2xl
            border
            border-slate-200/80
            bg-white
            p-5
            shadow-sm
            dark:border-slate-700/60
            dark:bg-slate-800
          "
        >
          <div
            className="
              mb-4
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                rounded-xl
                bg-indigo-50
                p-2.5
                text-indigo-600
                dark:bg-indigo-950/40
                dark:text-indigo-400
              "
            >
              <FileText
                size={20}
              />
            </div>

            <div>
              <h2
                className="
                  font-semibold
                  text-slate-900
                  dark:text-white
                "
              >
                Contenus
              </h2>

              <p
                className="
                  text-xs
                  text-slate-500
                  dark:text-slate-400
                "
              >
                État de préparation
                des contenus
              </p>
            </div>
          </div>

          <div
            className="
              grid
              grid-cols-3
              gap-2
              sm:gap-3
            "
          >
            <ContentMetric
              label="Total"
              value={
                contents.length
              }
            />

            <ContentMetric
              label="Brouillons"
              value={
                draftCount
              }
            />

            <ContentMetric
              label="Prêts"
              value={
                readyCount
              }
            />
          </div>
        </section>

        <section
          className="
            rounded-2xl
            border
            border-slate-200/80
            bg-white
            p-5
            shadow-sm
            dark:border-slate-700/60
            dark:bg-slate-800
          "
        >
          <div
            className="
              mb-4
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                rounded-xl
                bg-indigo-50
                p-2.5
                text-indigo-600
                dark:bg-indigo-950/40
                dark:text-indigo-400
              "
            >
              <Link2
                size={20}
              />
            </div>

            <div>
              <h2
                className="
                  font-semibold
                  text-slate-900
                  dark:text-white
                "
              >
                Comptes connectés
              </h2>

              <p
                className="
                  text-xs
                  text-slate-500
                  dark:text-slate-400
                "
              >
                État des intégrations
              </p>
            </div>
          </div>

          <div
            className="
              grid
              gap-3
              sm:grid-cols-2
            "
          >
            <AccountIndicator
              name="LinkedIn"
              account={
                accounts
                  ?.linkedin
              }
              icon={Link2}
            />

            <AccountIndicator
              name="WordPress"
              account={
                accounts
                  ?.wordpress
              }
              icon={Globe2}
            />
          </div>
        </section>
      </div>

      <section
        className="
          overflow-hidden
          rounded-2xl
          border
          border-slate-200/80
          bg-white
          shadow-sm
          dark:border-slate-700/60
          dark:bg-slate-800
        "
      >
        <div
          className="
            space-y-3
            p-4
          "
        >
          <div
            className="
              flex
              flex-col
              gap-3
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >
            <div
              className="
                relative
                flex-1
              "
            >
              <Search
                className="
                  absolute
                  left-3.5
                  top-1/2
                  h-4
                  w-4
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <input
                type="text"
                value={
                  searchQuery
                }
                placeholder="Rechercher une publication..."
                onChange={(
                  event,
                ) => {
                  setSearchQuery(
                    event.target
                      .value,
                  );

                  setCurrentPage(
                    1,
                  );
                }}
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  py-2.5
                  pl-10
                  pr-10
                  text-sm
                  text-slate-800
                  outline-none
                  focus:border-indigo-500
                  focus:ring-2
                  focus:ring-indigo-500/20
                  dark:border-slate-700
                  dark:bg-slate-900
                  dark:text-white
                "
              />

              {searchQuery && (
                <button
                  type="button"
                  aria-label="Effacer la recherche"
                  onClick={() => {
                    setSearchQuery(
                      '',
                    );

                    setCurrentPage(
                      1,
                    );
                  }}
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                    hover:text-slate-600
                    dark:hover:text-slate-200
                  "
                >
                  <X
                    size={16}
                  />
                </button>
              )}
            </div>

            <div
              className="
                grid
                grid-cols-1
                gap-2
                sm:flex
                sm:flex-wrap
                sm:items-center
              "
            >
              <div
                className="
                  flex
                  w-full
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-3
                  py-2
                  dark:border-slate-700
                  dark:bg-slate-900
                  sm:w-auto
                "
              >
                <Filter
                  size={14}
                  className="
                    shrink-0
                    text-slate-400
                  "
                />

                <select
                  aria-label="Filtrer par statut"
                  value={
                    selectedStatus
                  }
                  onChange={(
                    event,
                  ) => {
                    setSelectedStatus(
                      event.target
                        .value,
                    );

                    setCurrentPage(
                      1,
                    );
                  }}
                  className="
                    w-full
                    bg-transparent
                    text-xs
                    font-medium
                    text-slate-700
                    outline-none
                    dark:text-slate-300
                    sm:w-auto
                  "
                >
                  <option value="ALL">
                    Tous les statuts
                  </option>

                  {PUBLICATION_STATUSES.map(
                    (status) => (
                      <option
                        key={
                          status
                        }
                        value={
                          status
                        }
                      >
                        {
                          STATUS_LABELS[
                            status
                          ]
                        }
                      </option>
                    ),
                  )}
                </select>
              </div>

              <select
                aria-label="Filtrer par plateforme"
                value={
                  selectedDestination
                }
                onChange={(
                  event,
                ) => {
                  setSelectedDestination(
                    event.target
                      .value,
                  );

                  setCurrentPage(
                    1,
                  );
                }}
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-3
                  py-2
                  text-xs
                  font-medium
                  text-slate-700
                  outline-none
                  dark:border-slate-700
                  dark:bg-slate-900
                  dark:text-slate-300
                  sm:w-auto
                "
              >
                <option value="ALL">
                  Toutes les plateformes
                </option>

                <option value="LINKEDIN">
                  LinkedIn
                </option>

                <option value="WORDPRESS">
                  WordPress
                </option>
              </select>

              {(searchQuery ||
                selectedStatus !==
                  'ALL' ||
                selectedDestination !==
                  'ALL') && (
                <button
                  type="button"
                  onClick={
                    resetFilters
                  }
                  className="
                    w-full
                    rounded-xl
                    px-3
                    py-2.5
                    text-xs
                    font-medium
                    text-rose-600
                    transition-colors
                    hover:bg-rose-50
                    dark:hover:bg-rose-950/30
                    sm:w-auto
                  "
                >
                  Réinitialiser
                </button>
              )}

              <button
                type="button"
                disabled={
                  filteredPublications.length ===
                  0
                }
                onClick={
                  handleExportCSV
                }
                className="
                  inline-flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-indigo-600
                  px-4
                  py-2.5
                  text-xs
                  font-semibold
                  text-white
                  transition
                  hover:bg-indigo-700
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  sm:w-auto
                "
              >
                <Download
                  size={16}
                />

                Exporter CSV
              </button>
            </div>
          </div>

          <div
            className="
              flex
              flex-col
              gap-2
              border-t
              border-slate-100
              pt-3
              text-xs
              text-slate-500
              dark:border-slate-700/40
              dark:text-slate-400
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <span>
              Affichage de{' '}
              <strong>
                {startRecord}
              </strong>{' '}
              à{' '}
              <strong>
                {endRecord}
              </strong>{' '}
              sur{' '}
              <strong>
                {
                  filteredPublications.length
                }
              </strong>
            </span>

            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <span>
                Éléments par page :
              </span>

              <select
                aria-label="Éléments par page"
                value={
                  itemsPerPage
                }
                onChange={(
                  event,
                ) => {
                  setItemsPerPage(
                    Number(
                      event.target
                        .value,
                    ),
                  );

                  setCurrentPage(
                    1,
                  );
                }}
                className="
                  rounded-lg
                  border
                  border-slate-200
                  bg-slate-50
                  px-2
                  py-1
                  outline-none
                  dark:border-slate-700
                  dark:bg-slate-900
                "
              >
                <option value={5}>
                  5
                </option>

                <option value={10}>
                  10
                </option>

                <option value={20}>
                  20
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Mobile cards */}
        <div
          className="
            border-t
            border-slate-200
            dark:border-slate-700
            md:hidden
          "
        >
          {paginatedPublications.length >
          0 ? (
            <div
              className="
                divide-y
                divide-slate-100
                dark:divide-slate-700
              "
            >
              {paginatedPublications.map(
                (
                  publication,
                ) => (
                  <article
                    key={
                      publication.id
                    }
                    className="
                      space-y-4
                      p-4
                    "
                  >
                    <div
                      className="
                        flex
                        items-start
                        justify-between
                        gap-3
                      "
                    >
                      <div
                        className="
                          min-w-0
                          flex-1
                        "
                      >
                        <h3
                          className="
                            break-words
                            text-sm
                            font-semibold
                            leading-5
                            text-slate-900
                            dark:text-white
                          "
                        >
                          {publication.title ||
                            'Sans titre'}
                        </h3>

                        <p
                          className="
                            mt-1
                            text-xs
                            text-slate-400
                          "
                        >
                          #
                          {
                            publication.id
                          }
                          {' · '}
                          contenu #
                          {
                            publication.contentId
                          }
                        </p>
                      </div>

                      <StatusBadge
                        status={
                          publication.status
                        }
                      />
                    </div>

                    <div
                      className="
                        grid
                        grid-cols-2
                        gap-3
                        rounded-xl
                        bg-slate-50
                        p-3
                        text-xs
                        dark:bg-slate-900/50
                      "
                    >
                      <MobileMetric
                        label="Destination"
                        value={destinationLabel(
                          publication.destination,
                        )}
                      />

                      <MobileMetric
                        label="Planifiée"
                        value={formatDate(
                          publication.scheduledAt,
                        )}
                      />

                      <div
                        className="
                          col-span-2
                        "
                      >
                        <MobileMetric
                          label="Publiée"
                          value={formatDate(
                            publication.publishedAt,
                          )}
                        />
                      </div>
                    </div>

                    <div
                      className="
                        flex
                        flex-col
                        gap-2
                        sm:flex-row
                      "
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedPublication(
                            publication,
                          )
                        }
                        className="
                          inline-flex
                          flex-1
                          items-center
                          justify-center
                          gap-2
                          rounded-xl
                          border
                          border-slate-200
                          px-3
                          py-2.5
                          text-xs
                          font-medium
                          text-slate-700
                          transition-colors
                          hover:bg-slate-50
                          dark:border-slate-700
                          dark:text-slate-200
                          dark:hover:bg-slate-700
                        "
                      >
                        <Eye
                          size={15}
                        />

                        Détails
                      </button>

                      {canCancelPublication(
                        publication,
                      ) && (
                        <button
                          type="button"
                          disabled={
                            cancellingId ===
                            publication.id
                          }
                          onClick={() =>
                            setPublicationToCancel(
                              publication,
                            )
                          }
                          className="
                            inline-flex
                            flex-1
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            border
                            border-rose-200
                            px-3
                            py-2.5
                            text-xs
                            font-medium
                            text-rose-600
                            transition-colors
                            hover:bg-rose-50
                            disabled:opacity-50
                            dark:border-rose-900
                            dark:text-rose-400
                            dark:hover:bg-rose-950/30
                          "
                        >
                          {cancellingId ===
                          publication.id ? (
                            <LoaderCircle
                              size={
                                15
                              }
                              className="
                                animate-spin
                              "
                            />
                          ) : (
                            <Ban
                              size={
                                15
                              }
                            />
                          )}

                          Annuler
                        </button>
                      )}
                    </div>
                  </article>
                ),
              )}
            </div>
          ) : (
            <div
              className="
                px-6
                py-12
                text-center
                text-sm
                text-slate-500
                dark:text-slate-400
              "
            >
              Aucune publication ne
              correspond aux critères.
            </div>
          )}
        </div>

        {/* Desktop / tablet table */}
        <div
          className="
            hidden
            overflow-x-auto
            border-t
            border-slate-200
            dark:border-slate-700
            md:block
          "
        >
          <table
            className="
              min-w-[1000px]
              w-full
              text-left
              text-sm
            "
          >
            <thead
              className="
                bg-slate-50
                text-xs
                uppercase
                tracking-wide
                text-slate-500
                dark:bg-slate-900/70
                dark:text-slate-400
              "
            >
              <tr>
                <th
                  className="
                    px-5
                    py-3
                  "
                >
                  Publication
                </th>

                <th
                  className="
                    px-5
                    py-3
                  "
                >
                  Destination
                </th>

                <th
                  className="
                    px-5
                    py-3
                  "
                >
                  Statut
                </th>

                <th
                  className="
                    px-5
                    py-3
                  "
                >
                  Planifiée
                </th>

                <th
                  className="
                    px-5
                    py-3
                  "
                >
                  Publiée
                </th>

                <th
                  className="
                    px-5
                    py-3
                    text-right
                  "
                >
                  Actions
                </th>
              </tr>
            </thead>

            <tbody
              className="
                divide-y
                divide-slate-100
                dark:divide-slate-700
              "
            >
              {paginatedPublications.length >
              0 ? (
                paginatedPublications.map(
                  (
                    publication,
                  ) => (
                    <tr
                      key={
                        publication.id
                      }
                      className="
                        hover:bg-slate-50/70
                        dark:hover:bg-slate-700/30
                      "
                    >
                      <td
                        className="
                          px-5
                          py-4
                        "
                      >
                        <p
                          className="
                            max-w-md
                            font-medium
                            text-slate-900
                            dark:text-white
                          "
                        >
                          {publication.title ||
                            'Sans titre'}
                        </p>

                        <p
                          className="
                            mt-1
                            text-xs
                            text-slate-400
                          "
                        >
                          #
                          {
                            publication.id
                          }
                          {' · '}
                          contenu #
                          {
                            publication.contentId
                          }
                        </p>
                      </td>

                      <td
                        className="
                          px-5
                          py-4
                          text-slate-600
                          dark:text-slate-300
                        "
                      >
                        {destinationLabel(
                          publication.destination,
                        )}
                      </td>

                      <td
                        className="
                          px-5
                          py-4
                        "
                      >
                        <StatusBadge
                          status={
                            publication.status
                          }
                        />
                      </td>

                      <td
                        className="
                          whitespace-nowrap
                          px-5
                          py-4
                          text-slate-600
                          dark:text-slate-300
                        "
                      >
                        {formatDate(
                          publication.scheduledAt,
                        )}
                      </td>

                      <td
                        className="
                          whitespace-nowrap
                          px-5
                          py-4
                          text-slate-600
                          dark:text-slate-300
                        "
                      >
                        {formatDate(
                          publication.publishedAt,
                        )}
                      </td>

                      <td
                        className="
                          px-5
                          py-4
                        "
                      >
                        <div
                          className="
                            flex
                            items-center
                            justify-end
                            gap-2
                          "
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedPublication(
                                publication,
                              )
                            }
                            className="
                              inline-flex
                              items-center
                              gap-1.5
                              rounded-lg
                              border
                              border-slate-200
                              px-3
                              py-2
                              text-xs
                              font-medium
                              text-slate-700
                              hover:bg-slate-50
                              dark:border-slate-700
                              dark:text-slate-200
                              dark:hover:bg-slate-700
                            "
                          >
                            <Eye
                              size={
                                15
                              }
                            />

                            Détails
                          </button>

                          {canCancelPublication(
                            publication,
                          ) && (
                            <button
                              type="button"
                              disabled={
                                cancellingId ===
                                publication.id
                              }
                              onClick={() =>
                                setPublicationToCancel(
                                  publication,
                                )
                              }
                              className="
                                inline-flex
                                items-center
                                gap-1.5
                                rounded-lg
                                border
                                border-rose-200
                                px-3
                                py-2
                                text-xs
                                font-medium
                                text-rose-600
                                hover:bg-rose-50
                                disabled:opacity-50
                                dark:border-rose-900
                                dark:text-rose-400
                                dark:hover:bg-rose-950/30
                              "
                            >
                              {cancellingId ===
                              publication.id ? (
                                <LoaderCircle
                                  size={
                                    15
                                  }
                                  className="
                                    animate-spin
                                  "
                                />
                              ) : (
                                <Ban
                                  size={
                                    15
                                  }
                                />
                              )}

                              Annuler
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ),
                )
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="
                      px-6
                      py-14
                      text-center
                      text-slate-500
                      dark:text-slate-400
                    "
                  >
                    Aucune publication ne
                    correspond aux
                    critères.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div
          className="
            flex
            flex-col
            gap-3
            border-t
            border-slate-200
            px-4
            py-3
            dark:border-slate-700
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <p
            className="
              text-xs
              text-slate-500
              dark:text-slate-400
            "
          >
            Page{' '}
            <strong>
              {displayedPage}
            </strong>{' '}
            sur{' '}
            <strong>
              {totalPages}
            </strong>
          </p>

          <div
            className="
              flex
              items-center
              gap-1
            "
          >
            <PaginationButton
              label="Première page"
              disabled={
                displayedPage ===
                1
              }
              onClick={() =>
                setCurrentPage(
                  1,
                )
              }
            >
              <ChevronsLeft
                size={16}
              />
            </PaginationButton>

            <PaginationButton
              label="Page précédente"
              disabled={
                displayedPage ===
                1
              }
              onClick={() =>
                setCurrentPage(
                  Math.max(
                    1,
                    displayedPage -
                      1,
                  ),
                )
              }
            >
              <ChevronLeft
                size={16}
              />
            </PaginationButton>

            <PaginationButton
              label="Page suivante"
              disabled={
                displayedPage ===
                totalPages
              }
              onClick={() =>
                setCurrentPage(
                  Math.min(
                    totalPages,
                    displayedPage +
                      1,
                  ),
                )
              }
            >
              <ChevronRight
                size={16}
              />
            </PaginationButton>

            <PaginationButton
              label="Dernière page"
              disabled={
                displayedPage ===
                totalPages
              }
              onClick={() =>
                setCurrentPage(
                  totalPages,
                )
              }
            >
              <ChevronsRight
                size={16}
              />
            </PaginationButton>
          </div>
        </div>
      </section>

      {selectedPublication && (
        <PublicationDetailsModal
          publication={
            selectedPublication
          }
          cancelling={
            cancellingId ===
            selectedPublication.id
          }
          onCancel={(
            publication,
          ) =>
            setPublicationToCancel(
              publication,
            )
          }
          onClose={() =>
            setSelectedPublication(
              null,
            )
          }
        />
      )}

      {publicationToCancel && (
        <CancelPublicationModal
          publication={
            publicationToCancel
          }
          loading={
            cancellingId ===
            publicationToCancel.id
          }
          onClose={() =>
            setPublicationToCancel(
              null,
            )
          }
          onConfirm={() =>
            handleCancelPublication(
              publicationToCancel,
            )
          }
        />
      )}
    </div>
  );
}

function MobileMetric({
  label,
  value,
}) {
  return (
    <div>
      <p
        className="
          text-slate-400
          dark:text-slate-500
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1
          break-words
          font-medium
          text-slate-700
          dark:text-slate-200
        "
      >
        {value}
      </p>
    </div>
  );
}

function CancelPublicationModal({
  publication,
  loading,
  onClose,
  onConfirm,
}) {
  return (
    <div
      className="
        fixed
        inset-0
        z-[60]
        flex
        items-center
        justify-center
        bg-slate-950/60
        p-4
        backdrop-blur-sm
      "
      onMouseDown={(
        event,
      ) => {
        if (
          event.target ===
            event.currentTarget &&
          !loading
        ) {
          onClose();
        }
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="cancel-publication-title"
        className="
          w-full
          max-w-md
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-2xl
          dark:border-slate-700
          dark:bg-slate-800
        "
      >
        <div
          className="
            flex
            gap-4
            p-5
            sm:p-6
          "
        >
          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-rose-100
              text-rose-600
              dark:bg-rose-950/50
              dark:text-rose-400
            "
          >
            <Ban size={20} />
          </div>

          <div className="min-w-0">
            <h2
              id="cancel-publication-title"
              className="
                text-lg
                font-bold
                text-slate-900
                dark:text-white
              "
            >
              Annuler la
              publication ?
            </h2>

            <p
              className="
                mt-2
                break-words
                text-sm
                leading-6
                text-slate-500
                dark:text-slate-400
              "
            >
              La publication{' '}
              <strong>
                #{publication.id}
              </strong>{' '}
              «{' '}
              {publication.title ||
                'Sans titre'}{' '}
              » sera annulée.
            </p>

            {publication.status ===
              'SCHEDULED' && (
              <p
                className="
                  mt-2
                  text-sm
                  text-amber-600
                  dark:text-amber-400
                "
              >
                Elle ne sera plus
                publiée à la date
                planifiée.
              </p>
            )}
          </div>
        </div>

        <div
          className="
            flex
            flex-col-reverse
            gap-2
            border-t
            border-slate-200
            px-5
            py-4
            dark:border-slate-700
            sm:flex-row
            sm:justify-end
            sm:gap-3
            sm:px-6
          "
        >
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="
              rounded-xl
              border
              border-slate-200
              px-4
              py-2.5
              text-sm
              font-medium
              text-slate-700
              hover:bg-slate-50
              disabled:opacity-50
              dark:border-slate-700
              dark:text-slate-200
              dark:hover:bg-slate-700
            "
          >
            Retour
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={
              onConfirm
            }
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-rose-600
              px-4
              py-2.5
              text-sm
              font-semibold
              text-white
              hover:bg-rose-700
              disabled:opacity-50
            "
          >
            {loading ? (
              <>
                <LoaderCircle
                  size={16}
                  className="
                    animate-spin
                  "
                />

                Annulation...
              </>
            ) : (
              <>
                <Ban
                  size={16}
                />

                Confirmer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function PublicationDetailsModal({
  publication,
  cancelling,
  onCancel,
  onClose,
}) {
  const canCancel =
    canCancelPublication(
      publication,
    );

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-slate-950/60
        p-3
        backdrop-blur-sm
        sm:p-4
      "
      onMouseDown={(
        event,
      ) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="publication-details-title"
        className="
          max-h-[92vh]
          w-full
          max-w-2xl
          overflow-y-auto
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-2xl
          dark:border-slate-700
          dark:bg-slate-800
        "
      >
        <div
          className="
            flex
            items-start
            justify-between
            gap-4
            border-b
            border-slate-200
            px-4
            py-4
            dark:border-slate-700
            sm:px-6
            sm:py-5
          "
        >
          <div className="min-w-0">
            <p
              className="
                text-xs
                font-semibold
                uppercase
                tracking-wide
                text-slate-500
                dark:text-slate-400
              "
            >
              Publication{' '}
              #{publication.id}
            </p>

            <h2
              id="publication-details-title"
              className="
                mt-1
                break-words
                text-lg
                font-bold
                text-slate-900
                dark:text-white
              "
            >
              {publication.title ||
                'Sans titre'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              shrink-0
              rounded-lg
              p-2
              text-slate-500
              hover:bg-slate-100
              dark:hover:bg-slate-700
            "
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>

        <div
          className="
            grid
            grid-cols-1
            gap-3
            p-4
            sm:grid-cols-2
            sm:gap-4
            sm:p-6
          "
        >
          <DetailItem
            label="ID publication"
            value={
              publication.id
            }
          />

          <DetailItem
            label="ID contenu"
            value={
              publication.contentId
            }
          />

          <DetailItem
            label="Destination"
            value={destinationLabel(
              publication.destination,
            )}
          />

          <DetailItem
            label="Statut"
            value={
              STATUS_LABELS[
                publication.status
              ] ||
              publication.status
            }
          />

          <DetailItem
            label="Créée"
            value={formatDate(
              publication.createdAt,
            )}
          />

          <DetailItem
            label="Dernière mise à jour"
            value={formatDate(
              publication.updatedAt,
            )}
          />

          <DetailItem
            label="Planifiée"
            value={formatDate(
              publication.scheduledAt,
            )}
          />

          <DetailItem
            label="Publiée"
            value={formatDate(
              publication.publishedAt,
            )}
          />

          <DetailItem
            label="ID externe"
            value={
              publication.externalId ||
              '—'
            }
          />

          <DetailItem
            label="Exécution n8n"
            value={
              publication.n8nExecutionId ||
              '—'
            }
          />

          <div
            className="
              sm:col-span-2
            "
          >
            <DetailItem
              label="Message d’erreur"
              value={
                publication.errorMessage ||
                'Aucune erreur'
              }
              error={Boolean(
                publication.errorMessage,
              )}
            />
          </div>
        </div>

        <div
          className="
            flex
            flex-col-reverse
            gap-2
            border-t
            border-slate-200
            px-4
            py-4
            dark:border-slate-700
            sm:flex-row
            sm:items-center
            sm:justify-end
            sm:gap-3
            sm:px-6
          "
        >
          <button
            type="button"
            onClick={onClose}
            className="
              rounded-xl
              border
              border-slate-200
              px-4
              py-2.5
              text-sm
              font-medium
              text-slate-700
              hover:bg-slate-50
              dark:border-slate-700
              dark:text-slate-200
              dark:hover:bg-slate-700
            "
          >
            Fermer
          </button>

          {canCancel && (
            <button
              type="button"
              disabled={
                cancelling
              }
              onClick={() =>
                onCancel(
                  publication,
                )
              }
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-rose-600
                px-4
                py-2.5
                text-sm
                font-semibold
                text-white
                hover:bg-rose-700
                disabled:opacity-50
              "
            >
              {cancelling ? (
                <LoaderCircle
                  size={16}
                  className="
                    animate-spin
                  "
                />
              ) : (
                <Ban
                  size={16}
                />
              )}

              Annuler la
              publication
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
  error = false,
}) {
  return (
    <div
      className="
        rounded-xl
        bg-slate-50
        px-4
        py-3
        dark:bg-slate-900/50
      "
    >
      <p
        className="
          text-xs
          font-medium
          text-slate-500
          dark:text-slate-400
        "
      >
        {label}
      </p>

      <p
        className={`
          mt-1
          break-words
          text-sm
          font-medium
          ${
            error
              ? 'text-rose-600 dark:text-rose-400'
              : 'text-slate-900 dark:text-slate-200'
          }
        `}
      >
        {String(
          value ?? '—',
        )}
      </p>
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
  variant,
}) {
  const variants = {
    indigo: {
      value:
        'text-slate-900 dark:text-white',

      icon:
        'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400',
    },

    emerald: {
      value:
        'text-emerald-600 dark:text-emerald-400',

      icon:
        'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
    },

    blue: {
      value:
        'text-blue-600 dark:text-blue-400',

      icon:
        'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
    },

    rose: {
      value:
        'text-rose-600 dark:text-rose-400',

      icon:
        'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
    },
  };

  const styles =
    variants[variant] ||
    variants.indigo;

  return (
    <div
      className="
        flex
        items-center
        justify-between
        rounded-2xl
        border
        border-slate-200/80
        bg-white
        p-5
        shadow-sm
        dark:border-slate-700/60
        dark:bg-slate-800
      "
    >
      <div>
        <p
          className="
            text-xs
            font-medium
            uppercase
            tracking-wider
            text-slate-500
            dark:text-slate-400
          "
        >
          {label}
        </p>

        <h3
          className={`
            mt-1
            text-3xl
            font-extrabold
            ${styles.value}
          `}
        >
          {value}
        </h3>
      </div>

      <div
        className={`
          rounded-xl
          p-3
          ${styles.icon}
        `}
      >
        <Icon
          className="
            h-6
            w-6
          "
        />
      </div>
    </div>
  );
}

function ContentMetric({
  label,
  value,
}) {
  return (
    <div
      className="
        min-w-0
        rounded-xl
        bg-slate-50
        px-2
        py-3
        text-center
        dark:bg-slate-900/50
        sm:px-3
      "
    >
      <p
        className="
          text-xl
          font-bold
          text-slate-900
          dark:text-white
        "
      >
        {value}
      </p>

      <p
        className="
          mt-1
          break-words
          text-[11px]
          text-slate-500
          dark:text-slate-400
          sm:text-xs
        "
      >
        {label}
      </p>
    </div>
  );
}

function PaginationButton({
  children,
  label,
  disabled,
  onClick,
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="
        inline-flex
        h-9
        w-9
        items-center
        justify-center
        rounded-lg
        border
        border-slate-200
        text-slate-600
        hover:bg-slate-50
        disabled:cursor-not-allowed
        disabled:opacity-40
        dark:border-slate-700
        dark:text-slate-300
        dark:hover:bg-slate-700
      "
    >
      {children}
    </button>
  );
}
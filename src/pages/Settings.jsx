import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  AlertCircle,
  Bot,
  CheckCircle2,
  ExternalLink,
  Globe2,
  KeyRound,
  Link2,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  Unplug,
  Workflow,
} from 'lucide-react';

import {
  disconnectLinkedInAccount,
  disconnectWordPressAccount,
  getAccounts,
  getLinkedInAuthorizationUrl,
  linkWordPressAccount,
} from '../api/accounts';

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

function statusLabel(
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

function statusClasses(
  account,
) {
  if (
    account?.status ===
    'EXPIRED'
  ) {
    return `
      bg-amber-500/10
      text-amber-600
      dark:text-amber-400
      border-amber-500/20
    `;
  }

  if (account?.connected) {
    return `
      bg-emerald-500/10
      text-emerald-600
      dark:text-emerald-400
      border-emerald-500/20
    `;
  }

  return `
    bg-slate-500/10
    text-slate-600
    dark:text-slate-400
    border-slate-500/20
  `;
}

export default function Settings() {
  const [
    accounts,
    setAccounts,
  ] = useState(null);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isRefreshing,
    setIsRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState('');

  const [
    success,
    setSuccess,
  ] = useState('');

  const [
    wordpressForm,
    setWordpressForm,
  ] = useState({
    siteUrl: '',
    wpUsername: '',
    wpAppPassword: '',
  });

  const [
    isLinkingWordPress,
    setIsLinkingWordPress,
  ] = useState(false);

  const [
    isDisconnectingWordPress,
    setIsDisconnectingWordPress,
  ] = useState(false);

  const [
    isConnectingLinkedIn,
    setIsConnectingLinkedIn,
  ] = useState(false);

  const [
    isDisconnectingLinkedIn,
    setIsDisconnectingLinkedIn,
  ] = useState(false);

  const oauthTimerRef =
    useRef(null);

  const oauthPopupRef =
    useRef(null);

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const loadAccounts =
    useCallback(
      async ({
        silent = false,
      } = {}) => {
        if (!silent) {
          setIsRefreshing(
            true,
          );
        }

        try {
          const data =
            await getAccounts();

          setAccounts(data);

          return data;
        } catch (exception) {
          setError(
            getErrorMessage(
              exception,
            ),
          );

          return null;
        } finally {
          if (!silent) {
            setIsRefreshing(
              false,
            );
          }
        }
      },
      [],
    );

  useEffect(() => {
    let cancelled = false;

    getAccounts()
      .then(
        (data) => {
          if (!cancelled) {
            setAccounts(data);
          }
        },
      )
      .catch(
        (exception) => {
          if (!cancelled) {
            setError(
              getErrorMessage(
                exception,
              ),
            );
          }
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

      if (
        oauthTimerRef.current
      ) {
        clearInterval(
          oauthTimerRef.current,
        );
      }
    };
  }, []);

  const handleRefresh =
    async () => {
      clearMessages();

      await loadAccounts();

      setSuccess(
        'État des intégrations actualisé.',
      );
    };

  const handleWordPressSubmit =
    async (event) => {
      event.preventDefault();

      clearMessages();

      const siteUrl =
        wordpressForm
          .siteUrl
          .trim();

      const wpUsername =
        wordpressForm
          .wpUsername
          .trim();

      const wpAppPassword =
        wordpressForm
          .wpAppPassword
          .trim();

      if (
        !siteUrl ||
        !wpUsername ||
        !wpAppPassword
      ) {
        setError(
          'Tous les champs WordPress sont obligatoires.',
        );

        return;
      }

      setIsLinkingWordPress(
        true,
      );

      try {
        await linkWordPressAccount({
          siteUrl,
          wpUsername,
          wpAppPassword,
        });

        await loadAccounts({
          silent: true,
        });

        setWordpressForm({
          siteUrl: '',
          wpUsername: '',
          wpAppPassword: '',
        });

        setSuccess(
          'Compte WordPress connecté avec succès.',
        );
      } catch (exception) {
        setError(
          getErrorMessage(
            exception,
          ),
        );
      } finally {
        setIsLinkingWordPress(
          false,
        );
      }
    };

  const handleDisconnectWordPress =
    async () => {
      clearMessages();

      setIsDisconnectingWordPress(
        true,
      );

      try {
        await disconnectWordPressAccount();

        await loadAccounts({
          silent: true,
        });

        setSuccess(
          'Compte WordPress déconnecté.',
        );
      } catch (exception) {
        setError(
          getErrorMessage(
            exception,
          ),
        );
      } finally {
        setIsDisconnectingWordPress(
          false,
        );
      }
    };

  const stopOAuthPolling =
    useCallback(() => {
      if (
        oauthTimerRef.current
      ) {
        clearInterval(
          oauthTimerRef.current,
        );

        oauthTimerRef.current =
          null;
      }

      setIsConnectingLinkedIn(
        false,
      );
    }, []);

  const handleConnectLinkedIn =
    async () => {
      clearMessages();

      const popup =
        window.open(
          '',
          'linkedin-oauth',
          'width=650,height=760,resizable=yes,scrollbars=yes',
        );

      if (!popup) {
        setError(
          'Le navigateur a bloqué la fenêtre OAuth LinkedIn.',
        );

        return;
      }

      oauthPopupRef.current =
        popup;

      setIsConnectingLinkedIn(
        true,
      );

      try {
        const response =
          await getLinkedInAuthorizationUrl();

        const authorizationUrl =
          response
            ?.authorization_url;

        if (!authorizationUrl) {
          throw new Error(
            'URL OAuth LinkedIn absente.',
          );
        }

        popup.location.href =
          authorizationUrl;

        const startedAt =
          Date.now();

        oauthTimerRef.current =
          setInterval(
            async () => {
              if (
                Date.now() -
                  startedAt >
                120000
              ) {
                stopOAuthPolling();

                setError(
                  'La connexion LinkedIn a expiré. Réessayez.',
                );

                return;
              }

              try {
                const data =
                  await getAccounts();

                setAccounts(
                  data,
                );

                if (
                  data?.linkedin
                    ?.connected
                ) {
                  stopOAuthPolling();

                  try {
                    oauthPopupRef
                      .current
                      ?.close();
                  } catch {
                    // Ignore browser popup restrictions.
                  }

                  setSuccess(
                    'Compte LinkedIn connecté avec succès.',
                  );
                }
              } catch {
                // Polling retries automatically.
              }
            },
            1500,
          );
      } catch (exception) {
        stopOAuthPolling();

        try {
          popup.close();
        } catch {
          // Ignore browser popup restrictions.
        }

        setError(
          getErrorMessage(
            exception,
          ),
        );
      }
    };

  const handleDisconnectLinkedIn =
    async () => {
      clearMessages();

      setIsDisconnectingLinkedIn(
        true,
      );

      try {
        await disconnectLinkedInAccount();

        await loadAccounts({
          silent: true,
        });

        setSuccess(
          'Compte LinkedIn déconnecté.',
        );
      } catch (exception) {
        setError(
          getErrorMessage(
            exception,
          ),
        );
      } finally {
        setIsDisconnectingLinkedIn(
          false,
        );
      }
    };

  if (isLoading) {
    return (
      <div className="
        min-h-[60vh]
        flex
        items-center
        justify-center
      ">
        <div className="
          flex
          flex-col
          items-center
          gap-3
          text-slate-500
          dark:text-slate-400
        ">
          <LoaderCircle
            className="
              h-8
              w-8
              animate-spin
              text-indigo-600
            "
          />

          <p className="text-sm">
            Chargement des
            paramètres...
          </p>
        </div>
      </div>
    );
  }

  const linkedin =
    accounts?.linkedin;

  const wordpress =
    accounts?.wordpress;

  return (
    <div className="
      max-w-6xl
      mx-auto
      space-y-6
    ">
      <div className="
        flex
        flex-col
        gap-3
        sm:flex-row
        sm:items-center
        sm:justify-between
      ">
        <div>
          <h1 className="
            text-2xl
            font-bold
            text-slate-900
            dark:text-white
          ">
            Paramètres
          </h1>

          <p className="
            mt-1
            text-sm
            text-slate-500
            dark:text-slate-400
          ">
            Gérez les comptes
            utilisés pour publier
            votre contenu.
          </p>
        </div>

        <button
          type="button"
          onClick={
            handleRefresh
          }
          disabled={
            isRefreshing
          }
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-slate-200
            dark:border-slate-700
            bg-white
            dark:bg-slate-800
            px-4
            py-2.5
            text-sm
            font-medium
            text-slate-700
            dark:text-slate-200
            hover:bg-slate-50
            dark:hover:bg-slate-700
            disabled:opacity-50
          "
        >
          <RefreshCw
            size={16}
            className={
              isRefreshing
                ? 'animate-spin'
                : ''
            }
          />

          Actualiser
        </button>
      </div>

      {error && (
        <Message
          type="error"
          icon={AlertCircle}
        >
          {error}
        </Message>
      )}

      {success && (
        <Message
          type="success"
          icon={
            CheckCircle2
          }
        >
          {success}
        </Message>
      )}

      <section className="
        grid
        grid-cols-1
        gap-5
        xl:grid-cols-2
      ">
        <IntegrationCard
          title="LinkedIn"
          description="Publication via OAuth 2.0 et l’API LinkedIn."
          icon={
            <span className="
              font-bold
              text-[#0077B5]
              text-lg
            ">
              in
            </span>
          }
          account={linkedin}
        >
          {linkedin?.connected ? (
            <div className="
              space-y-4
            ">
              <InfoRow
                label="Expiration du jeton"
                value={formatDate(
                  linkedin
                    .accessTokenExpiresAt,
                )}
              />

              <button
                type="button"
                onClick={
                  handleDisconnectLinkedIn
                }
                disabled={
                  isDisconnectingLinkedIn
                }
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-rose-200
                  dark:border-rose-900
                  px-4
                  py-2.5
                  text-sm
                  font-medium
                  text-rose-600
                  dark:text-rose-400
                  hover:bg-rose-50
                  dark:hover:bg-rose-950/30
                  disabled:opacity-50
                "
              >
                {isDisconnectingLinkedIn ? (
                  <LoaderCircle
                    size={16}
                    className="
                      animate-spin
                    "
                  />
                ) : (
                  <Unplug
                    size={16}
                  />
                )}

                Déconnecter
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={
                handleConnectLinkedIn
              }
              disabled={
                isConnectingLinkedIn
              }
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-[#0077B5]
                px-4
                py-2.5
                text-sm
                font-semibold
                text-white
                hover:bg-[#006097]
                disabled:opacity-50
              "
            >
              {isConnectingLinkedIn ? (
                <LoaderCircle
                  size={16}
                  className="
                    animate-spin
                  "
                />
              ) : (
                <ExternalLink
                  size={16}
                />
              )}

              {isConnectingLinkedIn
                ? 'Connexion en cours...'
                : 'Connecter LinkedIn'}
            </button>
          )}
        </IntegrationCard>

        <IntegrationCard
          title="WordPress"
          description="Publication via WordPress REST API et mot de passe d’application."
          icon={
            <Globe2
              size={20}
            />
          }
          account={wordpress}
        >
          {wordpress?.connected ? (
            <div className="
              space-y-4
            ">
              <InfoRow
                label="Site"
                value={
                  wordpress.siteUrl ||
                  '—'
                }
              />

              <button
                type="button"
                onClick={
                  handleDisconnectWordPress
                }
                disabled={
                  isDisconnectingWordPress
                }
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-rose-200
                  dark:border-rose-900
                  px-4
                  py-2.5
                  text-sm
                  font-medium
                  text-rose-600
                  dark:text-rose-400
                  hover:bg-rose-50
                  dark:hover:bg-rose-950/30
                  disabled:opacity-50
                "
              >
                {isDisconnectingWordPress ? (
                  <LoaderCircle
                    size={16}
                    className="
                      animate-spin
                    "
                  />
                ) : (
                  <Unplug
                    size={16}
                  />
                )}

                Déconnecter
              </button>
            </div>
          ) : (
            <form
              onSubmit={
                handleWordPressSubmit
              }
              className="
                space-y-4
              "
            >
              <Field
                label="URL du site"
                type="url"
                placeholder="https://example.com"
                value={
                  wordpressForm
                    .siteUrl
                }
                onChange={(
                  value,
                ) =>
                  setWordpressForm(
                    (current) => ({
                      ...current,
                      siteUrl:
                        value,
                    }),
                  )
                }
              />

              <Field
                label="Nom d’utilisateur"
                type="text"
                autoComplete="username"
                value={
                  wordpressForm
                    .wpUsername
                }
                onChange={(
                  value,
                ) =>
                  setWordpressForm(
                    (current) => ({
                      ...current,
                      wpUsername:
                        value,
                    }),
                  )
                }
              />

              <Field
                label="Mot de passe d’application"
                type="password"
                autoComplete="new-password"
                value={
                  wordpressForm
                    .wpAppPassword
                }
                onChange={(
                  value,
                ) =>
                  setWordpressForm(
                    (current) => ({
                      ...current,
                      wpAppPassword:
                        value,
                    }),
                  )
                }
              />

              <p className="
                text-xs
                text-slate-500
                dark:text-slate-400
              ">
                Le mot de passe est
                envoyé au backend puis
                stocké chiffré. Il
                n’est pas conservé
                dans le navigateur.
              </p>

              <button
                type="submit"
                disabled={
                  isLinkingWordPress
                }
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-indigo-600
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  hover:bg-indigo-700
                  disabled:opacity-50
                "
              >
                {isLinkingWordPress ? (
                  <LoaderCircle
                    size={16}
                    className="
                      animate-spin
                    "
                  />
                ) : (
                  <Link2
                    size={16}
                  />
                )}

                Connecter WordPress
              </button>
            </form>
          )}
        </IntegrationCard>
      </section>

      <section className="
        rounded-2xl
        border
        border-slate-200
        dark:border-slate-700
        bg-white
        dark:bg-slate-800
        p-6
        shadow-sm
      ">
        <div className="
          flex
          items-center
          gap-3
          mb-5
        ">
          <div className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            bg-indigo-50
            dark:bg-indigo-950/40
            text-indigo-600
            dark:text-indigo-400
          ">
            <ShieldCheck
              size={20}
            />
          </div>

          <div>
            <h2 className="
              font-semibold
              text-slate-900
              dark:text-white
            ">
              Architecture du système
            </h2>

            <p className="
              text-xs
              text-slate-500
              dark:text-slate-400
            ">
              Fonctionnalités
              configurées côté serveur.
            </p>
          </div>
        </div>

        <div className="
          grid
          grid-cols-1
          gap-3
          md:grid-cols-3
        ">
          <SystemCard
            icon={Bot}
            title="Spring AI"
            description="Génération et amélioration de contenu avec Gemini."
          />

          <SystemCard
            icon={Workflow}
            title="n8n"
            description="Orchestration asynchrone, planification et retries."
          />

          <SystemCard
            icon={KeyRound}
            title="Sécurité"
            description="JWT et chiffrement serveur des identifiants tiers."
          />
        </div>
      </section>
    </div>
  );
}

function IntegrationCard({
  title,
  description,
  icon,
  account,
  children,
}) {
  return (
    <article className="
      rounded-2xl
      border
      border-slate-200
      dark:border-slate-700
      bg-white
      dark:bg-slate-800
      p-6
      shadow-sm
      space-y-5
    ">
      <div className="
        flex
        items-start
        justify-between
        gap-4
      ">
        <div className="
          flex
          items-start
          gap-3
        ">
          <div className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-slate-50
            dark:bg-slate-900
            border
            border-slate-200
            dark:border-slate-700
          ">
            {icon}
          </div>

          <div>
            <h2 className="
              font-semibold
              text-slate-900
              dark:text-white
            ">
              {title}
            </h2>

            <p className="
              mt-1
              text-xs
              text-slate-500
              dark:text-slate-400
            ">
              {description}
            </p>
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
            ${statusClasses(
              account,
            )}
          `}
        >
          {statusLabel(
            account,
          )}
        </span>
      </div>

      <div className="
        border-t
        border-slate-100
        dark:border-slate-700
        pt-5
      ">
        {children}
      </div>
    </article>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
}) {
  return (
    <div>
      <label className="
        block
        mb-1.5
        text-xs
        font-semibold
        text-slate-700
        dark:text-slate-300
      ">
        {label}
      </label>

      <input
        type={type}
        required
        value={value}
        placeholder={
          placeholder
        }
        autoComplete={
          autoComplete
        }
        onChange={(
          event,
        ) =>
          onChange(
            event.target.value,
          )
        }
        className="
          w-full
          rounded-xl
          border
          border-slate-300
          dark:border-slate-600
          bg-transparent
          px-3
          py-2.5
          text-sm
          text-slate-900
          dark:text-white
          outline-none
          focus:border-indigo-500
          focus:ring-2
          focus:ring-indigo-500/20
        "
      />
    </div>
  );
}

function InfoRow({
  label,
  value,
}) {
  return (
    <div className="
      rounded-xl
      bg-slate-50
      dark:bg-slate-900/60
      px-4
      py-3
    ">
      <p className="
        text-xs
        text-slate-500
        dark:text-slate-400
      ">
        {label}
      </p>

      <p className="
        mt-1
        break-all
        text-sm
        font-medium
        text-slate-800
        dark:text-slate-200
      ">
        {value}
      </p>
    </div>
  );
}

function SystemCard({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="
      rounded-xl
      border
      border-slate-200
      dark:border-slate-700
      bg-slate-50
      dark:bg-slate-900/50
      p-4
    ">
      <Icon
        size={20}
        className="
          text-indigo-600
          dark:text-indigo-400
        "
      />

      <h3 className="
        mt-3
        text-sm
        font-semibold
        text-slate-900
        dark:text-white
      ">
        {title}
      </h3>

      <p className="
        mt-1
        text-xs
        leading-5
        text-slate-500
        dark:text-slate-400
      ">
        {description}
      </p>
    </div>
  );
}

function Message({
  children,
  type,
  icon: Icon,
}) {
  const success =
    type === 'success';

  return (
    <div
      role={
        success
          ? 'status'
          : 'alert'
      }
      className={`
        flex
        items-start
        gap-3
        rounded-xl
        border
        px-4
        py-3
        ${
          success
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300'
            : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300'
        }
      `}
    >
      <Icon
        size={19}
        className="
          mt-0.5
          shrink-0
        "
      />

      <p className="text-sm">
        {children}
      </p>
    </div>
  );
}
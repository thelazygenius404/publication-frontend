import {
  useEffect,
  useState,
} from 'react';

import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  LoaderCircle,
  Save,
  Send,
  Sparkles,
  WandSparkles,
} from 'lucide-react';

import {
  useNavigate,
} from 'react-router-dom';

import {
  generateDraft,
  improveDraft,
} from '../api/ai';

import {
  createContent,
  markContentReady,
  updateContent,
} from '../api/contents';

import {
  getAccounts,
} from '../api/accounts';

import {
  createPublication,
} from '../api/publications';

function getErrorMessage(
  error,
) {
  return (
    error.response?.data
      ?.message ||
    error.message ||
    'Une erreur est survenue.'
  );
}

function normalizeOptional(
  value,
) {
  const trimmed =
    value.trim();

  return trimmed || null;
}

export default function Editor() {
  const navigate =
    useNavigate();

  const [title, setTitle] =
    useState('');

  const [body, setBody] =
    useState('');

  const [topic, setTopic] =
    useState('');

  const [tone, setTone] =
    useState(
      'professionnel',
    );

  const [language, setLanguage] =
    useState('français');

  const [
    instruction,
    setInstruction,
  ] = useState(
    'Améliore la clarté, la structure et l’impact du texte.',
  );

  const [
    contentId,
    setContentId,
  ] = useState(null);

  const [
    contentStatus,
    setContentStatus,
  ] = useState(null);

  const [
    accounts,
    setAccounts,
  ] = useState(null);

  const [
    selectedDestinations,
    setSelectedDestinations,
  ] = useState([]);

  const [
    scheduledAt,
    setScheduledAt,
  ] = useState('');

  const [
    isGenerating,
    setIsGenerating,
  ] = useState(false);

  const [
    isImproving,
    setIsImproving,
  ] = useState(false);

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [
    isValidating,
    setIsValidating,
  ] = useState(false);

  const [
    isPublishing,
    setIsPublishing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState('');

  const [
    success,
    setSuccess,
  ] = useState('');

  useEffect(() => {
    let cancelled = false;

    getAccounts()
      .then(
        (data) => {
          if (!cancelled) {
            setAccounts(
              data,
            );
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
      );

    return () => {
      cancelled = true;
    };
  }, []);

  const linkedinConnected =
    Boolean(
      accounts?.linkedin
        ?.connected,
    );

  const wordpressConnected =
    Boolean(
      accounts?.wordpress
        ?.connected,
    );

  const isReady =
    contentStatus ===
    'READY';

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleGenerate =
    async () => {
      clearMessages();

      if (!topic.trim()) {
        setError(
          'Saisissez un sujet avant de générer le contenu.',
        );

        return;
      }

      setIsGenerating(true);

      try {
        const draft =
          await generateDraft({
            topic:
              topic.trim(),

            tone:
              normalizeOptional(
                tone,
              ),

            language:
              normalizeOptional(
                language,
              ),
          });

        setTitle(
          draft.title || '',
        );

        setBody(
          draft.body || '',
        );

        setContentStatus(
          null,
        );

        setSuccess(
          'Le brouillon a été généré. Relisez-le avant de l’enregistrer.',
        );
      } catch (exception) {
        setError(
          getErrorMessage(
            exception,
          ),
        );
      } finally {
        setIsGenerating(
          false,
        );
      }
    };

  const handleImprove =
    async () => {
      clearMessages();

      if (
        !title.trim() ||
        !body.trim()
      ) {
        setError(
          'Un titre et un contenu sont nécessaires avant amélioration.',
        );

        return;
      }

      setIsImproving(true);

      try {
        const draft =
          await improveDraft({
            title:
              title.trim(),

            body:
              body.trim(),

            instruction:
              normalizeOptional(
                instruction,
              ),

            tone:
              normalizeOptional(
                tone,
              ),

            language:
              normalizeOptional(
                language,
              ),
          });

        setTitle(
          draft.title || '',
        );

        setBody(
          draft.body || '',
        );

        if (contentId) {
          setContentStatus(
            'DRAFT',
          );
        }

        setSuccess(
          'Le contenu a été amélioré. Une nouvelle validation sera nécessaire après sauvegarde.',
        );
      } catch (exception) {
        setError(
          getErrorMessage(
            exception,
          ),
        );
      } finally {
        setIsImproving(
          false,
        );
      }
    };

  const saveDraft =
    async () => {
      clearMessages();

      if (
        !title.trim() ||
        !body.trim()
      ) {
        setError(
          'Le titre et le contenu sont obligatoires.',
        );

        return null;
      }

      setIsSaving(true);

      try {
        const payload = {
          title:
            title.trim(),

          body:
            body.trim(),
        };

        const saved =
          contentId
            ? await updateContent(
                contentId,
                payload,
              )
            : await createContent(
                payload,
              );

        setContentId(
          saved.id,
        );

        setContentStatus(
          saved.status,
        );

        setTitle(
          saved.title,
        );

        setBody(
          saved.body,
        );

        setSuccess(
          `Brouillon enregistré (#${saved.id}).`,
        );

        return saved;
      } catch (exception) {
        setError(
          getErrorMessage(
            exception,
          ),
        );

        return null;
      } finally {
        setIsSaving(false);
      }
    };

  const handleValidate =
    async () => {
      clearMessages();

      setIsValidating(true);

      try {
        let currentId =
          contentId;

        if (!currentId) {
          const saved =
            await saveDraft();

          if (!saved) {
            return;
          }

          currentId =
            saved.id;
        } else {
          const saved =
            await updateContent(
              currentId,
              {
                title:
                  title.trim(),

                body:
                  body.trim(),
              },
            );

          setTitle(
            saved.title,
          );

          setBody(
            saved.body,
          );

          setContentStatus(
            saved.status,
          );
        }

        const ready =
          await markContentReady(
            currentId,
          );

        setContentId(
          ready.id,
        );

        setContentStatus(
          ready.status,
        );

        setTitle(
          ready.title,
        );

        setBody(
          ready.body,
        );

        setSuccess(
          'Contenu validé. Il est maintenant prêt à être publié.',
        );
      } catch (exception) {
        setError(
          getErrorMessage(
            exception,
          ),
        );
      } finally {
        setIsValidating(
          false,
        );
      }
    };

  const toggleDestination = (
    destination,
  ) => {
    setSelectedDestinations(
      (current) =>
        current.includes(
          destination,
        )
          ? current.filter(
              (value) =>
                value !==
                destination,
            )
          : [
              ...current,
              destination,
            ],
    );
  };

  const handlePublish =
    async () => {
      clearMessages();

      if (!contentId) {
        setError(
          'Enregistrez et validez le contenu avant publication.',
        );

        return;
      }

      if (!isReady) {
        setError(
          'Le contenu doit être validé avant publication.',
        );

        return;
      }

      if (
        selectedDestinations.length ===
        0
      ) {
        setError(
          'Sélectionnez au moins une plateforme connectée.',
        );

        return;
      }

      let scheduledInstant =
        null;

      if (scheduledAt) {
        const date =
          new Date(
            scheduledAt,
          );

        if (
          Number.isNaN(
            date.getTime(),
          )
        ) {
          setError(
            'La date de planification est invalide.',
          );

          return;
        }

        if (
          date.getTime() <=
          Date.now()
        ) {
          setError(
            'La date de planification doit être dans le futur.',
          );

          return;
        }

        scheduledInstant =
          date.toISOString();
      }

      setIsPublishing(
        true,
      );

      try {
        const publications =
          await createPublication({
            contentId,
            destinations:
              selectedDestinations,

            scheduledAt:
              scheduledInstant,
          });

        const count =
          Array.isArray(
            publications,
          )
            ? publications.length
            : 0;

        setSuccess(
          scheduledInstant
            ? `${count} publication(s) planifiée(s) avec succès.`
            : `${count} publication(s) envoyée(s) au workflow.`,
        );

        setTimeout(() => {
          navigate('/');
        }, 800);
      } catch (exception) {
        setError(
          getErrorMessage(
            exception,
          ),
        );
      } finally {
        setIsPublishing(
          false,
        );
      }
    };

  return (
    <div className="
      max-w-6xl
      mx-auto
      space-y-6
    ">
      <div>
        <h1 className="
          text-2xl
          font-bold
          text-slate-900
          dark:text-white
        ">
          Nouvelle publication
        </h1>

        <p className="
          mt-1
          text-sm
          text-slate-500
          dark:text-slate-400
        ">
          Générez, relisez,
          validez puis publiez
          votre contenu.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="
            flex
            items-start
            gap-3
            rounded-xl
            border
            border-rose-200
            dark:border-rose-900
            bg-rose-50
            dark:bg-rose-950/30
            px-4
            py-3
          "
        >
          <AlertCircle
            size={20}
            className="
              mt-0.5
              shrink-0
              text-rose-600
            "
          />

          <p className="
            text-sm
            text-rose-700
            dark:text-rose-300
          ">
            {error}
          </p>
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
            dark:border-emerald-900
            bg-emerald-50
            dark:bg-emerald-950/30
            px-4
            py-3
          "
        >
          <CheckCircle2
            size={20}
            className="
              mt-0.5
              shrink-0
              text-emerald-600
            "
          />

          <p className="
            text-sm
            text-emerald-700
            dark:text-emerald-300
          ">
            {success}
          </p>
        </div>
      )}

      <div className="
        grid
        grid-cols-1
        gap-6
        xl:grid-cols-[1fr_320px]
      ">
        <section className="
          rounded-2xl
          border
          border-slate-200
          dark:border-slate-700
          bg-white
          dark:bg-slate-800
          p-6
          shadow-sm
          space-y-6
        ">
          <div>
            <label
              htmlFor="title"
              className="
                block
                mb-2
                text-sm
                font-medium
                text-slate-700
                dark:text-slate-300
              "
            >
              Titre
            </label>

            <input
              id="title"
              type="text"
              maxLength={255}
              value={title}
              onChange={(
                event,
              ) => {
                setTitle(
                  event.target
                    .value,
                );

                if (
                  contentId &&
                  isReady
                ) {
                  setContentStatus(
                    'DRAFT',
                  );
                }
              }}
              placeholder="Titre de la publication"
              className="
                w-full
                rounded-xl
                border
                border-slate-300
                dark:border-slate-600
                bg-transparent
                px-4
                py-3
                text-slate-900
                dark:text-white
                outline-none
                focus:border-indigo-500
                focus:ring-2
                focus:ring-indigo-500/20
              "
            />
          </div>

          <div>
            <label
              htmlFor="body"
              className="
                block
                mb-2
                text-sm
                font-medium
                text-slate-700
                dark:text-slate-300
              "
            >
              Contenu
            </label>

            <textarea
              id="body"
              rows={15}
              value={body}
              onChange={(
                event,
              ) => {
                setBody(
                  event.target
                    .value,
                );

                if (
                  contentId &&
                  isReady
                ) {
                  setContentStatus(
                    'DRAFT',
                  );
                }
              }}
              placeholder="Rédigez ou générez votre contenu..."
              className="
                w-full
                resize-y
                rounded-xl
                border
                border-slate-300
                dark:border-slate-600
                bg-transparent
                px-4
                py-3
                text-slate-900
                dark:text-white
                outline-none
                focus:border-indigo-500
                focus:ring-2
                focus:ring-indigo-500/20
              "
            />
          </div>

          <div className="
            flex
            flex-wrap
            items-center
            justify-between
            gap-3
            border-t
            border-slate-200
            dark:border-slate-700
            pt-5
          ">
            <div className="
              text-sm
              text-slate-500
              dark:text-slate-400
            ">
              {contentId ? (
                <>
                  Contenu #
                  {contentId}
                  {' · '}
                  <strong>
                    {contentStatus}
                  </strong>
                </>
              ) : (
                'Contenu non enregistré'
              )}
            </div>

            <div className="
              flex
              flex-wrap
              gap-2
            ">
              <button
                type="button"
                disabled={
                  isSaving ||
                  isValidating
                }
                onClick={
                  saveDraft
                }
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-300
                  dark:border-slate-600
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
                {isSaving ? (
                  <LoaderCircle
                    size={17}
                    className="
                      animate-spin
                    "
                  />
                ) : (
                  <Save
                    size={17}
                  />
                )}

                Enregistrer
              </button>

              <button
                type="button"
                disabled={
                  isValidating ||
                  isSaving
                }
                onClick={
                  handleValidate
                }
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-emerald-600
                  px-4
                  py-2.5
                  text-sm
                  font-medium
                  text-white
                  hover:bg-emerald-700
                  disabled:opacity-50
                "
              >
                {isValidating ? (
                  <LoaderCircle
                    size={17}
                    className="
                      animate-spin
                    "
                  />
                ) : (
                  <CheckCircle2
                    size={17}
                  />
                )}

                Valider
              </button>
            </div>
          </div>
        </section>

        <aside className="
          space-y-5
        ">
          <section className="
            rounded-2xl
            border
            border-slate-200
            dark:border-slate-700
            bg-white
            dark:bg-slate-800
            p-5
            shadow-sm
            space-y-4
          ">
            <div className="
              flex
              items-center
              gap-2
            ">
              <Sparkles
                size={19}
                className="
                  text-violet-600
                "
              />

              <h2 className="
                font-semibold
                text-slate-900
                dark:text-white
              ">
                Assistant Gemini
              </h2>
            </div>

            <div>
              <label
                htmlFor="topic"
                className="
                  block
                  mb-1.5
                  text-xs
                  font-medium
                  text-slate-600
                  dark:text-slate-400
                "
              >
                Sujet
              </label>

              <textarea
                id="topic"
                rows={3}
                maxLength={500}
                value={topic}
                onChange={(
                  event,
                ) =>
                  setTopic(
                    event.target
                      .value,
                  )
                }
                placeholder="Ex: automatisation des publications..."
                className="
                  w-full
                  resize-none
                  rounded-xl
                  border
                  border-slate-300
                  dark:border-slate-600
                  bg-transparent
                  px-3
                  py-2.5
                  text-sm
                  dark:text-white
                  outline-none
                  focus:border-violet-500
                "
              />
            </div>

            <div className="
              grid
              grid-cols-2
              gap-3
            ">
              <div>
                <label className="
                  block
                  mb-1.5
                  text-xs
                  font-medium
                  text-slate-600
                  dark:text-slate-400
                ">
                  Ton
                </label>

                <select
                  value={tone}
                  onChange={(
                    event,
                  ) =>
                    setTone(
                      event.target
                        .value,
                    )
                  }
                  className="
                    w-full
                    rounded-xl
                    border
                    border-slate-300
                    dark:border-slate-600
                    bg-white
                    dark:bg-slate-900
                    px-3
                    py-2.5
                    text-sm
                    dark:text-white
                  "
                >
                  <option value="professionnel">
                    Professionnel
                  </option>

                  <option value="pédagogique">
                    Pédagogique
                  </option>

                  <option value="dynamique">
                    Dynamique
                  </option>

                  <option value="concis">
                    Concis
                  </option>
                </select>
              </div>

              <div>
                <label className="
                  block
                  mb-1.5
                  text-xs
                  font-medium
                  text-slate-600
                  dark:text-slate-400
                ">
                  Langue
                </label>

                <select
                  value={
                    language
                  }
                  onChange={(
                    event,
                  ) =>
                    setLanguage(
                      event.target
                        .value,
                    )
                  }
                  className="
                    w-full
                    rounded-xl
                    border
                    border-slate-300
                    dark:border-slate-600
                    bg-white
                    dark:bg-slate-900
                    px-3
                    py-2.5
                    text-sm
                    dark:text-white
                  "
                >
                  <option value="français">
                    Français
                  </option>

                  <option value="anglais">
                    Anglais
                  </option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={
                handleGenerate
              }
              disabled={
                isGenerating
              }
              className="
                w-full
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-violet-600
                px-4
                py-2.5
                text-sm
                font-medium
                text-white
                hover:bg-violet-700
                disabled:opacity-50
              "
            >
              {isGenerating ? (
                <LoaderCircle
                  size={17}
                  className="
                    animate-spin
                  "
                />
              ) : (
                <Sparkles
                  size={17}
                />
              )}

              Générer
            </button>

            <div className="
              border-t
              border-slate-200
              dark:border-slate-700
              pt-4
            ">
              <label
                htmlFor="instruction"
                className="
                  block
                  mb-1.5
                  text-xs
                  font-medium
                  text-slate-600
                  dark:text-slate-400
                "
              >
                Instruction
                d’amélioration
              </label>

              <textarea
                id="instruction"
                rows={3}
                maxLength={500}
                value={
                  instruction
                }
                onChange={(
                  event,
                ) =>
                  setInstruction(
                    event.target
                      .value,
                  )
                }
                className="
                  w-full
                  resize-none
                  rounded-xl
                  border
                  border-slate-300
                  dark:border-slate-600
                  bg-transparent
                  px-3
                  py-2.5
                  text-sm
                  dark:text-white
                  outline-none
                "
              />

              <button
                type="button"
                onClick={
                  handleImprove
                }
                disabled={
                  isImproving
                }
                className="
                  mt-3
                  w-full
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-violet-300
                  dark:border-violet-700
                  px-4
                  py-2.5
                  text-sm
                  font-medium
                  text-violet-700
                  dark:text-violet-300
                  hover:bg-violet-50
                  dark:hover:bg-violet-950/30
                  disabled:opacity-50
                "
              >
                {isImproving ? (
                  <LoaderCircle
                    size={17}
                    className="
                      animate-spin
                    "
                  />
                ) : (
                  <WandSparkles
                    size={17}
                  />
                )}

                Améliorer
              </button>
            </div>
          </section>

          <section className="
            rounded-2xl
            border
            border-slate-200
            dark:border-slate-700
            bg-white
            dark:bg-slate-800
            p-5
            shadow-sm
            space-y-4
          ">
            <div className="
              flex
              items-center
              gap-2
            ">
              <Send
                size={19}
                className="
                  text-indigo-600
                "
              />

              <h2 className="
                font-semibold
                text-slate-900
                dark:text-white
              ">
                Publication
              </h2>
            </div>

            {!isReady && (
              <p className="
                text-xs
                text-amber-600
                dark:text-amber-400
              ">
                Validez d’abord le
                contenu pour activer
                la publication.
              </p>
            )}

            <DestinationCheckbox
              label="LinkedIn"
              value="LINKEDIN"
              connected={
                linkedinConnected
              }
              checked={
                selectedDestinations.includes(
                  'LINKEDIN',
                )
              }
              onChange={
                toggleDestination
              }
            />

            <DestinationCheckbox
              label="WordPress"
              value="WORDPRESS"
              connected={
                wordpressConnected
              }
              checked={
                selectedDestinations.includes(
                  'WORDPRESS',
                )
              }
              onChange={
                toggleDestination
              }
            />

            <div>
              <label
                htmlFor="scheduledAt"
                className="
                  flex
                  items-center
                  gap-2
                  mb-2
                  text-xs
                  font-medium
                  text-slate-600
                  dark:text-slate-400
                "
              >
                <CalendarClock
                  size={15}
                />

                Planification
                facultative
              </label>

              <input
                id="scheduledAt"
                type="datetime-local"
                value={
                  scheduledAt
                }
                onChange={(
                  event,
                ) =>
                  setScheduledAt(
                    event.target
                      .value,
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
                  dark:text-white
                "
              />

              <p className="
                mt-1.5
                text-xs
                text-slate-400
              ">
                Laissez vide pour
                publier immédiatement.
              </p>
            </div>

            <button
              type="button"
              disabled={
                !isReady ||
                isPublishing
              }
              onClick={
                handlePublish
              }
              className="
                w-full
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-indigo-600
                px-4
                py-3
                text-sm
                font-semibold
                text-white
                hover:bg-indigo-700
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {isPublishing ? (
                <LoaderCircle
                  size={18}
                  className="
                    animate-spin
                  "
                />
              ) : (
                <Send
                  size={18}
                />
              )}

              {scheduledAt
                ? 'Planifier'
                : 'Publier maintenant'}
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}

function DestinationCheckbox({
  label,
  value,
  connected,
  checked,
  onChange,
}) {
  return (
    <label
      className={`
        flex
        items-center
        justify-between
        gap-3
        rounded-xl
        border
        px-3
        py-3
        ${
          connected
            ? 'border-slate-200 dark:border-slate-700 cursor-pointer'
            : 'border-slate-200 dark:border-slate-700 opacity-50 cursor-not-allowed'
        }
      `}
    >
      <div>
        <p className="
          text-sm
          font-medium
          text-slate-800
          dark:text-slate-200
        ">
          {label}
        </p>

        <p className="
          text-xs
          text-slate-500
          dark:text-slate-400
        ">
          {connected
            ? 'Compte connecté'
            : 'Compte non connecté'}
        </p>
      </div>

      <input
        type="checkbox"
        disabled={
          !connected
        }
        checked={
          checked
        }
        onChange={() =>
          onChange(value)
        }
        className="
          h-4
          w-4
          rounded
          border-slate-300
          text-indigo-600
        "
      />
    </label>
  );
}
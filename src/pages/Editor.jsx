import {
  useEffect,
  useState,
} from 'react';

import {
  AlertCircle,
  ArrowLeft,
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
  useSearchParams,
} from 'react-router-dom';

import {
  generateDraft,
  improveDraft,
} from '../api/ai';

import {
  createContent,
  getContent,
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

function contentStatusLabel(
  status,
) {
  const labels = {
    DRAFT: 'Brouillon',
    READY: 'Prêt',
    ARCHIVED: 'Archivé',
  };

  return (
    labels[status] ||
    status ||
    'Non enregistré'
  );
}

export default function Editor() {
  const navigate =
    useNavigate();

  const [
    searchParams,
  ] = useSearchParams();

  const editContentId =
    searchParams.get(
      'contentId',
    );

  const editingExisting =
    Boolean(editContentId);

  const parsedEditContentId =
    editContentId
      ? Number(editContentId)
      : null;

  const invalidEditContentId =
    Boolean(editContentId) &&
    (
      !Number.isInteger(
        parsedEditContentId,
      ) ||
      parsedEditContentId <= 0
    );

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
    isLoadingContent,
    setIsLoadingContent,
  ] = useState(
    editingExisting &&
      !invalidEditContentId,
  );

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

  useEffect(() => {
    let cancelled = false;

    if (
      !editContentId ||
      invalidEditContentId
    ) {
      return () => {
        cancelled = true;
      };
    }

    getContent(
      parsedEditContentId,
    )
      .then(
        (content) => {
          if (cancelled) {
            return;
          }

          setContentId(
            content.id,
          );

          setTitle(
            content.title || '',
          );

          setBody(
            content.body || '',
          );

          setContentStatus(
            content.status,
          );

          setSelectedDestinations(
            [],
          );

          setScheduledAt('');

          if (
            content.status ===
            'ARCHIVED'
          ) {
            setSuccess(
              'Ce contenu est archivé et disponible en lecture seule.',
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
      )
      .finally(() => {
        if (!cancelled) {
          setIsLoadingContent(
            false,
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    editContentId,
    invalidEditContentId,
    parsedEditContentId,
  ]);

  const displayedError =
    invalidEditContentId
      ? 'Identifiant de contenu invalide.'
      : error;

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

  const isArchived =
    contentStatus ===
    'ARCHIVED';

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const markLocallyModified =
    () => {
      if (
        contentId &&
        contentStatus ===
          'READY'
      ) {
        setContentStatus(
          'DRAFT',
        );
      }
    };

  const handleGenerate =
    async () => {
      clearMessages();

      if (isArchived) {
        setError(
          'Un contenu archivé ne peut pas être modifié.',
        );
        return;
      }

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
          contentId
            ? 'DRAFT'
            : null,
        );

        setSuccess(
          contentId
            ? 'Le contenu a été remplacé par un nouveau brouillon. Enregistrez puis validez de nouveau.'
            : 'Le brouillon a été généré. Relisez-le avant de l’enregistrer.',
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

      if (isArchived) {
        setError(
          'Un contenu archivé ne peut pas être modifié.',
        );
        return;
      }

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

      if (isArchived) {
        setError(
          'Un contenu archivé ne peut pas être modifié.',
        );
        return null;
      }

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
          contentId
            ? `Modifications enregistrées (#${saved.id}). Le contenu est maintenant en brouillon et doit être validé de nouveau.`
            : `Brouillon enregistré (#${saved.id}).`,
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

      if (isArchived) {
        setError(
          'Un contenu archivé ne peut pas être validé.',
        );
        return;
      }

      if (
        !title.trim() ||
        !body.trim()
      ) {
        setError(
          'Le titre et le contenu sont obligatoires.',
        );
        return;
      }

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

      if (isArchived) {
        setError(
          'Un contenu archivé ne peut pas être publié.',
        );
        return;
      }

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

  if (
    editingExisting &&
    isLoadingContent
  ) {
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
            size={32}
            className="
              animate-spin
              text-indigo-600
            "
          />

          <p className="text-sm">
            Chargement du contenu...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="
        max-w-6xl
        mx-auto
        space-y-6
      "
    >
      <div
        className="
          flex
          flex-col
          gap-3
          sm:flex-row
          sm:items-start
          sm:justify-between
        "
      >
        <div>
          <h1
            className="
              text-2xl
              font-bold
              text-slate-900
              dark:text-white
            "
          >
            {editingExisting
              ? 'Modifier le contenu'
              : 'Nouvelle publication'}
          </h1>

          <p
            className="
              mt-1
              text-sm
              text-slate-500
              dark:text-slate-400
            "
          >
            {editingExisting
              ? 'Modifiez le contenu sauvegardé, puis validez-le de nouveau avant publication.'
              : 'Générez, relisez, validez puis publiez votre contenu.'}
          </p>
        </div>

        {editingExisting && (
          <button
            type="button"
            onClick={() =>
              navigate('/')
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
              px-4
              py-2.5
              text-sm
              font-medium
              text-slate-700
              hover:bg-slate-50
              dark:border-slate-700
              dark:text-slate-200
              dark:hover:bg-slate-700
              sm:w-auto
            "
          >
            <ArrowLeft
              size={17}
            />

            Retour au tableau de bord
          </button>
        )}
      </div>

      {editingExisting &&
        contentId &&
        !isArchived && (
          <div
            className="
              rounded-xl
              border
              border-amber-200
              bg-amber-50
              px-4
              py-3
              text-sm
              text-amber-800
              dark:border-amber-900
              dark:bg-amber-950/30
              dark:text-amber-300
            "
          >
            Vous modifiez le contenu
            #{contentId}. Toute
            modification enregistrée
            repasse le contenu en
            brouillon et nécessite une
            nouvelle validation humaine.
          </div>
        )}

      {displayedError && (
        <div
          role="alert"
          className="
            flex
            items-start
            gap-3
            rounded-xl
            border
            border-rose-200
            bg-rose-50
            px-4
            py-3
            dark:border-rose-900
            dark:bg-rose-950/30
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

          <p
            className="
              text-sm
              text-rose-700
              dark:text-rose-300
            "
          >
            {displayedError}
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
            bg-emerald-50
            px-4
            py-3
            dark:border-emerald-900
            dark:bg-emerald-950/30
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

          <p
            className="
              text-sm
              text-emerald-700
              dark:text-emerald-300
            "
          >
            {success}
          </p>
        </div>
      )}

      <div
        className="
          grid
          grid-cols-1
          gap-6
          xl:grid-cols-[1fr_320px]
        "
      >
        <section
          className="
            space-y-6
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-6
            shadow-sm
            dark:border-slate-700
            dark:bg-slate-800
          "
        >
          <div>
            <label
              htmlFor="title"
              className="
                mb-2
                block
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
              disabled={isArchived}
              onChange={(
                event,
              ) => {
                setTitle(
                  event.target
                    .value,
                );

                markLocallyModified();
              }}
              placeholder="Titre de la publication"
              className="
                w-full
                rounded-xl
                border
                border-slate-300
                bg-transparent
                px-4
                py-3
                text-slate-900
                outline-none
                focus:border-indigo-500
                focus:ring-2
                focus:ring-indigo-500/20
                disabled:cursor-not-allowed
                disabled:opacity-60
                dark:border-slate-600
                dark:text-white
              "
            />
          </div>

          <div>
            <label
              htmlFor="body"
              className="
                mb-2
                block
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
              disabled={isArchived}
              onChange={(
                event,
              ) => {
                setBody(
                  event.target
                    .value,
                );

                markLocallyModified();
              }}
              placeholder="Rédigez ou générez votre contenu..."
              className="
                w-full
                resize-y
                rounded-xl
                border
                border-slate-300
                bg-transparent
                px-4
                py-3
                text-slate-900
                outline-none
                focus:border-indigo-500
                focus:ring-2
                focus:ring-indigo-500/20
                disabled:cursor-not-allowed
                disabled:opacity-60
                dark:border-slate-600
                dark:text-white
              "
            />
          </div>

          <div
            className="
              flex
              flex-wrap
              items-center
              justify-between
              gap-3
              border-t
              border-slate-200
              pt-5
              dark:border-slate-700
            "
          >
            <div
              className="
                text-sm
                text-slate-500
                dark:text-slate-400
              "
            >
              {contentId ? (
                <>
                  Contenu #
                  {contentId}
                  {' · '}
                  <strong>
                    {contentStatusLabel(
                      contentStatus,
                    )}
                  </strong>
                </>
              ) : (
                'Contenu non enregistré'
              )}
            </div>

            {!isArchived && (
              <div
                className="
                  flex
                  flex-wrap
                  gap-2
                "
              >
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
                    px-4
                    py-2.5
                    text-sm
                    font-medium
                    text-slate-700
                    hover:bg-slate-50
                    disabled:opacity-50
                    dark:border-slate-600
                    dark:text-slate-200
                    dark:hover:bg-slate-700
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

                  {editingExisting
                    ? 'Enregistrer les modifications'
                    : 'Enregistrer'}
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
            )}
          </div>
        </section>

        <aside
          className="
            space-y-5
          "
        >
          <section
            className="
              space-y-4
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-5
              shadow-sm
              dark:border-slate-700
              dark:bg-slate-800
            "
          >
            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <Sparkles
                size={19}
                className="
                  text-violet-600
                "
              />

              <h2
                className="
                  font-semibold
                  text-slate-900
                  dark:text-white
                "
              >
                Assistant Gemini
              </h2>
            </div>

            <div>
              <label
                htmlFor="topic"
                className="
                  mb-1.5
                  block
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
                disabled={isArchived}
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
                  bg-transparent
                  px-3
                  py-2.5
                  text-sm
                  outline-none
                  focus:border-violet-500
                  disabled:opacity-60
                  dark:border-slate-600
                  dark:text-white
                "
              />
            </div>

            <div
              className="
                grid
                grid-cols-2
                gap-3
              "
            >
              <div>
                <label
                  className="
                    mb-1.5
                    block
                    text-xs
                    font-medium
                    text-slate-600
                    dark:text-slate-400
                  "
                >
                  Ton
                </label>

                <select
                  value={tone}
                  disabled={isArchived}
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
                    bg-white
                    px-3
                    py-2.5
                    text-sm
                    disabled:opacity-60
                    dark:border-slate-600
                    dark:bg-slate-900
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
                <label
                  className="
                    mb-1.5
                    block
                    text-xs
                    font-medium
                    text-slate-600
                    dark:text-slate-400
                  "
                >
                  Langue
                </label>

                <select
                  value={
                    language
                  }
                  disabled={isArchived}
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
                    bg-white
                    px-3
                    py-2.5
                    text-sm
                    disabled:opacity-60
                    dark:border-slate-600
                    dark:bg-slate-900
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
                isGenerating ||
                isArchived
              }
              className="
                inline-flex
                w-full
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

            <div
              className="
                border-t
                border-slate-200
                pt-4
                dark:border-slate-700
              "
            >
              <label
                htmlFor="instruction"
                className="
                  mb-1.5
                  block
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
                disabled={isArchived}
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
                  bg-transparent
                  px-3
                  py-2.5
                  text-sm
                  outline-none
                  disabled:opacity-60
                  dark:border-slate-600
                  dark:text-white
                "
              />

              <button
                type="button"
                onClick={
                  handleImprove
                }
                disabled={
                  isImproving ||
                  isArchived
                }
                className="
                  mt-3
                  inline-flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-violet-300
                  px-4
                  py-2.5
                  text-sm
                  font-medium
                  text-violet-700
                  hover:bg-violet-50
                  disabled:opacity-50
                  dark:border-violet-700
                  dark:text-violet-300
                  dark:hover:bg-violet-950/30
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

          <section
            className="
              space-y-4
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-5
              shadow-sm
              dark:border-slate-700
              dark:bg-slate-800
            "
          >
            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <Send
                size={19}
                className="
                  text-indigo-600
                "
              />

              <h2
                className="
                  font-semibold
                  text-slate-900
                  dark:text-white
                "
              >
                Publication
              </h2>
            </div>

            {!isReady && (
              <p
                className="
                  text-xs
                  text-amber-600
                  dark:text-amber-400
                "
              >
                {isArchived
                  ? 'Le contenu archivé ne peut plus être publié.'
                  : 'Validez d’abord le contenu pour activer la publication.'}
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
              disabled={
                isArchived
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
              disabled={
                isArchived
              }
              onChange={
                toggleDestination
              }
            />

            <div>
              <label
                htmlFor="scheduledAt"
                className="
                  mb-2
                  flex
                  items-center
                  gap-2
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
                disabled={isArchived}
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
                  bg-transparent
                  px-3
                  py-2.5
                  text-sm
                  disabled:opacity-60
                  dark:border-slate-600
                  dark:text-white
                "
              />

              <p
                className="
                  mt-1.5
                  text-xs
                  text-slate-400
                "
              >
                Laissez vide pour
                publier immédiatement.
              </p>
            </div>

            <button
              type="button"
              disabled={
                !isReady ||
                isPublishing ||
                isArchived
              }
              onClick={
                handlePublish
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
  disabled = false,
  onChange,
}) {
  const available =
    connected &&
    !disabled;

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
          available
            ? 'cursor-pointer border-slate-200 dark:border-slate-700'
            : 'cursor-not-allowed border-slate-200 opacity-50 dark:border-slate-700'
        }
      `}
    >
      <div>
        <p
          className="
            text-sm
            font-medium
            text-slate-800
            dark:text-slate-200
          "
        >
          {label}
        </p>

        <p
          className="
            text-xs
            text-slate-500
            dark:text-slate-400
          "
        >
          {connected
            ? 'Compte connecté'
            : 'Compte non connecté'}
        </p>
      </div>

      <input
        type="checkbox"
        disabled={
          !available
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

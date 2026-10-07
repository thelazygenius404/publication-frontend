import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  ImagePlus,
  LoaderCircle,
  Save,
  Trash2,
  UploadCloud,
} from 'lucide-react';

import {
  deleteContentMedia,
  getContentMedia,
  getContentMediaFile,
  updateContentMediaAltText,
  uploadContentMedia,
} from '../api/contents';

const MAX_FILE_SIZE =
  10 * 1024 * 1024;

const ACCEPTED_TYPES =
  new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
  ]);

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

function formatFileSize(
  bytes,
) {
  if (!bytes) {
    return '0 Ko';
  }

  const megabytes =
    bytes /
    (1024 * 1024);

  if (megabytes >= 1) {
    return `${megabytes.toFixed(
      2,
    )} Mo`;
  }

  return `${Math.ceil(
    bytes / 1024,
  )} Ko`;
}

export default function MediaSection({
  contentId,
  isArchived,
  ensureContentSaved,
  onContentInvalidated,
}) {
  const [
    media,
    setMedia,
  ] = useState(null);

  const [
    altText,
    setAltText,
  ] = useState('');

  const [
    previewUrl,
    setPreviewUrl,
  ] = useState('');

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const [
    isUploading,
    setIsUploading,
  ] = useState(false);

  const [
    isUpdatingAlt,
    setIsUpdatingAlt,
  ] = useState(false);

  const [
    isDeleting,
    setIsDeleting,
  ] = useState(false);

  const [
    isDragging,
    setIsDragging,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState('');

  const [
    success,
    setSuccess,
  ] = useState('');

  const fileInputRef =
    useRef(null);

  const objectUrlRef =
    useRef(null);

  const busyRef =
    useRef(false);

  const clearPreview = () => {
    if (
      objectUrlRef.current
    ) {
      URL.revokeObjectURL(
        objectUrlRef.current,
      );

      objectUrlRef.current =
        null;
    }

    setPreviewUrl('');
  };

  const setBlobPreview = (
    blob,
  ) => {
    if (
      objectUrlRef.current
    ) {
      URL.revokeObjectURL(
        objectUrlRef.current,
      );
    }

    const url =
      URL.createObjectURL(
        blob,
      );

    objectUrlRef.current =
      url;

    setPreviewUrl(url);
  };

  useEffect(() => {
    let cancelled = false;

    if (
      !contentId ||
      busyRef.current
    ) {
      return () => {
        cancelled = true;
      };
    }

    Promise.resolve()
      .then(() => {
        if (!cancelled) {
          setIsLoading(true);
        }

        return getContentMedia(
          contentId,
        );
      })
      .then(
        async (items) => {
          if (cancelled) {
            return;
          }

          const firstMedia =
            Array.isArray(items)
              ? items[0]
              : null;

          if (!firstMedia) {
            setMedia(null);
            setAltText('');
            clearPreview();
            return;
          }

          setMedia(
            firstMedia,
          );

          setAltText(
            firstMedia.altText ||
              '',
          );

          const blob =
            await getContentMediaFile(
              contentId,
              firstMedia.id,
            );

          if (
            !cancelled
          ) {
            setBlobPreview(
              blob,
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
          setIsLoading(
            false,
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [contentId]);

  useEffect(
    () => () => {
      if (
        objectUrlRef.current
      ) {
        URL.revokeObjectURL(
          objectUrlRef.current,
        );
      }
    },
    [],
  );

  const validateFile = (
    file,
  ) => {
    if (!file) {
      return false;
    }

    if (
      !ACCEPTED_TYPES.has(
        file.type,
      )
    ) {
      setError(
        'Seules les images JPEG, PNG et WebP sont autorisées.',
      );

      return false;
    }

    if (
      file.size >
      MAX_FILE_SIZE
    ) {
      setError(
        'L’image ne peut pas dépasser 10 Mo.',
      );

      return false;
    }

    return true;
  };

  const uploadFile =
    async (file) => {
      setError('');
      setSuccess('');

      if (isArchived) {
        setError(
          'Un contenu archivé ne peut pas être modifié.',
        );

        return;
      }

      if (!validateFile(file)) {
        return;
      }

      busyRef.current = true;

      setIsUploading(true);

      try {
        const savedContentId =
          await ensureContentSaved();

        if (
          !savedContentId
        ) {
          return;
        }

        const uploaded =
          await uploadContentMedia(
            savedContentId,
            file,
            altText,
          );

        if (media) {
          try {
            await deleteContentMedia(
              savedContentId,
              media.id,
            );
          } catch (
            deleteException
          ) {
            try {
              await deleteContentMedia(
                savedContentId,
                uploaded.id,
              );
            } catch {
              // Best-effort rollback.
            }

            throw deleteException;
          }
        }

        setMedia(uploaded);

        setAltText(
          uploaded.altText ||
            '',
        );

        setBlobPreview(file);

        onContentInvalidated();

        setSuccess(
          media
            ? 'Image remplacée. Le contenu doit être validé de nouveau.'
            : 'Image ajoutée. Le contenu doit être validé de nouveau.',
        );
      } catch (exception) {
        setError(
          getErrorMessage(
            exception,
          ),
        );
      } finally {
        busyRef.current =
          false;

        setIsUploading(
          false,
        );

        if (
          fileInputRef.current
        ) {
          fileInputRef.current.value =
            '';
        }
      }
    };

  const handleFileChange = (
    event,
  ) => {
    const file =
      event.target.files?.[0];

    if (file) {
      uploadFile(file);
    }
  };

  const handleDrop = (
    event,
  ) => {
    event.preventDefault();

    setIsDragging(false);

    const file =
      event.dataTransfer
        .files?.[0];

    if (file) {
      uploadFile(file);
    }
  };

  const handleAltTextSave =
    async () => {
      if (
        !contentId ||
        !media
      ) {
        return;
      }

      setError('');
      setSuccess('');
      setIsUpdatingAlt(
        true,
      );

      try {
        const updated =
          await updateContentMediaAltText(
            contentId,
            media.id,
            altText,
          );

        setMedia(updated);

        setAltText(
          updated.altText ||
            '',
        );

        onContentInvalidated();

        setSuccess(
          'Texte alternatif enregistré. Le contenu doit être validé de nouveau.',
        );
      } catch (exception) {
        setError(
          getErrorMessage(
            exception,
          ),
        );
      } finally {
        setIsUpdatingAlt(
          false,
        );
      }
    };

  const handleDelete =
    async () => {
      if (
        !contentId ||
        !media
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          'Supprimer cette image du contenu ?',
        );

      if (!confirmed) {
        return;
      }

      setError('');
      setSuccess('');
      setIsDeleting(
        true,
      );

      try {
        await deleteContentMedia(
          contentId,
          media.id,
        );

        setMedia(null);
        setAltText('');
        clearPreview();

        onContentInvalidated();

        setSuccess(
          'Image supprimée. Le contenu doit être validé de nouveau.',
        );
      } catch (exception) {
        setError(
          getErrorMessage(
            exception,
          ),
        );
      } finally {
        setIsDeleting(
          false,
        );
      }
    };

  const isBusy =
    isLoading ||
    isUploading ||
    isUpdatingAlt ||
    isDeleting;

  return (
    <div
      className="
        space-y-4
        border-t
        border-slate-200
        pt-5
        dark:border-slate-700
      "
    >
      <div>
        <h2
          className="
            text-sm
            font-semibold
            text-slate-900
            dark:text-white
          "
        >
          Média
        </h2>

        <p
          className="
            mt-1
            text-xs
            text-slate-500
            dark:text-slate-400
          "
        >
          Une image JPEG, PNG ou WebP,
          jusqu’à 10 Mo.
        </p>
      </div>

      {error && (
        <div
          className="
            rounded-xl
            border
            border-rose-200
            bg-rose-50
            px-3
            py-2
            text-sm
            text-rose-700
            dark:border-rose-900
            dark:bg-rose-950/30
            dark:text-rose-300
          "
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="
            rounded-xl
            border
            border-emerald-200
            bg-emerald-50
            px-3
            py-2
            text-sm
            text-emerald-700
            dark:border-emerald-900
            dark:bg-emerald-950/30
            dark:text-emerald-300
          "
        >
          {success}
        </div>
      )}

      {previewUrl ? (
        <div
          className="
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-slate-50
            dark:border-slate-700
            dark:bg-slate-900
          "
        >
          <div
            className="
              relative
              aspect-video
              overflow-hidden
              bg-slate-100
              dark:bg-slate-950
            "
          >
            <img
              src={previewUrl}
              alt={
                altText ||
                media
                  ?.originalFilename ||
                'Aperçu du média'
              }
              className="
                h-full
                w-full
                object-cover
              "
            />

            {isBusy && (
              <div
                className="
                  absolute
                  inset-0
                  flex
                  items-center
                  justify-center
                  bg-slate-950/40
                "
              >
                <LoaderCircle
                  size={30}
                  className="
                    animate-spin
                    text-white
                  "
                />
              </div>
            )}
          </div>

          <div
            className="
              space-y-3
              p-4
            "
          >
            {media && (
              <div
                className="
                  flex
                  flex-wrap
                  items-center
                  justify-between
                  gap-2
                  text-xs
                  text-slate-500
                  dark:text-slate-400
                "
              >
                <span
                  className="
                    min-w-0
                    truncate
                  "
                  title={
                    media.originalFilename
                  }
                >
                  {
                    media.originalFilename
                  }
                </span>

                <span>
                  {formatFileSize(
                    media.sizeBytes,
                  )}
                </span>
              </div>
            )}

            <div>
              <label
                htmlFor="media-alt-text"
                className="
                  mb-1.5
                  block
                  text-xs
                  font-medium
                  text-slate-600
                  dark:text-slate-400
                "
              >
                Texte alternatif
              </label>

              <input
                id="media-alt-text"
                type="text"
                maxLength={255}
                value={altText}
                disabled={
                  isArchived ||
                  isBusy
                }
                onChange={(
                  event,
                ) =>
                  setAltText(
                    event.target
                      .value,
                  )
                }
                placeholder="Décrivez brièvement l’image"
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-300
                  bg-transparent
                  px-3
                  py-2.5
                  text-sm
                  text-slate-900
                  outline-none
                  focus:border-indigo-500
                  focus:ring-2
                  focus:ring-indigo-500/20
                  disabled:opacity-60
                  dark:border-slate-600
                  dark:text-white
                "
              />
            </div>

            {!isArchived && (
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
                  disabled={isBusy}
                  onClick={
                    handleAltTextSave
                  }
                  className="
                    inline-flex
                    flex-1
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-slate-300
                    px-3
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
                  {isUpdatingAlt ? (
                    <LoaderCircle
                      size={16}
                      className="
                        animate-spin
                      "
                    />
                  ) : (
                    <Save size={16} />
                  )}

                  Enregistrer le texte
                </button>

                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() =>
                    fileInputRef
                      .current
                      ?.click()
                  }
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-indigo-200
                    px-3
                    py-2.5
                    text-sm
                    font-medium
                    text-indigo-700
                    hover:bg-indigo-50
                    disabled:opacity-50
                    dark:border-indigo-900
                    dark:text-indigo-300
                    dark:hover:bg-indigo-950/30
                  "
                >
                  <ImagePlus
                    size={16}
                  />

                  Remplacer
                </button>

                <button
                  type="button"
                  disabled={isBusy}
                  onClick={
                    handleDelete
                  }
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-rose-200
                    px-3
                    py-2.5
                    text-sm
                    font-medium
                    text-rose-600
                    hover:bg-rose-50
                    disabled:opacity-50
                    dark:border-rose-900
                    dark:text-rose-400
                    dark:hover:bg-rose-950/30
                  "
                >
                  {isDeleting ? (
                    <LoaderCircle
                      size={16}
                      className="
                        animate-spin
                      "
                    />
                  ) : (
                    <Trash2
                      size={16}
                    />
                  )}

                  Supprimer
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={
            isArchived ||
            isBusy
          }
          onClick={() =>
            fileInputRef
              .current
              ?.click()
          }
          onDragEnter={(
            event,
          ) => {
            event.preventDefault();

            if (!isArchived) {
              setIsDragging(
                true,
              );
            }
          }}
          onDragOver={(
            event,
          ) => {
            event.preventDefault();
          }}
          onDragLeave={(
            event,
          ) => {
            event.preventDefault();

            setIsDragging(false);
          }}
          onDrop={handleDrop}
          className={`
            flex
            w-full
            flex-col
            items-center
            justify-center
            gap-3
            rounded-2xl
            border-2
            border-dashed
            px-5
            py-10
            text-center
            transition-colors
            ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20'
                : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-900/50'
            }
            ${
              isArchived ||
              isBusy
                ? 'cursor-not-allowed opacity-60'
                : 'cursor-pointer'
            }
          `}
        >
          {isUploading ||
          isLoading ? (
            <LoaderCircle
              size={32}
              className="
                animate-spin
                text-indigo-600
              "
            />
          ) : (
            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-full
                bg-indigo-50
                text-indigo-600
                dark:bg-indigo-950/40
                dark:text-indigo-400
              "
            >
              <UploadCloud
                size={24}
              />
            </div>
          )}

          <div>
            <p
              className="
                text-sm
                font-semibold
                text-slate-700
                dark:text-slate-200
              "
            >
              {isArchived
                ? 'Aucun média'
                : 'Ajouter une image'}
            </p>

            {!isArchived && (
              <p
                className="
                  mt-1
                  text-xs
                  text-slate-500
                  dark:text-slate-400
                "
              >
                Cliquez ou glissez-déposez
                une image ici
              </p>
            )}
          </div>
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        disabled={
          isArchived ||
          isBusy
        }
        onChange={
          handleFileChange
        }
      />
    </div>
  );
}
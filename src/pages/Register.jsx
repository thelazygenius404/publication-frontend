import {
  useEffect,
  useState,
} from 'react';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

import {
  LoaderCircle,
  Lock,
  Mail,
  Moon,
  Sparkles,
  Sun,
  UserPlus,
} from 'lucide-react';

import useAuth from '../auth/useAuth';

function getErrorMessage(
  error,
) {
  return (
    error.response?.data
      ?.message ||
    error.message ||
    'Impossible de créer le compte.'
  );
}

export default function Register() {
  const navigate =
    useNavigate();

  const {
    register,
  } = useAuth();

  const [
    email,
    setEmail,
  ] = useState('');

  const [
    password,
    setPassword,
  ] = useState('');

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('');

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState('');

  const [
    isDark,
    setIsDark,
  ] = useState(() => {
    const storedTheme =
      localStorage.getItem(
        'autopublisher-theme',
      );

    if (storedTheme) {
      return (
        storedTheme ===
        'dark'
      );
    }

    return window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches;
  });

  useEffect(() => {
    document.documentElement
      .classList
      .toggle(
        'dark',
        isDark,
      );

    localStorage.setItem(
      'autopublisher-theme',
      isDark
        ? 'dark'
        : 'light',
    );
  }, [isDark]);

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError('');

      if (
        password !==
        confirmPassword
      ) {
        setError(
          'Les mots de passe ne correspondent pas.',
        );

        return;
      }

      if (
        password.length < 8
      ) {
        setError(
          'Le mot de passe doit contenir au moins 8 caractères.',
        );

        return;
      }

      setIsLoading(true);

      try {
        await register(
          email.trim(),
          password,
        );

        navigate(
          '/',
          {
            replace: true,
          },
        );
      } catch (exception) {
        setError(
          getErrorMessage(
            exception,
          ),
        );
      } finally {
        setIsLoading(
          false,
        );
      }
    };

  return (
    <div
      className="
        relative
        flex
        min-h-screen
        items-center
        justify-center
        bg-gray-50
        p-4
        transition-colors
        dark:bg-gray-900
      "
    >
      <button
        type="button"
        onClick={() =>
          setIsDark(
            (value) =>
              !value,
          )
        }
        aria-label="Changer de thème"
        className="
          absolute
          right-6
          top-6
          rounded-full
          bg-gray-200
          p-2.5
          text-gray-600
          shadow-sm
          transition-colors
          hover:bg-gray-300
          dark:bg-gray-800
          dark:text-gray-300
          dark:hover:bg-gray-700
        "
      >
        {isDark ? (
          <Sun size={20} />
        ) : (
          <Moon size={20} />
        )}
      </button>

      <div
        className="
          w-full
          max-w-md
          rounded-2xl
          border
          border-gray-200
          bg-white
          p-6
          shadow-lg
          dark:border-gray-700
          dark:bg-gray-800
          sm:p-8
        "
      >
        <div
          className="
            mb-8
            text-center
          "
        >
          <div
            className="
              mb-4
              inline-flex
              h-12
              w-12
              items-center
              justify-center
              rounded-full
              bg-blue-100
              text-blue-600
              dark:bg-blue-900/30
              dark:text-blue-400
            "
          >
            <Sparkles
              size={24}
            />
          </div>

          <h1
            className="
              text-2xl
              font-bold
              text-gray-900
              dark:text-white
            "
          >
            Créer un compte
          </h1>

          <p
            className="
              mt-2
              text-sm
              text-gray-600
              dark:text-gray-400
            "
          >
            Commencez à gérer
            vos publications
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="
              mb-5
              rounded-lg
              border
              border-red-200
              bg-red-50
              px-4
              py-3
              text-sm
              text-red-700
              dark:border-red-900
              dark:bg-red-950/40
              dark:text-red-300
            "
          >
            {error}
          </div>
        )}

        <form
          onSubmit={
            handleSubmit
          }
          className="
            space-y-5
          "
        >
          <AuthInput
            id="email"
            label="Adresse email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={
              setEmail
            }
            icon={Mail}
            disabled={
              isLoading
            }
          />

          <AuthInput
            id="password"
            label="Mot de passe"
            type="password"
            autoComplete="new-password"
            value={
              password
            }
            onChange={
              setPassword
            }
            icon={Lock}
            minLength={8}
            maxLength={72}
            disabled={
              isLoading
            }
          />

          <AuthInput
            id="confirmPassword"
            label="Confirmer le mot de passe"
            type="password"
            autoComplete="new-password"
            value={
              confirmPassword
            }
            onChange={
              setConfirmPassword
            }
            icon={Lock}
            minLength={8}
            maxLength={72}
            disabled={
              isLoading
            }
          />

          <button
            type="submit"
            disabled={
              isLoading
            }
            className="
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-lg
              bg-blue-600
              px-6
              py-2.5
              font-medium
              text-white
              transition-colors
              hover:bg-blue-700
              disabled:bg-blue-400
            "
          >
            {isLoading ? (
              <LoaderCircle
                size={18}
                className="
                  animate-spin
                "
              />
            ) : (
              <UserPlus
                size={18}
              />
            )}

            {isLoading
              ? 'Création...'
              : 'Créer le compte'}
          </button>
        </form>

        <p
          className="
            mt-6
            text-center
            text-sm
            text-gray-600
            dark:text-gray-400
          "
        >
          Déjà inscrit ?{' '}

          <Link
            to="/login"
            className="
              font-medium
              text-blue-600
              hover:underline
              dark:text-blue-400
            "
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}

function AuthInput({
  id,
  label,
  type,
  autoComplete,
  value,
  onChange,
  icon: Icon,
  disabled,
  minLength,
  maxLength,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="
          mb-2
          block
          text-sm
          font-medium
          text-gray-700
          dark:text-gray-300
        "
      >
        {label}
      </label>

      <div
        className="
          relative
        "
      >
        <Icon
          size={18}
          className="
            absolute
            left-3
            top-1/2
            -translate-y-1/2
            text-gray-400
          "
        />

        <input
          id={id}
          type={type}
          autoComplete={
            autoComplete
          }
          value={value}
          onChange={(
            event,
          ) =>
            onChange(
              event.target.value,
            )
          }
          required
          minLength={
            minLength
          }
          maxLength={
            maxLength
          }
          disabled={
            disabled
          }
          className="
            w-full
            rounded-lg
            border
            border-gray-300
            bg-transparent
            py-2.5
            pl-10
            pr-4
            outline-none
            focus:border-blue-500
            focus:ring-2
            focus:ring-blue-500
            disabled:opacity-60
            dark:border-gray-600
            dark:text-white
          "
        />
      </div>
    </div>
  );
}
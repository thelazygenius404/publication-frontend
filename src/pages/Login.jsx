import {
  useEffect,
  useState,
} from 'react';

import {
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import {
  LoaderCircle,
  Lock,
  LogIn,
  Mail,
  Moon,
  Sparkles,
  Sun,
} from 'lucide-react';

import useAuth from '../auth/useAuth';

function getErrorMessage(
  error,
) {
  return (
    error.response?.data
      ?.message ||
    error.message ||
    'Impossible de se connecter.'
  );
}

export default function Login() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const {
    login,
  } = useAuth();

  const [email, setEmail] =
    useState('');

  const [
    password,
    setPassword,
  ] = useState('');

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const [error, setError] =
    useState('');

  const [isDark, setIsDark] =
    useState(
      document.documentElement
        .classList.contains(
          'dark',
        ),
    );

  useEffect(() => {
    document.documentElement
      .classList.toggle(
        'dark',
        isDark,
      );
  }, [isDark]);

  const handleLogin =
    async (event) => {
      event.preventDefault();

      setError('');
      setIsLoading(true);

      try {
        await login(
          email.trim(),
          password,
        );

        const destination =
          location.state?.from
            ?.pathname || '/';

        navigate(
          destination,
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
        setIsLoading(false);
      }
    };

  return (
    <div className="
      min-h-screen
      flex
      items-center
      justify-center
      bg-gray-50
      dark:bg-gray-900
      transition-colors
      p-4
      relative
    ">
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
          top-6
          right-6
          p-2.5
          rounded-full
          bg-gray-200
          dark:bg-gray-800
          text-gray-600
          dark:text-gray-300
          hover:bg-gray-300
          dark:hover:bg-gray-700
          transition-colors
          shadow-sm
        "
      >
        {isDark ? (
          <Sun size={20} />
        ) : (
          <Moon size={20} />
        )}
      </button>

      <div className="
        max-w-md
        w-full
        bg-white
        dark:bg-gray-800
        rounded-2xl
        shadow-lg
        border
        border-gray-200
        dark:border-gray-700
        p-8
      ">
        <div className="
          text-center
          mb-8
        ">
          <div className="
            inline-flex
            items-center
            justify-center
            w-12
            h-12
            rounded-full
            bg-blue-100
            dark:bg-blue-900/30
            text-blue-600
            dark:text-blue-400
            mb-4
          ">
            <Sparkles
              size={24}
            />
          </div>

          <h1 className="
            text-2xl
            font-bold
            text-gray-900
            dark:text-white
          ">
            AutoPublisher
          </h1>

          <p className="
            text-sm
            text-gray-600
            dark:text-gray-400
            mt-2
          ">
            Connectez-vous pour
            gérer vos publications
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
              dark:border-red-900
              bg-red-50
              dark:bg-red-950/40
              px-4
              py-3
              text-sm
              text-red-700
              dark:text-red-300
            "
          >
            {error}
          </div>
        )}

        <form
          onSubmit={
            handleLogin
          }
          className="
            space-y-6
          "
        >
          <div>
            <label
              htmlFor="email"
              className="
                block
                text-sm
                font-medium
                text-gray-700
                dark:text-gray-300
                mb-2
              "
            >
              Adresse email
            </label>

            <div className="relative">
              <Mail
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
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(
                  event,
                ) =>
                  setEmail(
                    event.target
                      .value,
                  )
                }
                required
                disabled={
                  isLoading
                }
                className="
                  w-full
                  pl-10
                  pr-4
                  py-2.5
                  bg-transparent
                  border
                  border-gray-300
                  dark:border-gray-600
                  rounded-lg
                  focus:ring-2
                  focus:ring-blue-500
                  focus:border-blue-500
                  outline-none
                  dark:text-white
                  disabled:opacity-60
                "
                placeholder="vous@example.com"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="
                block
                text-sm
                font-medium
                text-gray-700
                dark:text-gray-300
                mb-2
              "
            >
              Mot de passe
            </label>

            <div className="relative">
              <Lock
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
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(
                  event,
                ) =>
                  setPassword(
                    event.target
                      .value,
                  )
                }
                required
                disabled={
                  isLoading
                }
                className="
                  w-full
                  pl-10
                  pr-4
                  py-2.5
                  bg-transparent
                  border
                  border-gray-300
                  dark:border-gray-600
                  rounded-lg
                  focus:ring-2
                  focus:ring-blue-500
                  focus:border-blue-500
                  outline-none
                  dark:text-white
                  disabled:opacity-60
                "
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={
              isLoading
            }
            className="
              w-full
              flex
              items-center
              justify-center
              gap-2
              bg-blue-600
              hover:bg-blue-700
              disabled:bg-blue-400
              text-white
              px-6
              py-2.5
              rounded-lg
              font-medium
              transition-colors
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
              <LogIn
                size={18}
              />
            )}

            {isLoading
              ? 'Connexion...'
              : 'Se connecter'}
          </button>
        </form>

        <p className="
          mt-6
          text-center
          text-sm
          text-gray-600
          dark:text-gray-400
        ">
          Pas encore de compte ?{' '}
          <Link
            to="/register"
            className="
              font-medium
              text-blue-600
              dark:text-blue-400
              hover:underline
            "
          >
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
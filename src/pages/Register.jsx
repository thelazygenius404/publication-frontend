import {
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
  Sparkles,
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

  const [email, setEmail] =
    useState('');

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

  const [error, setError] =
    useState('');

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
      p-4
    ">
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
            Créer un compte
          </h1>

          <p className="
            text-sm
            text-gray-600
            dark:text-gray-400
            mt-2
          ">
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
            value={password}
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
              <UserPlus
                size={18}
              />
            )}

            {isLoading
              ? 'Création...'
              : 'Créer le compte'}
          </button>
        </form>

        <p className="
          mt-6
          text-center
          text-sm
          text-gray-600
          dark:text-gray-400
        ">
          Déjà inscrit ?{' '}
          <Link
            to="/login"
            className="
              font-medium
              text-blue-600
              dark:text-blue-400
              hover:underline
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
          block
          text-sm
          font-medium
          text-gray-700
          dark:text-gray-300
          mb-2
        "
      >
        {label}
      </label>

      <div className="relative">
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
  );
}
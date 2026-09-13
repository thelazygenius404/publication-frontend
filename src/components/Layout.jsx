import {
  useEffect,
  useState,
} from 'react';

import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import {
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  PenTool,
  Settings,
  Sun,
  X,
} from 'lucide-react';

import useAuth from '../auth/useAuth';

const MENU = [
  {
    name: 'Tableau de bord',
    icon: LayoutDashboard,
    path: '/',
  },
  {
    name: 'Nouvelle Publication',
    icon: PenTool,
    path: '/editor',
  },
  {
    name: 'Paramètres',
    icon: Settings,
    path: '/settings',
  },
];

export default function Layout() {
  const location =
    useLocation();

  const navigate =
    useNavigate();

  const {
    logout,
  } = useAuth();

  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);

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
        storedTheme === 'dark'
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

  useEffect(() => {
    if (!mobileMenuOpen) {
      return undefined;
    }

    const handleKeyDown =
      (event) => {
        if (
          event.key ===
          'Escape'
        ) {
          setMobileMenuOpen(
            false,
          );
        }
      };

    window.addEventListener(
      'keydown',
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown,
      );
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    setMobileMenuOpen(false);

    logout();

    navigate(
      '/login',
      {
        replace: true,
      },
    );
  };

  const handleToggleTheme = () => {
    setIsDark(
      (current) =>
        !current,
    );
  };

  return (
    <div
      className="
        min-h-screen
        bg-gray-100
        text-gray-900
        transition-colors
        duration-200
        dark:bg-gray-900
        dark:text-gray-100
      "
    >
      {/* Desktop sidebar */}
      <aside
        className="
          fixed
          inset-y-0
          left-0
          z-30
          hidden
          w-64
          flex-col
          border-r
          border-gray-200
          bg-white
          shadow-sm
          dark:border-gray-700
          dark:bg-gray-800
          lg:flex
        "
      >
        <SidebarContent
          pathname={
            location.pathname
          }
          isDark={isDark}
          onToggleTheme={
            handleToggleTheme
          }
          onLogout={
            handleLogout
          }
        />
      </aside>

      {/* Mobile header */}
      <header
        className="
          fixed
          inset-x-0
          top-0
          z-40
          flex
          h-16
          items-center
          justify-between
          border-b
          border-gray-200
          bg-white/95
          px-4
          backdrop-blur
          dark:border-gray-700
          dark:bg-gray-800/95
          lg:hidden
        "
      >
        <h1
          className="
            text-lg
            font-bold
            text-blue-600
            dark:text-blue-400
          "
        >
          AutoPublisher
        </h1>

        <button
          type="button"
          onClick={() =>
            setMobileMenuOpen(
              true,
            )
          }
          aria-label="Ouvrir le menu"
          aria-expanded={
            mobileMenuOpen
          }
          className="
            inline-flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            border
            border-gray-200
            text-gray-700
            transition-colors
            hover:bg-gray-100
            dark:border-gray-700
            dark:text-gray-200
            dark:hover:bg-gray-700
          "
        >
          <Menu size={21} />
        </button>
      </header>

      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Fermer le menu"
          onClick={() =>
            setMobileMenuOpen(
              false,
            )
          }
          className="
            fixed
            inset-0
            z-40
            bg-slate-950/50
            backdrop-blur-sm
            lg:hidden
          "
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-50
          flex
          w-[min(18rem,85vw)]
          flex-col
          border-r
          border-gray-200
          bg-white
          shadow-2xl
          transition-transform
          duration-200
          dark:border-gray-700
          dark:bg-gray-800
          lg:hidden
          ${
            mobileMenuOpen
              ? 'translate-x-0'
              : '-translate-x-full'
          }
        `}
      >
        <div
          className="
            flex
            h-16
            items-center
            justify-between
            border-b
            border-gray-200
            px-5
            dark:border-gray-700
          "
        >
          <h1
            className="
              text-lg
              font-bold
              text-blue-600
              dark:text-blue-400
            "
          >
            AutoPublisher
          </h1>

          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen(
                false,
              )
            }
            aria-label="Fermer le menu"
            className="
              inline-flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              text-gray-600
              transition-colors
              hover:bg-gray-100
              dark:text-gray-300
              dark:hover:bg-gray-700
            "
          >
            <X size={20} />
          </button>
        </div>

        <SidebarContent
          pathname={
            location.pathname
          }
          isDark={isDark}
          onNavigate={() =>
            setMobileMenuOpen(
              false,
            )
          }
          onToggleTheme={
            handleToggleTheme
          }
          onLogout={
            handleLogout
          }
        />
      </aside>

      {/* Page content */}
      <main
        className="
          min-w-0
          overflow-x-hidden
          pt-16
          lg:pl-64
          lg:pt-0
        "
      >
        <div
          className="
            mx-auto
            w-full
            p-4
            sm:p-6
            lg:p-8
          "
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function SidebarContent({
  pathname,
  isDark,
  onNavigate,
  onToggleTheme,
  onLogout,
}) {
  return (
    <>
      <div
        className="
          hidden
          p-6
          lg:block
        "
      >
        <h1
          className="
            text-xl
            font-bold
            text-blue-600
            dark:text-blue-400
          "
        >
          AutoPublisher
        </h1>
      </div>

      <nav
        className="
          flex-1
          space-y-2
          overflow-y-auto
          px-4
          py-4
          lg:py-0
        "
      >
        {MENU.map(
          (item) => {
            const Icon =
              item.icon;

            const isActive =
              pathname ===
              item.path;

            return (
              <Link
                key={
                  item.name
                }
                to={
                  item.path
                }
                onClick={
                  onNavigate
                }
                className={`
                  flex
                  items-center
                  gap-3
                  rounded-lg
                  px-4
                  py-3
                  transition-colors
                  ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                      : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                  }
                `}
              >
                <Icon
                  size={20}
                  className="
                    shrink-0
                  "
                />

                <span
                  className="
                    font-medium
                  "
                >
                  {item.name}
                </span>
              </Link>
            );
          },
        )}
      </nav>

      <div
        className="
          space-y-2
          border-t
          border-gray-200
          p-4
          dark:border-gray-700
        "
      >
        <button
          type="button"
          onClick={
            onToggleTheme
          }
          className="
            flex
            w-full
            items-center
            gap-3
            rounded-lg
            px-4
            py-2.5
            text-gray-600
            transition-colors
            hover:bg-gray-50
            hover:text-blue-600
            dark:text-gray-300
            dark:hover:bg-gray-700
            dark:hover:text-blue-400
          "
        >
          {isDark ? (
            <Sun size={20} />
          ) : (
            <Moon size={20} />
          )}

          <span
            className="
              font-medium
            "
          >
            {isDark
              ? 'Mode Clair'
              : 'Mode Sombre'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            onLogout();
          }}
          className="
            flex
            w-full
            items-center
            gap-3
            rounded-lg
            px-4
            py-2.5
            text-gray-600
            transition-colors
            hover:bg-rose-50
            hover:text-red-600
            dark:text-gray-300
            dark:hover:bg-rose-950/30
            dark:hover:text-red-400
          "
        >
          <LogOut
            size={20}
          />

          <span
            className="
              font-medium
            "
          >
            Déconnexion
          </span>
        </button>
      </div>
    </>
  );
}
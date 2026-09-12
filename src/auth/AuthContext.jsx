import {
  useCallback,
  useMemo,
  useState,
} from 'react';

import api, {
  TOKEN_KEY,
} from '../api/api';

import AuthContext from './authContext';

export function AuthProvider({
  children,
}) {
  const [token, setToken] =
    useState(() =>
      localStorage.getItem(
        TOKEN_KEY,
      ),
    );

  const storeToken =
    useCallback(
      (accessToken) => {
        localStorage.setItem(
          TOKEN_KEY,
          accessToken,
        );

        setToken(accessToken);
      },
      [],
    );

  const login =
    useCallback(
      async (
        email,
        password,
      ) => {
        const response =
          await api.post(
            '/auth/login',
            {
              email,
              password,
            },
          );

        const accessToken =
          response.data
            ?.access_token;

        if (!accessToken) {
          throw new Error(
            'Le serveur n’a retourné aucun jeton d’accès.',
          );
        }

        storeToken(
          accessToken,
        );
      },
      [storeToken],
    );

  const register =
    useCallback(
      async (
        email,
        password,
      ) => {
        const response =
          await api.post(
            '/auth/register',
            {
              email,
              password,
            },
          );

        const accessToken =
          response.data
            ?.access_token;

        if (!accessToken) {
          throw new Error(
            'Le serveur n’a retourné aucun jeton d’accès.',
          );
        }

        storeToken(
          accessToken,
        );
      },
      [storeToken],
    );

  const logout =
    useCallback(() => {
      localStorage.removeItem(
        TOKEN_KEY,
      );

      setToken(null);
    }, []);

  const value =
    useMemo(
      () => ({
        token,
        isAuthenticated:
          Boolean(token),
        login,
        register,
        logout,
      }),
      [
        token,
        login,
        register,
        logout,
      ],
    );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}
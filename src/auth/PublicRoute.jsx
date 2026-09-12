import {
  Navigate,
} from 'react-router-dom';

import useAuth from './useAuth';

export default function PublicRoute({
  children,
}) {
  const {
    isAuthenticated,
  } = useAuth();

  if (isAuthenticated) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
}
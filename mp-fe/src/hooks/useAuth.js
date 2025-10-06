import { useSelector, useDispatch } from "react-redux";
import { useCallback } from "react";
import {
  loginUser,
  signupUser,
  logout,
  clearError,
  selectUser,
  selectToken,
  selectAuthLoading,
  selectAuthError,
  selectIsAuthenticated,
} from "../store/slices/authSlice";

/**
 * Custom hook for authentication functionality
 * Provides authentication state and actions
 */
const useAuth = () => {
  const dispatch = useDispatch();

  // Selectors
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Actions
  const login = useCallback(
    async (credentials) => {
      const result = await dispatch(loginUser(credentials));
      if (loginUser.fulfilled.match(result)) {
        return { success: true, user: result.payload.user };
      } else {
        return { success: false, error: result.payload };
      }
    },
    [dispatch]
  );

  const signup = useCallback(
    async (userData) => {
      const result = await dispatch(signupUser(userData));
      if (signupUser.fulfilled.match(result)) {
        return { success: true, user: result.payload.user };
      } else {
        return { success: false, error: result.payload };
      }
    },
    [dispatch]
  );

  const signOut = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Helper functions
  const hasRole = useCallback(
    (role) => {
      return user?.role === role;
    },
    [user]
  );

  const hasAnyRole = useCallback(
    (roles) => {
      return roles.includes(user?.role);
    },
    [user]
  );

  const getAuthHeader = useCallback(() => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  return {
    // State
    user,
    token,
    loading,
    error,
    isAuthenticated,

    // Actions
    login,
    signup,
    logout: signOut,
    clearError: clearAuthError,

    // Helpers
    hasRole,
    hasAnyRole,
    getAuthHeader,
  };
};

export default useAuth;

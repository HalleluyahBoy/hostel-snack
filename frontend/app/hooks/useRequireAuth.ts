'use client'; // Though hooks are client-side by default in Next.js app router, good for clarity

import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext'; // Adjust path as necessary
import { useRouter } from 'next/navigation';

/**
 * Custom hook to protect routes that require authentication.
 * If the user is not authenticated after the auth state has loaded,
 * they will be redirected to the specified path (defaulting to '/login').
 *
 * @param redirectTo The path to redirect to if the user is not authenticated. Defaults to '/login'.
 */
const useRequireAuth = (redirectTo = '/login') => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only proceed if auth state is resolved (not loading)
    if (!isLoading) {
      // If there is no user, redirect
      if (!user) {
        router.replace(redirectTo);
      }
    }
  }, [user, isLoading, router, redirectTo]); // Dependencies for the effect

  // Optionally, you could return the user and isLoading state if the component using the hook needs them,
  // but often the component will also call useAuth() directly if it needs to display user data.
  // For now, this hook's primary job is the redirect side-effect.
  return { user, isLoading }; // Returning these can be helpful to avoid calling useAuth again
};

export default useRequireAuth;

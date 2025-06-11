'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // Adjusted path
import apiClient from '../../lib/axiosConfig'; // Adjusted path
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState<string | null>(null); // Simplified error state for login
  const [isLoading, setIsLoading] = useState(false);

  const auth = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (auth.user && !auth.isLoading) {
      router.push('/'); // Redirect to homepage or dashboard
    }
  }, [auth.user, auth.isLoading, router]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!username || !password) {
        setError('Username and password are required.');
        setIsLoading(false);
        return;
    }

    try {
      const response = await apiClient.post('/auth/login/', {
        username,
        password,
      });

      // The task specifies user_id, email, username in response.data for login
      // AuthContext's login function expects (token: string, userData: User)
      // The User type in AuthContext has id, username, email.
      if (response.data.token && response.data.user_id && response.data.email && response.data.username) {
        const userData = {
          id: response.data.user_id,
          email: response.data.email,
          username: response.data.username,
          // Add any other fields that your User type in AuthContext expects
          // and that your login API provides (even if not explicitly listed in task)
        };
        auth.login(response.data.token, userData);
        router.push('/'); // Redirect to homepage or a protected route like /dashboard
      } else {
        setError('Login successful, but user data was incomplete. Please try again.');
      }
    } catch (err: any) {
      if (err.response && err.response.data) {
        // Common error key for Django Rest Framework Simple JWT
        setError(err.response.data.detail || err.response.data.non_field_errors?.join(' ') || 'Invalid credentials or server error.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // If still loading auth state or user is already logged in, show minimal UI or null
  if (auth.isLoading || auth.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              {/* <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                Forgot your password?
              </a> */}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
        <div className="text-sm text-center">
          <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            Don't have an account? Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

'use client';

import { useAuth } from '../../contexts/AuthContext'; // Adjusted path
import useRequireAuth from '../../hooks/useRequireAuth'; // Adjusted path

const ProfilePage = () => {
  // Apply the authentication check.
  // useRequireAuth will handle redirection if not authenticated.
  // It also returns user and isLoading, which can be used directly.
  const { user, isLoading: isAuthLoading } = useRequireAuth();

  // We can also get user and isLoading from useAuth if preferred,
  // but useRequireAuth already provides them.
  // const { user: authUser, isLoading: authIsLoading } = useAuth();

  // Display loading message while authentication status is being determined
  // or if useRequireAuth is still processing.
  if (isAuthLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg">Loading profile...</p>
      </div>
    );
  }

  // If after loading, there's no user, it means useRequireAuth should have redirected.
  // However, as a fallback or if there's a slight delay in redirection,
  // we can prevent rendering content for a non-user.
  if (!user) {
    // This content ideally should not be seen if useRequireAuth works correctly,
    // as redirection should occur.
    return (
        <div className="flex justify-center items-center min-h-screen">
            <p className="text-lg">Redirecting to login...</p>
        </div>
    );
  }

  // If user is authenticated, display the profile page content
  return (
    <div className="container mx-auto p-4 pt-10">
      <h1 className="text-3xl font-bold mb-6">User Profile</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <p className="text-xl mb-2">
          Welcome, <span className="font-semibold">{user.username}</span>!
        </p>
        <p className="text-gray-700">
          Email: {user.email}
        </p>
        {/* Add more user details here as they become available in your User object */}
        {/* For example:
        {user.firstName && user.lastName && (
          <p className="text-gray-700">
            Name: {user.firstName} {user.lastName}
          </p>
        )}
        */}
        <p className="mt-4 text-gray-600">
          This is your profile page. More features will be added soon.
        </p>
      </div>
    </div>
  );
};

export default ProfilePage;

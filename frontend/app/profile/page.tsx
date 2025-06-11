'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // For authUser details
import useRequireAuth from '../../hooks/useRequireAuth'; // For route protection
import apiClient from '../../lib/axiosConfig';
// import { useRouter } from 'next/navigation'; // Optional: for refresh or redirect

interface ProfileFormData {
  address: string;
  phone_number: string;
  city: string;
  country: string;
  postal_code: string;
  // Add other fields if your API supports them, e.g., first_name, last_name
  // first_name: string;
  // last_name: string;
}

const ProfilePage = () => {
  // useRequireAuth handles redirection if not authenticated.
  // It returns authUser (user from AuthContext) and authIsLoading (isLoading from AuthContext)
  const { user: authUser, isLoading: authIsLoading } = useRequireAuth();
  // const router = useRouter(); // If needed for manual refresh/redirect

  const initialFormState: ProfileFormData = {
    address: '',
    phone_number: '',
    city: '',
    country: '',
    postal_code: '',
    // first_name: authUser?.firstName || '', // Example if you also manage these here
    // last_name: authUser?.lastName || '',
  };

  const [profileData, setProfileData] = useState<ProfileFormData>(initialFormState);
  const [initialProfileData, setInitialProfileData] = useState<ProfileFormData>(initialFormState); // To compare for changes

  const [isLoadingData, setIsLoadingData] = useState(true); // For fetching profile
  const [isUpdating, setIsUpdating] = useState(false); // For update submission
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch profile data when authUser is available
  useEffect(() => {
    if (authUser) {
      setIsLoadingData(true);
      setError(null);
      apiClient.get('/profile/')
        .then(response => {
          const fetchedData = {
            address: response.data.address || '',
            phone_number: response.data.phone_number || '',
            city: response.data.city || '',
            country: response.data.country || '',
            postal_code: response.data.postal_code || '',
            // first_name: response.data.first_name || authUser.firstName || '',
            // last_name: response.data.last_name || authUser.lastName || '',
          };
          setProfileData(fetchedData);
          setInitialProfileData(fetchedData); // Store initially fetched data
        })
        .catch(err => {
          console.error("Error fetching profile:", err);
          if (err.response?.status === 404) {
            setError("Profile not found. You can create one by filling out the form.");
            // Initialize form for creation if 404
            setProfileData(initialFormState);
            setInitialProfileData(initialFormState);
          } else {
            setError(err.message || "Failed to load profile data.");
          }
        })
        .finally(() => setIsLoadingData(false));
    } else if (!authIsLoading) {
      // If auth is loaded and no user, useRequireAuth should redirect.
      // If it doesn't for some reason, or if we want to clear data explicitly on logout:
      setProfileData(initialFormState);
      setInitialProfileData(initialFormState);
      setIsLoadingData(false);
    }
  }, [authUser, authIsLoading]); // Dependency on authUser

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setError(null);
    setSuccessMessage(null);

    // Simple validation
    if (!profileData.address || !profileData.phone_number) {
        setError("Address and Phone Number are required fields.");
        setIsUpdating(false);
        return;
    }

    // Construct payload - only send changed fields or all fields as per API design
    // For simplicity here, sending all fields from the form.
    // A more advanced version might compare profileData with initialProfileData.
    const payload = { ...profileData };

    try {
      // API might use PUT for update, or POST if it handles create/update via same endpoint
      const response = await apiClient.put('/profile/', payload);
      setSuccessMessage("Profile updated successfully!");
      setInitialProfileData(profileData); // Update initial data to current after successful save
      // Optionally, update AuthContext if user details (like name) changed and are stored there
      // This would require a method in AuthContext: auth.updateUser({ ...authUser, ...payload });
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.detail || err.message || "Failed to update profile.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Display loading message while authentication status or initial data is being determined
  if (authIsLoading || isLoadingData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-gray-700">Loading profile...</p>
      </div>
    );
  }

  // If after loading, there's no user, useRequireAuth should have redirected.
  // This is a fallback.
  if (!authUser) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-gray-700">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-2xl">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8 text-center">User Profile</h1>

      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg">
        <div className="mb-6 pb-4 border-b">
            <p className="text-lg"><span className="font-semibold">Username:</span> {authUser.username}</p>
            <p className="text-lg"><span className="font-semibold">Email:</span> {authUser.email}</p>
            {/* Display first/last name from authUser if available and not part of the editable form */}
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
        {successMessage && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">{successMessage}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Example: if first_name and last_name are part of profile
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input type="text" name="first_name" id="first_name" value={profileData.first_name} onChange={handleChange}
                     className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input type="text" name="last_name" id="last_name" value={profileData.last_name} onChange={handleChange}
                     className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
          </div>
          */}

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address <span className="text-red-500">*</span></label>
            <textarea name="address" id="address" rows={3} value={profileData.address} onChange={handleChange} required
                      className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
          </div>

          <div>
            <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
            <input type="tel" name="phone_number" id="phone_number" value={profileData.phone_number} onChange={handleChange} required
                   className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g., +1234567890"/>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input type="text" name="city" id="city" value={profileData.city} onChange={handleChange}
                     className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
            <div>
              <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
              <input type="text" name="postal_code" id="postal_code" value={profileData.postal_code} onChange={handleChange}
                     className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
          </div>

          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <input type="text" name="country" id="country" value={profileData.country} onChange={handleChange}
                   className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
          </div>

          <div>
            <button
              type="submit"
              disabled={isUpdating}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isUpdating ? 'Updating Profile...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;

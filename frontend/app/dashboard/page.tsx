'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // For authUser details if needed beyond what useRequireAuth provides
import useRequireAuth from '../../hooks/useRequireAuth'; // For route protection
import apiClient from '../../lib/axiosConfig';
import Link from 'next/link'; // For linking to relevant sections

interface DashboardStats {
  total_products: number | null;
  total_categories: number | null;
  cart_items_count: number | null;     // Updated to match typical API naming for counts
  wishlist_items_count: number | null; // Updated to match typical API naming for counts
  total_orders_count: number | null;   // Updated to match typical API naming for counts
}

const DashboardPage = () => {
  const { user: authUser, isLoading: authIsLoading } = useRequireAuth();

  const initialStats: DashboardStats = {
    total_products: null,
    total_categories: null,
    cart_items_count: null,
    wishlist_items_count: null,
    total_orders_count: null,
  };

  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authUser) { // Ensure user is authenticated before fetching
      setIsLoadingStats(true);
      setError(null);
      apiClient.get<DashboardStats>('/dashboard/stats/')
        .then(response => {
          // Ensure all expected fields are present or default them
          setStats({
            total_products: response.data.total_products ?? 0,
            total_categories: response.data.total_categories ?? 0,
            cart_items_count: response.data.cart_items_count ?? 0,
            wishlist_items_count: response.data.wishlist_items_count ?? 0,
            total_orders_count: response.data.total_orders_count ?? 0,
          });
        })
        .catch(err => {
          console.error("Error fetching dashboard stats:", err);
          setError(err.message || "Failed to load dashboard statistics.");
          setStats(initialStats); // Reset to initial/empty stats on error
        })
        .finally(() => setIsLoadingStats(false));
    } else if (!authIsLoading) {
      // If auth has loaded and there's no user, useRequireAuth should handle redirection.
      // If not, or to be explicit:
      setIsLoadingStats(false); // Not loading stats if no user
      setError("You need to be logged in to view the dashboard."); // Or rely on useRequireAuth
    }
  }, [authUser, authIsLoading]); // Rerun if authUser changes

  if (authIsLoading || isLoadingStats) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <p className="text-lg text-gray-700">Loading dashboard...</p>
      </div>
    );
  }

  // useRequireAuth handles redirection, but this is a fallback UI.
  if (!authUser) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <p className="text-lg text-gray-700">Please login to view the dashboard.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 text-center">
        <p className="text-lg text-red-600">Error: {error}</p>
      </div>
    );
  }

  // Individual Stat Card Component (optional, for better structure)
  const StatCard = ({ title, value, linkTo, linkText }: { title: string; value: number | string | null; linkTo?: string; linkText?: string }) => (
    <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
      <h3 className="text-lg font-semibold text-gray-600 mb-2">{title}</h3>
      <p className="text-3xl font-bold text-indigo-600 mb-3">
        {value !== null ? value : <span className="text-gray-400 text-2xl">N/A</span>}
      </p>
      {linkTo && linkText && (
        <Link href={linkTo} legacyBehavior>
          <a className="text-sm text-indigo-500 hover:text-indigo-700 font-medium transition-colors">
            {linkText} &rarr;
          </a>
        </Link>
      )}
    </div>
  );

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8 text-center">
        Welcome to your Dashboard, {authUser.username}!
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Products in Store"
          value={stats.total_products}
        />
        <StatCard
          title="Total Categories Available"
          value={stats.total_categories}
        />
        <StatCard
          title="Items in Your Cart"
          value={stats.cart_items_count}
          linkTo="/cart"
          linkText="View Cart"
        />
        <StatCard
          title="Items in Your Wishlist"
          value={stats.wishlist_items_count}
          linkTo="/wishlist"
          linkText="View Wishlist"
        />
        <StatCard
          title="Your Total Orders"
          value={stats.total_orders_count}
          linkTo="/orders"
          linkText="View Orders"
        />
        {/* You can add more StatCards here as needed */}
         <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 md:col-span-1 lg:col-span-1">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Manage Profile</h3>
            <p className="text-gray-700 mb-3">Keep your personal information up to date.</p>
            <Link href="/profile" legacyBehavior>
                <a className="text-sm text-indigo-500 hover:text-indigo-700 font-medium transition-colors">
                Go to Profile &rarr;
                </a>
            </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../../lib/axiosConfig';
import useRequireAuth from '../../hooks/useRequireAuth';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation'; // For pagination query params

// Define interfaces for Order and Pagination
interface Order {
  id: number; // Or string
  created_at: string; // ISO date string
  status: string;
  total_amount: string; // e.g., "123.45"
  // Add other fields your API provides for an order summary
}

interface PaginatedOrdersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Order[];
}

// Helper component to use Suspense for useSearchParams
const OrdersPageContent = () => {
  const { user, isLoading: authIsLoading } = useRequireAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const [prevPageUrl, setPrevPageUrl] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const baseOrdersUrl = '/orders/';

  const fetchOrders = useCallback(async (url: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<PaginatedOrdersResponse>(url);
      setOrders(response.data.results);
      setNextPageUrl(response.data.next);
      setPrevPageUrl(response.data.previous);
      setCount(response.data.count);

      const urlParams = new URLSearchParams(url.split('?')[1]);
      setCurrentPage(parseInt(urlParams.get('page') || '1'));
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      setError(err.message || 'Failed to fetch orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authIsLoading && user) { // Only fetch if user is loaded and authenticated
      const page = searchParams.get('page') || '1';
      fetchOrders(`${baseOrdersUrl}?page=${page}`);
    } else if (!authIsLoading && !user) {
        // This case should ideally be handled by useRequireAuth redirecting.
        // If not, we might want to set an error or show a message.
        setLoading(false);
        setError("You must be logged in to view orders.");
    }
  }, [authIsLoading, user, searchParams, fetchOrders]);

  const handlePageChange = (newPageUrl: string | null) => {
    if (newPageUrl) {
      const queryString = newPageUrl.split('?')[1] || '';
      router.push(`${baseOrdersUrl}?${queryString}`);
    }
  };

  // Calculate total pages - assuming a fixed items per page or get from API if available
  // For simplicity, if API doesn't give items_per_page, use length of current results.
  const itemsPerPage = orders.length > 0 ? orders.length : 10; // Estimate
  const totalPages = Math.ceil(count / itemsPerPage);

  if (authIsLoading || (loading && orders.length === 0) ) { // Show loading if auth is loading OR (data is loading AND no orders yet displayed)
    return <div className="container mx-auto p-4 text-center"><p>Loading your orders...</p></div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-center"><p className="text-red-600">Error: {error}</p></div>;
  }

  if (!user) { // Fallback if useRequireAuth hasn't redirected yet
    return <div className="container mx-auto p-4 text-center"><p>Please login to view your orders.</p></div>;
  }

  if (orders.length === 0 && !loading) {
    return (
      <div className="container mx-auto p-4 text-center min-h-[calc(100vh-200px)] flex flex-col justify-center items-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">My Orders</h1>
        <p className="text-gray-600 mb-8">You have no orders yet.</p>
        <Link href="/products" legacyBehavior>
          <a className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out">
            Start Shopping
          </a>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8 text-center">My Orders</h1>

      <div className="bg-white shadow-lg rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600 hover:text-indigo-800">
                  <Link href={`/orders/${order.id}`}>#{order.id.toString().padStart(6, '0')}</Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'Shipped' ? 'bg-teal-100 text-teal-800' :
                      order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${Number(order.total_amount).toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link href={`/orders/${order.id}`} legacyBehavior>
                    <a className="text-indigo-600 hover:text-indigo-900">View Details</a>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {(nextPageUrl || prevPageUrl) && (
        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={() => handlePageChange(prevPageUrl)}
            disabled={!prevPageUrl || loading}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <div className="text-sm text-gray-700">
            Page {currentPage} of {totalPages} (Total: {count} orders)
          </div>
          <button
            onClick={() => handlePageChange(nextPageUrl)}
            disabled={!nextPageUrl || loading}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

// Wrap with Suspense for useSearchParams
const OrdersPage = () => (
  <Suspense fallback={<div className="container mx-auto p-4 text-center"><p>Loading orders...</p></div>}>
    <OrdersPageContent />
  </Suspense>
);

export default OrdersPage;

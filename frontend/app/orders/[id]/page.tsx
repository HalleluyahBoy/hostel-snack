'use client';

import { useState, useEffect } from 'react';
import apiClient from '../../../lib/axiosConfig';
import useRequireAuth from '../../../hooks/useRequireAuth';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

// Define interfaces for Order Detail and Order Item
interface OrderItem {
  id: number;
  product: { // Assuming product is nested like this based on typical API structures
    id: number;
    name: string;
    image?: string; // Optional image
  };
  quantity: number;
  price: string; // Price per unit at the time of order
}

interface OrderDetail {
  id: number; // Or string
  created_at: string; // ISO date string
  status: string;
  total_amount: string; // e.g., "123.45"
  shipping_address: string;
  items: OrderItem[]; // Array of items in the order
  // Add other fields your API provides for order details
}

const OrderDetailPage = () => {
  const { user, isLoading: authIsLoading } = useRequireAuth();
  const params = useParams();
  const id = params.id as string; // Order ID from URL

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id && user) { // Ensure ID is present and user is authenticated (useRequireAuth handles redirect)
      setLoading(true);
      setError(null);
      apiClient.get<OrderDetail>(`/orders/${id}/`)
        .then(response => {
          setOrder(response.data);
        })
        .catch(err => {
          console.error(`Error fetching order details for ID ${id}:`, err);
          if (err.response?.status === 404) {
            setError("Order not found.");
          } else if (err.response?.status === 403) {
            setError("You do not have permission to view this order.");
          }
          else {
            setError(err.message || 'Failed to fetch order details.');
          }
        })
        .finally(() => setLoading(false));
    } else if (!user && !authIsLoading) {
        // Should be handled by useRequireAuth, but as a safeguard
        setLoading(false);
        setError("Please login to view order details.");
    }
  }, [id, user, authIsLoading]);

  if (authIsLoading || loading) {
    return <div className="container mx-auto p-4 text-center"><p>Loading order details...</p></div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-center"><p className="text-red-600">Error: {error}</p></div>;
  }

  if (!order) {
    // This state could be reached if loading finished but order is still null (e.g. ID was bad but no error thrown)
    return <div className="container mx-auto p-4 text-center"><p>Order details could not be loaded.</p></div>;
  }

  const statusColor =
    order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
    order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
    order.status === 'Shipped' ? 'bg-teal-100 text-teal-800' :
    order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
    order.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800';


  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">Order Details</h1>

      <div className="bg-white shadow-lg rounded-lg p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-1">Order ID:</h2>
            <p className="text-gray-600">#{order.id.toString().padStart(6, '0')}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-1">Date Placed:</h2>
            <p className="text-gray-600">{new Date(order.created_at).toLocaleString()}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-1">Status:</h2>
            <p>
              <span className={`px-3 py-1 text-sm leading-5 font-semibold rounded-full ${statusColor}`}>
                {order.status}
              </span>
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-1">Order Total:</h2>
            <p className="text-gray-800 font-bold text-xl">${Number(order.total_amount).toFixed(2)}</p>
          </div>
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold text-gray-700 mb-1">Shipping Address:</h2>
            <p className="text-gray-600 whitespace-pre-line">{order.shipping_address}</p>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mb-4">Items Ordered</h2>
        <div className="space-y-4">
          {order.items.map(item => (
            <div key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-md hover:bg-gray-50">
              <div className="flex items-center space-x-3 mb-3 sm:mb-0">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded overflow-hidden shadow">
                  <Link href={`/products/${item.product.id}`} legacyBehavior>
                    <a>
                    {item.product.image ? (
                      <Image src={item.product.image} alt={item.product.name} layout="fill" objectFit="cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">No Image</div>
                    )}
                    </a>
                  </Link>
                </div>
                <div>
                  <Link href={`/products/${item.product.id}`} legacyBehavior>
                    <a className="font-semibold text-gray-800 hover:text-indigo-600 text-sm sm:text-base">
                      {item.product.name}
                    </a>
                  </Link>
                  <p className="text-xs text-gray-500">Unit Price: ${Number(item.price).toFixed(2)}</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center sm:space-x-8 w-full sm:w-auto">
                <p className="text-sm text-gray-600 mb-1 sm:mb-0">
                  <span className="sm:hidden font-medium">Quantity: </span>{item.quantity}
                </p>
                <p className="text-sm text-gray-800 font-semibold">
                  <span className="sm:hidden font-medium">Item Total: </span>
                  ${(Number(item.price) * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
            <Link href="/orders" legacyBehavior>
                <a className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
                    &larr; Back to My Orders
                </a>
            </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;

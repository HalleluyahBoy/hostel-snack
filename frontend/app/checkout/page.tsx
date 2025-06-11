'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import useRequireAuth from '../../hooks/useRequireAuth';
import apiClient from '../../lib/axiosConfig';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

const CheckoutPage = () => {
  const { user, isLoading: authIsLoading } = useRequireAuth(); // Protect route
  const { cartItems, getCartTotal, clearCart } = useCart();
  const router = useRouter();

  const [shippingAddress, setShippingAddress] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if cart is empty
  useEffect(() => {
    if (!authIsLoading && cartItems.length === 0) {
      // Allow a moment for auth to settle before redirecting if cart is empty
      // This prevents redirecting if cartItems is momentarily empty during context hydration.
      // A more robust solution might involve a loading state in CartContext.
      const timer = setTimeout(() => {
        if (cartItems.length === 0) {
            alert("Your cart is empty. Add items before proceeding to checkout.");
            router.replace('/products'); // Or '/cart' to show the empty cart message there
        }
      }, 500); // Small delay to ensure cart context is stable
      return () => clearTimeout(timer);
    }
  }, [cartItems, authIsLoading, router]);


  const handlePlaceOrder = async (e: FormEvent) => {
    e.preventDefault();
    setIsPlacingOrder(true);
    setError(null);

    if (!shippingAddress.trim()) {
      setError('Shipping address is required.');
      setIsPlacingOrder(false);
      return;
    }
    if (cartItems.length === 0) {
        setError('Your cart is empty.');
        setIsPlacingOrder(false);
        return;
    }

    try {
      const response = await apiClient.post('/orders/create/', {
        shipping_address: shippingAddress,
        // The backend will associate the order with the authenticated user
        // and create OrderItem instances from the current cart items (server-side logic)
      });

      if (response.status === 201 && response.data.id) {
        clearCart();
        alert('Order placed successfully!'); // Feedback
        router.push(`/orders/${response.data.id}`);
      } else {
        setError('Failed to place order. Unexpected response from server.');
      }
    } catch (err: any) {
      console.error("Error placing order:", err);
      setError(err.response?.data?.detail || err.message || 'An unexpected error occurred while placing your order.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (authIsLoading) {
    return <div className="container mx-auto p-4 text-center"><p>Loading checkout...</p></div>;
  }
  if (!user) { // Should be handled by useRequireAuth, but as a fallback
    return <div className="container mx-auto p-4 text-center"><p>Please login to proceed to checkout.</p></div>;
  }
   if (cartItems.length === 0 && !authIsLoading) { // Explicit check after auth load
    return (
      <div className="container mx-auto p-4 text-center min-h-[calc(100vh-200px)] flex flex-col justify-center items-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-8">Please add items to your cart before proceeding to checkout.</p>
        <Link href="/products" legacyBehavior>
          <a className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out">
            Shop Products
          </a>
        </Link>
      </div>
    );
  }


  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8 text-center">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Summary */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-6 border-b pb-3">Order Summary</h2>
          {cartItems.map(item => (
            <div key={item.id} className="flex justify-between items-center py-3 border-b last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded overflow-hidden shadow">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} layout="fill" objectFit="cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">No Image</div>
                  )}
                </div>
                <div>
                  <Link href={`/products/${item.id}`} legacyBehavior>
                    <a className="font-medium text-gray-800 hover:text-indigo-600 text-sm sm:text-base">{item.name}</a>
                  </Link>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
              </div>
              <div className="text-sm sm:text-base text-gray-700">
                ${(Number(item.price) * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between items-center text-lg font-semibold text-gray-800">
              <span>Total Amount:</span>
              <span>${getCartTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Shipping and Payment Section */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-lg h-fit">
          <h2 className="text-xl font-semibold text-gray-700 mb-6 border-b pb-3">Shipping & Payment</h2>
          <form onSubmit={handlePlaceOrder}>
            <div className="mb-6">
              <label htmlFor="shippingAddress" className="block text-sm font-medium text-gray-700 mb-1">
                Shipping Address
              </label>
              <textarea
                id="shippingAddress"
                rows={4}
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter your full shipping address"
                required
              />
            </div>

            {/* Placeholder for Payment Method - Not part of this subtask's core logic */}
            <div className="mb-6">
                <p className="text-sm text-gray-600">Payment will be handled upon delivery or via a simulated payment gateway in a future step.</p>
            </div>

            {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

            <button
              type="submit"
              disabled={isPlacingOrder || cartItems.length === 0}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

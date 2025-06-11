'use client';

import { useCart } from '../../contexts/CartContext';
import useRequireAuth from '../../hooks/useRequireAuth'; // To protect the route
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react'; // For potential inline quantity edits

const CartPage = () => {
  const { user, isLoading: authIsLoading } = useRequireAuth(); // Protect route
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    // Assuming CartContext might have its own isLoading state for async operations if any
    // For now, we rely on authIsLoading for initial page block
  } = useCart();
  const router = useRouter();

  // This local state could be used if you want to debounce quantity updates
  // or have more complex inline editing, but for now, direct updates are fine.
  // const [itemQuantities, setItemQuantities] = useState<{ [key: string]: number }>({});

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
    // Add feedback if desired, e.g., toast
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity >= 1) {
      updateQuantity(productId, newQuantity);
    } else if (newQuantity === 0) {
      // Optionally, treat 0 as remove, or prevent it if < 1 is handled by input min
      removeFromCart(productId);
    }
    // Add feedback
  };

  const handleClearCart = () => {
    if (confirm("Are you sure you want to clear your entire cart?")) {
      clearCart();
    }
  };

  const handleProceedToCheckout = () => {
    // For now, navigate to a placeholder or log
    console.log("Proceeding to checkout with items:", cartItems, "Total:", getCartTotal());
    router.push('/checkout'); // Assuming a /checkout page will exist
    // alert("Proceeding to Checkout!");
  };

  // If auth is still loading, show a generic loading message
  if (authIsLoading) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-lg text-gray-700">Loading cart...</p>
      </div>
    );
  }

  // If user is not authenticated, useRequireAuth should have redirected.
  // This is a fallback or can be shown if redirection is not immediate.
  if (!user) {
     return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-lg text-gray-700">Please login to view your cart.</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto p-4 text-center min-h-[calc(100vh-200px)] flex flex-col justify-center items-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet.</p>
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
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8">Your Shopping Cart</h1>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Cart Items Header */}
        <div className="hidden md:grid md:grid-cols-6 gap-4 font-semibold text-gray-600 p-4 border-b">
          <div className="col-span-2">Product</div>
          <div>Price</div>
          <div>Quantity</div>
          <div>Total</div>
          <div>Action</div>
        </div>

        {/* Cart Items List */}
        {cartItems.map(item => (
          <div key={item.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors">
            {/* Product Info */}
            <div className="col-span-2 flex items-center space-x-3">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded overflow-hidden shadow">
                {item.image ? (
                  <Image src={item.image} alt={item.name} layout="fill" objectFit="cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">No Image</div>
                )}
              </div>
              <div>
                <Link href={`/products/${item.id}`} legacyBehavior>
                  <a className="font-semibold text-gray-800 hover:text-indigo-600 text-sm sm:text-base">
                    {item.name}
                  </a>
                </Link>
                {/* Optionally display category or other short info here */}
              </div>
            </div>

            {/* Price */}
            <div className="text-gray-700">
              <span className="md:hidden font-semibold">Price: </span>${Number(item.price).toFixed(2)}
            </div>

            {/* Quantity */}
            <div className="flex items-center space-x-2">
              <span className="md:hidden font-semibold">Quantity: </span>
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => handleUpdateQuantity(item.id.toString(), parseInt(e.target.value))}
                className="w-16 sm:w-20 p-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                aria-label={`Quantity for ${item.name}`}
              />
            </div>

            {/* Total Item Price */}
            <div className="text-gray-800 font-semibold">
              <span className="md:hidden font-semibold">Total: </span>
              ${(Number(item.price) * item.quantity).toFixed(2)}
            </div>

            {/* Remove Action */}
            <button
              onClick={() => handleRemoveItem(item.id.toString())}
              className="text-red-500 hover:text-red-700 font-medium text-sm transition-colors md:text-center"
              aria-label={`Remove ${item.name} from cart`}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Cart Summary & Actions */}
      <div className="mt-8 p-6 bg-gray-50 rounded-lg shadow">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 md:mb-0">
            Grand Total: ${getCartTotal().toFixed(2)}
          </div>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <button
              onClick={handleClearCart}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2.5 px-5 rounded-lg shadow-sm transition duration-150 ease-in-out w-full sm:w-auto"
            >
              Clear Cart
            </button>
            <button
              onClick={handleProceedToCheckout}
              disabled={cartItems.length === 0}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;

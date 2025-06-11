'use client';

import { useWishlist } from '../../contexts/WishlistContext';
import useRequireAuth from '../../hooks/useRequireAuth';
import ProductCard from '../../components/ProductCard'; // Reusing ProductCard for display
import Link from 'next/link';

const WishlistPage = () => {
  const { user, isLoading: authIsLoading } = useRequireAuth(); // Protect route
  const {
    wishlistItems,
    isLoading: wishlistIsLoading,
    error: wishlistError,
    removeFromWishlist
  } = useWishlist();

  const handleRemoveFromWishlist = async (productId: number) => {
    try {
      await removeFromWishlist(productId);
      // Feedback is handled within the context, but can add more here if needed
      // alert("Item removed from wishlist successfully on page!");
    } catch (err) {
      // Error is handled in context, but can show page-specific error if needed
      console.error("Failed to remove item from wishlist on page:", err);
    }
  };

  if (authIsLoading || wishlistIsLoading) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-lg text-gray-700">Loading your wishlist...</p>
      </div>
    );
  }

  if (!user) { // Fallback, useRequireAuth should redirect
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-lg text-gray-700">Please login to view your wishlist.</p>
      </div>
    );
  }

  if (wishlistError) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-lg text-red-600">Error: {wishlistError}</p>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="container mx-auto p-4 text-center min-h-[calc(100vh-200px)] flex flex-col justify-center items-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Wishlist is Empty</h1>
        <p className="text-gray-600 mb-8">You haven't added any items to your wishlist yet.</p>
        <Link href="/products" legacyBehavior>
          <a className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out">
            Discover Products
          </a>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8 text-center">My Wishlist</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlistItems.map(item => (
          // Assuming ProductCard is designed to take a 'product' prop
          // and that item.product matches the structure ProductCard expects.
          // We also add a custom remove button here, or modify ProductCard to show it based on a prop.
          <div key={item.product.id} className="relative">
            <ProductCard product={item.product} />
            <button
              onClick={() => handleRemoveFromWishlist(item.product.id)}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-700 text-white text-xs font-semibold py-1 px-2 rounded-full shadow-md transition duration-150 ease-in-out z-10"
              title="Remove from Wishlist"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import apiClient from '../lib/axiosConfig'; // Adjusted path
import { useAuth } from './AuthContext';   // Adjusted path

// Define the Product structure expected within a WishlistItem
// This should match the product structure returned by your API
interface Product {
  id: number; // Assuming product ID is a number
  name: string;
  price?: number; // Or string, depending on API
  image?: string;
  // Add other relevant product fields
}

// Define the WishlistItem structure as returned by GET /wishlist/
// Assuming it contains its own ID and a nested product object
interface WishlistItem {
  id: number; // This is the ID of the wishlist item itself
  product: Product;
  // Potentially other fields like `added_at` if your API provides them
}

interface WishlistContextState {
  wishlistItems: WishlistItem[];
  isLoading: boolean;
  error: string | null;
  addToWishlist: (product: Product) => Promise<void>; // Make async to handle API calls
  removeFromWishlist: (productId: number) => Promise<void>; // Make async
  isWishlisted: (productId: number) => boolean;
}

const WishlistContext = createContext<WishlistContextState | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const { user: authUser } = useAuth(); // Get authenticated user state
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false); // For loading wishlist from API
  const [error, setError] = useState<string | null>(null);

  // Fetch wishlist on auth change (login/logout)
  useEffect(() => {
    const fetchWishlist = async () => {
      if (authUser) {
        setIsLoading(true);
        setError(null);
        try {
          const response = await apiClient.get<WishlistItem[]>('/wishlist/');
          setWishlistItems(response.data || []); // Ensure it's an array
        } catch (err: any) {
          console.error("Error fetching wishlist:", err);
          setError(err.message || "Failed to fetch wishlist.");
          setWishlistItems([]); // Clear items on error
        } finally {
          setIsLoading(false);
        }
      } else {
        // User logged out, clear wishlist
        setWishlistItems([]);
        setError(null);
        setIsLoading(false);
      }
    };

    fetchWishlist();
  }, [authUser]); // Re-run when authUser state changes

  const addToWishlist = useCallback(async (product: Product) => {
    if (!authUser) {
      setError("Please login to add items to your wishlist.");
      // Or redirect to login, or show a toast
      console.warn("User not authenticated. Cannot add to wishlist.");
      return;
    }

    // Client-side check to prevent duplicate API calls if item is already visually in wishlist
    if (wishlistItems.some(item => item.product.id === product.id)) {
      console.log("Product already in wishlist (client check).");
      // Optionally, provide feedback that it's already there
      return;
    }

    try {
      // API expects product_id. Ensure your Product interface has 'id'.
      const response = await apiClient.post<WishlistItem>('/wishlist/add/', { product_id: product.id });
      // Add the new wishlist item (returned by API) to local state
      setWishlistItems(prevItems => [...prevItems, response.data]);
      alert(`${product.name} added to wishlist!`); // Placeholder feedback
      setError(null);
    } catch (err: any) {
      console.error("Error adding to wishlist:", err);
      setError(err.response?.data?.detail || err.message || "Failed to add item to wishlist.");
      // Potentially provide more specific user feedback based on error
    }
  }, [authUser, wishlistItems]);

  const removeFromWishlist = useCallback(async (productId: number) => {
    if (!authUser) {
      console.warn("User not authenticated. Cannot remove from wishlist.");
      return;
    }

    // Find the wishlist item ID based on the product ID
    const wishlistItem = wishlistItems.find(item => item.product.id === productId);
    if (!wishlistItem) {
      console.warn(`Product with ID ${productId} not found in local wishlist to remove.`);
      setError(`Product not found in your wishlist.`); // Or just silently fail if preferred
      return;
    }

    const wishlistItemId = wishlistItem.id; // This is the ID of the wishlist entry itself

    try {
      await apiClient.delete(`/wishlist/${wishlistItemId}/delete/`);
      // Remove from local state
      setWishlistItems(prevItems => prevItems.filter(item => item.id !== wishlistItemId));
      alert(`Item removed from wishlist!`); // Placeholder feedback
      setError(null);
    } catch (err: any) {
      console.error("Error removing from wishlist:", err);
      setError(err.response?.data?.detail || err.message || "Failed to remove item from wishlist.");
    }
  }, [authUser, wishlistItems]);

  const isWishlisted = useCallback((productId: number): boolean => {
    return wishlistItems.some(item => item.product.id === productId);
  }, [wishlistItems]);

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        isLoading,
        error,
        addToWishlist,
        removeFromWishlist,
        isWishlisted
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextState => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

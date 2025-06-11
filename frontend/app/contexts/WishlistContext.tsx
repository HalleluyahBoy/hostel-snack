'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Basic types (assuming a Product type exists or will be defined elsewhere)
// For now, a placeholder Product type, similar to CartContext
interface Product {
  id: string;
  name: string;
  price: number; // Or other relevant properties for a wishlist item
  // other product properties
}

// WishlistItem could be just the Product, or have additional wishlist-specific fields
type WishlistItem = Product;

interface WishlistContextState {
  wishlistItems: WishlistItem[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextState | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

  const addToWishlist = (product: Product) => {
    setWishlistItems(prevItems => {
      // Avoid adding duplicates
      if (!prevItems.find(item => item.id === product.id)) {
        return [...prevItems, product];
      }
      return prevItems;
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlistItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const isWishlisted = (productId: string): boolean => {
    return wishlistItems.some(item => item.id === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, addToWishlist, removeFromWishlist, isWishlisted }}>
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

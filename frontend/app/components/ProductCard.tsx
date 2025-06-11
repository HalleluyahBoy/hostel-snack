'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext'; // Added import

// Define the expected shape of the product prop
interface Product {
  id: number; // Or string
  name: string;
  price: string; // Assuming price is a string like "123.45" from the API
  image?: string; // URL of the product image
  stock?: number;
  is_in_stock?: boolean;
  category?: {
    id: number; // Or string
    name: string;
  };
  // Add other relevant product fields
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const {
    addToWishlist,
    removeFromWishlist,
    isWishlisted,
    isLoading: wishlistIsLoading // Renamed to avoid conflict if CartContext had isLoading
  } = useWishlist();

  const stockStatus = product.is_in_stock ?? (product.stock && product.stock > 0);
  const stockText = stockStatus ? "In Stock" : "Out of Stock";
  const stockColor = stockStatus ? "text-green-600" : "text-red-600";

  const handleAddToCart = () => {
    addToCart(product, 1);
    alert(`${product.name} added to cart!`);
  };

  const handleToggleWishlist = async () => {
    if (wishlistIsLoading) return; // Prevent action if wishlist is currently processing

    if (isWishlisted(product.id)) {
      await removeFromWishlist(product.id);
      // Feedback is in context, or add alert("Removed from wishlist!");
    } else {
      await addToWishlist(product);
      // Feedback is in context, or add alert("Added to wishlist!");
    }
  };

  const productIsWishlisted = isWishlisted(product.id);

  return (
    <div className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col">
      <Link href={`/products/${product.id}`} legacyBehavior>
        <a className="block">
          {product.image ? (
            <div className="relative w-full h-56 sm:h-64 md:h-72"> {/* Responsive height */}
              <Image
                src={product.image}
                alt={product.name}
                layout="fill"
                objectFit="cover" // Use "contain" if you want to see the whole image
                className="transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center w-full h-56 sm:h-64 md:h-72 bg-gray-200">
              <span className="text-gray-500">No Image Available</span>
            </div>
          )}
          <div className="p-4">
            {product.category && (
              <span className="text-xs text-gray-500 mb-1 block">{product.category.name}</span>
            )}
            <h3 className="text-md sm:text-lg font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors duration-300 truncate" title={product.name}>
              {product.name}
            </h3>
            <p className="text-lg sm:text-xl font-bold text-gray-900 mt-1">${product.price}</p>
            <p className={`text-sm font-medium mt-1 ${stockColor}`}>{stockText}</p>
          </div>
        </a>
      </Link>

      {/* Action buttons - Placeholder functionality */}
      <div className="mt-auto p-4 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <button
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-2 px-3 rounded-md transition duration-150 ease-in-out disabled:opacity-50"
            onClick={handleAddToCart}
            disabled={!stockStatus || wishlistIsLoading} // Disable if out of stock or wishlist is loading
          >
            {stockStatus ? 'Add to Cart' : 'Out of Stock'}
          </button>
          <button
            className={`w-full text-sm py-2 px-3 rounded-md transition duration-150 ease-in-out ${
              productIsWishlisted
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-pink-500 hover:bg-pink-600 text-white'
            } disabled:opacity-50`}
            onClick={handleToggleWishlist}
            disabled={wishlistIsLoading}
          >
            {wishlistIsLoading
              ? 'Processing...'
              : productIsWishlisted
                ? 'Remove from Wishlist'
                : 'Add to Wishlist'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

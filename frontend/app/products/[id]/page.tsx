'use client';

import { useState, useEffect, FormEvent } from 'react';
import apiClient from '../../../lib/axiosConfig';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useCart } from '../../../contexts/CartContext';
import { useWishlist } from '../../../contexts/WishlistContext';
import { useAuth } from '../../../contexts/AuthContext';

// Types (should ideally be in a shared types file)
interface Product {
  id: number;
  name: string;
  description: string;
  price: string; // e.g., "199.99"
  image?: string;
  stock?: number;
  is_in_stock?: boolean;
  average_rating?: number; // Assuming API provides this
  category?: { id: number; name: string };
  // Add other fields your API provides
}

interface Review {
  id: number;
  user: { username: string; id: number; }; // Or just username string if that's what API sends
  rating: number;
  comment: string;
  created_at: string; // Or Date
}

const ProductDetailPage = () => {
  const params = useParams();
  const id = params.id as string; // Product ID from URL

  const { user: authUser, isLoading: authIsLoading } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist, isWishlisted, removeFromWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);

  const [loadingProduct, setLoadingProduct] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [errorProduct, setErrorProduct] = useState<string | null>(null);
  const [errorReviews, setErrorReviews] = useState<string | null>(null);

  const [quantity, setQuantity] = useState(1);

  // Review form state
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Fetch product details
  useEffect(() => {
    if (id) {
      setLoadingProduct(true);
      setErrorProduct(null);
      apiClient.get<Product>(`/products/${id}/`)
        .then(response => {
          setProduct(response.data);
        })
        .catch(err => {
          console.error("Error fetching product:", err);
          setErrorProduct(err.message || "Failed to load product details.");
        })
        .finally(() => setLoadingProduct(false));
    }
  }, [id]);

  // Fetch product reviews
  const fetchReviews = () => {
     if (id) {
      setLoadingReviews(true);
      setErrorReviews(null);
      apiClient.get<Review[]>(`/products/${id}/reviews/`)
        .then(response => {
          setReviews(response.data);
        })
        .catch(err => {
          console.error("Error fetching reviews:", err);
          setErrorReviews(err.message || "Failed to load reviews.");
        })
        .finally(() => setLoadingReviews(false));
    }
  };
  useEffect(fetchReviews, [id]);


  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      alert(`${product.name} (x${quantity}) added to cart!`); // Placeholder feedback
    }
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    if (isWishlisted(product.id.toString())) { // Assuming product.id is number, isWishlisted might expect string
        removeFromWishlist(product.id.toString());
        alert(`${product.name} removed from wishlist!`);
    } else {
        addToWishlist(product);
        alert(`${product.name} added to wishlist!`);
    }
  };

  const handleReviewSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!authUser || !product) {
      setReviewError("You must be logged in to submit a review.");
      return;
    }
    if (!comment.trim() || rating < 1 || rating > 5) {
        setReviewError("Please provide a valid rating and comment.");
        return;
    }

    setSubmittingReview(true);
    setReviewError(null);

    try {
      // Assuming API endpoint is /reviews/ or /products/{id}/reviews/ for POST
      // The task states /reviews/create/
      const response = await apiClient.post('/reviews/create/', {
        product: product.id, // Ensure this matches backend expectation (e.g., product_id)
        rating,
        comment,
      });
      // Add new review to the list or re-fetch
      // setReviews(prevReviews => [response.data, ...prevReviews]);
      fetchReviews(); // Re-fetch to get the latest list including the new one
      setComment('');
      setRating(5);
      alert("Review submitted successfully!");
    } catch (err: any) {
      console.error("Error submitting review:", err);
      setReviewError(err.response?.data?.detail || err.message || "Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loadingProduct) return <div className="container mx-auto p-4 text-center"><p>Loading product details...</p></div>;
  if (errorProduct) return <div className="container mx-auto p-4 text-center"><p className="text-red-600">Error: {errorProduct}</p></div>;
  if (!product) return <div className="container mx-auto p-4 text-center"><p>Product not found.</p></div>;

  const stockStatusText = product.is_in_stock ?? (product.stock && product.stock > 0) ? "In Stock" : "Out of Stock";
  const stockStatusColor = product.is_in_stock ?? (product.stock && product.stock > 0) ? "text-green-600" : "text-red-600";

  return (
    <div className="container mx-auto p-4 pt-6 pb-12">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Image Section */}
        <div className="relative w-full h-80 md:h-[500px] rounded-lg overflow-hidden shadow-lg">
          {product.image ? (
            <Image src={product.image} alt={product.name} layout="fill" objectFit="cover" />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-200">
              <span className="text-gray-500">No Image</span>
            </div>
          )}
        </div>

        {/* Product Details Section */}
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">{product.name}</h1>
          {product.category && (
            <p className="text-sm text-indigo-600 mb-3">Category: {product.category.name}</p>
          )}
          <p className="text-2xl lg:text-3xl font-semibold text-gray-800 mb-4">${product.price}</p>

          {product.average_rating && (
            <div className="flex items-center mb-4">
              {/* Simple star display - can be improved with an actual star component */}
              <span className="text-yellow-500">{'★'.repeat(Math.round(product.average_rating))}{'☆'.repeat(5 - Math.round(product.average_rating))}</span>
              <span className="ml-2 text-sm text-gray-600">({product.average_rating.toFixed(1)} average rating)</span>
            </div>
          )}

          <p className={`font-semibold mb-4 ${stockStatusColor}`}>{stockStatusText}</p>

          <div dangerouslySetInnerHTML={{ __html: product.description }} className="text-gray-700 mb-6 prose lg:prose-lg"></div>

          <div className="flex items-center mb-6 space-x-3">
            <label htmlFor="quantity" className="font-semibold text-gray-700">Quantity:</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
              className="w-20 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={!(product.is_in_stock ?? (product.stock && product.stock > 0))}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex-grow"
            >
              Add to Cart
            </button>
            <button
              onClick={handleToggleWishlist}
              className={`${
                isWishlisted(product.id.toString()) ? 'bg-pink-500 hover:bg-pink-600' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              } text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out flex-grow`}
            >
              {isWishlisted(product.id.toString()) ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
        {loadingReviews && <p>Loading reviews...</p>}
        {errorReviews && <p className="text-red-500">Error loading reviews: {errorReviews}</p>}

        {!loadingReviews && !errorReviews && (
          reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map(review => (
                <div key={review.id} className="p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
                  <div className="flex items-center mb-1">
                    <span className="font-semibold text-gray-800">{review.user.username}</span>
                    <span className="ml-auto text-xs text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <span className="text-yellow-500">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No reviews yet for this product.</p>
          )
        )}

        {/* Review Submission Form */}
        {!authIsLoading && ( // Only render this section once auth loading is complete
          authUser ? (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Submit Your Review</h3>
              <form onSubmit={handleReviewSubmit} className="space-y-4 p-6 bg-white rounded-lg shadow-md">
                <div>
                  <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">Rating (1-5):</label>
                  <select
                    id="rating"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">Comment:</label>
                  <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  ></textarea>
                </div>
                {reviewError && <p className="text-sm text-red-600">{reviewError}</p>}
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm transition duration-150 ease-in-out disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          ) : (
            <p className="mt-8 text-center text-gray-700">Please <a href="/login" className="text-indigo-600 hover:underline">login</a> to submit a review.</p>
          )
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;

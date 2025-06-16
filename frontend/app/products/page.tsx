"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import apiClient from "../lib/axiosConfig";
import ProductCard from "../components/ProductCard";
import { useRouter, useSearchParams } from "next/navigation";

interface Product {
  id: number;
  name: string;
  price: string;
  image?: string;
  stock?: number;
  is_in_stock?: boolean;
  category?: { id: number; name: string };
}

interface Category {
  id: number;
  name: string;
}

interface PaginatedProductResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

// Helper component to contain the main logic, allowing Suspense for useSearchParams
const ProductsPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const [prevPageUrl, setPrevPageUrl] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter states
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || ""
  );

  // Store the base part of the URL for products
  const baseProductUrl = "/products/";

  // Fetch categories for filter dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get<Category[]>("/categories/");
        setCategories(response.data);
      } catch (err) {
        console.error("Failed to fetch categories for filter:", err);
        // Non-critical error, so not setting main page error
      }
    };
    fetchCategories();
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async (url: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<PaginatedProductResponse>(url);
      setProducts(response.data.results);
      setNextPageUrl(response.data.next);
      setPrevPageUrl(response.data.previous);
      setCount(response.data.count);

      // Extract page number from URL for display
      const urlParams = new URLSearchParams(url.split("?")[1]);
      setCurrentPage(parseInt(urlParams.get("page") || "1"));
    } catch (err: any) {
      console.error("Error fetching products:", err);
      setError(err.message || "Failed to fetch products.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect to react to changes in filters or direct URL navigation from pagination
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchParams.get("search"))
      params.set("search", searchParams.get("search")!);
    if (searchParams.get("category"))
      params.set("category", searchParams.get("category")!);
    if (searchParams.get("page")) params.set("page", searchParams.get("page")!);

    const queryString = params.toString();
    fetchProducts(`${baseProductUrl}${queryString ? "?" + queryString : ""}`);
  }, [searchParams, fetchProducts]);

  const handleFilterSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (selectedCategory) params.set("category", selectedCategory);
    // Reset page to 1 when filters change
    params.set("page", "1");
    router.push(`${baseProductUrl}?${params.toString()}`);
  };

  const handlePageChange = (newPageUrl: string | null) => {
    if (newPageUrl) {
      // Extract query string from the newPageUrl and navigate
      const queryString = newPageUrl.split("?")[1] || "";
      router.push(`${baseProductUrl}?${queryString}`);
    }
  };

  const itemsPerPage = products.length > 0 ? products.length : 10; // Estimate or get from API if available
  const totalPages = Math.ceil(count / itemsPerPage);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl sm:text-4xl font-bold my-8 text-center text-gray-800">
        Our Products
      </h1>

      {/* Filters Section */}
      <form
        onSubmit={handleFilterSubmit}
        className="mb-8 p-4 bg-gray-100 rounded-lg shadow"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Search Products
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g., Laptop, T-shirt"
            />
          </div>
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Filter by Category
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 h-10"
          >
            Apply Filters
          </button>
        </div>
      </form>

      {loading && (
        <div className="text-center py-10">
          <p className="text-lg text-gray-700">Loading products...</p>
          {/* Optional: Add a spinner here */}
        </div>
      )}
      {error && (
        <div className="text-center py-10">
          <p className="text-lg text-red-600">Error: {error}</p>
        </div>
      )}
      {!loading && !error && products.length === 0 && (
        <div className="text-center py-10">
          <p className="text-lg text-gray-700">
            No products found matching your criteria.
          </p>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="mt-12 flex justify-between items-center">
            <button
              onClick={() => handlePageChange(prevPageUrl)}
              disabled={!prevPageUrl || loading}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages} (Total: {count} products)
            </div>
            <button
              onClick={() => handlePageChange(nextPageUrl)}
              disabled={!nextPageUrl || loading}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// Wrap with Suspense for useSearchParams
const ProductsPage = () => (
  <Suspense
    fallback={
      <div className="container mx-auto p-4 text-center">
        <p className="text-lg">Loading page...</p>
      </div>
    }
  >
    <ProductsPageContent />
  </Suspense>
);

export default ProductsPage;

'use client';

import { useState, useEffect } from 'react';
import apiClient from '../../../lib/axiosConfig'; // Note the path change: ../../../
import { useParams } from 'next/navigation';
import Image from 'next/image'; // For displaying category image

// Define the expected shape of a single category
interface CategoryDetail {
  id: number; // Or string
  name: string;
  description?: string;
  image?: string;
  // Add any other fields your category detail API might return
}

// Placeholder for Product type
interface Product {
  id: number; // Or string
  name: string;
  price: number;
  // ... other product fields
}

const CategoryDetailPage = () => {
  const params = useParams();
  const id = params.id; // This will be a string

  const [category, setCategory] = useState<CategoryDetail | null>(null);
  const [products, setProducts] = useState<Product[]>([]); // Placeholder for products
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchCategoryDetails = async () => {
        setLoading(true);
        setError(null);
        try {
          // Fetch category details
          const categoryResponse = await apiClient.get<CategoryDetail>(`/categories/${id}/`);
          setCategory(categoryResponse.data);

          // TODO: Fetch products for this category (e.g., /products/?category_id={id})
          // For now, we'll leave products as an empty array or fetch them if endpoint is known
          // Example:
          // const productsResponse = await apiClient.get<Product[]>(`/products/?category=${id}`);
          // setProducts(productsResponse.data);

        } catch (err: any) {
          console.error(`Error fetching category details for ID ${id}:`, err);
          setError(err.message || `Failed to fetch category details. Please try again later.`);
        } finally {
          setLoading(false);
        }
      };

      fetchCategoryDetails();
    } else {
      // Handle case where ID might not be available initially, though useParams should provide it
      setLoading(false);
      setError("Category ID not found in URL.");
    }
  }, [id]); // Dependency array includes id

  if (loading) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-lg text-gray-700">Loading category details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-lg text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-lg text-gray-700">Category not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {category.image && (
          <div className="relative w-full h-64 md:h-96">
            <Image
              src={category.image}
              alt={category.name}
              layout="fill"
              objectFit="cover"
            />
          </div>
        )}
        <div className="p-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-gray-700 text-lg mb-6">
              {category.description}
            </p>
          )}

          {/* Placeholder for Products */}
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Products in this category
            </h2>
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {/* TODO: Render ProductCard components here when available */}
                {products.map(product => (
                  <div key={product.id} className="border p-4 rounded shadow">
                    <h3 className="font-semibold">{product.name}</h3>
                    <p>${product.price.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">
                No products found in this category yet. Stay tuned!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryDetailPage;

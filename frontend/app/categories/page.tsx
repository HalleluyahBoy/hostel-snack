'use client';

import { useState, useEffect } from 'react';
import apiClient from '../../lib/axiosConfig'; // Adjusted path
import CategoryCard from '../../components/CategoryCard'; // Adjusted path

interface Category {
  id: number; // Or string
  name: string;
  image?: string;
  description?: string;
}

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        // Assuming your API endpoint for categories is /categories/
        // And it returns an array of category objects
        // If the API returns data in a nested property (e.g., { results: [...] }),
        // you'll need to adjust response.data accordingly (e.g., response.data.results)
        const response = await apiClient.get<Category[]>('/categories/');
        setCategories(response.data);
      } catch (err: any) {
        console.error("Error fetching categories:", err);
        setError(err.message || 'Failed to fetch categories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-lg text-gray-700">Loading categories...</p>
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

  if (categories.length === 0) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-3xl font-bold my-8">Our Categories</h1>
        <p className="text-lg text-gray-700">No categories found at the moment.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl sm:text-4xl font-bold my-8 text-center text-gray-800">
        Our Categories
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map(category => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage;

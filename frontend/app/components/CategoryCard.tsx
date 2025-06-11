'use client';

import Link from 'next/link';
import Image from 'next/image'; // Using next/image for optimization

// Define the expected shape of the category prop
interface Category {
  id: number; // Or string, depending on your API
  name: string;
  image?: string; // Optional image
  description?: string; // Optional description
}

interface CategoryCardProps {
  category: Category;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <Link href={`/categories/${category.id}`} legacyBehavior>
      <a className="block group bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
        {category.image ? (
          <div className="relative w-full h-48 sm:h-56 md:h-64"> {/* Responsive height */}
            <Image
              src={category.image}
              alt={category.name}
              layout="fill"
              objectFit="cover" // Or "contain" depending on image aspect ratios
              className="transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center w-full h-48 sm:h-56 md:h-64 bg-gray-200">
            <span className="text-gray-500">No Image</span>
          </div>
        )}
        <div className="p-4">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors duration-300">
            {category.name}
          </h3>
          {category.description && (
            <p className="text-sm text-gray-600 mt-1 truncate">
              {category.description}
            </p>
          )}
        </div>
      </a>
    </Link>
  );
};

export default CategoryCard;

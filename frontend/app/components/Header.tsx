'use client';

import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext'; // Adjusted path
import { useRouter } from 'next/navigation'; // For redirecting after logout

const Header = () => {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login'); // Redirect to login page after logout
  };

  return (
    <header className="bg-gray-800 text-white p-4">
      <nav className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">
          <Link href="/">E-Store</Link>
        </div>
        <ul className="flex space-x-4">
          <li><Link href="/" className="hover:text-gray-300">Home</Link></li>
          <li><Link href="/products" className="hover:text-gray-300">Products</Link></li>
          <li><Link href="/categories" className="hover:text-gray-300">Categories</Link></li>
          <li><Link href="/cart" className="hover:text-gray-300">Cart</Link></li>
          <li><Link href="/wishlist" className="hover:text-gray-300">Wishlist</Link></li>
          {isLoading ? (
            <li>Loading...</li>
          ) : user ? (
            <>
              <li><Link href="/profile" className="hover:text-gray-300">Profile</Link></li>
              <li><button onClick={handleLogout} className="hover:text-gray-300">Logout</button></li>
            </>
          ) : (
            <>
              <li><Link href="/login" className="hover:text-gray-300">Login</Link></li>
              <li><Link href="/register" className="hover:text-gray-300">Register</Link></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;

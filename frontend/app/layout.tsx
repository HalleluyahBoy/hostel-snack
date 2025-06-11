import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Context Providers
import { AuthProvider } from "./contexts/AuthContext"; // Adjusted path
import { CartProvider } from "./contexts/CartContext";   // Adjusted path
import { WishlistProvider } from "./contexts/WishlistContext"; // Adjusted path

// Components
import Header from "./components/Header"; // Adjusted path
import Footer from "./components/Footer"; // Adjusted path

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "E-commerce App", // Updated title
  description: "A modern e-commerce platform.", // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

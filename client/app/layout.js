import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { StoreProvider } from '@/context/StoreContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata = {
  title: 'ShopSmart',
  description: 'E-commerce platform for small businesses',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-gray-50">
        <AuthProvider>
          <CartProvider>
            <StoreProvider>
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
              <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
            </StoreProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

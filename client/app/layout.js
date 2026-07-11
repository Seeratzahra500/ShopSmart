import { Fraunces, Inter, JetBrains_Mono } from 'next/font/google';
import { MotionConfig } from 'framer-motion';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { StoreProvider } from '@/context/StoreContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  axes: ['opsz'],
  weight: 'variable',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  weight: ['500'],
  display: 'swap',
});

export const metadata = {
  title: {
    default: 'ShopSmart — Marketplace for independent business',
    template: '%s',
  },
  description: 'ShopSmart is a multi-tenant marketplace platform where independent businesses run their own branded storefronts.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="flex flex-col min-h-screen bg-[var(--bg-page)] text-[var(--text-main)]">
        <MotionConfig reducedMotion="user">
          <AuthProvider>
            <CartProvider>
              <StoreProvider>
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
                <Toaster
                  position="bottom-center"
                  toastOptions={{
                    duration: 3000,
                    style: {
                      background: '#1C1917',
                      color: '#F5F2F0',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-overlay)',
                      fontSize: '13px',
                      fontWeight: 500,
                      padding: '10px 16px',
                    },
                    iconTheme: { primary: 'var(--color-brand)', secondary: '#F5F2F0' },
                  }}
                />
              </StoreProvider>
            </CartProvider>
          </AuthProvider>
        </MotionConfig>
      </body>
    </html>
  );
}

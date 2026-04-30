'use client';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';

export default function Footer() {
  const { store } = useStore();
  const name    = store?.name    || 'ShopSmart';
  const contact = store?.contact || {};

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand */}
        <div>
          <h3 className="text-white font-bold text-lg mb-3">{name}</h3>
          <p className="text-sm leading-relaxed">
            {store?.tagline || 'Empowering small businesses with a personalized e-commerce platform.'}
          </p>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="text-white font-medium mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/"         className="hover:text-white transition-colors">Home</Link></li>
            <li><Link href="/products" className="hover:text-white transition-colors">Products</Link></li>
            <li><Link href="/cart"     className="hover:text-white transition-colors">Cart</Link></li>
            <li><Link href="/orders"   className="hover:text-white transition-colors">My Orders</Link></li>
          </ul>
        </div>

        {/* Contact + Social */}
        <div>
          <h4 className="text-white font-medium mb-3">Contact</h4>
          <div className="space-y-1 text-sm">
            {contact.email   && <p>{contact.email}</p>}
            {contact.phone   && <p>{contact.phone}</p>}
            {contact.address && <p>{contact.address}</p>}
            {!contact.email && !contact.phone && !contact.address && (
              <p className="text-gray-500 text-xs">No contact info set yet.</p>
            )}
          </div>
          {(contact.instagram || contact.facebook || contact.twitter) && (
            <div className="flex gap-4 mt-3 text-sm">
              {contact.instagram && (
                <a href={contact.instagram} target="_blank" rel="noopener noreferrer"
                  className="hover:text-white transition-colors">Instagram</a>
              )}
              {contact.facebook && (
                <a href={contact.facebook} target="_blank" rel="noopener noreferrer"
                  className="hover:text-white transition-colors">Facebook</a>
              )}
              {contact.twitter && (
                <a href={contact.twitter} target="_blank" rel="noopener noreferrer"
                  className="hover:text-white transition-colors">Twitter</a>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-800 text-center py-4 text-xs text-gray-500">
        © {new Date().getFullYear()} {name}. All rights reserved.
      </div>
    </footer>
  );
}

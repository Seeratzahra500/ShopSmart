'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStore } from '@/context/StoreContext';

/* ─── Animation variants ─── */
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

/* ─── Social icon SVGs (inline, no lucide-react) ─── */
const IconInstagram = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);

const IconFacebook = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const IconTwitter = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const SocialButton = ({ href, icon: Icon, label }) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.15)' }}
    whileTap={{ scale: 0.93 }}
    className="inline-flex items-center justify-center rounded-full border border-white/20 p-2 text-white/60 hover:text-white transition-colors"
  >
    <Icon />
  </motion.a>
);

const hasSocial = (contact) => !!(contact.instagram || contact.facebook || contact.twitter);

const FooterLink = ({ href, children }) => (
  <li>
    <Link
      href={href}
      className="text-sm text-white/50 hover:text-white transition-colors duration-200"
    >
      {children}
    </Link>
  </li>
);

/* ─── Footer ─── */
export default function Footer() {
  const { store } = useStore();
  const name    = store?.name    || 'ShopSmart';
  const contact = store?.contact || {};
  const tagline = store?.tagline || 'Empowering small businesses with a personalised e-commerce platform.';

  return (
    <footer className="mt-auto bg-[#161311] text-white relative">
      <div className="h-px w-full" style={{ backgroundColor: 'var(--color-brand)' }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10"
        >
          {/* ── Col 1: Logo + Tagline + Social ── */}
          <motion.div variants={itemVariants} className="flex flex-col gap-4">
            <span className="font-display text-2xl font-semibold tracking-tight" style={{ color: 'var(--color-brand)' }}>
              {name}
            </span>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              {tagline}
            </p>

            {/* Social icons — only shown once the store has configured at least one */}
            {hasSocial(contact) && (
              <div className="flex items-center gap-2 mt-1">
                {contact.instagram && (
                  <SocialButton href={contact.instagram} icon={IconInstagram} label="Instagram" />
                )}
                {contact.facebook && (
                  <SocialButton href={contact.facebook} icon={IconFacebook} label="Facebook" />
                )}
                {contact.twitter && (
                  <SocialButton href={contact.twitter} icon={IconTwitter} label="Twitter" />
                )}
              </div>
            )}
          </motion.div>

          {/* ── Col 2: Quick Links ── */}
          <motion.div variants={itemVariants}>
            <h4 className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-white/40 mb-5">
              Quick Links
            </h4>
            <ul className="space-y-3">
              <FooterLink href="/stores">Stores</FooterLink>
              <FooterLink href="/cart">Cart</FooterLink>
              <FooterLink href="/orders">My Orders</FooterLink>
            </ul>
          </motion.div>

          {/* ── Col 3: Account ── */}
          <motion.div variants={itemVariants}>
            <h4 className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-white/40 mb-5">
              Account
            </h4>
            <ul className="space-y-3">
              <FooterLink href="/auth/login">Login</FooterLink>
              <FooterLink href="/auth/register">Register</FooterLink>
              <FooterLink href="/dashboard">Dashboard</FooterLink>
            </ul>
          </motion.div>

          {/* ── Col 4: Contact ── */}
          <motion.div variants={itemVariants}>
            <h4 className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-white/40 mb-5">
              Contact
            </h4>
            <div className="space-y-2 text-sm text-white/50 leading-relaxed">
              {contact.email && (
                <p>
                  <a href={`mailto:${contact.email}`} className="hover:text-white transition-colors">
                    {contact.email}
                  </a>
                </p>
              )}
              {contact.phone && <p>{contact.phone}</p>}
              {contact.address && <p>{contact.address}</p>}
              {!contact.email && !contact.phone && !contact.address && (
                <p className="text-white/30 text-xs">
                  No contact info configured yet.
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-white/5 px-4 sm:px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} {name}. All rights reserved.
          </p>
          <p className="text-xs text-white/40">
            Powered by{' '}
            <span className="font-semibold" style={{ color: 'var(--color-brand)' }}>
              ShopSmart
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}

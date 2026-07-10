'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/api';
import { buildStoreVars } from '@/lib/themes';

const StoreContext = createContext(null);

export function StoreProvider({ slug, children }) {
  const [store, setStore]   = useState(null);
  const [loading, setLoading] = useState(!!slug);

  const applyVars = (storeData) => {
    const vars = buildStoreVars(storeData);
    const root = document.documentElement;
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));

    if (storeData.fontFamily) {
      document.body.style.fontFamily = `'${storeData.fontFamily}', sans-serif`;
    }

    const scheme = storeData.colorScheme || 'system';
    if (scheme === 'dark')       root.classList.add('dark');
    else if (scheme === 'light') root.classList.remove('dark');
    else root.classList.toggle('dark', window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (storeData.fontFamily && storeData.fontFamily !== 'Inter') {
      const fontId = `gfont-${storeData.fontFamily.replace(/\s+/g, '-')}`;
      if (!document.getElementById(fontId)) {
        const link = document.createElement('link');
        link.id = fontId; link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(storeData.fontFamily)}:wght@400;500;600;700&display=swap`;
        document.head.appendChild(link);
      }
    }
  };

  useEffect(() => {
    if (!slug) return;
    api.get(`/stores/${slug}`)
      .then(({ data }) => { setStore(data); applyVars(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const refreshStore = () => {
    if (!slug) return;
    api.get(`/stores/${slug}`)
      .then(({ data }) => { setStore(data); applyVars(data); })
      .catch(() => {});
  };

  return (
    <StoreContext.Provider value={{ store, loading, refreshStore, setStore, applyVars }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);

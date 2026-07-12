'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import api from '@/lib/api';
import { buildStoreVars, resolveDesign, collectFontFamilies } from '@/lib/themes';

const StoreContext = createContext(null);

export function StoreProvider({ slug, children }) {
  const [store, setStore]   = useState(null);
  const [design, setDesign] = useState(null);
  const [loading, setLoading] = useState(!!slug);

  // Tracks what the last applyVars() call touched on documentElement/body so
  // it can be precisely undone — theme vars must never leak past this provider.
  const appliedRef = useRef(null);

  const cleanupVars = useCallback(() => {
    const applied = appliedRef.current;
    if (!applied) return;
    const root = document.documentElement;
    applied.propKeys.forEach((k) => root.style.removeProperty(k));
    document.body.style.fontFamily = applied.prevBodyFont || '';
    if (applied.darkAdded) root.classList.remove('dark');
    appliedRef.current = null;
  }, []);

  const applyVars = useCallback((storeData) => {
    const root = document.documentElement;
    const vars = buildStoreVars(storeData);

    // Clean up whatever the previous applyVars() call set before applying new vars.
    cleanupVars();

    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));

    const prevBodyFont = document.body.style.fontFamily;
    if (storeData.fontFamily) {
      document.body.style.fontFamily = `'${storeData.fontFamily}', sans-serif`;
    }

    const scheme = storeData.colorScheme || 'system';
    let darkAdded = false;
    if (scheme === 'dark')       { root.classList.add('dark'); darkAdded = true; }
    else if (scheme === 'light') { root.classList.remove('dark'); }
    else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
      darkAdded = prefersDark;
    }

    collectFontFamilies(storeData).forEach((family) => {
      const fontId = `gfont-${family.replace(/\s+/g, '-')}`;
      if (!document.getElementById(fontId)) {
        const link = document.createElement('link');
        link.id = fontId; link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@400;500;600;700&display=swap`;
        document.head.appendChild(link);
      }
    });

    appliedRef.current = {
      propKeys: Object.keys(vars),
      prevBodyFont,
      darkAdded,
    };
  }, [cleanupVars]);

  useEffect(() => {
    if (!slug) return;
    api.get(`/stores/${slug}`)
      .then(({ data }) => { setStore(data); setDesign(resolveDesign(data)); applyVars(data); })
      .catch(() => {})
      .finally(() => setLoading(false));

    // Cleanup on unmount or slug change — theme vars must not leak into the rest of the app.
    return () => cleanupVars();
  }, [slug, applyVars, cleanupVars]);

  const refreshStore = () => {
    if (!slug) return;
    api.get(`/stores/${slug}`)
      .then(({ data }) => { setStore(data); setDesign(resolveDesign(data)); applyVars(data); })
      .catch(() => {});
  };

  return (
    <StoreContext.Provider value={{ store, design, loading, refreshStore, setStore, applyVars }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);

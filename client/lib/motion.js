// Single motion vocabulary for the app — import from here instead of redeclaring
// per-page fadeUp/stagger variants with slightly different values everywhere.
export const EASE = [0.22, 1, 0.36, 1]; // ease-out-quint

export const SPRING = { type: 'spring', stiffness: 420, damping: 32 };

export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.4, ease: EASE } },
};

export const stagger = (delay = 0.06) => ({
  hidden: {},
  show: { transition: { staggerChildren: delay } },
});

// Standard viewport-reveal props: `whileInView` + this = animate once, a little
// before the element is fully visible.
export const revealOnce = { once: true, margin: '-80px' };

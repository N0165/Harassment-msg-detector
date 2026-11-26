export const pct = (v) => Math.round(v * 100);

export const tint = (hex, alpha) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};

export const formatTime = (ts) =>
  new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export const truncate = (s, n = 64) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);

export const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const Svg = ({ size = 20, children, ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    {...rest}
  >
    {children}
  </svg>
);

export const MenuIcon = (p) => (
  <Svg {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Svg>
);
export const CloseIcon = (p) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
);
export const ScanIcon = (p) => (
  <Svg {...p}>
    <path d="M4 8V6a2 2 0 012-2h2M16 4h2a2 2 0 012 2v2M20 16v2a2 2 0 01-2 2h-2M8 20H6a2 2 0 01-2-2v-2M4 12h16" />
  </Svg>
);
export const CopyIcon = (p) => (
  <Svg {...p}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V6a2 2 0 012-2h9" />
  </Svg>
);
export const DownloadIcon = (p) => (
  <Svg {...p}>
    <path d="M12 4v11M7 11l5 5 5-5M5 20h14" />
  </Svg>
);
export const InfoIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </Svg>
);
export const TrashIcon = (p) => (
  <Svg {...p}>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M9 7V4h6v3" />
  </Svg>
);
export const PlayIcon = (p) => (
  <Svg {...p}>
    <path d="M7 5l12 7-12 7V5z" />
  </Svg>
);
export const CheckIcon = (p) => (
  <Svg {...p}>
    <path d="M5 12.5l4.500 4.500L19 7.500" />
  </Svg>
);
export const AlertIcon = (p) => (
  <Svg {...p}>
    <path d="M12 4l9 16H3L12 4z" />
    <path d="M12 10v4M12 17h.01" />
  </Svg>
);
export const CodeIcon = (p) => (
  <Svg {...p}>
    <path d="M9 8l-5 4 5 4M15 8l5 4-5 4M13.500 5l-3 14" />
  </Svg>
);
export const LockIcon = (p) => (
  <Svg {...p}>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 018 0v3" />
  </Svg>
);
export const LayersIcon = (p) => (
  <Svg {...p}>
    <path d="M12 4l9 5-9 5-9-5 9-5zM3 14l9 5 9-5" />
  </Svg>
);
export const FlagIcon = (p) => (
  <Svg {...p}>
    <path d="M5 21V4M5 4h11l-2 4 2 4H5" />
  </Svg>
);

export function LogoMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="logo-g" x1="4" y1="3" x2="28" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="#B7A1FF" />
          <stop offset="1" stopColor="#4C5BD4" />
        </linearGradient>
      </defs>
      <path d="M16 3l11 4v8c0 6.600-4.400 11.200-11 14C9.400 26.200 5 21.600 5 15V7l11-4z" fill="url(#logo-g)" />
      <path d="M11 16.500l3.600 3.600L21.500 12" stroke="#060A1C" strokeWidth="2.400" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

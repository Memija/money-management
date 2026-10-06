import type { IconComponent } from './types'

export const MercedesLogo: IconComponent = ({ size = 16, className }) => (
  <svg
    viewBox="0 0 48 48"
    width={typeof size === 'number' ? size : undefined}
    height={typeof size === 'number' ? size : undefined}
    style={{
      width: typeof size === 'number' ? `${size}px` : size,
      height: typeof size === 'number' ? `${size}px` : size,
      display: 'inline-block',
      verticalAlign: 'middle',
      borderRadius: 'inherit',
      flexShrink: 0,
    }}
    className={['brand-logo-full', className].filter(Boolean).join(' ')}
    data-brand-logo="true"
    aria-label="Mercedes-Benz"
    role="img"
  >
    <rect width="48" height="48" fill="#0A0D12" />
    {/* Outer chrome ring */}
    <circle cx="24" cy="19.5" r="13.5" fill="none" stroke="#D1D5DB" strokeWidth="1.8" />
    <circle cx="24" cy="19.5" r="12.3" fill="none" stroke="#4B5563" strokeWidth="0.6" />
    {/* 3D Faceted 3-pointed Star */}
    <g>
      {/* Top Arm */}
      <polygon points="24,19.5 24,6.5 22.8,19" fill="#FFFFFF" />
      <polygon points="24,19.5 24,6.5 25.2,19" fill="#9CA3AF" />
      {/* Bottom Right Arm */}
      <polygon points="24,19.5 35.3,26 25.2,19" fill="#FFFFFF" />
      <polygon points="24,19.5 35.3,26 24,20.8" fill="#9CA3AF" />
      {/* Bottom Left Arm */}
      <polygon points="24,19.5 12.7,26 24,20.8" fill="#FFFFFF" />
      <polygon points="24,19.5 12.7,26 22.8,19" fill="#9CA3AF" />
    </g>
    <text
      x="24"
      y="38.5"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#F3F4F6"
      fontWeight="700"
      fontSize="5.2"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letterSpacing="0.4px"
    >
      MERCEDES
    </text>
  </svg>
)
MercedesLogo.displayName = 'MercedesLogo'

export const BmwLogo: IconComponent = ({ size = 16, className }) => (
  <svg
    viewBox="0 0 48 48"
    width={typeof size === 'number' ? size : undefined}
    height={typeof size === 'number' ? size : undefined}
    style={{
      width: typeof size === 'number' ? `${size}px` : size,
      height: typeof size === 'number' ? `${size}px` : size,
      display: 'inline-block',
      verticalAlign: 'middle',
      borderRadius: 'inherit',
      flexShrink: 0,
    }}
    className={['brand-logo-full', className].filter(Boolean).join(' ')}
    data-brand-logo="true"
    aria-label="BMW"
    role="img"
  >
    <rect width="48" height="48" fill="#0A0D12" />
    {/* Outer silver rim & black ring */}
    <circle cx="24" cy="24" r="20" fill="#000000" stroke="#D1D5DB" strokeWidth="1.5" />
    {/* BMW letters around the top */}
    <text
      x="24"
      y="10.5"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="7.5"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letterSpacing="1.8px"
    >
      BMW
    </text>
    {/* Inner Bavarian Roundel */}
    <g transform="translate(24, 27)">
      <circle cx="0" cy="0" r="11" fill="none" stroke="#D1D5DB" strokeWidth="1.2" />
      <path d="M 0 0 L 0 -11 A 11 11 0 0 1 11 0 Z" fill="#0066B1" />
      <path d="M 0 0 L 11 0 A 11 11 0 0 1 0 11 Z" fill="#FFFFFF" />
      <path d="M 0 0 L 0 11 A 11 11 0 0 1 -11 0 Z" fill="#0066B1" />
      <path d="M 0 0 L -11 0 A 11 11 0 0 1 0 -11 Z" fill="#FFFFFF" />
      {/* Silver Crosshair */}
      <line x1="-11" y1="0" x2="11" y2="0" stroke="#D1D5DB" strokeWidth="0.8" />
      <line x1="0" y1="-11" x2="0" y2="11" stroke="#D1D5DB" strokeWidth="0.8" />
    </g>
  </svg>
)
BmwLogo.displayName = 'BmwLogo'

export const AudiLogo: IconComponent = ({ size = 16, className }) => (
  <svg
    viewBox="0 0 48 48"
    width={typeof size === 'number' ? size : undefined}
    height={typeof size === 'number' ? size : undefined}
    style={{
      width: typeof size === 'number' ? `${size}px` : size,
      height: typeof size === 'number' ? `${size}px` : size,
      display: 'inline-block',
      verticalAlign: 'middle',
      borderRadius: 'inherit',
      flexShrink: 0,
    }}
    className={['brand-logo-full', className].filter(Boolean).join(' ')}
    data-brand-logo="true"
    aria-label="Audi"
    role="img"
  >
    <rect width="48" height="48" fill="#0B0E14" />
    {/* 4 Interlocking Rings */}
    <g fill="none" stroke="#E5E7EB" strokeWidth="2.2">
      <circle cx="12" cy="20.5" r="7.5" />
      <circle cx="20" cy="20.5" r="7.5" />
      <circle cx="28" cy="20.5" r="7.5" />
      <circle cx="36" cy="20.5" r="7.5" />
    </g>
    <text
      x="24"
      y="37.5"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="800"
      fontSize="8.5"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letterSpacing="0.8px"
    >
      Audi
    </text>
  </svg>
)
AudiLogo.displayName = 'AudiLogo'

export const VolkswagenLogo: IconComponent = ({ size = 16, className }) => (
  <svg
    viewBox="0 0 48 48"
    width={typeof size === 'number' ? size : undefined}
    height={typeof size === 'number' ? size : undefined}
    style={{
      width: typeof size === 'number' ? `${size}px` : size,
      height: typeof size === 'number' ? `${size}px` : size,
      display: 'inline-block',
      verticalAlign: 'middle',
      borderRadius: 'inherit',
      flexShrink: 0,
    }}
    className={['brand-logo-full', className].filter(Boolean).join(' ')}
    data-brand-logo="true"
    aria-label="Volkswagen"
    role="img"
  >
    <rect width="48" height="48" fill="#001E50" />
    {/* Outer ring */}
    <circle cx="24" cy="24" r="18" fill="none" stroke="#FFFFFF" strokeWidth="2.2" />
    {/* V and W inner glyphs */}
    <path
      d="M 14.5 13.5 L 18.5 25.5 L 21 17.5 L 24 23 L 27 17.5 L 29.5 25.5 L 33.5 13.5"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M 17 25 L 20.5 35.5 L 24 29 L 27.5 35.5 L 31 25"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Dividing horizontal slit */}
    <line x1="12" y1="24.5" x2="36" y2="24.5" stroke="#001E50" strokeWidth="1.2" />
  </svg>
)
VolkswagenLogo.displayName = 'VolkswagenLogo'

export const PorscheLogo: IconComponent = ({ size = 16, className }) => (
  <svg
    viewBox="0 0 48 48"
    width={typeof size === 'number' ? size : undefined}
    height={typeof size === 'number' ? size : undefined}
    style={{
      width: typeof size === 'number' ? `${size}px` : size,
      height: typeof size === 'number' ? `${size}px` : size,
      display: 'inline-block',
      verticalAlign: 'middle',
      borderRadius: 'inherit',
      flexShrink: 0,
    }}
    className={['brand-logo-full', className].filter(Boolean).join(' ')}
    data-brand-logo="true"
    aria-label="Porsche"
    role="img"
  >
    <rect width="48" height="48" fill="#0A0D12" />
    {/* Crest outline */}
    <path
      d="M 13 8 L 35 8 C 35 15 36 29 24 40 C 12 29 13 15 13 8 Z"
      fill="#B1975B"
      stroke="#B1975B"
      strokeWidth="1"
    />
    {/* Crest inner black/red heraldic quarters */}
    <path d="M 14 11 L 23.5 11 L 23.5 23 L 14 23 Z" fill="#D5001C" />
    <path d="M 24.5 11 L 34 11 L 34 23 L 24.5 23 Z" fill="#1A1A1A" />
    <path d="M 14 24 L 23.5 24 L 23.5 35 C 19 32 15 28 14 24 Z" fill="#1A1A1A" />
    <path d="M 24.5 24 L 34 24 C 33 28 29 32 24.5 35 Z" fill="#D5001C" />
    {/* Stuttgart center shield */}
    <rect x="21" y="17" width="6" height="8" rx="1.5" fill="#B1975B" stroke="#000000" strokeWidth="0.6" />
    {/* Porsche banner text */}
    <text
      x="24"
      y="7"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#B1975B"
      fontWeight="900"
      fontSize="4.8"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letterSpacing="1px"
    >
      PORSCHE
    </text>
  </svg>
)
PorscheLogo.displayName = 'PorscheLogo'

export const TeslaLogo: IconComponent = ({ size = 16, className }) => (
  <svg
    viewBox="0 0 48 48"
    width={typeof size === 'number' ? size : undefined}
    height={typeof size === 'number' ? size : undefined}
    style={{
      width: typeof size === 'number' ? `${size}px` : size,
      height: typeof size === 'number' ? `${size}px` : size,
      display: 'inline-block',
      verticalAlign: 'middle',
      borderRadius: 'inherit',
      flexShrink: 0,
    }}
    className={['brand-logo-full', className].filter(Boolean).join(' ')}
    data-brand-logo="true"
    aria-label="Tesla"
    role="img"
  >
    <rect width="48" height="48" fill="#E82127" />
    <g transform="translate(7.2, 7.2) scale(1.4)" fill="#FFFFFF">
      <path d="M12 5.362l2.475-3.026s4.245.09 8.471 2.054c-1.082 1.636-3.231 2.438-3.231 2.438-.146-1.439-1.154-1.79-4.354-1.79L12 24 8.619 5.034c-3.18 0-4.188.354-4.335 1.792 0 0-2.146-.795-3.229-2.43C5.28 2.431 9.525 2.34 9.525 2.34L12 5.362l-.004.002H12v-.002zm0-3.899c3.415-.03 7.326.528 11.328 2.28.535-.968.672-1.395.672-1.395C19.625.612 15.528.015 12 0 8.472.015 4.375.61 0 2.349c0 0 .195.525.672 1.396C4.674 1.989 8.585 1.435 12 1.46v.003z" />
    </g>
  </svg>
)
TeslaLogo.displayName = 'TeslaLogo'

export {
  AudiLogo as AudiCarLogo,
  BmwLogo as BmwCarLogo,
  MercedesLogo as MercedesBenzLogo,
  PorscheLogo as PorscheCarLogo,
  TeslaLogo as TeslaCarLogo,
  VolkswagenLogo as VwLogo,
}

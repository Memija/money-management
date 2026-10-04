import type { IconComponent } from './types'

export const Check24Logo: IconComponent = ({ size = 16, className }) => (
  <svg
    viewBox="0 0 48 48"
    width={typeof size === 'number' ? size : undefined}
    height={typeof size === 'number' ? size : undefined}
    style={{
      width: typeof size === 'number' ? `${size}px` : size,
      height: typeof size === 'number' ? `${size}px` : size,
      display: 'inline-block',
      verticalAlign: 'middle',
      borderRadius: '3px',
      flexShrink: 0,
    }}
    className={className}
    aria-label="CHECK24"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill="#002D72" />
    <text
      x="24"
      y="15.5"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="10"
      letterSpacing="0.8px"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >
      CHECK
    </text>
    <circle cx="24" cy="31.5" r="9" fill="#FFCC00" />
    <text
      x="24"
      y="31.5"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#002D72"
      fontWeight="900"
      fontSize="10.5"
      letterSpacing="-0.5px"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >
      24
    </text>
  </svg>
)
Check24Logo.displayName = 'Check24Logo'

export const SumupLogo: IconComponent = ({ size = 16, className }) => (
  <svg
    viewBox="0 0 48 48"
    width={typeof size === 'number' ? size : undefined}
    height={typeof size === 'number' ? size : undefined}
    style={{
      width: typeof size === 'number' ? `${size}px` : size,
      height: typeof size === 'number' ? `${size}px` : size,
      display: 'inline-block',
      verticalAlign: 'middle',
      borderRadius: '3px',
      flexShrink: 0,
    }}
    className={className}
    aria-label="SumUp"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill="#0050FF" />
    <text
      x="24"
      y="24"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="12.5"
      letterSpacing="-0.5px"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >
      sumup
    </text>
  </svg>
)
SumupLogo.displayName = 'SumupLogo'

export const ObiLogo: IconComponent = ({ size = 16, className }) => (
  <svg
    viewBox="0 0 48 48"
    width={typeof size === 'number' ? size : undefined}
    height={typeof size === 'number' ? size : undefined}
    style={{
      width: typeof size === 'number' ? `${size}px` : size,
      height: typeof size === 'number' ? `${size}px` : size,
      display: 'inline-block',
      verticalAlign: 'middle',
      borderRadius: '3px',
      flexShrink: 0,
    }}
    className={className}
    aria-label="OBI"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill="#FF6600" />
    <text
      x="24"
      y="25"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="17"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letterSpacing="-0.5px"
    >
      OBI
    </text>
  </svg>
)
ObiLogo.displayName = 'ObiLogo'

export const BauhausLogo: IconComponent = ({ size = 16, className }) => (
  <svg
    viewBox="0 0 48 48"
    width={typeof size === 'number' ? size : undefined}
    height={typeof size === 'number' ? size : undefined}
    style={{
      width: typeof size === 'number' ? `${size}px` : size,
      height: typeof size === 'number' ? `${size}px` : size,
      display: 'inline-block',
      verticalAlign: 'middle',
      borderRadius: '3px',
      flexShrink: 0,
    }}
    className={className}
    aria-label="BAUHAUS"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill="#D40000" />
    {/* 3 iconic interlocking pitched house outlines */}
    <g fill="#FFFFFF">
      <path d="M 14 18 L 20 12 L 26 18 L 26 27 L 14 27 Z" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinejoin="miter" />
      <path d="M 22 18 L 28 12 L 34 18 L 34 27 L 22 27 Z" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinejoin="miter" />
    </g>
    <text
      x="24"
      y="38.5"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="6.5"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letterSpacing="0.8px"
    >
      BAUHAUS
    </text>
  </svg>
)
BauhausLogo.displayName = 'BauhausLogo'

export const HornbachLogo: IconComponent = ({ size = 16, className }) => (
  <svg
    viewBox="0 0 48 48"
    width={typeof size === 'number' ? size : undefined}
    height={typeof size === 'number' ? size : undefined}
    style={{
      width: typeof size === 'number' ? `${size}px` : size,
      height: typeof size === 'number' ? `${size}px` : size,
      display: 'inline-block',
      verticalAlign: 'middle',
      borderRadius: '3px',
      flexShrink: 0,
    }}
    className={className}
    aria-label="HORNBACH"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill="#F28C00" />
    {/* Hornbach iconic hammer emblem */}
    <path
      d="M 17 15 L 31 15 L 31 21 L 27 21 L 27 29 L 21 29 L 21 21 L 17 21 Z"
      fill="#000000"
    />
    <text
      x="24"
      y="39"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="6"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letterSpacing="0.5px"
    >
      HORNBACH
    </text>
  </svg>
)
HornbachLogo.displayName = 'HornbachLogo'

export const TchiboLogo: IconComponent = ({ size = 16, className }) => (
  <svg
    viewBox="0 0 48 48"
    width={typeof size === 'number' ? size : undefined}
    height={typeof size === 'number' ? size : undefined}
    style={{
      width: typeof size === 'number' ? `${size}px` : size,
      height: typeof size === 'number' ? `${size}px` : size,
      display: 'inline-block',
      verticalAlign: 'middle',
      borderRadius: '3px',
      flexShrink: 0,
    }}
    className={className}
    aria-label="Tchibo"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill="#072042" />
    {/* Tchibo iconic golden coffee bean with aroma steam */}
    <g fill="#DCA432">
      {/* Left lobe of bean */}
      <path d="M 23 8 C 16 9 14 15 14 19.5 C 14 24.5 17.5 27.5 22.5 27.8 C 21.2 24.5 21 20 22.8 15 C 23.3 13.5 23.2 10.5 23 8 Z" />
      {/* Right lobe of bean */}
      <path d="M 25 8.2 C 25.2 10.5 25.1 13.5 24.6 15 C 22.8 20 23 24.5 24.3 27.8 C 29.5 27.5 33 24.5 33 19.5 C 33 15 31 9 25 8.2 Z" />
      {/* Steam swirl */}
      <path
        d="M 23.2 8.5 C 23 5.5 25.5 4.5 27 3.5 C 27.8 2.8 27.2 2 26 2 C 24.2 2 23.5 3.5 23.5 5"
        fill="none"
        stroke="#DCA432"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </g>
    <text
      x="24"
      y="38"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="800"
      fontSize="8.5"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letterSpacing="0.2px"
    >
      Tchibo
    </text>
  </svg>
)
TchiboLogo.displayName = 'TchiboLogo'

export const DellLogo: IconComponent = ({ size = 16, className }) => (
  <svg
    viewBox="0 0 48 48"
    width={typeof size === 'number' ? size : undefined}
    height={typeof size === 'number' ? size : undefined}
    style={{
      width: typeof size === 'number' ? `${size}px` : size,
      height: typeof size === 'number' ? `${size}px` : size,
      display: 'inline-block',
      verticalAlign: 'middle',
      borderRadius: '3px',
      flexShrink: 0,
    }}
    className={className}
    aria-label="Dell"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill="#007DB8" />
    <g transform="translate(7.2, 7.2) scale(1.4)" fill="#FFFFFF">
      <path d="M17.963 14.6V9.324h1.222v4.204h2.14v1.07h-3.362zm-9.784-3.288l2.98-2.292c.281.228.56.458.841.687l-2.827 2.14.611.535 2.827-2.216c.281.228.56.458.841.688a295.83 295.83 0 0 1-2.827 2.216l.61.536 2.83-2.295-.001-1.986h1.223v4.204h2.216v1.07h-3.362v-1.987c-.995.763-1.987 1.529-2.981 2.292l-2.981-2.292c-.144.729-.653 1.36-1.312 1.694-.285.147-.597.24-.915.276-.183.022-.367.017-.551.017H3.516V9.325H5.69a2.544 2.544 0 0 1 1.563.557c.454.36.778.872.927 1.43m-3.516-.917v3.21l.953-.001a1.377 1.377 0 0 0 1.036-.523 1.74 1.74 0 0 0 .182-1.889 1.494 1.494 0 0 0-.976-.766c-.166-.04-.338-.03-.507-.032h-.688zM11.82 0h.337a11.94 11.94 0 0 1 5.405 1.373 12.101 12.101 0 0 1 4.126 3.557A11.93 11.93 0 0 1 24 11.82v.36a11.963 11.963 0 0 1-3.236 8.033A11.967 11.967 0 0 1 12.182 24h-.361a11.993 11.993 0 0 1-4.145-.806 12.04 12.04 0 0 1-4.274-2.836A12.057 12.057 0 0 1 .576 15.67 12.006 12.006 0 0 1 0 12.181v-.361a11.924 11.924 0 0 1 1.992-6.396 12.211 12.211 0 0 1 4.71-4.172A11.875 11.875 0 0 1 11.82 0m-.153 1.23a10.724 10.724 0 0 0-6.43 2.375 10.78 10.78 0 0 0-3.319 4.573 10.858 10.858 0 0 0 .193 8.12 10.788 10.788 0 0 0 3.546 4.421 10.698 10.698 0 0 0 4.786 1.946c1.456.209 2.955.124 4.376-.26a10.756 10.756 0 0 0 5.075-3.062 10.742 10.742 0 0 0 2.686-5.28 10.915 10.915 0 0 0-.122-4.682 10.77 10.77 0 0 0-7.098-7.626 10.78 10.78 0 0 0-3.693-.525z" />
    </g>
  </svg>
)
DellLogo.displayName = 'DellLogo'


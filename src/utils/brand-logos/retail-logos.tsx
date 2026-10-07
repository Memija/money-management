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
      borderRadius: 'inherit',
      flexShrink: 0,
    }}
    className={['brand-logo-full', className].filter(Boolean).join(' ')}
    data-brand-logo="true"
    aria-label="CHECK24"
    role="img"
  >
    <rect width="48" height="48" fill="#002D72" />
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
export { Check24Logo as CHECK24Logo }

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

export const IntratecLogo: IconComponent = ({ size = 16, className }) => (
  <svg
    viewBox="0 0 48 48"
    width={typeof size === 'number' ? size : undefined}
    height={typeof size === 'number' ? size : undefined}
    style={{
      width: typeof size === 'number' ? `${size}px` : size,
      height: typeof size === 'number' ? `${size}px` : size,
      display: 'inline-block',
      verticalAlign: 'middle',
      borderRadius: '8px',
      overflow: 'hidden',
      flexShrink: 0,
    }}
    className={className}
    aria-label="INTRA-TEC"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill="#111111" />
    <rect
      x="0.5"
      y="0.5"
      width="47"
      height="47"
      rx="7.5"
      fill="none"
      stroke="rgba(255, 255, 255, 0.15)"
      strokeWidth="1"
    />
    <g transform="translate(6.9, 6.9) scale(0.38) translate(-4.6, 0)">
      <path
        d="M8.34,3.76h82.22v31.28h3.7V.76c0-.25,0-.51,0-.76H4.65c-.01.16-.03.31-.03.47v63.25h3.72V3.76ZM4.61,83.06v6.12c0,.17.02.35.03.52h.1c.22-.02.44-.05.66-.05,29.37,0,58.75,0,88.12,0h.7v-6.6h-3.68v2.87H8.32v-2.85h-3.71ZM9.28,79.45c2.03-.88,3.28-2.46,3.87-4.54h15.51c1.13,3.91,4.54,5.32,7.1,5.06,3.1-.31,5.48-2.53,5.98-5.6.24-1.43.02-2.81-.66-4.1-.94-1.78-2.41-2.89-4.33-3.42v-15.53c2.56-.74,4.19-2.39,4.92-4.92h15.53c.32,1.21.9,2.27,1.78,3.15s1.95,1.44,3.13,1.77v15.51c-4.04,1.17-5.4,4.76-5.04,7.42.39,2.82,2.72,5.25,5.56,5.67,1.51.22,2.94-.01,4.27-.75,1.69-.94,2.75-2.39,3.26-4.25h15.53c.06.19.12.38.19.57,1.11,3.28,4.57,5.16,7.93,4.32,3.31-.83,5.49-4.1,4.96-7.47-.48-3.05-2.99-5.38-6.02-5.62-3.13-.24-5.96,1.64-6.9,4.62-.12.37-.27.48-.65.48-4.86-.01-9.72-.01-14.58,0-.34,0-.48-.1-.59-.43-.71-2.2-2.19-3.66-4.38-4.39-.13-.04-.26-.09-.39-.14v-15.52c2.55-.74,4.19-2.39,4.92-4.92h15.5c1.16,4.05,4.88,5.52,7.71,4.99,3.07-.58,5.31-3.15,5.46-6.32.14-3.03-1.89-5.82-4.86-6.65-1.48-.41-2.95-.33-4.37.27-2.05.88-3.33,2.46-3.92,4.58-.12,0-.2.02-.28.02-4.96,0-9.91,0-14.87,0-.29,0-.4-.09-.49-.37-.72-2.26-2.22-3.75-4.47-4.48-.12-.04-.23-.09-.33-.13v-15.49c3.51-.94,5.54-4.2,5-7.53-.51-3.18-3.16-5.52-6.31-5.62-3.21-.1-6.02,2.02-6.74,5.11-.36,1.55-.2,3.06.51,4.48.92,1.85,2.43,3,4.4,3.55v15.48s-.04.05-.05.05c-.13.05-.27.09-.41.13-2.15.74-3.61,2.18-4.32,4.34-.12.37-.28.48-.66.47-4.85-.01-9.69,0-14.54,0h-.49c-.43-1.63-1.3-2.94-2.65-3.9-1.38-.97-2.92-1.36-4.59-1.17-2.93.32-5.32,2.59-5.81,5.46-.24,1.45-.05,2.84.62,4.15.93,1.82,2.43,2.95,4.37,3.49v15.53c-1.22.33-2.27.91-3.15,1.79-.88.88-1.44,1.95-1.77,3.12h-15.52c-1.06-3.74-4.4-5.44-7.37-5.03-3.2.45-5.56,2.98-5.78,6.17-.21,3.09,1.82,5.98,4.81,6.82,1.52.43,3.01.35,4.46-.28h0ZM28.52,16.32c0,3.66,2.97,6.65,6.63,6.67,3.7.01,6.68-2.95,6.69-6.64,0-3.68-2.95-6.65-6.62-6.66-3.69-.01-6.69,2.96-6.69,6.64h0ZM90.57,63.73h3.66v-9.19h-3.66v9.19Z"
        fill="#FFFFFF"
      />
    </g>
  </svg>
)
IntratecLogo.displayName = 'IntratecLogo'

export { IntratecLogo as IntraTecLogo }

/**
 * Official vector logo of cadooz GmbH (Hamburg voucher, gift card, and incentive rewards provider).
 * Features cadooz's signature royal indigo card (#2D2E83) with the interlocking white and
 * orange gradient ribbon loops representing gift vouchers and rewards.
 */
export const CadoozLogo: IconComponent = ({ size = 16, className }) => (
  <svg
    viewBox="0 0 48 48"
    width={typeof size === 'number' ? size : undefined}
    height={typeof size === 'number' ? size : undefined}
    style={{
      width: typeof size === 'number' ? `${size}px` : size,
      height: typeof size === 'number' ? `${size}px` : size,
      display: 'inline-block',
      verticalAlign: 'middle',
      borderRadius: '8px',
      overflow: 'hidden',
      flexShrink: 0,
    }}
    className={className}
    aria-label="cadooz"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill="#2D2E83" />
    <rect
      x="0.5"
      y="0.5"
      width="47"
      height="47"
      rx="7.5"
      fill="none"
      stroke="rgba(255, 255, 255, 0.15)"
      strokeWidth="1"
    />
    <defs>
      <linearGradient id="cadoozOrange" gradientUnits="userSpaceOnUse" x1="21.43" y1="21.82" x2="33.71" y2="9.53">
        <stop offset="0" stopColor="#E94E1B" />
        <stop offset="1" stopColor="#F29100" />
      </linearGradient>
      <linearGradient id="cadoozGloss" gradientUnits="userSpaceOnUse" x1="29.48" y1="10.26" x2="25.91" y2="20.08">
        <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
        <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.3" />
      </linearGradient>
    </defs>
    <g transform="translate(-4.74, 5.04) scale(1.2)">
      {/* White Loop */}
      <path
        fill="#FFFFFF"
        d="M31.1,15.8c0,0.8-0.3,1.6-0.9,2.2l-7.9,7.9c-0.6,0.6-1.4,0.9-2.2,0.9c-0.8,0-1.6-0.3-2.2-0.9l-7.9-7.9c-0.6-0.6-0.9-1.4-0.9-2.2c0-0.8,0.3-1.6,0.9-2.2L18,5.7c0.6-0.6,1.3-0.9,2.2-0.9c0.8,0,1.6,0.3,2.2,0.9l1.1,1.2l-1.9,1.9l-1-1c-0.1-0.1-0.3-0.2-0.5-0.2c-0.2,0-0.4,0.1-0.5,0.2l-7.5,7.5c-0.3,0.3-0.3,0.7,0,1l7.5,7.5c0.1,0.1,0.3,0.2,0.5,0.2c0.2,0,0.3-0.1,0.5-0.2l7.5-7.5c0.1-0.1,0.2-0.3,0.2-0.5c0-0.2-0.1-0.4-0.2-0.5l-4-4L26,9.4l4.2,4.2C30.8,14.2,31.1,15,31.1,15.8z"
      />
      {/* Orange Gradient Loop */}
      <path
        fill="url(#cadoozOrange)"
        d="M38.4,15.8c0,0.8-0.3,1.6-0.9,2.2l-7.9,7.9c-0.6,0.6-1.3,0.9-2.2,0.9c-0.8,0-1.6-0.3-2.2-0.9l-1.1-1.2l1.9-1.9l1,0.9c0.1,0.1,0.3,0.2,0.5,0.2c0.2,0,0.4-0.1,0.5-0.2l7.5-7.5c0.1-0.1,0.2-0.3,0.2-0.5c0-0.2-0.1-0.4-0.2-0.5L28,7.8c-0.1-0.1-0.3-0.2-0.5-0.2c-0.2,0-0.4,0.1-0.5,0.2l-7.5,7.5c-0.3,0.3-0.3,0.7,0,1l4,4l-1.9,1.9l-4.2-4.2c-0.6-0.6-0.9-1.4-0.9-2.2c0-0.8,0.3-1.6,0.9-2.2l7.9-7.9c0.6-0.6,1.3-0.9,2.2-0.9c0.8,0,1.6,0.3,2.2,0.9l7.9,7.9C38.1,14.2,38.4,15,38.4,15.8z"
      />
      {/* Translucent Highlight Gloss */}
      <path
        fill="url(#cadoozGloss)"
        d="M38.4,15.8c0-0.8-0.3-1.6-0.9-2.2l-7.9-7.9c-0.6-0.6-1.3-0.9-2.2-0.9c-0.8,0-1.6,0.3-2.2,0.9l-7.9,7.9c-0.4,0.4-0.7,0.9-0.8,1.4c1,0.5,2.1,1,3.1,1.5l-0.3-0.3c-0.3-0.3-0.3-0.7,0-1L27,7.8c0.1-0.1,0.3-0.2,0.5-0.2c0.2,0,0.4,0.1,0.5,0.2l7.5,7.5c0.1,0.1,0.2,0.3,0.2,0.5c0,0.2-0.1,0.4-0.2,0.5l-2.8,2.8c0,0,0.1,0,0.1,0c1.3,0,2.6-0.1,3.9-0.2l0.9-0.9C38.1,17.3,38.4,16.6,38.4,15.8z"
      />
    </g>
  </svg>
)
CadoozLogo.displayName = 'CadoozLogo'

export { CadoozLogo as CadoozGmbHLogo }

/**
 * Official logo of PAYBACK (Payback Pay / Paymorrow / Payback GmbH).
 * Uses the official PAYBACK app icon featuring the signature royal blue background with the iconic 4 circles.
 */
export const PaybackLogo: IconComponent = ({ size = 16, className }) => (
  <img
    src="/brands/payback.png"
    alt="PAYBACK"
    width={typeof size === 'number' ? size : undefined}
    height={typeof size === 'number' ? size : undefined}
    style={{
      width: typeof size === 'number' ? `${size}px` : size,
      height: typeof size === 'number' ? `${size}px` : size,
      objectFit: 'contain',
      borderRadius: '3px',
      display: 'inline-block',
      verticalAlign: 'middle',
    }}
    className={className}
  />
)
PaybackLogo.displayName = 'PaybackLogo'

export { PaybackLogo as PaybackPayLogo, PaybackLogo as PaymorrowLogo }



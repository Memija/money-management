import type { IconComponent } from './types'

export const TkLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="Techniker Krankenkasse"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill="#005A9C" />
    <text
      x="24"
      y="23"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="19"
      letterSpacing="-0.5px"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >
      TK
    </text>
    <rect x="12" y="36" width="24" height="2.5" rx="1" fill="#00A3E0" />
  </svg>
)
TkLogo.displayName = 'TkLogo'

export const AokLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="AOK"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill="#007B3B" />
    <text
      x="24"
      y="22"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="15"
      letterSpacing="-0.5px"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >
      AOK
    </text>
    <path
      d="M 12 34 Q 24 40 36 34"
      stroke="#FFD100"
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
)
AokLogo.displayName = 'AokLogo'

export const BarmerLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="BARMER"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill="#007A3D" />
    <path
      d="M 10 32 C 18 36 30 36 38 31"
      stroke="#84BD00"
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
    />
    <text
      x="24"
      y="20"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="8.5"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letterSpacing="0.8px"
    >
      BARMER
    </text>
  </svg>
)
BarmerLogo.displayName = 'BarmerLogo'

export const DakLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="DAK-Gesundheit"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill="#E4002B" />
    <text
      x="24"
      y="19"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="15"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letterSpacing="-0.5px"
    >
      DAK
    </text>
    <text
      x="24"
      y="34"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="700"
      fontSize="5.5"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letterSpacing="0.3px"
    >
      gesundheit
    </text>
  </svg>
)
DakLogo.displayName = 'DakLogo'

export const ShopApothekeLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="Shop Apotheke"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill="#E30613" />
    <path
      d="M 24 10 L 24 24 M 17 17 L 31 17"
      stroke="#FFFFFF"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <text
      x="24"
      y="32"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="6.5"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letterSpacing="-0.2px"
    >
      shop
    </text>
    <text
      x="24"
      y="39.5"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="700"
      fontSize="5"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letterSpacing="0.2px"
    >
      apotheke
    </text>
  </svg>
)
ShopApothekeLogo.displayName = 'ShopApothekeLogo'

export const DocMorrisLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="DocMorris"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill="#008542" />
    <circle cx="18" cy="18" r="5" fill="#FFFFFF" />
    <circle cx="30" cy="18" r="5" fill="#78BE20" />
    <text
      x="24"
      y="34"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="6.5"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letterSpacing="-0.2px"
    >
      DocMorris
    </text>
  </svg>
)
DocMorrisLogo.displayName = 'DocMorrisLogo'

/** Münchener Verein — German insurance group specializing in health and supplementary insurance. */
export const MuenchenerVereinLogo: IconComponent = ({ size = 16, className }) => (
  <img
    src="/brands/muenchener-verein.png"
    alt="Münchener Verein"
    role="img"
    aria-label="Münchener Verein"
    width={typeof size === 'number' ? size : undefined}
    height={typeof size === 'number' ? size : undefined}
    className={className}
    style={{
      width: typeof size === 'number' ? `${size}px` : size,
      height: typeof size === 'number' ? `${size}px` : size,
      display: 'inline-block',
      verticalAlign: 'middle',
      borderRadius: '4px',
      objectFit: 'contain',
      flexShrink: 0,
    }}
  />
)
MuenchenerVereinLogo.displayName = 'MuenchenerVereinLogo'

/** Apotheke (Deutscher Apothekerverband) — universal German pharmacy symbol. */
export const ApothekeLogo: IconComponent = ({ size = 16, className }) => (
  <img
    src="/brands/apotheke.png"
    alt="Apotheke"
    width={typeof size === 'number' ? size : undefined}
    height={typeof size === 'number' ? size : undefined}
    className={className}
    style={{
      width: typeof size === 'number' ? `${size}px` : size,
      height: typeof size === 'number' ? `${size}px` : size,
      display: 'inline-block',
      verticalAlign: 'middle',
      borderRadius: '4px',
      objectFit: 'contain',
      flexShrink: 0,
    }}
    role="img"
    aria-label="Apotheke"
  />
)
ApothekeLogo.displayName = 'ApothekeLogo'


import type { IconComponent } from './types'

export const MicrosoftLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="Microsoft"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill="#F3F4F6" />
    <rect x="10" y="10" width="13" height="13" rx="1.5" fill="#F25022" />
    <rect x="25" y="10" width="13" height="13" rx="1.5" fill="#7FBA00" />
    <rect x="10" y="25" width="13" height="13" rx="1.5" fill="#00A4EF" />
    <rect x="25" y="25" width="13" height="13" rx="1.5" fill="#FFB900" />
  </svg>
)
MicrosoftLogo.displayName = 'MicrosoftLogo'

export const HpLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="HP"
    role="img"
  >
    <circle cx="24" cy="24" r="21" fill="#0096D6" />
    <text
      x="24"
      y="26"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="22"
      fontStyle="italic"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letterSpacing="-1.5px"
    >
      hp
    </text>
  </svg>
)
HpLogo.displayName = 'HpLogo'

export const LogitechLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="Logitech"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill="#00B8FC" />
    <text
      x="24"
      y="26"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="15"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letterSpacing="-0.5px"
    >
      logi
    </text>
  </svg>
)
LogitechLogo.displayName = 'LogitechLogo'

export const CanonLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="Canon"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill="#CC0000" />
    <text
      x="24"
      y="26"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="12.5"
      fontFamily="Georgia, 'Times New Roman', serif"
      letterSpacing="0.5px"
    >
      Canon
    </text>
  </svg>
)
CanonLogo.displayName = 'CanonLogo'

export const PhilipsLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="Philips"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill="#0B5EAA" />
    <text
      x="24"
      y="26"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="9.5"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letterSpacing="1px"
    >
      PHILIPS
    </text>
  </svg>
)
PhilipsLogo.displayName = 'PhilipsLogo'

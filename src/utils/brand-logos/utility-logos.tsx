import type { IconComponent } from './types'

export const BeitragsserviceLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="ARD ZDF Deutschlandradio Beitragsservice"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill="#002D5A" />
    <text
      x="24"
      y="16"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="8.5"
      letterSpacing="0.5px"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >
      ARD ZDF
    </text>
    <rect x="8" y="24" width="32" height="1" fill="#FFFFFF" opacity="0.3" />
    <text
      x="24"
      y="34"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFB800"
      fontWeight="700"
      fontSize="5.5"
      letterSpacing="0.3px"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >
      BEITRAG
    </text>
  </svg>
)
BeitragsserviceLogo.displayName = 'BeitragsserviceLogo'

export const EinsUndEinsLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="1&1"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill="#00267F" />
    <text
      x="24"
      y="24"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="15"
      letterSpacing="-0.5px"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >
      1&amp;1
    </text>
  </svg>
)
EinsUndEinsLogo.displayName = 'EinsUndEinsLogo'

export const SuewagLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="Süwag"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill="#004B87" />
    <path
      d="M 8 36 C 18 31 30 39 40 33"
      stroke="#E30613"
      strokeWidth="3.5"
      fill="none"
      strokeLinecap="round"
    />
    <text
      x="24"
      y="21"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="13"
      letterSpacing="-0.3px"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >
      Süwag
    </text>
  </svg>
)
SuewagLogo.displayName = 'SuewagLogo'

export const EonLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="E.ON"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill="#ED1C24" />
    <text
      x="24"
      y="24"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="15"
      letterSpacing="-0.5px"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >
      e.on
    </text>
  </svg>
)
EonLogo.displayName = 'EonLogo'

export const VattenfallLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="Vattenfall"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill="#003B7A" />
    <circle cx="24" cy="18" r="7" fill="#FFD100" />
    <path
      d="M 12 36 C 18 30 30 30 36 36"
      stroke="#00A3E0"
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
)
VattenfallLogo.displayName = 'VattenfallLogo'

export const AllianzLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="Allianz"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill="#003780" />
    <circle cx="24" cy="17" r="9" fill="none" stroke="#FFFFFF" strokeWidth="2" />
    <line x1="20" y1="13" x2="20" y2="21" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
    <line x1="24" y1="11" x2="24" y2="23" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
    <line x1="28" y1="13" x2="28" y2="21" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
    <text
      x="24"
      y="36"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="8"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letterSpacing="-0.2px"
    >
      Allianz
    </text>
  </svg>
)
AllianzLogo.displayName = 'AllianzLogo'

export const HukLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="HUK-COBURG"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill="#FFCC00" />
    <path
      d="M 18 10 L 30 10 L 30 18 C 30 23 24 26 24 26 C 24 26 18 23 18 18 Z"
      fill="#000000"
    />
    <path
      d="M 21 13 L 27 13 L 27 17 C 27 20 24 22 24 22 C 24 22 21 20 21 17 Z"
      fill="#FFCC00"
    />
    <text
      x="24"
      y="33"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#000000"
      fontWeight="900"
      fontSize="6.5"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letterSpacing="-0.2px"
    >
      HUK-COBURG
    </text>
    <text
      x="24"
      y="40"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#000000"
      fontWeight="700"
      fontSize="4"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letterSpacing="0.4px"
    >
      Aus Tradition günstig
    </text>
  </svg>
)
HukLogo.displayName = 'HukLogo'

export const KlarmobilLogo: IconComponent = ({ size = 16, className }) => (
  <img
    src="/brands/klarmobil.png"
    alt="klarmobil.de"
    width={typeof size === 'number' ? size : undefined}
    height={typeof size === 'number' ? size : undefined}
    style={{
      width: typeof size === 'number' ? `${size}px` : size,
      height: typeof size === 'number' ? `${size}px` : size,
      display: 'inline-block',
      verticalAlign: 'middle',
      borderRadius: '4px',
      objectFit: 'contain',
      flexShrink: 0,
    }}
    className={className}
    role="img"
    aria-label="klarmobil.de"
  />
)
KlarmobilLogo.displayName = 'KlarmobilLogo'

export { KlarmobilLogo as KlarmobilDeLogo }


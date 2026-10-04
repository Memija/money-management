import type { IconComponent } from './types'

export const BpLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="BP"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill="#007A3D" />
    <path
      d="M 24.0 5.5 L 25.7 10.7 L 29.2 6.5 L 28.7 11.9 L 33.5 9.5 L 31.1 14.3 L 36.5 13.8 L 32.3 17.3 L 37.5 19.0 L 32.3 20.7 L 36.5 24.2 L 31.1 23.7 L 33.5 28.5 L 28.7 26.1 L 29.2 31.5 L 25.7 27.3 L 24.0 32.5 L 22.3 27.3 L 18.8 31.5 L 19.3 26.1 L 14.5 28.5 L 16.9 23.7 L 11.5 24.2 L 15.7 20.7 L 10.5 19.0 L 15.7 17.3 L 11.5 13.8 L 16.9 14.3 L 14.5 9.5 L 19.3 11.9 L 18.8 6.5 L 22.3 10.7 Z"
      fill="#78BE20"
    />
    <path
      d="M 25.9 9.4 L 26.1 13.9 L 29.4 10.9 L 27.9 15.1 L 32.1 13.6 L 29.1 16.9 L 33.6 17.1 L 29.5 19.0 L 33.6 20.9 L 29.1 21.1 L 32.1 24.4 L 27.9 22.9 L 29.4 27.1 L 26.1 24.1 L 25.9 28.6 L 24.0 24.5 L 22.1 28.6 L 21.9 24.1 L 18.6 27.1 L 20.1 22.9 L 15.9 24.4 L 18.9 21.1 L 14.4 20.9 L 18.5 19.0 L 14.4 17.1 L 18.9 16.9 L 15.9 13.6 L 20.1 15.1 L 18.6 10.9 L 21.9 13.9 L 22.1 9.4 L 24.0 13.5 Z"
      fill="#FFD100"
    />
    <circle cx="24" cy="19" r="4" fill="#FFFFFF" />
    <text
      x="24"
      y="39"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="13"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letterSpacing="-0.5px"
    >
      bp
    </text>
  </svg>
)
BpLogo.displayName = 'BpLogo'

export const JetLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="JET"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill="#FFD100" />
    <g transform="translate(8, 8) scale(1.33)" fill="#003B7A">
      <path d="M15.778 19.044c3.048-.498 4.755-.73 8.219-2.395L24 13.81c-3.228 3.225-9.249 5.146-15.07 5.098-.75-.01-1.948.017-2.246-.024 3.1.49 6.18.556 9.094.159M3.836 15.764c.75.003 1.805-.014 2.403-.394.535-.467.93-1.106 1.247-1.828l1.545-4.697-2.157.013-1.199 3.664c-.225 1.161-.943 1.566-1.483 1.483l-1.354-.097-.515 1.676 1.513.18m13.29-.104l1.672-5.074h2.44l.543-1.665-5.907-.01-.556 1.662H16.6l-1.73 5.077 2.257.01m-3.859-.024l.564-1.718h-3.204l.297-.909h2.668l.543-1.641h-2.661l.262-.81h3.08l.57-1.713-5.267.027-2.205 6.757 5.353.007m1.245-9.809c1.883-.072 3.743.083 5.969.277-2.192-.809-5.7-1.407-8.344-1.407-4.344 0-8.644 1.054-12.117 2.675L0 11.07c3.321-3.387 9.114-5.298 14.513-5.243" />
    </g>
  </svg>
)
JetLogo.displayName = 'JetLogo'

export const EssoLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="Esso"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill="#003882" />
    <ellipse cx="24" cy="24" rx="20" ry="14" fill="#FFFFFF" stroke="#ED1B24" strokeWidth="2.5" />
    <text
      x="24"
      y="24"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#ED1B24"
      fontWeight="900"
      fontSize="14"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letterSpacing="-0.5px"
    >
      Esso
    </text>
  </svg>
)
EssoLogo.displayName = 'EssoLogo'

export const AviaLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="AVIA"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill="#E30613" />
    <path d="M 0 32 L 48 20 L 48 48 L 0 48 Z" fill="#B3050F" />
    <text
      x="24"
      y="24"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="14"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letterSpacing="1px"
    >
      AVIA
    </text>
  </svg>
)
AviaLogo.displayName = 'AviaLogo'

export const EniLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="Eni"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill="#FFD100" />
    <text
      x="22"
      y="26"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#000000"
      fontWeight="900"
      fontSize="19"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >
      eni
    </text>
    <circle cx="33" cy="17" r="2.5" fill="#ED1C24" />
  </svg>
)
EniLogo.displayName = 'EniLogo'

export const TurmoelLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="Turmöl"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill="#E30613" />
    <path
      d="M 18 34 L 18 20 L 22 14 L 26 14 L 30 20 L 30 34 Z M 22 24 L 26 24 L 26 28 L 22 28 Z"
      fill="#FFFFFF"
    />
    <text
      x="24"
      y="40"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="7.5"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letterSpacing="0.5px"
    >
      TURMÖL
    </text>
  </svg>
)
TurmoelLogo.displayName = 'TurmoelLogo'

export const IonityLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="IONITY"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill="#121212" />
    <path d="M 16 12 L 22 12 L 22 36 L 16 36 Z" fill="#00A3E0" />
    <path d="M 26 12 L 32 12 L 32 36 L 26 36 Z" fill="#FFFFFF" />
    <circle cx="29" cy="18" r="4" fill="#00A3E0" />
    <text
      x="24"
      y="41"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#00A3E0"
      fontWeight="900"
      fontSize="6.5"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letterSpacing="1px"
    >
      IONITY
    </text>
  </svg>
)
IonityLogo.displayName = 'IonityLogo'

export const EnbwLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="EnBW"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill="#001C3D" />
    <text
      x="21"
      y="24"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FF6600"
      fontWeight="900"
      fontSize="13"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letterSpacing="-0.3px"
    >
      EnBW
    </text>
    <text
      x="37"
      y="22"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#00A3E0"
      fontWeight="900"
      fontSize="15"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >
      +
    </text>
  </svg>
)
EnbwLogo.displayName = 'EnbwLogo'

export const FastnedLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="Fastned"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill="#FFD100" />
    <path d="M 14 30 L 24 14 L 34 30 Z" fill="#1A1A1A" />
    <path d="M 19 30 L 24 20 L 29 30 Z" fill="#FFD100" />
    <text
      x="24"
      y="38"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#1A1A1A"
      fontWeight="900"
      fontSize="6"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letterSpacing="0.8px"
    >
      FASTNED
    </text>
  </svg>
)
FastnedLogo.displayName = 'FastnedLogo'

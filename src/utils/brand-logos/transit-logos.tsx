import type { IconComponent } from './types'

export {
  AviaLogo,
  BpLogo,
  EnbwLogo,
  EniLogo,
  EssoLogo,
  FastnedLogo,
  IonityLogo,
  JetLogo,
  TurmoelLogo,
} from './fuel-logos'

export const RmvLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="RMV"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill="#005B9C" />
    <path
      d="M 6 37 Q 24 31 42 37"
      stroke="#FFCC00"
      strokeWidth="3.5"
      fill="none"
      strokeLinecap="round"
    />
    <text
      x="50%"
      y="49%"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="16"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letterSpacing="-0.5px"
    >
      RMV
    </text>
  </svg>
)
RmvLogo.displayName = 'RmvLogo'

export const HvvLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="HVV"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill="#004B87" />
    <path d="M 0 34 L 48 24 L 48 48 L 0 48 Z" fill="#D40E14" />
    <text
      x="50%"
      y="47%"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="16"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >
      hvv
    </text>
  </svg>
)
HvvLogo.displayName = 'HvvLogo'

export const FlixLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="Flix"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill="#73D700" />
    <text
      x="50%"
      y="50%"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="14"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letterSpacing="-0.5px"
    >
      FLIX
    </text>
  </svg>
)
FlixLogo.displayName = 'FlixLogo'

export const OebbLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="ÖBB"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill="#D91A15" />
    <text
      x="50%"
      y="50%"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="15"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >
      ÖBB
    </text>
  </svg>
)
OebbLogo.displayName = 'OebbLogo'

export const VrrLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="VRR"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill="#009640" />
    <text
      x="50%"
      y="50%"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="15"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >
      VRR
    </text>
  </svg>
)
VrrLogo.displayName = 'VrrLogo'

export const AsfinagLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="ASFINAG"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill="#F39200" />
    <path
      d="M 12 34 L 21 13 L 27 13 L 36 34 L 31 34 L 28 27 L 20 27 L 17 34 Z M 22 22 L 26 22 L 24 16 Z"
      fill="#FFFFFF"
    />
    <text
      x="24"
      y="40"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="6.5"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letterSpacing="0.8px"
    >
      ASFINAG
    </text>
  </svg>
)
AsfinagLogo.displayName = 'AsfinagLogo'

export const SixtLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="SIXT"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill="#FF5F00" />
    <text
      x="24"
      y="26"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#000000"
      fontWeight="900"
      fontSize="14.5"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letterSpacing="-0.3px"
    >
      SIXT
    </text>
  </svg>
)
SixtLogo.displayName = 'SixtLogo'

export const FairParkenLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="fair parken"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill="#002D62" />
    <rect x="6" y="11" width="13" height="26" rx="3" fill="#00529C" stroke="#FFFFFF" strokeWidth="1.5" />
    <text
      x="12.5"
      y="24"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="13"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >
      P
    </text>
    <text
      x="22"
      y="19"
      dominantBaseline="central"
      textAnchor="start"
      fill="#88C13F"
      fontWeight="900"
      fontSize="10"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letterSpacing="-0.3px"
    >
      fair
    </text>
    <text
      x="22"
      y="30"
      dominantBaseline="central"
      textAnchor="start"
      fill="#FFFFFF"
      fontWeight="800"
      fontSize="9.5"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letterSpacing="-0.3px"
    >
      parken
    </text>
  </svg>
)
FairParkenLogo.displayName = 'FairParkenLogo'

export const EasyParkLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="EasyPark"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill="#E5007D" />
    <circle cx="24" cy="24" r="16" fill="none" stroke="#FFFFFF" strokeWidth="3" />
    <text
      x="24"
      y="25.5"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="16"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >
      P
    </text>
  </svg>
)
EasyParkLogo.displayName = 'EasyParkLogo'

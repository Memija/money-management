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

export const HerokuLogo: IconComponent = ({ size = 16, className, color = '#430098' }) => (
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
    aria-label="Heroku"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill={color || '#430098'} />
    <g transform="translate(6, 6) scale(0.0703125)">
      <path
        d="M439.7 0H72.3C46.7 0 26.2 20.5 26.2 46.1v419.8c0 25.6 20.5 46.1 46.1 46.1h367.4c25.6 0 46.1-20.5 46.1-46.1V46.1c0-25.6-20.5-46.1-46.1-46.1m20.5 465.9c0 11.5-9 20.5-20.5 20.5H72.3c-11.5 0-20.5-9-20.5-20.5V46.1c0-11.5 9-20.5 20.5-20.5h367.4c11.5 0 20.5 9 20.5 20.5zm-318.8-30.7L199 384l-57.6-51.2zm207.4-207.4c-10.2-10.2-29.4-23-61.4-23-34.6 0-70.4 9-96 17.9V76.8h-51.2v221.4l35.8-16.6s58.9-26.9 110.1-26.9c25.6 0 32 14.1 32 26.9v153.6h51.2V281.6c1.3-3.8 1.3-32-20.5-53.8M281 160h51.2c23-26.9 34.6-53.8 38.4-83.2h-51.2c-5.2 29.4-18 56.3-38.4 83.2"
        fill="#FFFFFF"
      />
    </g>
  </svg>
)
HerokuLogo.displayName = 'HerokuLogo'


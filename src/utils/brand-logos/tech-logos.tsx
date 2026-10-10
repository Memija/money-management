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
      borderRadius: 'inherit',
      overflow: 'hidden',
      flexShrink: 0,
    }}
    className={['brand-logo-full', className].filter(Boolean).join(' ')}
    data-brand-logo="true"
    aria-label="Heroku"
    role="img"
  >
    <rect width="48" height="48" fill={color || '#430098'} />
    <g transform="translate(4, 4) scale(0.078125)">
      <path
        d="M439.7 0H72.3C46.7 0 26.2 20.5 26.2 46.1v419.8c0 25.6 20.5 46.1 46.1 46.1h367.4c25.6 0 46.1-20.5 46.1-46.1V46.1c0-25.6-20.5-46.1-46.1-46.1m20.5 465.9c0 11.5-9 20.5-20.5 20.5H72.3c-11.5 0-20.5-9-20.5-20.5V46.1c0-11.5 9-20.5 20.5-20.5h367.4c11.5 0 20.5 9 20.5 20.5zm-318.8-30.7L199 384l-57.6-51.2zm207.4-207.4c-10.2-10.2-29.4-23-61.4-23-34.6 0-70.4 9-96 17.9V76.8h-51.2v221.4l35.8-16.6s58.9-26.9 110.1-26.9c25.6 0 32 14.1 32 26.9v153.6h51.2V281.6c1.3-3.8 1.3-32-20.5-53.8M281 160h51.2c23-26.9 34.6-53.8 38.4-83.2h-51.2c-5.2 29.4-18 56.3-38.4 83.2"
        fill="#FFFFFF"
      />
    </g>
  </svg>
)
HerokuLogo.displayName = 'HerokuLogo'

/** Official Cloudflare cloud network and security brand tile. */
export const CloudflareLogo: IconComponent = ({ size = 16, className, color = '#F38020' }) => (
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
      overflow: 'hidden',
      flexShrink: 0,
    }}
    className={['brand-logo-full', className].filter(Boolean).join(' ')}
    data-brand-logo="true"
    aria-label="Cloudflare"
    role="img"
  >
    <rect width="48" height="48" fill={color || '#F38020'} />
    <g transform="translate(4.8, 14.5) scale(1.6)" fill="#FFFFFF">
      <path d="M16.5088 16.8447c.1475-.5068.0908-.9707-.1553-1.3154-.2246-.3164-.6045-.499-1.0615-.5205l-8.6592-.1123a.1559.1559 0 0 1-.1333-.0713c-.0283-.042-.0351-.0986-.021-.1553.0278-.084.1123-.1484.2036-.1562l8.7359-.1123c1.0351-.0489 2.1601-.8868 2.5537-1.9136l.499-1.3013c.0215-.0561.0293-.1128.0147-.168-.5625-2.5463-2.835-4.4453-5.5499-4.4453-2.5039 0-4.6284 1.6177-5.3876 3.8614-.4927-.3658-1.1187-.5625-1.794-.499-1.2026.119-2.1665 1.083-2.2861 2.2856-.0283.31-.0069.6128.0635.894C1.5683 13.171 0 14.7754 0 16.752c0 .1748.0142.3515.0352.5273.0141.083.0844.1475.1689.1475h15.9814c.0909 0 .1758-.0645.2032-.1553l.12-.4268zm2.7568-5.5634c-.0771 0-.1611 0-.2383.0112-.0566 0-.1054.0415-.127.0976l-.3378 1.1744c-.1475.5068-.0918.9707.1543 1.3164.2256.3164.6055.498 1.0625.5195l1.8437.1133c.0557 0 .1055.0263.1329.0703.0283.043.0351.1074.0214.1562-.0283.084-.1132.1485-.204.1553l-1.921.1123c-1.041.0488-2.1582.8867-2.5527 1.914l-.1406.3585c-.0283.0713.0215.1416.0986.1416h6.5977c.0771 0 .1474-.0489.169-.126.1122-.4082.1757-.837.1757-1.2803 0-2.6025-2.125-4.727-4.7344-4.727" />
    </g>
  </svg>
)
CloudflareLogo.displayName = 'CloudflareLogo'

/** Cyberport (Cyberport GmbH) — major German consumer electronics and IT hardware e-commerce retailer. */
export const CyberportLogo: IconComponent = ({ size = 16, className }) => (
  <img
    src="/brands/cyberport.png"
    alt="Cyberport"
    role="img"
    aria-label="Cyberport"
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
CyberportLogo.displayName = 'CyberportLogo'


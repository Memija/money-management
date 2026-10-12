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

const OPENAI_ICON_PATH =
  'M24 9.736V9.72c0-.018-.009-.035-.009-.053-.008-.017-.008-.034-.017-.052 0-.009-.009-.009-.009-.017a.19.19 0 0 0-.026-.044v-.009c-.009-.017-.026-.026-.044-.043l-.008-.009c-.018-.009-.035-.026-.053-.035l-3.72-2.143V3.02c0-.018 0-.044-.008-.061V2.94a.124.124 0 0 0-.017-.052V2.88c-.01-.017-.018-.035-.027-.043 0-.01-.008-.01-.008-.01a.19.19 0 0 0-.035-.043c-.018-.008-.026-.026-.044-.034-.008 0-.008-.01-.017-.01l-.009-.008L16.055.476a.338.338 0 0 0-.34 0l-3.72 2.143L8.286.476a.338.338 0 0 0-.34 0L4.06 2.723c-.01 0-.01.01-.01.01-.008 0-.008.008-.017.008-.017.009-.026.026-.043.035a.153.153 0 0 0-.035.043l-.009.009c-.008.017-.017.026-.026.044v.008c-.009.018-.009.035-.017.052v.018c0 .017-.009.043-.009.06v4.296L.166 9.457c-.018.01-.035.026-.053.035l-.008.009-.044.043v.01c-.009.017-.017.025-.026.043 0 .008-.009.008-.009.017a.124.124 0 0 0-.017.052C0 9.684 0 9.701 0 9.72v4.521a.34.34 0 0 0 .166.296l3.72 2.143v4.295a.34.34 0 0 0 .165.296l3.885 2.248c.009.008.018.008.026.017 0 0 .009 0 .009.009.009 0 .017.008.026.008.009 0 .009 0 .018.01.008 0 .017 0 .026.008h.061a.35.35 0 0 0 .13-.026c.018-.009.026-.009.044-.018l3.72-2.143 3.72 2.143c.017.009.026.018.043.018a.35.35 0 0 0 .13.026h.062c.008 0 .017 0 .026-.009.008 0 .008 0 .017-.009.009 0 .018-.008.026-.008.009 0 .009 0 .009-.009.009 0 .017-.009.026-.017l3.885-2.248a.34.34 0 0 0 .166-.296V16.68l3.72-2.143a.34.34 0 0 0 .165-.296V9.754c.009-.01.009-.018.009-.018zM12.17 20.67s-.009 0-.009-.009c-.009-.008-.017-.008-.035-.017-.008 0-.017-.009-.026-.009-.009 0-.017-.009-.035-.009-.008 0-.026-.008-.035-.008h-.069c-.009 0-.026 0-.035.008-.009 0-.017 0-.035.01-.009 0-.017.008-.026.008-.009.009-.017.009-.035.017 0 0-.009 0-.009.009l-3.37 1.951v-3.702l3.545-2.047 3.545 2.047v3.702zM4.4 7.793c.017-.017.025-.026.034-.026.009-.008.018-.008.026-.017l.026-.026c.01-.009.018-.018.018-.026.009-.01.009-.018.017-.026.009-.01.009-.018.018-.027.008-.008.008-.017.008-.034 0-.01.01-.018.01-.035 0-.009 0-.018.008-.035V3.603L7.77 5.46v4.094L4.225 11.6 1.02 9.745zm7.596-4.381l3.545 2.047V9.16l-3.38-1.951s-.009 0-.009-.009c-.008-.009-.017-.009-.034-.017-.01 0-.018-.009-.027-.009-.008 0-.017-.009-.034-.009-.01 0-.018-.008-.035-.008h-.07c-.009 0-.026 0-.035.008-.008 0-.017 0-.035.009-.008 0-.017.009-.026.009-.008.008-.026.008-.035.017 0 0-.008 0-.008.009L8.45 9.16v-3.7zm0 12.675L8.45 14.04V9.945l3.546-2.047 3.545 2.047v4.095zm-7.431-3.903l3.206-1.856v3.947c0 .008 0 .017.008.035 0 .008.009.017.009.034 0 .01.009.018.009.035.008.009.008.018.017.026.009.01.009.018.018.027.008.008.017.017.017.026l.026.026c.009.009.018.017.026.017.009.009.018.018.026.018l.01.008 3.38 1.952-3.207 1.855-3.545-2.047zm11.325 6.15l-3.206-1.855 3.38-1.952.009-.008c.008-.009.017-.018.026-.018.008-.008.017-.008.026-.017l.026-.026c.009-.009.017-.018.017-.026.01-.01.01-.018.018-.027.009-.008.009-.017.017-.026.009-.008.009-.017.009-.035 0-.008.009-.017.009-.034 0-.01 0-.018.008-.035v-3.947l3.206 1.856v4.094zm3.885-6.734l-3.546-2.047V5.46l3.206-1.856V7.55c0 .008 0 .017.009.034 0 .01.009.018.009.035 0 .009.008.018.008.035.01.009.01.018.018.026.008.009.008.018.017.026.009.01.018.018.018.026.008.01.017.018.026.027.008.008.017.017.026.017.009.009.017.017.026.017l.009.01 3.38 1.95zM15.89 1.164l3.205 1.856-3.205 1.855-3.206-1.855zm-7.78 0l3.206 1.856L8.11 4.866 4.905 3.02zM.68 10.337l3.205 1.856v3.702L.68 14.04zM7.77 22.62l-3.205-1.855v-3.703l3.206 1.856zm11.665-1.846l-3.206 1.855v-3.702l3.206-1.856zm3.886-6.734l-3.206 1.855v-3.702l3.206-1.856Z'

/** Official OpenAI brand tile for ChatGPT and API services. */
export const OpenAiLogo: IconComponent = ({ size = 16, className, color = '#10A37F' }) => (
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
    aria-label="OpenAI"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill={color || '#10A37F'} />
    <g transform="translate(8.5, 8.5) scale(1.29)" fill="#FFFFFF">
      <path d={OPENAI_ICON_PATH} />
    </g>
  </svg>
)
OpenAiLogo.displayName = 'OpenAiLogo'

/** Midjourney AI image generation subscription brand tile. */
export const MidjourneyLogo: IconComponent = ({ size = 16, className, color = '#000000' }) => (
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
    aria-label="Midjourney"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill={color || '#000000'} />
    <path d="M24 9L36.5 37H28.2L24 25.2L19.8 37H11.5L24 9Z" fill="#FFFFFF" />
    <path d="M24 16.5L30.5 32.5H26.2L24 25.8L21.8 32.5H17.5L24 16.5Z" fill={color || '#000000'} />
  </svg>
)
MidjourneyLogo.displayName = 'MidjourneyLogo'


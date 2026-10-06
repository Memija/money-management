import type { IconComponent } from './types'

/** ADAC — Allgemeiner Deutscher Automobil-Club e.V. (membership, roadside assistance). */
export const AdacLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="ADAC"
    role="img"
  >
    <rect width="48" height="48" fill="#FFCF00" />
    <text
      x="24"
      y="24"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#000000"
      fontWeight="900"
      fontSize="17"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Arial Black', Impact, sans-serif"
      letterSpacing="-0.5px"
    >
      ADAC
    </text>
  </svg>
)
AdacLogo.displayName = 'AdacLogo'

/** ACE Auto Club Europa e.V. */
export const AceLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="ACE Auto Club Europa"
    role="img"
  >
    <rect width="48" height="48" fill="#FFF200" />
    <text
      x="24"
      y="21"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#E30613"
      fontWeight="900"
      fontSize="17"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Arial Black', Impact, sans-serif"
      letterSpacing="-0.5px"
    >
      ACE
    </text>
    <text
      x="24"
      y="34.5"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#1A1A1A"
      fontWeight="800"
      fontSize="5.2"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
    >
      Auto Club Europa
    </text>
  </svg>
)
AceLogo.displayName = 'AceLogo'

/** AvD — Automobilclub von Deutschland e.V. */
export const AvdLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="AvD Automobilclub von Deutschland"
    role="img"
  >
    <rect width="48" height="48" fill="#003C7E" />
    <rect width="48" height="3.5" fill="#E30613" />
    <text
      x="24"
      y="26"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="17"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Arial Black', Impact, sans-serif"
      letterSpacing="-0.5px"
    >
      AvD
    </text>
  </svg>
)
AvdLogo.displayName = 'AvdLogo'

export {
  AdacLogo as AdacEvLogo,
  AceLogo as AutoClubEuropaLogo,
}


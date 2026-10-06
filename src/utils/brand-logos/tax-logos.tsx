import type { IconComponent } from './types'

export const WundertaxLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="wundertax"
    role="img"
  >
    <rect width="48" height="48" fill="#001233" />
    <g transform="translate(7.01, 10.30) scale(0.47)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M37.441 47.2815C38.5119 48.8963 38.8561 49.3192 39.5063 50.1651C42.1836 53.7407 46.5437 54.8557 48.9915 54.8557C56.6791 54.8557 59.7006 48.7041 61.001 44.6286C62.3014 40.5531 70.5245 15.6388 70.5245 15.6388C70.5245 15.6388 72.3221 10.6406 69.3771 5.64233C66.4321 0.644098 60.542 0.0289307 60.1978 0.0289307H11.2419C11.2419 0.0289307 4.47221 0.298066 1.71844 5.45009C-1.07358 10.5637 0.379799 14.1009 0.647527 14.9852C0.877008 15.831 8.83235 40.0533 10.3622 44.667C11.8921 49.2423 14.6459 54.7788 22.257 54.8942C29.8681 55.0095 33.9223 47.2815 33.9223 47.2815L45.97 28.442C45.97 28.442 47.4616 26.3658 47.4616 22.0596C47.4616 17.7534 43.2545 11.0635 35.5669 11.0635C27.8793 11.0635 23.7104 17.5997 23.7104 22.0596C23.7104 26.558 25.3932 28.788 25.3932 28.788L28.7207 34.1323L33.3486 27.4808C33.3486 27.4808 31.551 24.7894 31.551 22.7901C31.551 20.8293 32.6984 18.8684 35.4904 18.8684C38.2824 18.8684 39.468 21.1369 39.468 22.7901C39.468 24.4434 38.4736 25.9044 38.4736 25.9044C38.4736 25.9044 29.1797 39.1305 28.0705 40.9376C26.9613 42.7446 25.049 46.2818 22.1422 46.2818C19.2355 46.2818 18.0116 44.321 16.5965 40.0917C13.6514 31.0949 8.10566 13.3704 8.10566 13.3704C8.10566 13.3704 7.53196 11.1788 8.56462 9.56403C9.59728 7.98766 11.8538 7.91077 11.8538 7.91077H59.2417C60.3891 7.91077 64.252 9.29489 62.9516 13.1397C61.6894 16.946 56.2202 33.3633 53.6959 40.1302C53.2369 41.3221 51.86 46.3587 48.1883 46.3587C45.511 46.3587 44.2871 43.8596 41.6864 40.1302C40.0417 42.7062 38.7414 45.2822 37.441 47.2815Z"
        fill="#00CB9D"
      />
    </g>
  </svg>
)
WundertaxLogo.displayName = 'WundertaxLogo'

export const TaxfixLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="Taxfix"
    role="img"
  >
    <rect width="48" height="48" fill="#24C875" />
    <circle cx="17.5" cy="17.5" r="4.5" fill="#FFFFFF" />
    <line x1="33" y1="15" x2="15" y2="33" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" />
    <circle cx="30.5" cy="30.5" r="4.5" fill="#FFFFFF" />
  </svg>
)
TaxfixLogo.displayName = 'TaxfixLogo'

export const SmartsteuerLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="smartsteuer"
    role="img"
  >
    <rect width="48" height="48" fill="#FF7900" />
    <text
      x="24"
      y="18"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="9.5"
      letterSpacing="-0.3px"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >
      smart
    </text>
    <text
      x="24"
      y="31"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#002D62"
      fontWeight="900"
      fontSize="9.5"
      letterSpacing="-0.3px"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >
      steuer
    </text>
  </svg>
)
SmartsteuerLogo.displayName = 'SmartsteuerLogo'

export const ElsterLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="ELSTER"
    role="img"
  >
    <rect width="48" height="48" fill="#003366" />
    <path
      d="M14 14h18v5H20v4h10v5H20v6h12v5H14V14z"
      fill="#FFCC00"
    />
    <path
      d="M32 19l4-5 4 5h-8z"
      fill="#00A3E0"
    />
  </svg>
)
ElsterLogo.displayName = 'ElsterLogo'

export const WisoSteuerLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="WISO Steuer"
    role="img"
  >
    <rect width="48" height="48" fill="#003B7E" />
    <text
      x="24"
      y="18"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="10"
      letterSpacing="0.5px"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >
      WISO
    </text>
    <text
      x="24"
      y="32"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFB800"
      fontWeight="800"
      fontSize="7.5"
      letterSpacing="0.4px"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >
      STEUER
    </text>
  </svg>
)
WisoSteuerLogo.displayName = 'WisoSteuerLogo'

export { GermanyFlagLogo as FinanzamtLogo } from './civic-logos'


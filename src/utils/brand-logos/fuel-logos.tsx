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
      borderRadius: 'inherit',
      flexShrink: 0,
    }}
    className={['brand-logo-full', className].filter(Boolean).join(' ')}
    data-brand-logo="true"
    aria-label="BP"
    role="img"
  >
    <rect width="48" height="48" fill="#007A3D" />
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

export const AralLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="Aral"
    role="img"
  >
    <rect width="48" height="48" fill="#003399" />
    <g transform="translate(6, 6) scale(1.5)" fill="#FFFFFF">
      <path d="M5.393 10.02l-.48 1.959.99.001-.51-1.96zm3.892.082v1.187c.549-.002.958.03 1.229-.033.27-.062.404-.217.404-.592 0-.334-.12-.469-.385-.523-.264-.055-.672-.028-1.248-.04zm5.326-.079l-.48 1.96h.99l-.51-1.96zM11.996 0L0 11.998 12.004 24 24 12.004 11.996 0zM5.393 8.896c.366 0 .606.117.775.295.169.18.267.421.35.67l1.07 3.211s.134.276.144.567c.01.29-.104.599-.6.666-.355-.054-.536-.156-.657-.35-.122-.194-.184-.482-.305-.91H4.645c-.147.468-.195.757-.295.941-.1.184-.254.263-.616.317-.508-.054-.636-.369-.636-.67 0-.301.129-.588.129-.588l1.015-3.152c.08-.246.176-.495.348-.682.172-.187.42-.315.803-.315zm9.191.002c.366 0 .607.117.775.295.17.18.267.421.35.67l1.072 3.211s.135.276.145.567c.01.29-.104.599-.6.666-.356-.054-.536-.156-.658-.35-.122-.194-.186-.482-.307-.91h-1.525c-.147.468-.193.757-.293.941-.1.184-.256.263-.617.317-.509-.054-.635-.367-.635-.668 0-.301.127-.59.127-.59l1.016-3.152c.075-.233.17-.484.343-.674.174-.19.424-.323.807-.323zm3.346.002c.308 0 .483.114.58.291.097.178.117.418.117.672v3.207c.215.005 1.23 0 1.23 0 .29 0 .53.02.694.106.164.086.252.239.244.504-.01.361-.18.517-.406.582-.226.065-.509.039-.744.039h-1.766c-.375 0-.536-.165-.604-.436-.067-.27-.04-.645-.04-1.062v-2.94c-.014-.254.02-.496.126-.674.107-.177.288-.289.569-.289zm-8.645.104h1.098c.254 0 .51-.002.767.084.259.086.52.26.786.613.28.378.35.933.222 1.414-.128.481-.456.889-.972.969.187.348.804 1.283.804 1.283s.066.11.078.266c.012.155-.03.357-.25.539-.388.147-.633.106-.78.03-.149-.078-.2-.192-.2-.192s-.562-.964-.91-1.633h-.643v1.338s.01.154-.064.305c-.075.15-.236.298-.578.285-.327 0-.488-.155-.567-.309C7.997 13.842 8 13.69 8 13.69V9.861c0-.334.006-.549.17-.68.164-.13.486-.177 1.115-.177z" />
    </g>
  </svg>
)
AralLogo.displayName = 'AralLogo'

export const ShellLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="Shell"
    role="img"
  >
    <rect width="48" height="48" fill="#FFD500" />
    <g transform="translate(6, 6) scale(1.5)" fill="#DD1D21">
      <path d="M12 .863C5.34.863 0 6.251 0 12.98c0 .996.038 1.374.246 2.33l3.662 2.71.57 4.515h6.102l.326.227c.377.262.705.375 1.082.375.352 0 .732-.101 1.024-.313l.39-.289h6.094l.563-4.515 3.695-2.71c.208-.956.246-1.334.246-2.33C24 6.252 18.661.863 12 .863zm.996 2.258c.9 0 1.778.224 2.512.649l-2.465 12.548 3.42-12.062c1.059.36 1.863.941 2.508 1.814l.025.034-4.902 10.615 5.572-9.713.033.03c.758.708 1.247 1.567 1.492 2.648l-6.195 7.666 6.436-6.5.01.021c.253.563.417 1.36.417 1.996 0 .509-.024.712-.164 1.25l-3.554 2.602-.467 3.71h-4.475l-.517.395c-.199.158-.482.266-.682.266-.199 0-.483-.108-.682-.266l-.517-.394H6.322l-.445-3.61-3.627-2.666c-.11-.436-.16-.83-.16-1.261 0-.72.159-1.49.426-2.053l.013-.024 6.45 6.551L2.75 9.621c.25-1.063.874-2.09 1.64-2.713l5.542 9.776L4.979 6.1c.555-.814 1.45-1.455 2.546-1.827l3.424 12.069L8.355 3.816l.055-.03c.814-.45 1.598-.657 2.457-.657.195 0 .286.004.528.03l.587 13.05.46-13.059c.224-.025.309-.029.554-.029z" />
    </g>
  </svg>
)
ShellLogo.displayName = 'ShellLogo'

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
      borderRadius: 'inherit',
      flexShrink: 0,
    }}
    className={['brand-logo-full', className].filter(Boolean).join(' ')}
    data-brand-logo="true"
    aria-label="JET"
    role="img"
  >
    <rect width="48" height="48" fill="#FFD100" />
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
      borderRadius: 'inherit',
      flexShrink: 0,
    }}
    className={['brand-logo-full', className].filter(Boolean).join(' ')}
    data-brand-logo="true"
    aria-label="Esso"
    role="img"
  >
    <rect width="48" height="48" fill="#003882" />
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
      borderRadius: 'inherit',
      flexShrink: 0,
    }}
    className={['brand-logo-full', className].filter(Boolean).join(' ')}
    data-brand-logo="true"
    aria-label="AVIA"
    role="img"
  >
    <rect width="48" height="48" fill="#E30613" />
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
      borderRadius: 'inherit',
      flexShrink: 0,
    }}
    className={['brand-logo-full', className].filter(Boolean).join(' ')}
    data-brand-logo="true"
    aria-label="Eni"
    role="img"
  >
    <rect width="48" height="48" fill="#FFD100" />
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
      borderRadius: 'inherit',
      flexShrink: 0,
    }}
    className={['brand-logo-full', className].filter(Boolean).join(' ')}
    data-brand-logo="true"
    aria-label="Turmöl"
    role="img"
  >
    <rect width="48" height="48" fill="#E30613" />
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
      borderRadius: 'inherit',
      flexShrink: 0,
    }}
    className={['brand-logo-full', className].filter(Boolean).join(' ')}
    data-brand-logo="true"
    aria-label="IONITY"
    role="img"
  >
    <rect width="48" height="48" fill="#121212" />
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
      borderRadius: 'inherit',
      flexShrink: 0,
    }}
    className={['brand-logo-full', className].filter(Boolean).join(' ')}
    data-brand-logo="true"
    aria-label="EnBW"
    role="img"
  >
    <rect width="48" height="48" fill="#001C3D" />
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
      borderRadius: 'inherit',
      flexShrink: 0,
    }}
    className={['brand-logo-full', className].filter(Boolean).join(' ')}
    data-brand-logo="true"
    aria-label="Fastned"
    role="img"
  >
    <rect width="48" height="48" fill="#FFD100" />
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

export const OmvLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="OMV"
    role="img"
  >
    <rect width="48" height="48" fill="#006633" />
    <text
      x="24"
      y="24"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="16"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letterSpacing="0.5px"
    >
      OMV
    </text>
  </svg>
)
OmvLogo.displayName = 'OmvLogo'

export const TotalEnergiesLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="TotalEnergies"
    role="img"
  >
    <rect width="48" height="48" fill="#ED1B2D" />
    <text
      x="24"
      y="24"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="13"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letterSpacing="-0.3px"
    >
      TOTAL
    </text>
  </svg>
)
TotalEnergiesLogo.displayName = 'TotalEnergiesLogo'

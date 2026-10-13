import type { IconComponent } from './types'

export {
  AralLogo,
  AviaLogo,
  BpLogo,
  EnbwLogo,
  EniLogo,
  EssoLogo,
  FastnedLogo,
  IonityLogo,
  JetLogo,
  OmvLogo,
  ShellLogo,
  TotalEnergiesLogo,
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
      borderRadius: 'inherit',
      flexShrink: 0,
    }}
    className={['brand-logo-full', className].filter(Boolean).join(' ')}
    data-brand-logo="true"
    aria-label="RMV"
    role="img"
  >
    <rect width="48" height="48" fill="#FFFFFF" />
    <g transform="translate(0.8, 17.8) scale(0.065, 0.072)">
      {/* Light mint background parallelogram */}
      <path
        fill="#E0F1EF"
        d="M 133.29 159.86 L 534.12 159.86 L 638.04 16.38 L 636.81 10.75 L 176.81 10.75 L 175.77 11.54 L 133.29 159.86 Z"
      />
      {/* Deep navy lettering and right fin */}
      <path
        fill="#0A2C72"
        d="M 636.79 10.75 C 641.98 13.13 645.67 17.51 649.47 21.73 C 672.92 51.83 687.27 78.09 698.40 102.98 C 709.42 125.51 704.43 143.71 675.01 155.30 C 664.91 158.54 653.31 160.43 638.94 159.86 L 527.33 159.86 L 636.79 10.75 Z M 507.26 10.75 L 569.01 10.75 L 513.76 104.30 L 510.38 27.18 L 473.01 159.86 L 467.00 159.86 L 467.22 155.48 L 507.26 10.75 Z M 382.23 159.86 L 409.15 159.86 L 440.35 54.32 L 382.23 159.86 Z M 384.57 10.75 L 429.61 10.75 L 386.83 93.17 L 384.57 10.75 Z M 319.65 159.86 L 352.31 159.86 L 350.68 55.03 L 319.65 159.86 Z M 306.79 159.86 L 313.11 159.86 C 308.87 152.51 309.13 143.36 312.18 133.07 L 314.66 123.08 C 317.13 112.77 316.73 103.32 311.04 95.64 L 306.62 89.23 L 307.30 88.94 C 319.34 85.00 327.31 78.27 332.76 67.55 C 335.49 61.03 337.71 54.21 337.76 46.05 C 338.25 37.07 336.66 30.42 333.38 25.68 L 320.38 48.43 L 294.13 82.68 L 291.76 156.30 L 306.79 159.86 Z M 257.57 74.24 L 217.26 74.24 L 225.01 47.37 L 265.13 47.37 C 268.35 47.47 271.36 47.64 274.97 50.16 C 276.89 51.88 277.32 53.88 277.36 55.95 C 277.38 59.18 276.44 62.34 274.93 65.46 C 273.32 68.79 270.79 70.90 267.77 72.35 C 264.59 73.60 261.22 74.29 257.57 74.24 Z M 243.51 110.53 L 207.00 110.53 L 192.42 159.86 L 249.69 159.86 C 249.34 157.47 249.71 155.56 250.05 153.62 L 255.53 129.89 C 256.23 127.09 256.62 124.18 256.68 121.14 C 256.58 118.95 256.21 117.04 255.42 115.44 C 254.14 112.97 252.30 111.78 250.09 111.17 C 247.98 110.56 245.69 110.53 243.51 110.53 Z"
      />
      {/* Mint / Teal M and R accent elements */}
      <path
        fill="#009A89"
        d="M 447.95 10.75 L 508.67 10.75 L 467.13 159.86 L 447.95 10.75 Z M 305.56 10.75 L 262.60 159.86 L 308.03 159.86 C 304.14 152.54 304.39 143.19 307.32 132.54 L 310.24 122.29 C 312.36 115.45 314.78 103.61 311.07 95.14 C 309.58 91.75 307.16 87.66 301.93 84.46 C 315.08 81.72 324.43 74.51 329.72 63.57 C 334.21 54.27 337.16 41.16 333.60 26.07 C 330.01 21.07 326.07 16.76 321.38 14.19 C 316.34 11.85 311.06 10.74 305.56 10.75 Z"
      />
      {/* 10 Speed Stripes */}
      <path
        fill="#0A2C72"
        d="M 10.05 159.86 L 53.23 10.75 L 56.01 10.75 L 12.65 159.86 L 10.05 159.86 Z M 23.52 159.86 L 66.70 10.75 L 69.83 10.75 L 26.47 159.86 L 23.52 159.86 Z M 36.81 159.86 L 79.99 10.75 L 83.83 10.75 L 40.47 159.86 L 36.81 159.86 Z M 49.75 159.86 L 92.93 10.75 L 97.66 10.75 L 54.30 159.86 L 49.75 159.86 Z M 63.04 159.86 L 106.23 10.75 L 111.36 10.75 L 68.30 159.86 L 63.04 159.86 Z M 76.22 159.86 L 119.41 10.75 L 125.25 10.75 L 82.06 159.86 L 76.22 159.86 Z M 89.69 159.86 L 132.88 10.75 L 139.25 10.75 L 95.89 159.86 L 89.69 159.86 Z M 102.63 159.86 L 145.82 10.75 L 153.07 10.75 L 109.71 159.86 L 102.63 159.86 Z M 115.93 159.86 L 159.11 10.75 L 166.89 10.75 L 123.53 159.86 L 115.93 159.86 Z M 129.04 159.86 L 172.23 10.75 L 176.95 10.75 L 133.71 159.86 L 129.04 159.86 Z"
      />
    </g>
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
      borderRadius: 'inherit',
      flexShrink: 0,
    }}
    className={['brand-logo-full', className].filter(Boolean).join(' ')}
    data-brand-logo="true"
    aria-label="HVV"
    role="img"
  >
    <rect width="48" height="48" fill="#004B87" />
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
      borderRadius: 'inherit',
      flexShrink: 0,
    }}
    className={['brand-logo-full', className].filter(Boolean).join(' ')}
    data-brand-logo="true"
    aria-label="Flix"
    role="img"
  >
    <rect width="48" height="48" fill="#73D700" />
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
      borderRadius: 'inherit',
      flexShrink: 0,
    }}
    className={['brand-logo-full', className].filter(Boolean).join(' ')}
    data-brand-logo="true"
    aria-label="ÖBB"
    role="img"
  >
    <rect width="48" height="48" fill="#D91A15" />
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
      borderRadius: 'inherit',
      flexShrink: 0,
    }}
    className={['brand-logo-full', className].filter(Boolean).join(' ')}
    data-brand-logo="true"
    aria-label="VRR"
    role="img"
  >
    <rect width="48" height="48" fill="#009640" />
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
      borderRadius: 'inherit',
      flexShrink: 0,
    }}
    className={['brand-logo-full', className].filter(Boolean).join(' ')}
    data-brand-logo="true"
    aria-label="ASFINAG"
    role="img"
  >
    <rect width="48" height="48" fill="#F39200" />
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
      borderRadius: 'inherit',
      flexShrink: 0,
    }}
    className={['brand-logo-full', className].filter(Boolean).join(' ')}
    data-brand-logo="true"
    aria-label="SIXT"
    role="img"
  >
    <rect width="48" height="48" fill="#FF5F00" />
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
      borderRadius: 'inherit',
      flexShrink: 0,
    }}
    className={['brand-logo-full', className].filter(Boolean).join(' ')}
    data-brand-logo="true"
    aria-label="fair parken"
    role="img"
  >
    <rect width="48" height="48" fill="#002D62" />
    <rect
      x="6"
      y="11"
      width="13"
      height="26"
      rx="3"
      fill="#00529C"
      stroke="#FFFFFF"
      strokeWidth="1.5"
    />
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
      y="31"
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
      borderRadius: 'inherit',
      flexShrink: 0,
    }}
    className={['brand-logo-full', className].filter(Boolean).join(' ')}
    data-brand-logo="true"
    aria-label="EasyPark"
    role="img"
  >
    <rect width="48" height="48" fill="#E5007D" />
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

export const DbLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="Deutsche Bahn"
    role="img"
  >
    <rect width="48" height="48" fill="#EC161B" />
    <g transform="translate(6, 6) scale(1.5)" fill="#FFFFFF">
      <path d="M21.6 3.6H2.4C1.08 3.6 0 4.68 0 6v12c0 1.32 1.08 2.4 2.4 2.4h19.2c1.32 0 2.4-1.08 2.4-2.424V6c0-1.32-1.08-2.4-2.4-2.4zm.648 14.376c.024.36-.264.672-.648.696H2.4c-.36 0-.648-.312-.648-.672V6a.667.667 0 0 1 .624-.696H21.6c.36 0 .648.312.648.672v12zM7.344 6.504H3.312v10.992h4.032c3.336-.024 4.416-2.376 4.416-5.544 0-3.672-1.56-5.448-4.416-5.448zm-.456 9.216h-.936V8.232h.528c2.376 0 2.616 1.728 2.616 3.936 0 2.424-.816 3.552-2.208 3.552zm11.832-3.984c1.128-.336 1.896-1.368 1.92-2.568 0-.24-.048-2.688-3.144-2.688h-4.584v10.992H16.8c1.032 0 4.248 0 4.248-3.096 0-.744-.336-2.208-2.328-2.64zm-2.352-3.528c1.176 0 1.656.408 1.656 1.32 0 .72-.528 1.32-1.44 1.32h-1.032v-2.64h.816zm.24 7.512h-1.08v-2.832h1.152c1.368 0 1.704.792 1.704 1.416 0 1.416-1.344 1.416-1.776 1.416z" />
    </g>
  </svg>
)
DbLogo.displayName = 'DbLogo'

export const BvgLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="BVG"
    role="img"
  >
    <rect width="48" height="48" fill="#F0D100" />
    <g transform="translate(6, 6) scale(1.5)" fill="#000000">
      <path d="M17.25 1.11c3.647 0 6.478 2.886 6.73 6.447.151 2.21-.535 4.019-2.158 5.674l-3.601 3.655-.154.157-.078.079-.214.217-.214.217a18348.219 18348.219 0 0 1-4.951 5.019c-.074.074-.323.302-.576.315h-.023c-.272 0-.534-.24-.6-.315l-4.89-4.958-.129-.13-.257-.261-.214-.218A5994.604 5994.604 0 0 1 2.2 13.23C.554 11.576-.13 9.768.02 7.557.27 3.997 3.103 1.11 6.75 1.11c2.353 0 3.704 1.416 5.25 3.027 1.536-1.61 2.897-3.027 5.25-3.027zm-4.02 6.48c-.26 0-.446.174-.511.48l-.6 3.092c-.043.294-.097.642-.12.87a5.71 5.71 0 0 0-.12-.87l-.663-3.093c-.065-.36-.283-.48-.534-.48-.392 0-.577.35-.479.763l1.013 4.193c.098.414.305.642.784.642.414 0 .664-.228.762-.686l.948-4.214c.087-.425-.153-.697-.48-.697zm2.995-.033c-1.274 0-2.101.85-2.101 2.832 0 1.884.37 2.787 2.003 2.787 1.013 0 1.48-.348 1.48-1.143v-1.634c0-.337-.107-.479-.412-.479h-.904c-.294 0-.436.142-.436.414 0 .25.163.392.436.392h.305v1.568a1.015 1.015 0 0 1-.35.044c-.73 0-1.077-.349-1.077-1.873 0-1.634.414-2.004 1.035-2.004.468 0 .697.163.925.163a.439.439 0 0 0 .294-.762c-.305-.24-.925-.305-1.198-.305Zm-8.091.065H7.056a.42.42 0 0 0-.436.414v4.716c0 .283.185.37.436.37h.99c1.406 0 1.721-.784 1.732-1.655 0-.556-.272-1.177-1.056-1.22.719-.153.904-.664.904-1.242 0-.718-.196-1.383-1.492-1.383zm-.185 3.018c.686 0 .74.37.74.86v.02c-.002.45-.074.852-.664.852h-.37v-1.733h.294zm.022-2.265c.577 0 .664.207.664.762v.071l-.001.03c-.01.325-.087.682-.718.682h-.25V8.374h.305z" />
    </g>
  </svg>
)
BvgLogo.displayName = 'BvgLogo'

/** Official Uber mobility and ride-hailing brand tile with white lettermark on black background. */
export const UberLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="Uber"
    role="img"
  >
    <rect width="48" height="48" fill="#000000" />
    <g transform="translate(4.2, 4.3) scale(1.65)" fill="#FFFFFF">
      <path d="M0 7.97v4.958c0 1.867 1.302 3.101 3 3.101.826 0 1.562-.316 2.094-.87v.736H6.27V7.97H5.082v4.888c0 1.257-.85 2.106-1.947 2.106-1.11 0-1.946-.827-1.946-2.106V7.971H0zm7.44 0v7.925h1.13v-.725c.521.532 1.257.86 2.06.86a3.006 3.006 0 0 0 3.034-3.01 3.01 3.01 0 0 0-3.033-3.024 2.86 2.86 0 0 0-2.049.861V7.971H7.439zm9.869 2.038c-1.687 0-2.965 1.37-2.965 3 0 1.72 1.334 3.01 3.066 3.01 1.053 0 1.913-.463 2.49-1.233l-.826-.611c-.43.577-.996.847-1.664.847-.973 0-1.753-.7-1.912-1.64h4.697v-.373c0-1.72-1.222-3-2.886-3zm6.295.068c-.634 0-1.098.294-1.381.758v-.713h-1.131v5.774h1.142V12.61c0-.894.544-1.47 1.291-1.47H24v-1.065h-.396zm-6.319.928c.85 0 1.564.588 1.756 1.47H15.52c.203-.882.916-1.47 1.765-1.47zm-6.732.012c1.086 0 1.98.883 1.98 2.004a1.993 1.993 0 0 1-1.98 2.001A1.989 1.989 0 0 1 8.56 13.02a1.99 1.99 0 0 1 1.992-2.004z" />
    </g>
  </svg>
)
UberLogo.displayName = 'UberLogo'

export {
  BvgLogo as BerlinerVerkehrsbetriebeLogo,
  DbLogo as DeutscheBahnLogo,
  UberLogo as UberRidesLogo,
}

import type { IconComponent } from './types'

/**
 * Official logo of Schreinerei Lothar Braun GmbH (Bad Homburg master carpentry & door installation).
 * Features the signature timber triangular gable with vertical plank grain, bold 3D 'BRAUN' lettering,
 * the arched 'LOTHAR' crest, the iconic articulated golden-yellow carpenter's folding ruler (Zollstock),
 * and the 'SCHREINEREI' foundation banner.
 */
export const LotharBraunLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="Schreinerei Lothar Braun"
    role="img"
  >
    {/* Dark stone background card */}
    <rect width="48" height="48" rx="8" fill="#1C1917" />
    <rect
      x="0.5"
      y="0.5"
      width="47"
      height="47"
      rx="7.5"
      fill="none"
      stroke="rgba(255, 255, 255, 0.12)"
      strokeWidth={1}
    />

    <defs>
      {/* Rich Wood Grain Gradient */}
      <linearGradient id="braunWood" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#A1461C" />
        <stop offset="45%" stopColor="#843210" />
        <stop offset="75%" stopColor="#672408" />
        <stop offset="100%" stopColor="#541C06" />
      </linearGradient>

      {/* Warm Top Highlight */}
      <linearGradient id="braunHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.25" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </linearGradient>

      {/* Ruler Gold Gradient */}
      <linearGradient id="rulerGold" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="100%" stopColor="#EAB308" />
      </linearGradient>
    </defs>

    {/* Wooden Gable / Triangle Peak */}
    <polygon points="24,4.5 45,41 3,41" fill="#090503" />
    <polygon
      points="24,6 43.5,39.8 4.5,39.8"
      fill="url(#braunWood)"
      stroke="#381405"
      strokeWidth={1.2}
      strokeLinejoin="round"
    />
    <polygon points="24,6 43.5,39.8 4.5,39.8" fill="url(#braunHighlight)" />

    {/* Vertical Wood Plank Grooves & Texture */}
    <line x1="14.5" y1="39.8" x2="20.5" y2="12" stroke="#3D1304" strokeWidth={0.75} opacity={0.7} />
    <line x1="24" y1="39.8" x2="24" y2="7" stroke="#3D1304" strokeWidth={0.75} opacity={0.7} />
    <line x1="33.5" y1="39.8" x2="27.5" y2="12" stroke="#3D1304" strokeWidth={0.75} opacity={0.7} />

    {/* "LOTHAR" arched text */}
    <text
      x="24"
      y="13.2"
      textAnchor="middle"
      fontFamily="'Arial Black', Impact, system-ui, sans-serif"
      fontWeight="900"
      fontSize="4.2"
      fill="#FFFFFF"
      stroke="#000000"
      strokeWidth={0.5}
      letterSpacing="0.9px"
      style={{ paintOrder: 'stroke fill' }}
    >
      LOTHAR
    </text>

    {/* "BRAUN" 3D bold text */}
    <text
      x="25.2"
      y="24.8"
      textAnchor="middle"
      fontFamily="'Arial Black', Impact, system-ui, -apple-system, sans-serif"
      fontWeight="900"
      fontSize="11.5"
      fill="#090503"
      letterSpacing="0.6px"
    >
      BRAUN
    </text>
    <text
      x="24"
      y="23.8"
      textAnchor="middle"
      fontFamily="'Arial Black', Impact, system-ui, -apple-system, sans-serif"
      fontWeight="900"
      fontSize="11.5"
      fill="#FFFFFF"
      stroke="#000000"
      strokeWidth={0.9}
      letterSpacing="0.6px"
      style={{ paintOrder: 'stroke fill' }}
    >
      BRAUN
    </text>

    {/* Iconic Yellow Carpenter's Folding Ruler (Zollstock) */}
    <polyline
      points="1.5,33.5 8.5,27.5 16.5,34.5 24.5,27.5 32.5,34.5 40.5,27.5 47,32.5"
      fill="none"
      stroke="#000000"
      strokeWidth={2.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={0.85}
    />
    <polyline
      points="1.5,32.5 8.5,26.5 16.5,33.5 24.5,26.5 32.5,33.5 40.5,26.5 47,31.5"
      fill="none"
      stroke="url(#rulerGold)"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <polyline
      points="1.5,32.5 8.5,26.5 16.5,33.5 24.5,26.5 32.5,33.5 40.5,26.5 47,31.5"
      fill="none"
      stroke="#A16207"
      strokeWidth={0.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Metric Ruler Joint Rivets (Hinges) */}
    <circle cx="8.5" cy="26.5" r={1.1} fill="#713F12" stroke="#000000" strokeWidth={0.4} />
    <circle cx="16.5" cy="33.5" r={1.1} fill="#713F12" stroke="#000000" strokeWidth={0.4} />
    <circle cx="24.5" cy="26.5" r={1.1} fill="#713F12" stroke="#000000" strokeWidth={0.4} />
    <circle cx="32.5" cy="33.5" r={1.1} fill="#713F12" stroke="#000000" strokeWidth={0.4} />
    <circle cx="40.5" cy="26.5" r={1.1} fill="#713F12" stroke="#000000" strokeWidth={0.4} />

    {/* Base Bar: SCHREINEREI Banner */}
    <rect x="3.5" y="36.5" width="41" height="8" rx="1.5" fill="#0C0A09" stroke="#292524" strokeWidth={0.6} />
    <text
      x="24"
      y="42.5"
      textAnchor="middle"
      fontFamily="'Arial Black', Impact, system-ui, sans-serif"
      fontWeight="900"
      fontSize="4.7"
      fill="#FAFAF9"
      letterSpacing="1.2px"
    >
      SCHREINEREI
    </text>
  </svg>
)
LotharBraunLogo.displayName = 'LotharBraunLogo'

export {
  LotharBraunLogo as SchreinereiBraunLogo,
  LotharBraunLogo as SchreinereiLotharBraunLogo,
}

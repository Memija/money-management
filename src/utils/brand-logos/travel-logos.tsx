import type { IconComponent } from './types'

export const TuiLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="TUI"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill="#D40E14" />
    <g transform="translate(8, 8) scale(1.33)" fill="#FFFFFF">
      <path d="M24 4.5167a2.117 2.117 0 01-2.117 2.117 2.117 2.117 0 01-2.117-2.117 2.117 2.117 0 012.117-2.117A2.117 2.117 0 0124 4.5168zM1.1397 7.7475h5.7055c.5642 0 .9806.1772 1.1465.9716.185.8836.1129 1.4986-.8858 1.5686l-1.7909.132c1.318 8.3303 9.0277 11.0453 13.2221 2.073.6952-1.485.922-1.7548 1.6826-1.5663 1.0314.2561 1.1724.7899.677 2.2828-3.6234 11.0566-15.8186 12.166-18.211-2.6044l-1.4546.105C.0463 10.7942 0 9.7956 0 9.2404c0-1.0992.4074-1.493 1.1397-1.493z" />
    </g>
  </svg>
)
TuiLogo.displayName = 'TuiLogo'

export const DertourLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="DERTOUR"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill="#E4002B" />
    <text
      x="24"
      y="25"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="9.5"
      letterSpacing="0.5px"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >
      DERTOUR
    </text>
  </svg>
)
DertourLogo.displayName = 'DertourLogo'

export const AlltoursLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="alltours"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill="#E30613" />
    <path
      d="M 12 18 Q 24 9 36 18"
      stroke="#FFCC00"
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
    />
    <circle cx="24" cy="14" r="2.5" fill="#FFCC00" />
    <text
      x="24"
      y="30"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="9.5"
      letterSpacing="-0.3px"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >
      alltours
    </text>
  </svg>
)
AlltoursLogo.displayName = 'AlltoursLogo'

export const SchauinslandLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="Schauinsland-Reisen"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill="#004890" />
    <circle cx="24" cy="18" r="7" fill="#FFD100" />
    <path d="M 21 24 Q 23 20 24 13" stroke="#004890" strokeWidth="1.5" fill="none" />
    <path d="M 24 14 Q 21 16 19 18" stroke="#004890" strokeWidth="1.2" fill="none" />
    <path d="M 24 14 Q 27 16 29 18" stroke="#004890" strokeWidth="1.2" fill="none" />
    <text
      x="24"
      y="34"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="6.5"
      letterSpacing="-0.2px"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >
      schauinsland
    </text>
    <text
      x="24"
      y="41"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFD100"
      fontWeight="700"
      fontSize="5.5"
      letterSpacing="0.5px"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >
      reisen
    </text>
  </svg>
)
SchauinslandLogo.displayName = 'SchauinslandLogo'

export const EurowingsLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="Eurowings"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill="#7A1B3B" />
    <path
      d="M 9 23 C 18 13 32 12 39 15 C 33 17 21 19 15 25 Z"
      fill="#FFFFFF"
    />
    <path
      d="M 12 27 C 19 19 32 18 39 21 C 33 22 22 24 16 30 Z"
      fill="#0082C9"
    />
    <text
      x="24"
      y="38.5"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="7"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letterSpacing="-0.2px"
    >
      eurowings
    </text>
  </svg>
)
EurowingsLogo.displayName = 'EurowingsLogo'

export const CondorLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="Condor"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill="#FFB800" />
    {/* Condor soaring bird wings */}
    <circle cx="24" cy="18" r="11" fill="#002D5A" />
    <path
      d="M 18 20 C 22 15 26 15 30 20 C 27 17 21 17 18 20 Z"
      fill="#FFB800"
    />
    <path
      d="M 16 17 C 22 12 26 12 32 17 C 28 14 20 14 16 17 Z"
      fill="#FFB800"
    />
    <text
      x="24"
      y="38.5"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#002D5A"
      fontWeight="900"
      fontSize="8"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letterSpacing="0.2px"
    >
      condor
    </text>
  </svg>
)
CondorLogo.displayName = 'CondorLogo'

export const BookingLogo: IconComponent = ({ size = 16, className }) => (
  <img
    src="/brands/booking.png"
    alt="Booking.com"
    width={typeof size === 'number' ? size : undefined}
    height={typeof size === 'number' ? size : undefined}
    style={{
      width: typeof size === 'number' ? `${size}px` : size,
      height: typeof size === 'number' ? `${size}px` : size,
      display: 'inline-block',
      verticalAlign: 'middle',
      borderRadius: '4px',
      objectFit: 'contain',
      flexShrink: 0,
    }}
    className={className}
    role="img"
    aria-label="Booking.com"
  />
)
BookingLogo.displayName = 'BookingLogo'

export { BookingLogo as BookingDotComLogo }

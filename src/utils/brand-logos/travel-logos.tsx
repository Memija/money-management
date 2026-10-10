import { createImageLogo } from './logo-factory'
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
      borderRadius: 'inherit',
      flexShrink: 0,
    }}
    className={['brand-logo-full', className].filter(Boolean).join(' ')}
    data-brand-logo="true"
    aria-label="TUI"
    role="img"
  >
    <rect width="48" height="48" fill="#D40E14" />
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
      borderRadius: 'inherit',
      flexShrink: 0,
    }}
    className={['brand-logo-full', className].filter(Boolean).join(' ')}
    data-brand-logo="true"
    aria-label="DERTOUR"
    role="img"
  >
    <rect width="48" height="48" fill="#E4002B" />
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

export const AlltoursLogo = createImageLogo({
  src: '/brands/alltours.svg',
  label: 'alltours',
  displayName: 'AlltoursLogo',
})

export const SchauinslandLogo = createImageLogo({
  src: '/brands/schauinsland.svg',
  label: 'Schauinsland-Reisen',
  displayName: 'SchauinslandLogo',
})

export const EurowingsLogo = createImageLogo({
  src: '/brands/eurowings.svg',
  label: 'Eurowings',
  displayName: 'EurowingsLogo',
})

export const CondorLogo = createImageLogo({
  src: '/brands/condor.svg',
  label: 'Condor',
  displayName: 'CondorLogo',
})

export const BookingLogo = createImageLogo({
  src: '/brands/booking.png',
  label: 'Booking.com',
  displayName: 'BookingLogo',
})

/** sander Hotel Koblenz — contemporary boutique hotel and gastronomy concept in Koblenz. */
export const SanderHotelLogo = createImageLogo({
  src: '/brands/sander-hotel.png',
  label: 'sander Hotel Koblenz',
  displayName: 'SanderHotelLogo',
})

export {
  BookingLogo as BookingDotComLogo,
  EurowingsLogo as EurowingsHolidaysLogo,
  EurowingsLogo as HolidaysLogo,
}

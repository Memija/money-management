import type { IconComponent } from './types'

/**
 * Official logo of Färber & Hutzel (Rechtsanwälte & Notare, Bad Homburg).
 * Features the signature deep navy circular seal with the classical serif 'HF'
 * conjoined ligature monogram.
 */
export const FaerberHutzelLogo: IconComponent = ({ size = 16, className }) => (
  <svg
    viewBox="0 0 48 48"
    width={typeof size === 'number' ? size : undefined}
    height={typeof size === 'number' ? size : undefined}
    style={{
      width: typeof size === 'number' ? `${size}px` : size,
      height: typeof size === 'number' ? `${size}px` : size,
      display: 'inline-block',
      verticalAlign: 'middle',
      borderRadius: '8px',
      overflow: 'hidden',
      flexShrink: 0,
    }}
    className={className}
    aria-label="Färber & Hutzel Notare und Rechtsanwälte"
    role="img"
  >
    {/* Dark navy background circular card */}
    <rect width="48" height="48" rx="8" fill="#172A45" />

    {/* Elegant 'HF' monogram ligature vector path */}
    <path
      d="M9.75 14h9v.5h-1.75v.25h-.5v.25h-.25v.25h-.25V16h-.25v7H26.5v-6.25h-.25v-1.25h-.25V15h-.25v-.25H25v-.25h-1.75V14h15.5v1.75h.25V19h-.5v-.25h-.25v-1h-.25v-.75h-.25V16.5h-.25V16h-.25v-.25h-.25V15.5h-.25v-.25h-.25V15h-.5v-.25H35v-.25h-4.5v.25h-.5V15h-.25v.25h-.25v.5h-.25v7.5H32.25V23h1v-.25h.25V22.5h.25v-.25h.25V21.5h.25V20h.5v.25h.25V27h-.25v.25h-.25V27h-.25v-1.5h-.25v-.75h-.25v-.25h-.25V24.25h-.25V24h-.5v-.25H29.25V32h.25v.75h.25V33h.25v.25H30.75v.25H32.5V34h-9.25v-.5H25v-.25h.5V33h.5v-.5h.25v-1.5h.25V24H15.75v8h.25v.75h.25V33h.25v.25H17.25v.25H18.75V34h-9v-.5H11.5v-.25h.75V33h.25v-.5h.25v-1h.25V16.25h-.25v-1h-.25V15h-.25v-.25H11.5v-.25H9.75Z"
      fill="#FFFFFF"
    />
  </svg>
)
FaerberHutzelLogo.displayName = 'FaerberHutzelLogo'

export {
  FaerberHutzelLogo as FaerberUndHutzelLogo,
  FaerberHutzelLogo as FarberHutzelLogo,
  FaerberHutzelLogo as FarberUndHutzelLogo,
}

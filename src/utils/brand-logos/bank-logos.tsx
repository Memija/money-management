import type { IconComponent } from './types'

interface BankImageProps {
  src: string
  alt: string
  size?: number | string
  className?: string
}

const BankImage = ({ src, alt, size, className }: BankImageProps) => (
  <img
    src={src}
    alt={alt}
    width={typeof size === 'number' ? size : undefined}
    height={typeof size === 'number' ? size : undefined}
    style={{
      width: typeof size === 'number' ? `${size}px` : size,
      height: typeof size === 'number' ? `${size}px` : size,
      objectFit: 'contain',
      borderRadius: '3px',
      display: 'inline-block',
      verticalAlign: 'middle',
    }}
    className={className}
  />
)

export const ComdirectLogo: IconComponent = ({ size = 16, className }) => (
  <BankImage src="/banks/comdirect.png" alt="comdirect" size={size} className={className} />
)
ComdirectLogo.displayName = 'ComdirectLogo'

export const DkbLogo: IconComponent = ({ size = 16, className }) => (
  <BankImage src="/banks/dkb.png" alt="DKB" size={size} className={className} />
)
DkbLogo.displayName = 'DkbLogo'

export const IngLogo: IconComponent = ({ size = 16, className }) => (
  <BankImage src="/banks/ing-de.png" alt="ING" size={size} className={className} />
)
IngLogo.displayName = 'IngLogo'

export const PostbankLogo: IconComponent = ({ size = 16, className }) => (
  <BankImage src="/banks/postbank.png" alt="Postbank" size={size} className={className} />
)
PostbankLogo.displayName = 'PostbankLogo'

export const TradeRepublicLogo: IconComponent = ({ size = 16, className }) => (
  <BankImage src="/banks/trade-republic.png" alt="Trade Republic" size={size} className={className} />
)
TradeRepublicLogo.displayName = 'TradeRepublicLogo'

export const ScalableCapitalLogo: IconComponent = ({ size = 16, className }) => (
  <BankImage src="/banks/scalable-capital.png" alt="Scalable Capital" size={size} className={className} />
)
ScalableCapitalLogo.displayName = 'ScalableCapitalLogo'

export const VolksbankLogo: IconComponent = ({ size = 16, className }) => (
  <BankImage src="/banks/volksbank-other.png" alt="Volksbank" size={size} className={className} />
)
VolksbankLogo.displayName = 'VolksbankLogo'

export const TargobankLogo: IconComponent = ({ size = 16, className }) => (
  <BankImage src="/banks/targobank.png" alt="Targobank" size={size} className={className} />
)
TargobankLogo.displayName = 'TargobankLogo'

export const SpardaBankLogo: IconComponent = ({ size = 16, className }) => (
  <BankImage src="/banks/sparda-bank.png" alt="Sparda-Bank" size={size} className={className} />
)
SpardaBankLogo.displayName = 'SpardaBankLogo'

export const C24Logo: IconComponent = ({ size = 16, className }) => (
  <BankImage src="/banks/c24.png" alt="C24 Bank" size={size} className={className} />
)
C24Logo.displayName = 'C24Logo'

export const ConsorsbankLogo: IconComponent = ({ size = 16, className }) => (
  <BankImage src="/banks/consorsbank.png" alt="Consorsbank" size={size} className={className} />
)
ConsorsbankLogo.displayName = 'ConsorsbankLogo'

export const SparkasseLogo: IconComponent = ({ size = 16, className }) => (
  <BankImage src="/banks/sparkasse-other.png" alt="Sparkasse" size={size} className={className} />
)
SparkasseLogo.displayName = 'SparkasseLogo'

export const Direkt1822Logo: IconComponent = ({ size = 16, className }) => (
  <BankImage src="/banks/1822direkt.png" alt="1822direkt" size={size} className={className} />
)
Direkt1822Logo.displayName = 'Direkt1822Logo'

export const HypoVereinsbankLogo: IconComponent = ({ size = 16, className }) => (
  <BankImage src="/banks/hypovereinsbank.png" alt="HypoVereinsbank" size={size} className={className} />
)
HypoVereinsbankLogo.displayName = 'HypoVereinsbankLogo'

export const SantanderLogo: IconComponent = ({ size = 16, className }) => (
  <BankImage src="/banks/santander-de.png" alt="Santander" size={size} className={className} />
)
SantanderLogo.displayName = 'SantanderLogo'

export const NorisbankLogo: IconComponent = ({ size = 16, className }) => (
  <BankImage src="/banks/norisbank.png" alt="norisbank" size={size} className={className} />
)
NorisbankLogo.displayName = 'NorisbankLogo'

export const GlsBankLogo: IconComponent = ({ size = 16, className }) => (
  <BankImage src="/banks/gls-bank.png" alt="GLS Bank" size={size} className={className} />
)
GlsBankLogo.displayName = 'GlsBankLogo'

export const FlatexLogo: IconComponent = ({ size = 16, className }) => (
  <BankImage src="/banks/flatex.png" alt="flatex" size={size} className={className} />
)
FlatexLogo.displayName = 'FlatexLogo'

export const DegiroLogo: IconComponent = ({ size = 16, className }) => (
  <BankImage src="/banks/degiro-de.png" alt="DEGIRO" size={size} className={className} />
)
DegiroLogo.displayName = 'DegiroLogo'

export const VividMoneyLogo: IconComponent = ({ size = 16, className }) => (
  <BankImage src="/banks/vivid-money.png" alt="Vivid Money" size={size} className={className} />
)
VividMoneyLogo.displayName = 'VividMoneyLogo'

export const ApoBankLogo: IconComponent = ({ size = 16, className }) => (
  <BankImage src="/banks/apobank.png" alt="apoBank" size={size} className={className} />
)
ApoBankLogo.displayName = 'ApoBankLogo'

export const N26Logo: IconComponent = ({ size = 16, className }) => (
  <BankImage src="/banks/n26.png" alt="N26" size={size} className={className} />
)
N26Logo.displayName = 'N26Logo'

export const WiseLogo: IconComponent = ({ size = 16, className }) => (
  <BankImage src="/banks/wise-de.png" alt="Wise" size={size} className={className} />
)
WiseLogo.displayName = 'WiseLogo'

export const BunqLogo: IconComponent = ({ size = 16, className }) => (
  <BankImage src="/banks/bunq-de.png" alt="bunq" size={size} className={className} />
)
BunqLogo.displayName = 'BunqLogo'

export {
  SparkasseLogo as HaspaLogo,
  HypoVereinsbankLogo as HvbLogo,
  Direkt1822Logo as Logo1822Direkt,
  HypoVereinsbankLogo as UniCreditLogo,
  VividMoneyLogo as VividLogo,
}

export const TomorrowLogo: IconComponent = ({ size = 16, className }) => (
  <svg
    viewBox="0 0 64 64"
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
    aria-label="Tomorrow Bank"
    role="img"
  >
    <rect width="64" height="64" rx="12" fill="#FF8454" />
    <g fill="#FFFFFF">
      <path d="M55.72 45.813c.95 0 1.72-.765 1.72-1.709 0-.944-.77-1.71-1.72-1.71S54 43.16 54 44.105s.77 1.71 1.72 1.71zM39.64 45.508l2.719 7.672h.587l2.746-7.155 2.466 7.155h.587l2.84-7.592c.586-1.497 1.013-2.12 1.773-2.915v-.04h-2.493v.04c.373.477.76 1.616.173 3.167l-1.32 3.484-1.253-3.895c-.413-1.285-.307-2.306.027-2.756v-.04h-4.413v.04c.52.517.866 1.1 1.426 2.77l-1.56 4.014-1.32-4.041c-.413-1.206-.28-2.306.04-2.756v-.04h-4.48v.053c.548.583.868 1.232 1.454 2.835zM32.847 42.74c1.907 0 2.746 2.305 2.746 5.1 0 2.823-.84 5.075-2.746 5.075-1.92 0-2.72-2.252-2.72-5.074 0-2.796.827-5.102 2.72-5.102zm0 10.572c3.12 0 5.666-2.557 5.666-5.485 0-2.941-2.573-5.525-5.666-5.525s-5.666 2.584-5.666 5.525c0 2.928 2.533 5.486 5.666 5.486zM19.948 52.994h3.76v-.04c-.414-1.1-.494-2.133-.494-3.961V45.23c.413-.49.867-.768 1.213-.768.52 0 1.6.41 2.054.927h.106l.2-3.074c-1.626-.066-2.746 1.564-3.64 2.518h-.026v-2.637l-3.693 1.18v.039c.626.755 1.013 1.59 1.013 3.074v2.49c0 1.895-.147 2.836-.493 3.962zM39.893 38.806h3.76v-.04c-.414-1.1-.494-2.133-.494-3.961v-3.763c.414-.49.867-.769 1.214-.769.52 0 1.6.411 2.053.928h.107l.2-3.074c-1.627-.066-2.747 1.563-3.64 2.517h-.027v-2.636l-3.693 1.179v.04c.627.755 1.013 1.59 1.013 3.073v2.491c0 1.895-.146 2.836-.493 3.962zM32.846 28.551c1.907 0 2.746 2.306 2.746 5.101 0 2.822-.84 5.075-2.746 5.075-1.92 0-2.72-2.253-2.72-5.075 0-2.795.813-5.1 2.72-5.1zm0 10.573c3.12 0 5.666-2.557 5.666-5.485 0-2.941-2.573-5.525-5.666-5.525s-5.666 2.584-5.666 5.525c0 2.928 2.533 5.485 5.666 5.485zM13.52 38.806v-.04c-.414-1.1-.494-2.133-.494-3.961v-4.108c.493-.768 1.227-1.14 1.987-1.14 1.106 0 1.453.822 1.453 1.79v3.484c0 1.762-.08 2.835-.494 3.935v.04h3.76v-.04c-.413-1.1-.52-2.106-.52-3.975v-4.094c.215-.346.515-.632.872-.831s.759-.306 1.168-.308c1.107 0 1.427.821 1.427 1.789v3.484c0 1.762-.08 2.835-.494 3.935v.04h3.76v-.04c-.413-1.1-.493-2.106-.493-3.975v-3.789c0-1.802-1-2.875-2.813-2.875-1.56 0-2.667.888-3.413 2.027h-.04c-.254-1.285-1.187-2.027-2.747-2.027-1.56 0-2.68.888-3.4 2.027l-.08-.026v-2.12l-3.693 1.179v.04c.627.755 1.014 1.59 1.014 3.073v2.491c0 1.895-.147 2.836-.494 3.962v.04h3.733zM32.857 14.49c1.906 0 2.746 2.305 2.746 5.1 0 2.822-.84 5.075-2.746 5.075-1.92 0-2.72-2.253-2.72-5.075-.013-2.795.813-5.1 2.72-5.1zm0 10.572c3.12 0 5.666-2.557 5.666-5.485 0-2.941-2.573-5.525-5.666-5.525s-5.68 2.584-5.68 5.525c0 2.928 2.533 5.485 5.68 5.485z" />
      <path d="M25.703 24.73v-.039c-.666-1.391-.866-2.252-.866-4.147V9.388l1.466.08c1.04.119 2.613 2.186 3.76 3.829l.333-.067-.76-4.226H16.931l-.774 4.226.334.067c1.146-1.643 2.706-3.71 3.733-3.83l1.506-.079v11.156c0 1.895-.213 2.756-.893 4.147v.04z" />
    </g>
  </svg>
)
TomorrowLogo.displayName = 'TomorrowLogo'

export { TomorrowLogo as TomorrowBankLogo }

/**
 * Official logo of Revolut (Revolut Bank UAB / Revolt).
 * Features Revolut's iconic geometric 'R' cut on a signature sleek dark obsidian card.
 */
export const RevolutLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="Revolut"
    role="img"
  >
    <rect width="48" height="48" rx="8" fill="#191C1F" />
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
    <g transform="translate(11, 11) scale(1.08333)">
      <path
        d="M20.9133 6.9566C20.9133 3.1208 17.7898 0 13.9503 0H2.424v3.8605h10.9782c1.7376 0 3.177 1.3651 3.2087 3.043.016.84-.2994 1.633-.8878 2.2324-.5886.5998-1.375.9303-2.2144.9303H9.2322a.2756.2756 0 0 0-.2755.2752v3.431c0 .0585.018.1142.052.1612L16.2646 24h5.3114l-7.2727-10.094c3.6625-.1838 6.61-3.2612 6.61-6.9494zM6.8943 5.9229H2.424V24h4.4704z"
        fill="#FFFFFF"
      />
    </g>
  </svg>
)
RevolutLogo.displayName = 'RevolutLogo'

export { RevolutLogo as RevoltLogo, RevolutLogo as RevolutBankLogo }

/** FNZ Bank AG (formerly ebase AG) — German investment bank and B2B fund custody platform. */
export const FnzBankLogo: IconComponent = ({ size = 16, className }) => (
  <BankImage src="/brands/fnz-bank.png" alt="FNZ Bank" size={size} className={className} />
)
FnzBankLogo.displayName = 'FnzBankLogo'

/** ebase (European Bank for Financial Services GmbH) — fund depot and investment platform. */
export const EbaseLogo: IconComponent = ({ size = 16, className }) => (
  <BankImage src="/brands/ebase.png" alt="ebase" size={size} className={className} />
)
EbaseLogo.displayName = 'EbaseLogo'



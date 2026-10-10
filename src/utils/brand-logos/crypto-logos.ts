import { createElement } from 'react'

import { createImageLogo } from './logo-factory'
import type { IconComponent } from './types'

export const GuardarianLogo: IconComponent = ({ size = 16, className }) =>
  createElement(
    'svg',
    {
      viewBox: '0 0 48 48',
      width: typeof size === 'number' ? size : undefined,
      height: typeof size === 'number' ? size : undefined,
      style: {
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
        display: 'inline-block',
        verticalAlign: 'middle',
        borderRadius: '3px',
        flexShrink: 0,
      },
      className,
      'aria-label': 'Guardarian',
      role: 'img',
    },
    createElement('rect', { width: '48', height: '48', rx: '8', fill: '#000756' }),
    createElement(
      'g',
      { transform: 'translate(8, 8) scale(0.4)' },
      createElement('path', {
        d: 'M56.7925 69.8333C52.3565 73.2977 47.5605 76.2953 42.4837 78.7767L39.9985 80L37.4996 78.78C14.0126 67.24 0 47.36 0 25.58V0H14.3258V25.5767C14.3258 27.21 14.4347 28.8367 14.6628 30.4533C16.4672 43.6867 25.591 55.8967 39.944 64.12C39.9583 64.1323 39.9743 64.1424 39.9917 64.15L40.0291 64.1267L40.0904 64.09C45.2789 66.9314 50.9291 68.8721 56.7925 69.8333Z',
        fill: '#4C9DE8',
      }),
      createElement('path', {
        d: 'M79.9963 0.00488281H14.3251V14.0249H79.9963V0.00488281Z',
        fill: '#FFFFFF',
      }),
      createElement('path', {
        d: 'M79.9999 14.0283V25.5783C79.9999 26.055 79.9829 26.535 79.9659 27.0117H65.6333C65.6503 26.535 65.6571 26.055 65.6571 25.5783V14.0283H79.9999Z',
        fill: '#FFFFFF',
      }),
      createElement('path', {
        d: 'M79.5556 32.1518C78.8919 37.2066 77.4753 42.139 75.3511 46.7918C71.4258 55.4318 65.1141 63.2951 56.8005 69.8384C50.9394 68.8766 45.2916 66.9325 40.1052 64.0918C41.9777 63.0084 43.7956 61.8351 45.5489 60.5751C45.7225 60.4651 45.8893 60.3418 46.0527 60.2151C55.7568 53.3732 62.748 43.4581 65.8426 32.1484L79.5556 32.1518Z',
        fill: '#4C9DE8',
      }),
      createElement('path', {
        d: 'M65.8416 32.1533C70.8461 38.69 56.1901 51.3333 59.4822 46.1133H28.2637C24.8865 41.7867 22.5647 37.06 21.4481 32.1533H65.8416Z',
        fill: '#4C9DE8',
      }),
    ),
  )
GuardarianLogo.displayName = 'GuardarianLogo'

/** Kraken (Payward Ireland / Kraken Exchange) — leading global cryptocurrency exchange. */
export const KrakenLogo = createImageLogo({
  src: '/brands/kraken.png',
  label: 'Kraken',
  displayName: 'KrakenLogo',
})

/** eToro (Europe) Limited — leading social trading and multi-asset investment platform. */
export const EtoroLogo = createImageLogo({
  src: '/brands/etoro.png',
  label: 'eToro',
  displayName: 'EtoroLogo',
})

/** NAGA (NAGA Markets Europe Ltd / The NAGA Group AG) — social investing, stock, and crypto broker platform. */
export const NagaLogo = createImageLogo({
  src: '/brands/naga.png',
  label: 'NAGA',
  displayName: 'NagaLogo',
})

/** Coinbase (Coinbase Ireland Limited / Coinbase Global, Inc.) — leading cryptocurrency exchange. */
export const CoinbaseLogo: IconComponent = ({ size = 16, className }) =>
  createElement(
    'svg',
    {
      viewBox: '0 0 48 48',
      width: typeof size === 'number' ? size : undefined,
      height: typeof size === 'number' ? size : undefined,
      style: {
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
        display: 'inline-block',
        verticalAlign: 'middle',
        borderRadius: 'inherit',
        flexShrink: 0,
      },
      className: ['brand-logo-full', className].filter(Boolean).join(' '),
      'data-brand-logo': 'true',
      'aria-label': 'Coinbase',
      role: 'img',
    },
    createElement('rect', { width: '48', height: '48', fill: '#0052FF' }),
    createElement(
      'g',
      { transform: 'translate(10.03, -1.17) scale(0.20)', fill: '#FFFFFF' },
      createElement('path', {
        d: 'M71.02,84.26c16.7,0,29.95,10.3,34.98,25.62h33.66c-6.1-32.75-33.13-54.94-68.37-54.94C31.27,54.94,0,85.32,0,126s30.48,70.79,71.29,70.79c34.45,0,62.01-22.19,68.11-55.21H106c-4.77,15.32-18.02,25.89-34.72,25.89c-23.06,0-39.22-17.96-39.22-41.47S47.96,84.26,71.02,84.26z',
      }),
    ),
  )
CoinbaseLogo.displayName = 'CoinbaseLogo'

export const CRYPTO_LOGOS: Record<string, IconComponent> = {
  CoinbaseLogo,
  coinbaseLogo: CoinbaseLogo,
  'coinbase': CoinbaseLogo,
  GuardarianLogo,
  'guardarian': GuardarianLogo,
  KrakenLogo,
  'kraken': KrakenLogo,
  EtoroLogo,
  'etoro': EtoroLogo,
  NagaLogo,
  nagaLogo: NagaLogo,
  'naga': NagaLogo,
  'naga-markets': NagaLogo,
}


import { createImageLogo } from './logo-factory'
import type { IconComponent } from './types'

/** Golden Club Cabanas (Sites Cabanas SA) — beachside holiday resort and aparthotel in Cabanas de Tavira, Algarve. */
export const GoldenClubCabanasLogo = createImageLogo({
  src: '/brands/golden-club-cabanas.png',
  label: 'Golden Club Cabanas',
  displayName: 'GoldenClubCabanasLogo',
})

/** Argumento da Lua, Lda — boutique clothing, footwear, beachwear, and travel retail in the Algarve, Portugal. */
export const ArgumentoDaLuaLogo = createImageLogo({
  src: '/brands/argumento-da-lua.png',
  label: 'Argumento da Lua',
  displayName: 'ArgumentoDaLuaLogo',
})

export const PORTUGUESE_LOGOS: Record<string, IconComponent> = {
  GoldenClubCabanasLogo,
  goldenClubCabanasLogo: GoldenClubCabanasLogo,
  'golden-club-cabanas': GoldenClubCabanasLogo,
  'sites-cabanas': GoldenClubCabanasLogo,
  ArgumentoDaLuaLogo,
  argumentoDaLuaLogo: ArgumentoDaLuaLogo,
  'argumento-da-lua': ArgumentoDaLuaLogo,
}

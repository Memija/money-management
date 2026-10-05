import { createImageLogo } from './logo-factory'
import type { IconComponent } from './types'

/** Official Coat of Arms (Stadtwappen) of Stadt Bad Soden am Taunus (Main-Taunus-Kreis, Hesse). */
export const BadSodenLogo = createImageLogo({
  src: '/brands/bad-soden.png',
  label: 'Stadt Bad Soden am Taunus',
  displayName: 'BadSodenLogo',
})

/** Official Coat of Arms (Kreiswappen) of Main-Taunus-Kreis (MTK, Hesse). */
export const MainTaunusKreisLogo = createImageLogo({
  src: '/brands/mtk.png',
  label: 'Main-Taunus-Kreis',
  displayName: 'MainTaunusKreisLogo',
})

/** National Coat of Arms of Bosnia and Herzegovina (used on consular seals, embassies, and official documents). */
export const BosniaCoatOfArmsLogo = createImageLogo({
  src: '/brands/coa-ba.png',
  label: 'Generalkonsulat von Bosnien und Herzegowina',
  displayName: 'BosniaCoatOfArmsLogo',
})

/** National Coat of Arms of the Republic of Serbia. */
export const SerbiaCoatOfArmsLogo = createImageLogo({
  src: '/brands/coa-rs.png',
  label: 'Konzulat Republike Srbije',
  displayName: 'SerbiaCoatOfArmsLogo',
})

/** National Coat of Arms of the Republic of Croatia. */
export const CroatiaCoatOfArmsLogo = createImageLogo({
  src: '/brands/coa-hr.png',
  label: 'Generalni konzulat Republike Hrvatske',
  displayName: 'CroatiaCoatOfArmsLogo',
})

/** National Coat of Arms of the Republic of Poland. */
export const PolandCoatOfArmsLogo = createImageLogo({
  src: '/brands/coa-pl.png',
  label: 'Konsulat Rzeczypospolitej Polskiej',
  displayName: 'PolandCoatOfArmsLogo',
})

export const CONSULAR_LOGOS: Record<string, IconComponent> = {
  BadSodenLogo,
  StadtBadSodenLogo: BadSodenLogo,
  StandesamtBadSodenLogo: BadSodenLogo,
  MainTaunusKreisLogo,
  MtkLogo: MainTaunusKreisLogo,
  BosniaCoatOfArmsLogo,
  KonsulatBosnienLogo: BosniaCoatOfArmsLogo,
  GeneralkonsulatBosnienLogo: BosniaCoatOfArmsLogo,
  SerbiaCoatOfArmsLogo,
  CroatiaCoatOfArmsLogo,
  PolandCoatOfArmsLogo,
}

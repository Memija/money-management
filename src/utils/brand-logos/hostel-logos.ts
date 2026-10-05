import { createImageLogo } from './logo-factory'
import type { IconComponent } from './types'

/** byebye — package tour and holiday provider (alltours flugreisen group). */
export const ByebyeLogo = createImageLogo({
  src: '/brands/byebye.png',
  label: 'byebye (alltours)',
  displayName: 'ByebyeLogo',
})

/** Deutsches Jugendherbergswerk (DJH) — German Youth Hostel Association. */
export const DjhLogo = createImageLogo({
  src: '/brands/djh.png',
  label: 'Deutsches Jugendherbergswerk',
  displayName: 'DjhLogo',
})

/** Hostelling International (HI) — worldwide federation of youth hostel associations. */
export const HostellingInternationalLogo = createImageLogo({
  src: '/brands/hostelling-international.png',
  label: 'Hostelling International',
  displayName: 'HostellingInternationalLogo',
})

/** a&o Hostels — largest youth hostel and budget hotel chain in Europe. */
export const AoHostelsLogo = createImageLogo({
  src: '/brands/ao-hostels.png',
  label: 'a&o Hostels',
  displayName: 'AoHostelsLogo',
})

/** MEININGER Hotels — hybrid hostel-hotel chain across Europe. */
export const MeiningerLogo = createImageLogo({
  src: '/brands/meininger.png',
  label: 'MEININGER Hotels',
  displayName: 'MeiningerLogo',
})

/** Salzburger Jugendherbergswerk (Junge Hotels Salzburg) — youth hostels across Salzburg province including Zell am See. */
export const SalzburgerJugendherbergeLogo = createImageLogo({
  src: '/brands/salzburger-jugendherberge.png',
  label: 'Salzburger Jugendherbergen (Junge Hotels)',
  displayName: 'SalzburgerJugendherbergeLogo',
})

/** Österreichisches Jugendherbergswerk (ÖJHW) — Austrian Youth Hostel Association. */
export const OejhwLogo = createImageLogo({
  src: '/brands/oejhw.png',
  label: 'Österreichisches Jugendherbergswerk (ÖJHW)',
  displayName: 'OejhwLogo',
})

export const HOSTEL_LOGOS: Record<string, IconComponent> = {
  ByebyeLogo,
  byebyeLogo: ByebyeLogo,
  DjhLogo,
  DJHLogo: DjhLogo,
  HostellingInternationalLogo,
  HiHostelsLogo: HostellingInternationalLogo,
  AoHostelsLogo,
  AOHostelsLogo: AoHostelsLogo,
  MeiningerLogo,
  SalzburgerJugendherbergeLogo,
  salzburgerJugendherbergeLogo: SalzburgerJugendherbergeLogo,
  JungeHotelsSalzburgLogo: SalzburgerJugendherbergeLogo,
  OejhwLogo,
  OEJHWLogo: OejhwLogo,
}

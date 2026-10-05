import { createImageLogo, createWordmarkLogo } from './logo-factory'
import type { IconComponent } from './types'

/** WebID Solutions GmbH — pioneer in Video-Ident and digital identification in Germany. */
export const WebIdLogo = createImageLogo({
  src: '/brands/webid.png',
  label: 'WebID Solutions',
  displayName: 'WebIdLogo',
})

/** IDnow — German identity verification platform. */
export const IdnowLogo = createWordmarkLogo({
  label: 'IDnow',
  text: 'IDnow',
  background: '#00529C',
  textColor: '#FFFFFF',
  accentColor: '#00A3E0',
  fontSize: 11,
  displayName: 'IdnowLogo',
})

/** POSTIDENT — Deutsche Post identity verification service. */
export const PostidentLogo = createWordmarkLogo({
  label: 'POSTIDENT',
  text: 'POSTIDENT',
  background: '#FFCC00',
  textColor: '#18181B',
  accentColor: '#E30613',
  fontSize: 7.5,
  displayName: 'PostidentLogo',
})

/** Verimi — German digital identity and verification platform. */
export const VerimiLogo = createWordmarkLogo({
  label: 'verimi',
  text: 'verimi',
  background: '#003780',
  textColor: '#FFFFFF',
  accentColor: '#00D68F',
  fontSize: 11,
  displayName: 'VerimiLogo',
})

export const IDENTITY_LOGOS: Record<string, IconComponent> = {
  WebIdLogo,
  WebIDLogo: WebIdLogo,
  IdnowLogo,
  IDnowLogo: IdnowLogo,
  PostidentLogo,
  POSTIDENTLogo: PostidentLogo,
  VerimiLogo,
}

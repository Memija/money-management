import type { CSSProperties } from 'react'

import { createImageLogo } from './logo-factory'
import type { IconComponent } from './types'

const getFullTileStyle = (size: number | string): CSSProperties => ({
  width: typeof size === 'number' ? `${size}px` : size,
  height: typeof size === 'number' ? `${size}px` : size,
  display: 'inline-block',
  verticalAlign: 'middle',
  borderRadius: 'inherit',
  flexShrink: 0,
})

const getTileClasses = (className?: string) =>
  ['brand-logo-full', className].filter(Boolean).join(' ')

/** REWE — major German supermarket chain (Rewe Group). */
export const ReweLogo: IconComponent = ({ size = 16, className }) => (
  <svg
    viewBox="0 0 48 48"
    width={typeof size === 'number' ? size : undefined}
    height={typeof size === 'number' ? size : undefined}
    style={getFullTileStyle(size)}
    className={getTileClasses(className)}
    data-brand-logo="true"
    aria-label="REWE"
    role="img"
  >
    <rect width="48" height="48" fill="#CC071E" />
    <rect x="0.5" y="0.5" width="47" height="47" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
    <text
      x="24"
      y="25.5"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="13"
      letterSpacing="0.8px"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >
      REWE
    </text>
  </svg>
)
ReweLogo.displayName = 'ReweLogo'

/** Lidl — leading European discount supermarket chain (Schwarz-Gruppe). */
export const LidlLogo: IconComponent = ({ size = 16, className }) => (
  <svg
    viewBox="0 0 48 48"
    width={typeof size === 'number' ? size : undefined}
    height={typeof size === 'number' ? size : undefined}
    style={getFullTileStyle(size)}
    className={getTileClasses(className)}
    data-brand-logo="true"
    aria-label="Lidl"
    role="img"
  >
    <rect width="48" height="48" rx="6" fill="#0050AA" />
    <g transform="scale(0.8)">
      {/* Yellow circular field */}
      <path
        fill="#FFF000"
        d="M30 3.85c-14.442 0-26.15 11.708-26.15 26.15s11.708 26.15 26.15 26.15c14.438 0 26.144-11.702 26.15-26.139v-0.001c0-14.444-11.706-26.154-26.149-26.16h-0.001z"
      />
      {/* Outer red ring border */}
      <path
        fill="#E60A14"
        d="M30 2.087c-0.002 0-0.003 0-0.005 0-15.419 0-27.918 12.499-27.918 27.918s12.499 27.918 27.918 27.918c15.417 0 27.915-12.496 27.918-27.913v-0c-0.003-15.417-12.497-27.915-27.912-27.923h-0.001zM30 56.155c-14.442 0-26.15-11.708-26.15-26.15s11.708-26.15 26.15-26.15c14.442 0 26.15 11.708 26.15 26.15 0 0.004 0 0.007 0 0.011v-0.001c-0.012 14.434-11.714 26.131-26.149 26.134h-0z"
      />
      {/* Authentic typography: L and l in blue */}
      <path
        fill="#0050AA"
        d="M6.824 25.148h8.223v1.774h-1.372v5.739l4.763-2.65v4.857h-11.614v-1.784h1.377v-6.162h-1.377v-1.774zM41.494 25.148v1.774h1.377v6.162h-1.377v1.784h11.624v-4.857l-4.769 2.65v-5.739h1.377v-1.774h-8.233z"
      />
      {/* Authentic typography: Tilted i stem in red */}
      <path
        fill="#E60A14"
        d="M28.377 30.736l-4.617-4.617-5.322 5.332v1.79l1.341-1.346 3.715 3.725-1.372 1.367 0.892 0.897 7.43-7.44v-1.784l-2.066 2.077z"
      />
      {/* Authentic typography: Red dot of i */}
      <path
        fill="#E60A14"
        d="M23.082 19.623c1.616 0 2.927 1.31 2.927 2.927s-1.31 2.927-2.927 2.927c-1.616 0-2.927-1.31-2.927-2.927 0-0.004 0-0.007 0-0.011v0.001c0 0 0 0 0 0 0-1.611 1.306-2.917 2.917-2.917 0.004 0 0.007 0 0.011 0h-0.001z"
      />
      {/* Authentic typography: d in blue */}
      <path
        fill="#0050AA"
        d="M36.913 25.148h-7.826v1.774h1.372v6.162h-1.388v1.784h7.826c5.812 0 5.885-9.72 0.016-9.72z"
      />
      {/* Authentic typography: d inner counter in yellow */}
      <path
        fill="#FFF000"
        d="M35.812 31.826h-0.391v-3.652h0.329c1.717 0 1.717 3.652 0.063 3.652z"
      />
    </g>
  </svg>
)
LidlLogo.displayName = 'LidlLogo'

/** ALDI SÜD — premier international discount supermarket chain (authentic vector geometry). */
export const AldiSudLogo: IconComponent = ({ size = 16, className }) => (
  <svg
    viewBox="0 0 48 48"
    width={typeof size === 'number' ? size : undefined}
    height={typeof size === 'number' ? size : undefined}
    style={getFullTileStyle(size)}
    className={getTileClasses(className)}
    data-brand-logo="true"
    aria-label="ALDI SÜD"
    role="img"
  >
    <rect width="48" height="48" rx="6" fill="#00205B" />
    {/* Outer Cyan Border Frame */}
    <rect x="2" y="2" width="44" height="44" rx="4.5" fill="none" stroke="#00A3E0" strokeWidth="1.8" />
    {/* Inner Orange Border Frame */}
    <rect x="4.8" y="4.8" width="38.4" height="38.4" rx="3.2" fill="none" stroke="#ED6B00" strokeWidth="1.4" />
    {/* Centered Scaled Authentic Emblem & Typography */}
    <g transform="translate(3.262, 3.131) scale(1.75)">
      {/* Cyan diagonal stripes of the 'A' */}
      <path
        d="M9.355 3.519c-.68 0-.97.485-1.238 1.237L5.424 12.74h.68c.679 0 .97-.485 1.237-1.237l2.354-6.94c.194-.607.485-.947.922-.996V3.52zm4.416-.025c-.679 0-.97.486-1.238 1.238l-2.354 6.916c-.194.607-.461.947-.898.995v.049h1.213c.68 0 .971-.486 1.238-1.238l2.354-6.916c.194-.607.485-.946.922-.995v-.049zm-2.208 0c-.68 0-.97.486-1.237 1.238l-2.33 6.94c-.194.607-.461.947-.898.995v.049h1.213c.68 0 .971-.485 1.238-1.238l2.354-6.916c.194-.606.485-.946.922-.995V3.52c-.218-.025-1.213-.025-1.262-.025z"
        fill="#00A3E0"
      />
      {/* Top red-orange horizontal bar */}
      <path
        d="M16.392 6.722c-.267-.534-.534-.582-1.019-.582h-1.238l-.485 1.43h2.403c.34 0 .63.049.825.316h.048c0-.025-.485-1.02-.534-1.165z"
        fill="#E03C00"
      />
      {/* Middle orange horizontal bar */}
      <path
        d="M17.266 8.785c-.243-.51-.534-.583-1.02-.583h-2.79l-.485 1.432h3.955c.364 0 .631.049.825.315h.049s-.486-1.043-.534-1.164z"
        fill="#ED6B00"
      />
      {/* Bottom yellow horizontal bar */}
      <path
        d="M18.164 10.92c-.243-.558-.558-.655-1.044-.655h-4.368l-.412 1.189a.727.727 0 0 1-.097.243h5.533c.315 0 .582.048.8.315h.049c0 .024-.437-1.02-.461-1.092z"
        fill="#FFB81C"
      />
      {/* ALDI wordmark */}
      <path
        d="M8.36 17.569c-.049-.194-.121-.534-.17-.68H6.855c-.048.146-.12.486-.17.68H5.497c.51-1.601.728-2.257 1.31-3.688h1.457c.558 1.407.8 2.087 1.31 3.688zm-1.335-1.456h.995c-.145-.485-.412-1.31-.485-1.553-.097.219-.364 1.044-.51 1.553zm3.834 1.456c-.63 0-.97-.364-.97-.995v-2.693h1.116v2.475c0 .315.097.388.413.388h1.092l.17.825zm6.334-3.688h1.116v3.688h-1.116zm-4.077 3.688v-3.688h1.53c1.14 0 1.916.46 1.916 1.82 0 1.31-.63 1.868-1.868 1.868zm1.117-.8h.315c.68 0 .946-.316.946-1.068 0-.728-.34-1.02-.995-1.02h-.266z"
        fill="#FFFFFF"
      />
      {/* SÜD wordmark */}
      <path
        d="M11.927 20.336c-.558 0-.655-.243-.655-.825v-.923h.461v1.044c0 .267.024.388.218.388.17 0 .219-.097.219-.388v-1.044h.437v.923c0 .63-.17.825-.68.825zm.316-1.917a.217.217 0 0 1-.219-.219c0-.121.097-.242.219-.242.121 0 .218.12.218.242a.217.217 0 0 1-.218.219zm-.631 0a.217.217 0 0 1-.219-.219c0-.121.097-.242.219-.242.121 0 .218.12.218.242a.217.217 0 0 1-.218.219zm1.31 1.868v-1.699h.485c.607 0 .874.122.874.85s-.267.85-.874.85zm.558-.291c.243 0 .34-.146.34-.558 0-.388-.097-.558-.34-.558h-.097v1.116zm-3.154.34c-.267 0-.461-.049-.559-.073l.073-.316c.17.049.291.073.389.073.12 0 .266-.024.266-.17 0-.097-.12-.17-.242-.242h-.024c-.195-.122-.413-.243-.413-.51 0-.315.218-.485.63-.485.22 0 .34.024.51.073l-.072.29a.924.924 0 0 0-.364-.072c-.146 0-.243.048-.243.17 0 .097.121.17.267.242h.024c.194.122.437.243.437.51 0 .316-.218.51-.68.51z"
        fill="#FFFFFF"
      />
    </g>
  </svg>
)
AldiSudLogo.displayName = 'AldiSudLogo'

export const AldiLogo: IconComponent = AldiSudLogo
AldiLogo.displayName = 'AldiLogo'

/** ALDI Nord — international discount supermarket chain (northern Germany & Europe). */
export const AldiNordLogo: IconComponent = ({ size = 16, className }) => (
  <svg
    viewBox="0 0 48 48"
    width={typeof size === 'number' ? size : undefined}
    height={typeof size === 'number' ? size : undefined}
    style={getFullTileStyle(size)}
    className={getTileClasses(className)}
    data-brand-logo="true"
    aria-label="ALDI Nord"
    role="img"
  >
    <rect width="48" height="48" rx="6" fill="#00205B" />
    <g transform="translate(6, 6) scale(1.5)">
      <path
        d="M13.812 2.057 6.086 13.73c-.349.523-.581.89-.592 1.461-.01.541.128 1.027.395 1.495h1.46a2.11 2.11 0 0 1-.546-1.531c.007-.125.03-.28.067-.405h9.833a1.933 1.933 0 0 0-.297-.583H7.145a11.3 11.3 0 0 1 .379-.604l.507-.76h7.47l-.408-.614H8.44l6.702-10.132zm-3.502 0L3.092 12.963c-.549.823-.806 1.304-.806 2.068 0 .871.232 1.255.409 1.655h1.153a4.007 4.007 0 0 1-.096-.232 3.327 3.327 0 0 1-.233-1.23c.02-.811.302-1.356.772-2.058l7.381-11.109zm6.34 14.629c.338-.352.58-.927.547-1.532-.028-.517-.343-1.026-.72-1.591l-4.234-6.35.648-.974 4.993 7.491c.348.523.58.89.592 1.461a2.833 2.833 0 0 1-.395 1.495h-1.43zm3.508 0c.041-.09.062-.144.094-.23.123-.324.27-.768.26-1.231-.02-.812-.302-1.357-.773-2.059l-5.745-8.58.665-.996 6.25 9.373c.548.824.805 1.303.805 2.068 0 .871-.232 1.255-.409 1.655zm-17.53.457v4.8h18.743v-4.8zm3.588.571h1.672l1.873 3.658H8.104l-.176-.385H6.177L6 21.372H4.343zm3.761 0h1.67v2.601h1.435v1.057H9.977zm3.422 0h2.43c1.002 0 1.814.82 1.814 1.83a1.822 1.822 0 0 1-1.815 1.828h-2.43zm4.614 0h1.644v3.658h-1.644zm-2.974 1.034v1.59h.352c.41 0 .743-.356.743-.795 0-.44-.332-.795-.743-.795zm-7.996.465-.374.811h.767zm.84-6.189h7.767l.614.922H7.276c.088-.145.607-.922.607-.922m4.035-10.967L4.488 13.24c-.465.695-.731 1.214-.75 1.99-.01.452.128 1.013.337 1.457h1.576a2.942 2.942 0 0 1-.376-1.497c.012-.615.266-1.01.614-1.531l7.678-11.6zm6.431 14.629a2.94 2.94 0 0 0 .376-1.497c-.012-.615-.266-1.01-.613-1.532l-5.079-7.625.827-1.247 5.652 8.454c.465.695.732 1.214.75 1.99.011.452-.128 1.013-.338 1.457H18.35zM23.429 0H.57v24h22.86zm-.915 23.086H1.486V.914h21.028z"
        fill="#FFFFFF"
      />
    </g>
  </svg>
)
AldiNordLogo.displayName = 'AldiNordLogo'

/** EDEKA — Germany's largest supermarket corporation. */
export const EdekaLogo: IconComponent = ({ size = 16, className }) => (
  <svg
    viewBox="0 0 48 48"
    width={typeof size === 'number' ? size : undefined}
    height={typeof size === 'number' ? size : undefined}
    style={getFullTileStyle(size)}
    className={getTileClasses(className)}
    data-brand-logo="true"
    aria-label="EDEKA"
    role="img"
  >
    <rect width="48" height="48" fill="#005CA9" />
    {/* Yellow border */}
    <rect x="2.5" y="2.5" width="43" height="43" rx="4" fill="none" stroke="#FFD100" strokeWidth="2" />
    {/* Iconic EDEKA stylized 'E' block */}
    <g transform="translate(13, 8)">
      {/* Yellow stem and top/bottom arms */}
      <path
        d="M 0 0 L 22 0 L 22 6 L 6 6 L 6 11 L 18 11 L 18 16 L 6 16 L 6 21 L 22 21 L 22 27 L 0 27 Z"
        fill="#FFD100"
      />
      {/* Inner cyan-blue triangle cut */}
      <polygon points="6,6 18,11 6,11" fill="#00A3E0" />
      <polygon points="6,16 18,16 6,21" fill="#00A3E0" />
    </g>
    {/* EDEKA wordmark */}
    <text
      x="24"
      y="41"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="7.5"
      letterSpacing="0.8px"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >
      EDEKA
    </text>
  </svg>
)
EdekaLogo.displayName = 'EdekaLogo'

/** Kaufland — major German hypermarket chain (Schwarz-Gruppe). */
export const KauflandLogo: IconComponent = ({ size = 16, className }) => (
  <svg
    viewBox="0 0 48 48"
    width={typeof size === 'number' ? size : undefined}
    height={typeof size === 'number' ? size : undefined}
    style={getFullTileStyle(size)}
    className={getTileClasses(className)}
    data-brand-logo="true"
    aria-label="Kaufland"
    role="img"
  >
    <rect width="48" height="48" fill="#E3000F" />
    {/* White card container */}
    <rect x="4" y="4" width="40" height="40" rx="4" fill="#FFFFFF" />
    {/* Red outer geometric grid border */}
    <rect x="6" y="6" width="36" height="36" rx="2" fill="none" stroke="#E3000F" strokeWidth="1.5" />
    {/* Stylized Kaufland 'K' triangles */}
    <g transform="translate(14, 9)">
      {/* Left red pillar */}
      <rect x="0" y="0" width="5" height="20" fill="#E3000F" />
      {/* Top right triangle */}
      <polygon points="9,0 19,0 9,9" fill="#E3000F" />
      {/* Bottom right triangle */}
      <polygon points="9,20 19,20 9,11" fill="#E3000F" />
    </g>
    {/* Kaufland wordmark */}
    <text
      x="24"
      y="37"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#E3000F"
      fontWeight="900"
      fontSize="6"
      letterSpacing="0.2px"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >
      Kaufland
    </text>
  </svg>
)
KauflandLogo.displayName = 'KauflandLogo'

/** Penny — German discount supermarket chain (Rewe Group). */
export const PennyLogo: IconComponent = ({ size = 16, className }) => (
  <svg
    viewBox="0 0 48 48"
    width={typeof size === 'number' ? size : undefined}
    height={typeof size === 'number' ? size : undefined}
    style={getFullTileStyle(size)}
    className={getTileClasses(className)}
    data-brand-logo="true"
    aria-label="Penny"
    role="img"
  >
    <rect width="48" height="48" fill="#CC071E" />
    <rect x="0.5" y="0.5" width="47" height="47" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
    <text
      x="24"
      y="25"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="10.5"
      letterSpacing="0.8px"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >
      PENNY.
    </text>
  </svg>
)
PennyLogo.displayName = 'PennyLogo'

/** Netto Marken-Discount — German supermarket discount chain (Edeka Group). */
export const NettoLogo: IconComponent = ({ size = 16, className }) => (
  <svg
    viewBox="0 0 48 48"
    width={typeof size === 'number' ? size : undefined}
    height={typeof size === 'number' ? size : undefined}
    style={getFullTileStyle(size)}
    className={getTileClasses(className)}
    data-brand-logo="true"
    aria-label="Netto"
    role="img"
  >
    <rect width="48" height="48" fill="#FFD500" />
    <rect x="0.5" y="0.5" width="47" height="47" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
    <text
      x="24"
      y="20.5"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#CC071E"
      fontWeight="900"
      fontSize="14"
      letterSpacing="-0.5px"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >
      Netto
    </text>
    <rect x="6" y="30" width="36" height="3.5" rx="1.75" fill="#CC071E" />
    <text
      x="24"
      y="39.5"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#CC071E"
      fontWeight="800"
      fontSize="4.8"
      letterSpacing="0.4px"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >
      MARKEN-DISCOUNT
    </text>
  </svg>
)
NettoLogo.displayName = 'NettoLogo'

/** BILLA — Austria's premier supermarket chain (Rewe International). */
export const BillaLogo: IconComponent = ({ size = 16, className }) => (
  <svg
    viewBox="0 0 48 48"
    width={typeof size === 'number' ? size : undefined}
    height={typeof size === 'number' ? size : undefined}
    style={getFullTileStyle(size)}
    className={getTileClasses(className)}
    data-brand-logo="true"
    aria-label="BILLA"
    role="img"
  >
    <rect width="48" height="48" fill="#FED100" />
    <rect x="0.5" y="0.5" width="47" height="47" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
    <text
      x="24"
      y="25.5"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#D90000"
      fontWeight="900"
      fontSize="13"
      letterSpacing="0.8px"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >
      BILLA
    </text>
  </svg>
)
BillaLogo.displayName = 'BillaLogo'

/** BILLA PLUS — Austrian hypermarket chain (formerly Merkur). */
export const BillaPlusLogo: IconComponent = ({ size = 16, className }) => (
  <svg
    viewBox="0 0 48 48"
    width={typeof size === 'number' ? size : undefined}
    height={typeof size === 'number' ? size : undefined}
    style={getFullTileStyle(size)}
    className={getTileClasses(className)}
    data-brand-logo="true"
    aria-label="BILLA PLUS"
    role="img"
  >
    <rect width="48" height="48" fill="#FED100" />
    <rect x="0.5" y="0.5" width="47" height="47" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
    <text
      x="24"
      y="18.5"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#D90000"
      fontWeight="900"
      fontSize="11"
      letterSpacing="0.6px"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >
      BILLA
    </text>
    <rect x="11" y="27" width="26" height="12" rx="3" fill="#008037" />
    <text
      x="24"
      y="33.5"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="7"
      letterSpacing="0.8px"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >
      PLUS
    </text>
  </svg>
)
BillaPlusLogo.displayName = 'BillaPlusLogo'

/** Biedronka — Poland's leading discount supermarket chain (Jerónimo Martins). */
export const BiedronkaLogo: IconComponent = ({ size = 16, className }) => (
  <svg
    viewBox="0 0 48 48"
    width={typeof size === 'number' ? size : undefined}
    height={typeof size === 'number' ? size : undefined}
    style={getFullTileStyle(size)}
    className={getTileClasses(className)}
    data-brand-logo="true"
    aria-label="Biedronka"
    role="img"
  >
    <rect width="48" height="48" fill="#FED100" />
    <rect x="0.5" y="0.5" width="47" height="47" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
    {/* Ladybug shell */}
    <ellipse cx="24" cy="18.5" rx="12" ry="11" fill="#E30613" />
    {/* Center divider */}
    <line x1="24" y1="8" x2="24" y2="29.5" stroke="#1A1A1A" strokeWidth="1.5" />
    {/* Spots */}
    <circle cx="18" cy="15.5" r="2.2" fill="#1A1A1A" />
    <circle cx="30" cy="15.5" r="2.2" fill="#1A1A1A" />
    <circle cx="19" cy="23.5" r="2" fill="#1A1A1A" />
    <circle cx="29" cy="23.5" r="2" fill="#1A1A1A" />
    {/* Happy eyes */}
    <circle cx="21" cy="10.5" r="1.5" fill="#FFFFFF" />
    <circle cx="27" cy="10.5" r="1.5" fill="#FFFFFF" />
    <circle cx="21" cy="10.5" r="0.8" fill="#1A1A1A" />
    <circle cx="27" cy="10.5" r="0.8" fill="#1A1A1A" />
    {/* Red banner pill */}
    <rect x="5" y="32.5" width="38" height="10" rx="3" fill="#E30613" />
    <text
      x="24"
      y="38"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="6"
      letterSpacing="0.3px"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >
      Biedronka
    </text>
  </svg>
)
BiedronkaLogo.displayName = 'BiedronkaLogo'

/** Żabka — Poland's leading convenience store franchise chain. */
export const ZabkaLogo: IconComponent = ({ size = 16, className }) => (
  <svg
    viewBox="0 0 48 48"
    width={typeof size === 'number' ? size : undefined}
    height={typeof size === 'number' ? size : undefined}
    style={getFullTileStyle(size)}
    className={getTileClasses(className)}
    data-brand-logo="true"
    aria-label="Żabka"
    role="img"
  >
    <rect width="48" height="48" fill="#005934" />
    <text
      x="24"
      y="21"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="12"
      letterSpacing="-0.2px"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >
      żabka
    </text>
    {/* Signature yellow smile curve */}
    <path
      d="M 12 28.5 Q 24 37.5 36 28.5"
      fill="none"
      stroke="#FFCC00"
      strokeWidth="3.2"
      strokeLinecap="round"
    />
  </svg>
)
ZabkaLogo.displayName = 'ZabkaLogo'

/** Carrefour — multinational hypermarket and grocery retail chain. */
export const CarrefourLogo: IconComponent = ({ size = 16, className }) => (
  <svg
    viewBox="0 0 48 48"
    width={typeof size === 'number' ? size : undefined}
    height={typeof size === 'number' ? size : undefined}
    style={getFullTileStyle(size)}
    className={getTileClasses(className)}
    data-brand-logo="true"
    aria-label="Carrefour"
    role="img"
  >
    <rect width="48" height="48" fill="#FFFFFF" />
    <rect x="0.5" y="0.5" width="47" height="47" fill="none" stroke="#E2E8F0" strokeWidth="1" />
    {/* Left blue curved diamond */}
    <path
      d="M 19 9 C 14 14 11 19 11 24 C 11 29 14 34 19 39 L 24 33 C 21 29 19 26 19 24 C 19 22 21 19 24 15 Z"
      fill="#004E9A"
    />
    {/* Right red diamond arrow */}
    <path
      d="M 29 9 L 24 15 C 27 19 29 22 29 24 C 29 26 27 29 24 33 L 29 39 C 34 34 37 29 37 24 C 37 19 34 14 29 9 Z"
      fill="#E3001B"
    />
  </svg>
)
CarrefourLogo.displayName = 'CarrefourLogo'

/** Auchan — French multinational retail group and hypermarket chain. */
export const AuchanLogo: IconComponent = ({ size = 16, className }) => (
  <svg
    viewBox="0 0 48 48"
    width={typeof size === 'number' ? size : undefined}
    height={typeof size === 'number' ? size : undefined}
    style={getFullTileStyle(size)}
    className={getTileClasses(className)}
    data-brand-logo="true"
    aria-label="Auchan"
    role="img"
  >
    <rect width="48" height="48" fill="#FFFFFF" />
    <rect x="0.5" y="0.5" width="47" height="47" fill="none" stroke="#E2E8F0" strokeWidth="1" />
    {/* Iconic Auchan robin bird */}
    <g transform="translate(10, 8) scale(1.15)">
      {/* Red bird head & breast */}
      <path
        d="M 12 3 C 7 3 3 7 3 13 C 3 17 6 21 11 22 C 16 23 21 19 21 13 C 21 7 17 3 12 3 Z"
        fill="#E3001B"
      />
      {/* Green beak / wing accent */}
      <path d="M 3 11 L 0 13 L 4 15 Z" fill="#008836" />
      <path d="M 12 14 C 15 14 18 17 19 21 C 15 22 12 18 12 14 Z" fill="#008836" />
      {/* White eye */}
      <circle cx="7.5" cy="10" r="1.5" fill="#FFFFFF" />
      <circle cx="7.5" cy="10" r="0.8" fill="#1A1A1A" />
    </g>
    <text
      x="24"
      y="38.5"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#E3001B"
      fontWeight="900"
      fontSize="6.5"
      letterSpacing="-0.2px"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >
      Auchan
    </text>
  </svg>
)
AuchanLogo.displayName = 'AuchanLogo'

/** Coop — Swiss and European retail and wholesale supermarket cooperative. */
export const CoopLogo: IconComponent = ({ size = 16, className }) => (
  <svg
    viewBox="0 0 48 48"
    width={typeof size === 'number' ? size : undefined}
    height={typeof size === 'number' ? size : undefined}
    style={getFullTileStyle(size)}
    className={getTileClasses(className)}
    data-brand-logo="true"
    aria-label="Coop"
    role="img"
  >
    <rect width="48" height="48" fill="#E35205" />
    <rect x="0.5" y="0.5" width="47" height="47" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
    <text
      x="24"
      y="24"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="14"
      letterSpacing="-0.5px"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >
      coop
    </text>
  </svg>
)
CoopLogo.displayName = 'CoopLogo'

/** Tesco — British multinational groceries and general merchandise retailer. */
export const TescoLogo: IconComponent = ({ size = 16, className }) => (
  <svg
    viewBox="0 0 48 48"
    width={typeof size === 'number' ? size : undefined}
    height={typeof size === 'number' ? size : undefined}
    style={getFullTileStyle(size)}
    className={getTileClasses(className)}
    data-brand-logo="true"
    aria-label="Tesco"
    role="img"
  >
    <rect width="48" height="48" fill="#FFFFFF" />
    <rect x="0.5" y="0.5" width="47" height="47" fill="none" stroke="#E2E8F0" strokeWidth="1" />
    <text
      x="24"
      y="21"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#EE1C2E"
      fontWeight="900"
      fontSize="11"
      letterSpacing="0.8px"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >
      TESCO
    </text>
    {/* Blue dashes under each letter */}
    <rect x="8.5" y="29.5" width="4.5" height="2.2" rx="0.5" fill="#00539F" />
    <rect x="14.8" y="29.5" width="4.5" height="2.2" rx="0.5" fill="#00539F" />
    <rect x="21.5" y="29.5" width="4.5" height="2.2" rx="0.5" fill="#00539F" />
    <rect x="28" y="29.5" width="4.5" height="2.2" rx="0.5" fill="#00539F" />
    <rect x="34.5" y="29.5" width="4.5" height="2.2" rx="0.5" fill="#00539F" />
  </svg>
)
TescoLogo.displayName = 'TescoLogo'

/** ASDA — British supermarket retailer. */
export const AsdaLogo: IconComponent = ({ size = 16, className }) => (
  <svg
    viewBox="0 0 48 48"
    width={typeof size === 'number' ? size : undefined}
    height={typeof size === 'number' ? size : undefined}
    style={getFullTileStyle(size)}
    className={getTileClasses(className)}
    data-brand-logo="true"
    aria-label="ASDA"
    role="img"
  >
    <rect width="48" height="48" fill="#78BE20" />
    <text
      x="24"
      y="25.5"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="13"
      letterSpacing="0.5px"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >
      ASDA
    </text>
  </svg>
)
AsdaLogo.displayName = 'AsdaLogo'

/** Morrisons — major British supermarket chain. */
export const MorrisonsLogo: IconComponent = ({ size = 16, className }) => (
  <svg
    viewBox="0 0 48 48"
    width={typeof size === 'number' ? size : undefined}
    height={typeof size === 'number' ? size : undefined}
    style={getFullTileStyle(size)}
    className={getTileClasses(className)}
    data-brand-logo="true"
    aria-label="Morrisons"
    role="img"
  >
    <rect width="48" height="48" fill="#004F34" />
    {/* Yellow foliage tree mark */}
    <g transform="translate(14, 8) scale(0.85)">
      <path
        d="M 12 2 C 10 6 6 8 4 12 C 1 18 5 24 12 24 C 19 24 23 18 20 12 C 18 8 14 6 12 2 Z"
        fill="#FFB81C"
      />
      <circle cx="7" cy="8" r="3" fill="#FFB81C" />
      <circle cx="17" cy="8" r="3" fill="#FFB81C" />
    </g>
    <text
      x="24"
      y="38.5"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="6.5"
      letterSpacing="0.2px"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >
      Morrisons
    </text>
  </svg>
)
MorrisonsLogo.displayName = 'MorrisonsLogo'

/** HelloFresh — leading global meal-kit provider. */
export const HellofreshLogo: IconComponent = ({ size = 16, className }) => (
  <svg
    viewBox="0 0 48 48"
    width={typeof size === 'number' ? size : undefined}
    height={typeof size === 'number' ? size : undefined}
    style={getFullTileStyle(size)}
    className={getTileClasses(className)}
    data-brand-logo="true"
    aria-label="HelloFresh"
    role="img"
  >
    <rect width="48" height="48" fill="#99CC00" />
    {/* Lime fruit mark */}
    <path
      d="M 24 8 C 15 8 9 15 9 24 C 9 32 16 38 24 38 C 32 38 39 32 39 24 C 39 15 33 8 24 8 Z"
      fill="#FFFFFF"
    />
    <path
      d="M 24 11 C 17 11 12 17 12 24 C 12 30 18 35 24 35 C 30 35 36 30 36 24 C 36 17 31 11 24 11 Z"
      fill="#99CC00"
    />
    {/* Lime wheel segments */}
    <circle cx="24" cy="24" r="3" fill="#FFFFFF" />
    <path d="M 24 13 L 24 21" stroke="#FFFFFF" strokeWidth="1.5" />
    <path d="M 24 27 L 24 35" stroke="#FFFFFF" strokeWidth="1.5" />
    <path d="M 13 24 L 21 24" stroke="#FFFFFF" strokeWidth="1.5" />
    <path d="M 27 24 L 35 24" stroke="#FFFFFF" strokeWidth="1.5" />
    <path d="M 16 16 L 22 22" stroke="#FFFFFF" strokeWidth="1.5" />
    <path d="M 26 26 L 32 32" stroke="#FFFFFF" strokeWidth="1.5" />
    <path d="M 32 16 L 26 22" stroke="#FFFFFF" strokeWidth="1.5" />
    <path d="M 22 26 L 16 32" stroke="#FFFFFF" strokeWidth="1.5" />
  </svg>
)
HellofreshLogo.displayName = 'HellofreshLogo'

/** Dino — Polish supermarket chain. */
export const DinoLogo: IconComponent = ({ size = 16, className }) => (
  <svg
    viewBox="0 0 48 48"
    width={typeof size === 'number' ? size : undefined}
    height={typeof size === 'number' ? size : undefined}
    style={getFullTileStyle(size)}
    className={getTileClasses(className)}
    data-brand-logo="true"
    aria-label="Dino"
    role="img"
  >
    <rect width="48" height="48" fill="#D8232A" />
    <text
      x="24"
      y="25.5"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#00843D"
      stroke="#FFFFFF"
      strokeWidth="1.2"
      paintOrder="stroke fill"
      fontWeight="900"
      fontSize="15"
      letterSpacing="-0.5px"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >
      dino
    </text>
  </svg>
)
DinoLogo.displayName = 'DinoLogo'

/** Bingo — leading supermarket and retail chain in Bosnia and Herzegovina. */
export const BingoLogo: IconComponent = ({ size = 16, className }) => (
  <svg
    viewBox="0 0 48 48"
    width={typeof size === 'number' ? size : undefined}
    height={typeof size === 'number' ? size : undefined}
    style={getFullTileStyle(size)}
    className={getTileClasses(className)}
    data-brand-logo="true"
    aria-label="Bingo"
    role="img"
  >
    <rect width="48" height="48" fill="#E30613" />
    <text
      x="24"
      y="25.5"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="12"
      letterSpacing="0.3px"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >
      bingo
    </text>
  </svg>
)
BingoLogo.displayName = 'BingoLogo'

/** Konzum — leading supermarket chain in Croatia and the Western Balkans. */
export const KonzumLogo: IconComponent = ({ size = 16, className }) => (
  <svg
    viewBox="0 0 48 48"
    width={typeof size === 'number' ? size : undefined}
    height={typeof size === 'number' ? size : undefined}
    style={getFullTileStyle(size)}
    className={getTileClasses(className)}
    data-brand-logo="true"
    aria-label="Konzum"
    role="img"
  >
    <rect width="48" height="48" fill="#E2001A" />
    <text
      x="24"
      y="25.5"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="9.5"
      letterSpacing="0.8px"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >
      KONZUM
    </text>
  </svg>
)
KonzumLogo.displayName = 'KonzumLogo'

const SparImageLogo = createImageLogo({
  src: '/brands/spar.png',
  label: 'SPAR',
  displayName: 'SparLogo',
})

/** SPAR — multinational supermarket, hypermarket, and retail grocery franchise (official SPAR International brand identity). */
export const SparLogo: IconComponent = ({ size = 16, className }) => (
  <SparImageLogo size={size} className={className} />
)
SparLogo.displayName = 'SparLogo'

/** Anadolu Supermarkt — Turkish grocery supermarket and fresh market specialist in Bad Homburg. */
export const AnadoluSupermarktLogo: IconComponent = ({ size = 16, className }) => (
  <svg
    viewBox="0 0 48 48"
    width={typeof size === 'number' ? size : undefined}
    height={typeof size === 'number' ? size : undefined}
    style={getFullTileStyle(size)}
    className={getTileClasses(className)}
    data-brand-logo="true"
    aria-label="Anadolu Supermarkt"
    role="img"
  >
    <rect width="48" height="48" fill="#B91C1C" />
    {/* Storefront canopy header bar */}
    <path d="M 0 0 L 48 0 L 48 8.5 L 0 8.5 Z" fill="#991B1B" />
    {/* Scalloped canopy awning trim */}
    <path
      d="M 3 8.5 Q 6.5 12 10 8.5 Q 13.5 12 17 8.5 Q 20.5 12 24 8.5 Q 27.5 12 31 8.5 Q 34.5 12 38 8.5 Q 41.5 12 45 8.5"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="1.2"
      strokeLinecap="round"
      opacity="0.9"
    />
    {/* Primary ANADOLU wordmark */}
    <text
      x="24"
      y="24.5"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontSize="8.5"
      letterSpacing="0.8px"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >
      ANADOLU
    </text>
    {/* Clean white pill badge with red SUPERMARKT lettering */}
    <rect x="6.5" y="32" width="35" height="8.5" rx="2" fill="#FFFFFF" />
    <text
      x="24"
      y="36.5"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#B91C1C"
      fontWeight="900"
      fontSize="4.2"
      letterSpacing="0.6px"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >
      SUPERMARKT
    </text>
  </svg>
)
AnadoluSupermarktLogo.displayName = 'AnadoluSupermarktLogo'

/** Transgourmet — specialist B2B wholesale grocer and food service delivery provider. */
const RawTransgourmetLogo = createImageLogo({
  src: '/brands/transgourmet.png',
  label: 'Transgourmet',
  displayName: 'TransgourmetLogo',
})
export const TransgourmetLogo: IconComponent = (props) => <RawTransgourmetLogo {...props} />
TransgourmetLogo.displayName = 'TransgourmetLogo'

/** Früchte und Feinkost — Rothenburg ob der Tauber gourmet fresh produce and deli grocer. */
const RawFruechteFeinkostLogo = createImageLogo({
  src: '/brands/fruechte-und-feinkost.png',
  label: 'Früchte und Feinkost',
  displayName: 'FruechteFeinkostLogo',
})
export const FruechteFeinkostLogo: IconComponent = (props) => <RawFruechteFeinkostLogo {...props} />
FruechteFeinkostLogo.displayName = 'FruechteFeinkostLogo'

// eslint-disable-next-line react-refresh/only-export-components
export const GROCERY_LOGOS: Record<string, IconComponent> = {
  // REWE
  ReweLogo,
  reweLogo: ReweLogo,
  REWELogo: ReweLogo,
  rewe: ReweLogo,
  REWE: ReweLogo,
  SiRewe: ReweLogo,

  // Lidl
  LidlLogo,
  lidlLogo: LidlLogo,
  lidl: LidlLogo,
  Lidl: LidlLogo,
  SiLidl: LidlLogo,

  // ALDI
  AldiLogo,
  aldiLogo: AldiLogo,
  ALDI: AldiLogo,
  aldi: AldiLogo,
  AldiSudLogo,
  aldiSudLogo: AldiSudLogo,
  'aldi-sued': AldiSudLogo,
  'aldi-süd': AldiSudLogo,
  AldiNordLogo,
  aldiNordLogo: AldiNordLogo,
  'aldi-nord': AldiNordLogo,
  SiAldisud: AldiSudLogo,
  SiAldinord: AldiNordLogo,

  // EDEKA
  EdekaLogo,
  edekaLogo: EdekaLogo,
  EDEKA: EdekaLogo,
  edeka: EdekaLogo,
  SiEdeka: EdekaLogo,

  // Kaufland
  KauflandLogo,
  kauflandLogo: KauflandLogo,
  kaufland: KauflandLogo,
  Kaufland: KauflandLogo,
  SiKaufland: KauflandLogo,

  // Penny
  PennyLogo,
  pennyLogo: PennyLogo,
  penny: PennyLogo,
  Penny: PennyLogo,
  SiPenny: PennyLogo,

  // Netto
  NettoLogo,
  nettoLogo: NettoLogo,
  netto: NettoLogo,
  Netto: NettoLogo,
  SiNetto: NettoLogo,

  // SPAR
  SparLogo,
  sparLogo: SparLogo,
  SPARLogo: SparLogo,
  spar: SparLogo,
  SPAR: SparLogo,
  'spar-portugal': SparLogo,

  // BILLA
  BillaLogo,
  billaLogo: BillaLogo,
  billa: BillaLogo,
  BILLA: BillaLogo,

  // BILLA PLUS
  BillaPlusLogo,
  billaPlusLogo: BillaPlusLogo,
  'billa-plus': BillaPlusLogo,
  'billa plus': BillaPlusLogo,

  // Biedronka
  BiedronkaLogo,
  biedronkaLogo: BiedronkaLogo,
  biedronka: BiedronkaLogo,
  Biedronka: BiedronkaLogo,

  // Żabka
  ZabkaLogo,
  zabkaLogo: ZabkaLogo,
  zabka: ZabkaLogo,
  'żabka': ZabkaLogo,
  SiZabka: ZabkaLogo,

  // Carrefour
  CarrefourLogo,
  carrefourLogo: CarrefourLogo,
  carrefour: CarrefourLogo,
  SiCarrefour: CarrefourLogo,

  // Auchan
  AuchanLogo,
  auchanLogo: AuchanLogo,
  auchan: AuchanLogo,
  SiAuchan: AuchanLogo,

  // Coop
  CoopLogo,
  coopLogo: CoopLogo,
  coop: CoopLogo,
  SiCoop: CoopLogo,

  // Tesco
  TescoLogo,
  tescoLogo: TescoLogo,
  tesco: TescoLogo,
  SiTesco: TescoLogo,

  // ASDA
  AsdaLogo,
  asdaLogo: AsdaLogo,
  asda: AsdaLogo,
  SiAsda: AsdaLogo,

  // Morrisons
  MorrisonsLogo,
  morrisonsLogo: MorrisonsLogo,
  morrisons: MorrisonsLogo,
  SiMorrisons: MorrisonsLogo,

  // HelloFresh
  HellofreshLogo,
  hellofreshLogo: HellofreshLogo,
  hellofresh: HellofreshLogo,
  SiHellofresh: HellofreshLogo,

  // Dino
  DinoLogo,
  dinoLogo: DinoLogo,
  dino: DinoLogo,

  // Bingo
  BingoLogo,
  bingoLogo: BingoLogo,
  bingo: BingoLogo,

  // Konzum
  KonzumLogo,
  konzumLogo: KonzumLogo,
  konzum: KonzumLogo,

  // Anadolu Supermarkt
  AnadoluSupermarktLogo,
  anadoluSupermarktLogo: AnadoluSupermarktLogo,
  anadolu: AnadoluSupermarktLogo,
  'anadolu-supermarkt': AnadoluSupermarktLogo,

  // Transgourmet
  TransgourmetLogo,
  transgourmetLogo: TransgourmetLogo,
  transgourmet: TransgourmetLogo,

  // Früchte und Feinkost
  FruechteFeinkostLogo,
  fruechteFeinkostLogo: FruechteFeinkostLogo,
  'fruechte-und-feinkost': FruechteFeinkostLogo,
}

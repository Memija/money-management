import type { IconComponent } from './types'

const HoeGraphic = () => (
  <g>
    <path
      fill="#FFFFFF"
      stroke="#000000"
      strokeWidth="6"
      strokeLinejoin="round"
      d="m 269.12618,288.69172 c -12.98978,27.87228 -5.85919,26.53425 -11.33569,37.48039 -39.04589,78.04283 -72.95819,118.04524 -94.57322,146.58727 -0.71397,0.94278 -0.80807,2.53876 -0.17632,3.53875 3.49332,5.5295 7.96869,10.49784 16.54869,13.12067 1.02565,0.31354 2.40534,-0.16868 3.0613,-1.01737 32.98873,-42.68093 59.29517,-86.48738 94.20287,-152.09255 9.3713,-17.61232 10.13891,-6.7952 23.9261,-31.74487"
    />
    <path
      fill="#FFFFFF"
      stroke="#000000"
      strokeWidth="6"
      strokeLinejoin="round"
      d="m 376.41208,134.96687 2.79389,-2.42976 -1.28632,-1.77896 c 0,0 -2.76252,-5.27037 -2.76252,-8.65412 l 1e-5,-46.923285 c 0,-7.180643 5.7808,-12.961446 16.27579,-12.96145 10.49498,-4e-6 19.17512,5.508554 19.17512,17.707613 v 41.883952 c 0,2.72229 -0.29365,4.65466 -1.84323,6.49474 l -1.71282,1.88254 3.30125,3.76051"
      transform="rotate(28.925036)"
    />
    <path
      fill="#FFFFFF"
      stroke="#000000"
      strokeWidth="6"
      strokeLinejoin="round"
      d="m 356.20283,343.94672 15.63665,0.2628 c 1.56025,0.0262 2.30859,-1.10827 1.59504,-2.49583 C 362.4733,320.39862 320.31329,266.6867 272.4269,266.6867 c 34.35188,0 67.49257,42.8372 83.77593,77.26002 z"
    />
    <path
      fill="#FFFFFF"
      stroke="#000000"
      strokeWidth="5"
      strokeLinejoin="round"
      d="m 272.4269,266.6867 c 36.94412,6.82235 78.39198,40.25851 101.00762,75.02699 -8.51081,-18.96755 -18.32705,-57.66872 -85.69031,-101.17809 -1.25917,-0.81329 -3.29499,-0.78024 -4.43076,0.19725 -6.3275,5.44575 -10.42022,14.202 -10.88655,25.95385 z"
    />
  </g>
)

/**
 * Official Coat of Arms (Stadtwappen) of Bad Homburg vor der Höhe:
 * Blazon: "In Blau zwei silberne Hacken mit einer vierzackigen Mauerkrone."
 * Features the four-pointed golden mural crown with battlements and two crossed
 * silver adzes (hoes) on an azure blue field.
 */
export const BadHomburgLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="Stadtverwaltung Bad Homburg vor der Höhe"
    role="img"
  >
    {/* Dark navy background card to provide contrast for the crest and crown */}
    <rect width="48" height="48" rx="8" fill="#0A1832" />

    {/* Centered and scaled official heraldic coat of arms */}
    <g transform="translate(6.33, 2) scale(0.07738) translate(-27.34, -30.86)">
      {/* Mural crown (Mauerkrone) */}
      <g>
        <path
          fill="#FCDD09"
          stroke="#000000"
          strokeWidth="7"
          strokeLinejoin="round"
          d="m 294.9043,41.359375 -3.56836,29.060547 c -11.85099,-1.013655 -23.75369,-1.529297 -35.66406,-1.529297 -11.91038,0 -23.81308,0.515642 -35.66407,1.529297 l -3.55469,-28.960938 c -19.76529,1.831941 -39.32965,4.99612 -58.50976,9.462891 l 8.6875,27.546875 c -12.84033,2.802375 -25.4892,6.208618 -37.88867,10.203125 L 116.58789,62.605469 C 102.29519,66.21476 74.204484,79.218114 65.441878,89.19573 l 51.597182,73.68904 c 0.76585,0.36853 0.39497,0.26069 1.16427,0.62262 42.60316,-17.27312 90.26971,-25.85266 137.46855,-25.88239 47.19884,-0.0297 94.78853,8.61855 137.46684,25.88239 0.69803,-0.32866 0.47273,-0.29048 1.16792,-0.62458 L 445.90315,89.19573 C 437.85223,77.88202 409.88664,67.003472 394.91211,62.271484 L 382.60156,88.671875 C 370.20209,84.677368 357.55322,81.271125 344.71289,78.46875 l 8.76367,-27.791016 c -19.2052,-4.420741 -38.79052,-7.536602 -58.57226,-9.318359 z"
        />
        <path
          fill="none"
          stroke="#000000"
          strokeWidth="7"
          strokeLinejoin="round"
          d="M 109.65979,97.462501 125.277,125.6367 m 29.19218,-9.08624 13.12303,31.68179 m 17.26959,-71.360311 7.85235,31.494051 m 26.99181,-3.40065 4.77253,33.95828 M 401.68365,97.462501 386.06644,125.6367 m -29.19218,-9.08624 -13.12303,31.68179 m -17.26959,-71.360311 -7.85235,31.494051 m -26.99181,-3.40065 -4.77253,33.95828 M 255.67172,70.875 v 32.5 m 175.55094,6.78711 C 377.62655,84.426869 317.13034,70.753835 255.67188,70.875 194.21342,70.996165 133.52762,84.278682 80.120585,110.162 M 412.87109,136.37109 C 364.35932,114.70852 310.38488,103.26111 255.67188,103.375 c -54.713,0.11389 -108.46899,11.75335 -156.804692,33.55859"
        />
        <path
          fill="none"
          stroke="#000000"
          strokeWidth="11"
          strokeLinejoin="round"
          d="m 394.91211,62.271484 c 14.97453,3.943276 42.94012,15.610536 50.99104,26.924246 l -51.59651,73.68708 c -42.33037,22.75996 -90.04828,35.07017 -138.63476,35.07031 -48.58648,1.4e-4 -96.30283,-12.30938 -138.63282,-35.06835 L 65.441878,89.19573 C 74.204484,79.218114 102.29519,66.21476 116.58789,62.605469 l 12.15431,26.066406 c 12.39947,-3.994507 25.04834,-7.40075 37.88867,-10.203125 l -8.68751,-27.546875 c 19.18011,-4.466771 38.74447,-7.63095 58.50976,-9.462891 l 3.5547,28.960938 c 11.85099,-1.013655 23.75369,-1.529297 35.66406,-1.529297 11.91037,0 23.81307,0.515642 35.66406,1.529297 l 3.56836,-29.060547 c 19.78174,1.781757 39.36706,4.897618 58.57226,9.318359 l -8.76367,27.791016 c 12.84033,2.802375 25.4892,6.208618 37.88867,10.203125 z"
        />
        <path
          fill="#FFFFFF"
          d="m 128.83819,163.50739 c 0,-5.13239 70.17911,-22.98246 126.83352,-22.98246 56.6544,0 126.85281,17.85007 126.85281,22.98246 0,5.13239 -66.75995,29.74656 -126.85281,29.74656 -60.09287,0 -126.83352,-24.61417 -126.83352,-29.74656 z"
        />
        <path
          fill="#000000"
          d="m 255.67172,148.27681 c 43.36276,0 103.83533,13.09819 103.87327,15.97319 0.0379,2.875 -61.69106,18.79183 -103.87327,18.79183 -42.18221,0 -103.84011,-15.91683 -103.84011,-18.79183 0,-2.875 60.47735,-15.97319 103.84011,-15.97319 z"
        />
      </g>

      {/* Shield (Escutcheon) */}
      <g>
        {/* Outer silver border */}
        <path
          fill="#FFFFFF"
          stroke="#000000"
          strokeWidth="12"
          strokeLinejoin="round"
          d="m 247.2536,173.08203 c -36.91402,33.63194 -84.52,44.42711 -133.20508,23.83789 l -9.5293,-4.03125 -40.587886,60.88086 5.56055,7.11719 c 29.42968,37.66386 36.877716,67.51762 31.451166,94.70703 -5.426546,27.18941 -25.016736,53.55809 -55.158196,80.46875 l -6.38282,5.69922 3.00391,8.01172 c 7.85614,20.95592 22.5175,34.48071 39.23242,39.97851 12.46842,4.10106 25.555056,4.17454 38.298826,1.98047 8.34457,26.1993 32.23142,51.20135 74.01953,58.34375 29.39132,5.02355 37.38803,11.46139 53.04883,26.52539 l 8.66617,9.13179 8.66617,-9.13179 c 15.6608,-15.064 23.65751,-21.50184 53.04883,-26.52539 41.78811,-7.1424 65.67496,-32.14445 74.01953,-58.34375 12.74377,2.19407 25.83041,2.12059 38.29883,-1.98047 16.71492,-5.4978 31.37628,-19.02259 39.23242,-39.97851 l 3.00391,-8.01172 -6.38282,-5.69922 c -30.14146,-26.91066 -49.73165,-53.27934 -55.1582,-80.46875 -5.42655,-27.18941 2.02149,-57.04317 31.45117,-94.70703 l 5.56055,-7.11719 -40.58789,-60.88086 -9.5293,4.03125 c -48.68508,20.58922 -97.36461,10.93585 -133.20508,-23.83789 l -8.41812,-8.16757 z"
        />
        {/* Inner heraldic azure field */}
        <path
          fill="#0F47AF"
          stroke="#000000"
          strokeWidth="8"
          strokeLinejoin="round"
          d="m 397.29297,223.66016 19.49609,29.24414 c -27.90436,38.45253 -37.52217,74.43333 -30.90625,107.58203 6.5302,32.71916 27.6284,61.10604 56.26758,87.93554 -5.328,9.99587 -12.08572,14.89475 -20.25586,17.58204 -9.99626,3.28792 -23.00903,2.58988 -36.47851,-1.26172 l -14.14649,-4.04492 -1.70703,14.61328 c -2.38617,20.43615 -16.22378,43.25807 -56.38867,50.12304 -27.26323,4.65982 -43.27386,13.29228 -57.50211,25.29365 -14.22825,-12.00137 -30.23888,-20.63383 -57.50211,-25.29365 -40.16489,-6.86497 -54.0025,-29.68689 -56.38867,-50.12304 l -1.70703,-14.61328 -14.14649,4.04492 c -13.46948,3.8516 -26.482246,4.54964 -36.478506,1.26172 -8.17014,-2.68729 -14.92786,-7.58617 -20.25586,-17.58204 28.63918,-26.8295 49.737376,-55.21638 56.267576,-87.93554 6.61592,-33.1487 -3.00189,-69.1295 -30.906246,-107.58203 l 19.496086,-29.24414 c 50.50918,17.58266 101.94298,6.66839 141.62125,-24.92342 39.67827,31.59181 91.11207,42.50608 141.62125,24.92342 z"
        />
      </g>

      {/* Two crossed silver adzes (Hacken) */}
      <g>
        <HoeGraphic />
        <g transform="matrix(-1,0,0,1,511.34344,0)">
          <HoeGraphic />
        </g>
      </g>
    </g>
  </svg>
)
BadHomburgLogo.displayName = 'BadHomburgLogo'

export { BadHomburgLogo as StadtBadHomburgLogo }

const SchmittenTools = () => (
  <g>
    <path
      fill="#ffffff"
      stroke="#000000"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={4}
      d="m -20822.264,-21565.519 -40.945,40.041 c -2.526,2.469 -2.498,6.546 0,9.044 2.497,2.497 6.573,2.525 9.043,0 l 40.041,-40.946 z m 8.139,8.139 10.59,10.59 4.279,-21.382 -18.769,-18.769 -12.83,12.831 8.591,8.591 z"
    />
    <path
      fill="#ffffff"
      stroke="#000000"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={4}
      d="m -20848.797,-21565.293 8.592,-8.592 -12.83,-12.829 -25.321,25.321 12.829,12.83 8.592,-8.592 z m -8.138,8.138 40.041,40.947 c 2.469,2.526 6.546,2.497 9.043,0 2.498,-2.497 2.526,-6.573 0,-9.043 l -40.947,-40.041 z"
    />
  </g>
)

/**
 * Official Coat of Arms (Gemeindewappen) of Schmitten im Taunus:
 * Blazon: "In Silber drei rote Schrägbalken, von unten durch eine aufsteigende,
 * geschweifte blaue Spitze geteilt, darin ein silberner Turm und beiderseits
 * silberne Hammer und Schlägel."
 * Features three red bends on a silver field, divided by a curved blue pile/chape
 * bearing a silver observation tower and silver mining hammers (Schlägel und Eisen).
 */
export const SchmittenLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="Gemeinde Schmitten im Taunus"
    role="img"
  >
    {/* Dark navy background card to provide contrast for the silver and red crest */}
    <rect width="48" height="48" rx="8" fill="#0A1832" />

    {/* Centered and scaled official coat of arms */}
    <g transform="translate(4.75, 3) scale(0.0832672) translate(20475.935, 21936.687)">
      {/* Outer shield boundary / rim */}
      <g>
        <path
          fill="#000000"
          stroke="none"
          strokeWidth={0.623845}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit={8}
          d="m -20411.083,-21907.453 c -15.515,4.373 -16.522,2.476 -16.472,-7.369 -11.229,16.274 -25.394,34.386 -43.38,50.573 43.4,-1.385 29.337,44.652 41.096,254.746 3.946,70.515 75.331,172.216 185.086,172.216 109.754,0 186.238,-92.378 190.707,-172.216 11.758,-210.094 -3.3,-255.984 35.474,-254.746 -17.985,-16.187 -32.15,-34.299 -43.38,-50.573 0.05,9.845 -0.957,11.742 -16.472,7.369 -70.182,-19.781 -120.688,-24.234 -166.329,-24.234 -45.642,0 -96.147,4.453 -166.33,24.234 z"
        />
        <path
          fill="#ffffff"
          stroke="none"
          strokeWidth={1.24745}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit={4}
          d="m -20038.203,-21875.732 c -21.208,15.909 -17.052,15.609 -24.105,224.972 -0.421,12.484 -0.881,23.101 -1.389,37.143 -2.8,77.382 -78.552,169.463 -181.056,169.463 -102.504,0 -178.257,-92.081 -181.056,-169.463 -0.508,-14.042 -0.969,-24.659 -1.389,-37.143 -7.053,-209.363 -2.897,-209.063 -24.106,-224.972 54.999,-24.095 122.319,-44.244 206.551,-44.244 84.231,0 151.552,20.149 206.55,44.244 z"
        />
      </g>
      {/* Three red diagonal bends on silver field */}
      <path
        fill="#da121a"
        stroke="#000000"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={4}
        transform="translate(-20959.299,-22018.712)"
        d="m 713.52344,93.699219 c -22.9021,0.0325 -43.25134,1.17358 -61.6836,2.984375 L 899.91016,319.91992 c 1.07422,-35.19041 2.13674,-68.94603 2.88672,-90.02344 L 755.98633,97.783203 C 742.55344,95.89477 728.33088,94.509848 713.52344,93.699219 Z M 560.83789,115.85938 c -20.00467,4.6646 -42.07069,14.46667 -57.43166,29.31475 5.279,3.961 12.6208,6.42721 15.1758,11.60321 1.92313,3.89824 3.35601,9.31177 4.47656,17.70704 l 347.02344,312.27929 c 13.96938,-22.0815 22.96822,-46.05843 25.91211,-69.30078 z m -32.85547,161.84765 c 0.77522,25.97477 1.49716,51.61031 2.81836,90.81641 0.0508,1.51062 0.11595,3.02698 0.16797,4.49218 l 221.33789,199.17969 c 25.17222,-5.70269 48.04264,-16.90651 67.82031,-31.59179 z"
      />
      {/* Curved blue pile / chape */}
      <path
        fill="#0f47af"
        stroke="#000000"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={4}
        d="m -20244.747,-21918.898 c -28.726,118.089 -77.578,264.983 -166.645,366.303 30.338,62.981 93.564,110.259 166.645,110.259 73.081,0 136.307,-47.278 166.645,-110.259 -89.067,-101.32 -137.919,-248.214 -166.645,-366.303 z"
      />
      {/* Observation tower on Feldberg */}
      <g transform="translate(497.02607,9.1295307)">
        <path
          fill="#ffffff"
          stroke="#000000"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit={4}
          d="m -20743.207,-21793.946 c -16.452,7.698 -21.487,19.803 -24.352,34.885 -4.889,4.338 -4.498,10.854 -3.963,19.385 l 1.018,-0.241 v 69.236 h -18.443 l -9.032,24.698 1.599,1.287 v 45.062 c 2.575,2.421 7.909,5.867 7.909,9.138 v 132.633 c 14.943,3.756 30.587,6.436 46.698,6.436 16.111,0 31.755,-2.68 46.698,-6.436 v -132.633 c 0,-3.193 5.381,-6.717 7.909,-9.138 v -45.062 l 1.599,-1.287 -9.032,-24.698 h -18.443 v -69.236 l 1.018,0.241 c 0.535,-8.531 0.838,-15.135 -4.051,-19.473 -2.865,-15.082 -7.812,-27.099 -24.264,-34.797"
        />
        <g>
          <path
            fill="#ffffff"
            stroke="#000000"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeMiterlimit={4}
            d="m -20730.509,-21762.234 c 0,-19.104 -4.622,-23.711 -11.264,-34.029 -6.642,10.318 -10.938,14.925 -11.264,34.029"
          />
          <path
            fill="none"
            stroke="#000000"
            strokeWidth={3.5}
            strokeLinecap="butt"
            strokeLinejoin="round"
            strokeMiterlimit={4}
            d="m -20712.024,-21739.676 -12.305,-2.915 -17.444,-0.762 -17.444,0.762 -12.305,2.915"
          />
          <path
            fill="#000000"
            fillRule="nonzero"
            stroke="none"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeMiterlimit={4}
            d="m -20765.402,-21604.262 c -9.964,0.971 -21.579,2.571 -31.211,4.084 l 0.232,1.482 2.576,1.483 c 10.006,-1.572 18.417,-3.284 28.678,-4.656 7.44,-0.996 13.025,-1.596 17.719,-1.959 2.118,-0.165 3.897,-0.198 5.635,-0.198 1.679,0 3.569,0.03 5.601,0.188 4.694,0.366 10.279,0.968 17.719,1.965 10.262,1.375 18.752,3.087 28.759,4.66 l 2.495,-1.483 0.232,-1.482 c -9.631,-1.513 -21.246,-3.114 -31.209,-4.088 -2.453,-0.24 -4.652,-0.417 -7.858,-0.651 -3.207,-0.234 -6.881,-0.563 -9.568,-0.585 -2.008,-0.02 -4.114,-0.06 -6.171,-0.06 -2.085,0 -4.358,0.05 -6.255,0.07 -2.576,0.02 -6.182,0.342 -9.379,0.573 -3.197,0.23 -5.46,0.412 -7.995,0.659 z"
          />
          <path
            fill="none"
            stroke="#000000"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeMiterlimit={4}
            d="m -20784.575,-21601.457 v -47.42 l -4.372,-21.804 m 75.905,0 h -2.978 l -8.78,12.149 m 0.471,-84.059 v 84.059 m 29.73,-12.149 -4.372,21.804 v 47.424 m 0,-47.424 c -5.812,-4.228 -13.395,-9.655 -25.358,-9.655 h -17.444 -17.444 c -11.963,0 -19.546,5.427 -25.358,9.655 8.672,-0.461 25.905,-0.904 42.802,-0.904 16.897,0 34.13,0.443 42.802,0.904 z m -71.533,-21.804 h 2.978 l 8.78,12.149 m -0.471,-84.059 v 84.059 m 17.444,0 v -84.821 m 25.698,-15.796 c -4.54,3.567 -7.149,7.393 -8.254,16.558 -0.605,-9.686 -1.389,-16.489 -7.064,-20.187 -6.988,3.599 -9.949,10.98 -10.38,19.425 -0.475,-8.445 -3.392,-15.693 -10.38,-19.292 -5.709,3.72 -6.548,10.102 -7.064,20.054 -1.149,-9.253 -3.802,-12.903 -8.342,-16.47"
          />
        </g>
        <path
          fill="#000000"
          stroke="none"
          strokeWidth={0.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit={4}
          d="m -20734.568,-21688.963 v -10.254 c 0,-1.608 1.155,-2.991 2.341,-2.991 1.185,0 2.339,1.683 2.339,3.291 v 10.254 c -1.53,-1.116 -3.086,-1.353 -4.68,-0.3 z m 0,-30.038 v -10.254 c 0,-1.608 1.155,-2.991 2.341,-2.991 1.185,0 2.339,1.683 2.339,3.291 v 10.254 c -1.53,-1.116 -3.086,-1.353 -4.68,-0.3 z m -14.41,30.038 v -10.254 c 0,-1.608 -1.155,-2.991 -2.341,-2.991 -1.185,0 -2.339,1.683 -2.339,3.291 v 10.254 c 1.53,-1.116 3.086,-1.353 4.68,-0.3 z m 0,-30.038 v -10.254 c 0,-1.608 -1.155,-2.991 -2.341,-2.991 -1.185,0 -2.339,1.683 -2.339,3.291 v 10.254 c 1.53,-1.116 3.086,-1.353 4.68,-0.3 z m 58.836,81.958 -5.189,-0.759 v 13.045 l 5.189,0.759 z m -103.262,0 5.189,-0.759 v 13.045 l -5.189,0.759 z m 85.226,10.749 v -9.463 c 0,-1.608 -1.794,-4.582 -3.635,-4.582 -1.841,0 -3.633,2.174 -3.633,3.782 v 9.463 c 2.443,-1.407 4.865,-0.565 7.268,0.8 z m -59.908,-0.8 v -9.463 c 0,-1.608 -1.794,-3.782 -3.635,-3.782 -1.841,0 -3.633,2.973 -3.633,4.581 v 9.463 c 2.443,-1.407 4.865,-2.163 7.268,-0.799 z m 29.948,-1.599 v -9.463 c 0,-1.608 -1.794,-3.782 -3.635,-3.782 -1.841,0 -3.633,2.174 -3.633,3.782 v 9.463 c 2.443,-1.407 4.865,-1.364 7.268,0 z m -31.844,85.579 v -15.1 c 0,-2.312 1.351,-3.945 2.736,-3.945 1.386,0 2.735,1.633 2.735,3.945 v 15.1 c -1.052,-0.566 -1.838,-0.844 -2.735,-0.844 -0.897,0 -1.684,0.278 -2.736,0.844 z m 8.534,0 v -15.1 c 0,-2.312 1.351,-3.945 2.736,-3.945 1.386,0 2.735,1.633 2.735,3.945 v 15.1 c -1.052,-0.566 -1.838,-0.844 -2.735,-0.844 -0.897,0 -1.684,0.278 -2.736,0.844 z m 47.884,0 v -15.1 c 0,-2.312 -1.351,-3.945 -2.736,-3.945 -1.386,0 -2.735,1.633 -2.735,3.945 v 15.1 c 1.052,-0.566 1.838,-0.844 2.735,-0.844 0.897,0 1.684,0.278 2.736,0.844 z m -8.534,0 v -15.1 c 0,-2.312 -1.351,-3.945 -2.736,-3.945 -1.386,0 -2.735,1.633 -2.735,3.945 v 15.1 c 1.052,-0.566 1.838,-0.844 2.735,-0.844 0.897,0 1.684,0.278 2.736,0.844 z m -47.884,56.608 v -15.1 c 0,-2.312 1.351,-3.945 2.736,-3.945 1.386,0 2.735,1.633 2.735,3.945 v 15.1 c -1.052,-0.566 -1.838,-0.844 -2.735,-0.844 -0.897,0 -1.684,0.278 -2.736,0.844 z m 8.534,0 v -15.1 c 0,-2.312 1.351,-3.945 2.736,-3.945 1.386,0 2.735,1.633 2.735,3.945 v 15.1 c -1.052,-0.566 -1.838,-0.844 -2.735,-0.844 -0.897,0 -1.684,0.278 -2.736,0.844 z m 47.884,0 v -15.1 c 0,-2.312 -1.351,-3.945 -2.736,-3.945 -1.386,0 -2.735,1.633 -2.735,3.945 v 15.1 c 1.052,-0.566 1.838,-0.844 2.735,-0.844 0.897,0 1.684,0.278 2.736,0.844 z m -8.534,0 v -15.1 c 0,-2.312 -1.351,-3.945 -2.736,-3.945 -1.386,0 -2.735,1.633 -2.735,3.945 v 15.1 c 1.052,-0.566 1.838,-0.844 2.735,-0.844 0.897,0 1.684,0.278 2.736,0.844 z"
        />
        {/* Bird perched on top */}
        <g transform="translate(0,11.490485)">
          <path
            fill="none"
            stroke="#000000"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="miter"
            strokeMiterlimit={4}
            d="m -20737.109,-21815.164 -0.802,4.221 -2.428,4.247"
          />
          <path
            fill="#000000"
            stroke="#000000"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeMiterlimit={4}
            d="m -20747.311,-21832.857 c -0.157,-0.471 -0.132,-0.981 0.608,-1.639 0,-0.376 0.207,-0.569 0.466,-0.721 0.641,-4.677 5.473,-3.438 6.443,4.056 0.721,5.566 8.029,8.692 16.631,9.693 -0.444,0.214 -1.116,0.359 -1.865,0.48 0.457,0.06 0.935,0.109 1.498,0.127 0.09,0.1 0.161,0.198 0.325,0.255 0.02,0.385 -0.454,0.309 -0.792,0.325 -0.338,0.02 -0.571,0.05 -0.763,0.141 l 1.286,0.07 c -0.354,0.176 -0.543,0.343 -0.169,0.48 -0.585,0.307 -1.329,0.203 -2.148,0.07 -1.03,-0.167 -1.74,-0.125 -1.908,0.06 -0.372,0.408 -0.907,0.553 -1.54,0.551 -0.405,0 -0.759,0.09 -1.045,0.297 -0.255,0.18 -0.564,0.353 -1.004,0.41 -0.521,0.07 -0.966,0.345 -1.328,0.706 -0.553,0.55 -1.098,0.86 -1.738,1.018 -0.278,0.191 -0.619,0.339 -1.116,0.48 -0.629,0.178 -1.127,0.522 -1.639,0.834 -0.77,-0.832 -1.496,-1.272 -2.19,-1.427 -8.118,-1.819 -7.201,-6.704 -5.68,-14.837 0.393,-2.102 -1.116,-2.233 -1.661,-1.83 -0.224,0.204 -0.447,0.417 -0.671,0.401 z"
          />
          <path
            fill="#ffffff"
            stroke="#000000"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeMiterlimit={4}
            d="m -20737.787,-21826.866 c -0.358,-0.228 -0.808,-0.34 -1.555,0.198 -0.765,0.55 -1.425,0.992 -1.78,1.611 -1.935,3.372 -2.743,6.61 3.448,7.884 0.328,-0.343 1.396,-0.553 3.871,-1.13 5.849,-1.364 6.861,-2.539 7.404,-3.504 2.924,-1.5 2.901,-2.495 -1.639,-1.159 0.656,-0.415 1.277,-0.834 2.996,-1.102 0.02,-0.728 -2.119,-0.945 -3.985,-0.141 -4.629,-0.552 -7.213,-1.503 -8.76,-2.657 z"
          />
        </g>
      </g>
      {/* Crossed hammer and chisel (Schlägel und Eisen) on both sides */}
      <g transform="translate(497.02607)">
        <g transform="translate(190.46059,7.5)">
          <SchmittenTools />
        </g>
        <g transform="translate(-3.57752, 7.5)">
          <SchmittenTools />
        </g>
      </g>
      {/* Outer shield rim outline */}
      <g>
        <path
          fill="none"
          stroke="#000000"
          strokeWidth={4}
          strokeLinecap="square"
          strokeLinejoin="round"
          strokeMiterlimit={8}
          d="m -20451.98,-21873.804 c 5.28,3.961 8.709,6.694 11.262,11.87 2.552,5.175 4.243,12.997 5.483,26.959 2.479,27.919 3.209,80.183 6.734,184.786 0.421,12.481 0.882,23.092 1.389,37.116 1.414,39.13 21.209,81.748 53.525,114.659 32.316,32.911 77.227,56.117 128.888,56.117 51.661,0 96.572,-23.206 128.888,-56.117 32.316,-32.911 52.111,-75.529 53.525,-114.659 0.507,-14.024 0.968,-24.635 1.389,-37.116 3.525,-104.603 4.255,-156.867 6.734,-184.786 1.24,-13.962 2.931,-21.784 5.483,-26.959 2.553,-5.176 5.982,-7.909 11.262,-11.87"
        />
        <g transform="matrix(0.98768621,0,0,0.98768621,-20541.115,-21931.13)">
          <path
            fill="#ffffff"
            stroke="none"
            strokeWidth={0.631623}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeMiterlimit={8}
            d="m 90.931186,56.088695 c 9.222964,-9.222961 18.750364,-22.897601 22.196504,-30.133475 2.91304,4.282405 6.66994,4.997402 13.50536,3.070951 C 195.91326,9.4989117 251.53526,3.1207816 300.05654,3.1207816 c 48.52129,0 104.14328,6.3781301 173.42349,25.9053894 6.83543,1.926451 10.59232,1.211454 13.50537,-3.070951 3.44613,7.235874 12.86363,20.800612 22.1965,30.133475 C 453.498,31.692884 385.33829,11.292721 300.05654,11.292721 c -85.28175,0 -153.44146,20.400163 -209.125354,44.795974 z"
          />
          <path
            fill="#000000"
            stroke="none"
            strokeWidth={1.26325}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeMiterlimit={8}
            d="M 90.931186,56.088695 C 90.722588,55.605817 112.44467,44.775647 149.70371,33.027609 187.45298,21.124999 239.50549,9.4302864 299.87672,9.3857645 c 0,0 0.18516,-6.77e-5 0.18515,-6.77e-5 60.42726,-0.01015 112.5115,11.6678702 150.30396,23.5899692 37.29112,11.763947 59.02525,22.630106 58.81609,23.113038 -0.20916,0.482931 -22.29458,-9.484611 -59.60498,-20.533202 -37.8376,-11.204704 -89.56438,-22.376627 -149.5141,-22.356237 -10e-6,0 -0.18366,9.7e-5 -0.18367,9.7e-5 -59.89403,0.03275 -111.5923,11.22151 -149.38725,22.407225 -37.27934,11.033117 -59.352136,20.964986 -59.560734,20.482108 z"
          />
        </g>
      </g>
    </g>
  </svg>
)
SchmittenLogo.displayName = 'SchmittenLogo'

export {
  SchmittenLogo as GemeindeSchmittenLogo,
  SchmittenLogo as SchmittenImTaunusLogo,
  SchmittenLogo as SchmittenWappenLogo,
}

/**
 * Official Federal Flag of Germany (Bundesflagge der Bundesrepublik Deutschland).
 * Horizontal tricolour of black, red, and gold (Schwarz-Rot-Gold).
 */
export const GermanyFlagLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="Bundesrepublik Deutschland"
    role="img"
  >
    <rect x="0" y="0" width="48" height="16" fill="#18181B" />
    <rect x="0" y="16" width="48" height="16" fill="#DC2626" />
    <rect x="0" y="32" width="48" height="16" fill="#FACC15" />
    <rect
      x="0.5"
      y="0.5"
      width="47"
      height="47"
      rx="7.5"
      fill="none"
      stroke="rgba(255, 255, 255, 0.2)"
      strokeWidth="1"
    />
  </svg>
)
GermanyFlagLogo.displayName = 'GermanyFlagLogo'

export { GermanyFlagLogo as BundesflaggeLogo, GermanyFlagLogo as FederalRepublicLogo }

/**
 * Official State Flag & Coat of Arms of Hesse (Land Hessen / Justiz Hessen).
 * Features the red-and-white state flag field (Landesfarben Rot-Weiß),
 * crowned with the golden Volkskrone and the azure blue shield bearing the
 * legendary nine-striped crowned Hessian Lion (Bunter Löwe).
 */
export const HessenLogo: IconComponent = ({ size = 16, className }) => (
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
    aria-label="Land Hessen"
    role="img"
  >
    {/* Red upper half of Hessian state flag */}
    <rect x="0" y="0" width="48" height="24" fill="#DC2626" />
    {/* Silver/white lower half of Hessian state flag */}
    <rect x="0" y="24" width="48" height="24" fill="#F8FAFC" />

    {/* Subtle card outline */}
    <rect
      x="0.5"
      y="0.5"
      width="47"
      height="47"
      rx="7.5"
      fill="none"
      stroke="rgba(0, 0, 0, 0.15)"
      strokeWidth="1"
    />

    {/* Center Coat of Arms of Hesse (Landeswappen Hessen) */}
    {/* Volkskrone (Golden People's Crown atop the shield) */}
    <path
      d="M13.5 13.5h21v-2.2h-21z"
      fill="#D97706"
    />
    <path
      d="M14 13h20v-1.5h-20z"
      fill="#FBBF24"
    />
    {/* 5 crown leaves (trefoils) */}
    <path
      d="M14 11.5l1.5-3.5 1.5 3.5zm4.8 0l1.4-4 1.8 4zm5.2 0l1.5-4.5 1.5 4.5zm5.2 0l1.8-4 1.4 4zm5 0l1.5-3.5 1.5 3.5z"
      fill="#F59E0B"
      stroke="#B45309"
      strokeWidth="0.5"
      strokeLinejoin="round"
    />

    {/* Heraldic Shield (Azurblau) */}
    <path
      d="M14 13.5h20v13.5c0 8.5-10 14-10 14s-10-5.5-10-14z"
      fill="#0B3C8A"
      stroke="#FBBF24"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />

    {/* Heraldic Hessian Lion (Bunter Löwe von Hessen - 9 horizontal stripes) */}
    {/* Stripe 1 (White / Silver): Crown, Head, Brow, Upper Jaw */}
    <path
      d="M21 16c1.2-1.5 3-1.2 3.8-.5.8.7.6 1.8-.2 2.3l-2.6.2z"
      fill="#FFFFFF"
    />
    {/* Lion's Golden Crown */}
    <path
      d="M23.5 14.2l.8 1.4.8-.8.8.8.8-1.4v1.8h-3.2z"
      fill="#FCDD09"
      stroke="#B45309"
      strokeWidth="0.4"
      strokeLinejoin="round"
    />
    {/* Red Tongue */}
    <path
      d="M20.2 18.2c-.8.2-1.4.6-1.6 1.2.6.1 1.2-.4 1.6-.7z"
      fill="#EF4444"
    />

    {/* Stripe 2 (Red): Muzzle, Lower Jaw, Throat */}
    <path
      d="M20 18l3.2.2c-.2.8-.7 1.4-1.6 1.6l-2.6-.2c.2-.6.6-1.2 1-1.6z"
      fill="#DC2626"
    />

    {/* Stripe 3 (White / Silver): Neck and Upper Outstretched Front Paw */}
    <path
      d="M19 19.8l4 .2c-.1.7-.5 1.3-1.2 1.6l-3.2-.2zm-3.2-1.5l2.4 1-1 1.2-2.2-.8c.1-.6.4-1 .8-1.4z"
      fill="#FFFFFF"
    />
    {/* Golden Claws on Upper Front Paw */}
    <path d="M15 18l.8-.6m-.3 1.2l.8-.4" stroke="#FBBF24" strokeWidth="0.6" strokeLinecap="round" />

    {/* Stripe 4 (Red): Upper Torso & Lower Outstretched Front Paw */}
    <path
      d="M18.4 21.6l4.2.2c-.1.8-.6 1.4-1.4 1.8l-3.4-.2zm-2.2 1.2l2.6.6-.8 1.4-2.4-.6c.1-.6.3-1 .6-1.4z"
      fill="#DC2626"
    />
    {/* Golden Claws on Lower Front Paw */}
    <path d="M15.8 22.8l.8-.4m-.2 1.1l.8-.3" stroke="#FBBF24" strokeWidth="0.6" strokeLinecap="round" />

    {/* Stripe 5 (White / Silver): Mid Torso / Flank */}
    <path
      d="M19.2 23.6l3.8.2c-.2.8-.8 1.4-1.6 1.7l-3-.2c.2-.7.5-1.2.8-1.7z"
      fill="#FFFFFF"
    />

    {/* Stripe 6 (Red): Lower Flank & Waist */}
    <path
      d="M20.2 25.5l3.4.2c-.3.9-1 1.5-1.9 1.8l-2.6-.2c.3-.7.7-1.3 1.1-1.8z"
      fill="#DC2626"
    />

    {/* Stripe 7 (White / Silver): Rump, Upper Thigh, Upper Tail */}
    <path
      d="M21 27.5l4 .2c-.2.9-1 1.7-2.2 2l-3-.4c.3-.7.8-1.3 1.2-1.8zm6.5-7.5c1.2 1.4 1.6 3.2 1.4 4.8l-1.5-.2c.2-1.3-.1-2.8-1-3.8z"
      fill="#FFFFFF"
    />

    {/* Stripe 8 (Red): Lower Hind Legs & Mid Tail */}
    <path
      d="M21.2 29.7l3.8.3c-.4 1.2-1.4 2.2-2.8 2.6l-2.6-.6c.5-.9 1.1-1.6 1.6-2.3zm5.8-5c.4 1.4.3 2.8-.2 4.2l-1.4-.4c.4-1.1.5-2.2.2-3.4z"
      fill="#DC2626"
    />

    {/* Stripe 9 (White / Silver): Hind Feet with Claws & Bushy Tail Tuft */}
    <path
      d="M19.5 32.6l2.2.4-1.2 3.2-2.5-.2c.3-1.2.9-2.4 1.5-3.4zm4.2 1.2l2.2.4-1.4 3.4-2.4-.2c.4-1.2 1-2.4 1.6-3.6zm4.5-14c1.2-.8 2.2-.6 2.8.2.4.6.2 1.4-.4 1.8l-2.6-.4z"
      fill="#FFFFFF"
    />
    {/* Golden Claws on Hind Paws */}
    <path d="M18 36.2l.6-.4m2.6 0l.6-.4" stroke="#FBBF24" strokeWidth="0.6" strokeLinecap="round" />
  </svg>
)
HessenLogo.displayName = 'HessenLogo'

export {
  HessenLogo as GerichtskasseHessenLogo,
  HessenLogo as HessenFlagLogo,
  HessenLogo as HessenWappenLogo,
  HessenLogo as LandHessenLogo,
}

/**
 * Official Coat of Arms (Stadtwappen) of Kelkheim (Taunus):
 * Blazon: "Geviert; 1: in Rot ein sechsspeichiges silbernes Rad; 2: in Silber ein rotes
 * Hifthorn; 3 und 4: in verwechselten Farben ein Hufeisen."
 * Features the Mainz wheel, the Hornau bugle horn, and the Kelkheim horseshoe.
 */
export const KelkheimLogo: IconComponent = ({ size = 16, className }) => (
  <img
    src="/brands/kelkheim.png"
    alt="Stadt Kelkheim (Taunus)"
    width={typeof size === 'number' ? size : undefined}
    height={typeof size === 'number' ? size : undefined}
    style={{
      width: typeof size === 'number' ? `${size}px` : size,
      height: typeof size === 'number' ? `${size}px` : size,
      display: 'inline-block',
      verticalAlign: 'middle',
      borderRadius: '8px',
      objectFit: 'contain',
      flexShrink: 0,
    }}
    className={className}
    role="img"
    aria-label="Stadt Kelkheim (Taunus)"
  />
)
KelkheimLogo.displayName = 'KelkheimLogo'

export {
  KelkheimLogo as KelkheimTaunusLogo,
  KelkheimLogo as KelkheimWappenLogo,
  KelkheimLogo as StadtkasseKelkheimLogo,
  KelkheimLogo as StadtKelkheimLogo,
}

/**
 * Official Coat of Arms (Kreiswappen) of Hochtaunuskreis (Hesse):
 * Features the rising divided lion of Hesse and Nassau, accompanied by the
 * heraldic iron hats of Kronberg and cloverleafs of Usingen.
 */
export const HochtaunuskreisLogo: IconComponent = ({ size = 16, className }) => (
  <img
    src="/brands/hochtaunuskreis.png"
    alt="Hochtaunuskreis"
    width={typeof size === 'number' ? size : undefined}
    height={typeof size === 'number' ? size : undefined}
    style={{
      width: typeof size === 'number' ? `${size}px` : size,
      height: typeof size === 'number' ? `${size}px` : size,
      display: 'inline-block',
      verticalAlign: 'middle',
      borderRadius: '8px',
      objectFit: 'contain',
      flexShrink: 0,
    }}
    className={className}
    role="img"
    aria-label="Hochtaunuskreis"
  />
)
HochtaunuskreisLogo.displayName = 'HochtaunuskreisLogo'

export {
  HochtaunuskreisLogo as KreisHochtaunusLogo,
  HochtaunuskreisLogo as KreisverwaltungHochtaunuskreisLogo,
  HochtaunuskreisLogo as LandkreisHochtaunusLogo,
}



/**
 * Hand-drawn hero scene: a house with a rooftop solar array, the sun,
 * and floating product cards. Stands in for photography until the
 * real product/installation shoot is scheduled — see the design notes
 * shared with the client.
 */
export function HeroIllustration() {
  return (
    <div className="relative">
      <span
        className="absolute right-2 top-0.5 max-w-[8em] rotate-[-7deg] text-center font-script text-[clamp(1.1rem,2.3vw,1.7rem)] font-bold leading-[1.05] text-blue-deep after:mx-auto after:mt-0.5 after:block after:h-[6px] after:w-[74%] after:rounded-full after:bg-red after:opacity-85"
      >
        Clean Energy for a Better Tomorrow
      </span>

      <svg
        viewBox="0 0 600 540"
        role="img"
        aria-label="Illustration of a modern home with rooftop solar panels, the sun, and floating cards for an inverter, a lithium battery and a security camera"
        className="block w-full rounded-[22px] drop-shadow-[0_40px_50px_rgba(13,27,47,0.16)]"
      >
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d7e8ff" />
            <stop offset="1" stopColor="#f4f9ff" />
          </linearGradient>
          <linearGradient id="panel" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#2f6bff" />
            <stop offset="1" stopColor="#0b3f9e" />
          </linearGradient>
          <radialGradient id="sunGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#ffd97a" />
            <stop offset="0.55" stopColor="#f7b733" />
            <stop offset="1" stopColor="#f7b733" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#eef3fb" />
          </linearGradient>
          <linearGradient id="win" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffe6a8" />
            <stop offset="1" stopColor="#ffce5c" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="600" height="470" rx="22" fill="url(#sky)" />

        <g className="animate-sun-spin">
          <circle cx="452" cy="116" r="118" fill="url(#sunGlow)" />
          <circle cx="452" cy="116" r="38" fill="#f8c85a" />
          <g stroke="#f7b733" strokeWidth="7" strokeLinecap="round">
            <line x1="452" y1="34" x2="452" y2="14" />
            <line x1="452" y1="198" x2="452" y2="218" />
            <line x1="370" y1="116" x2="350" y2="116" />
            <line x1="534" y1="116" x2="554" y2="116" />
            <line x1="394" y1="58" x2="380" y2="44" />
            <line x1="510" y1="174" x2="524" y2="188" />
            <line x1="510" y1="58" x2="524" y2="44" />
            <line x1="394" y1="174" x2="380" y2="188" />
          </g>
        </g>

        <g fill="#ffffff" opacity="0.9">
          <ellipse cx="150" cy="86" rx="46" ry="20" />
          <ellipse cx="185" cy="94" rx="34" ry="16" />
          <ellipse cx="118" cy="96" rx="28" ry="14" />
        </g>

        <path d="M0 400 Q300 350 600 400 L600 452 Q580 470 560 470 L40 470 Q20 470 0 452 Z" fill="#e5f0e4" />
        <path d="M0 430 Q300 392 600 430 L600 452 Q580 470 560 470 L40 470 Q20 470 0 452 Z" fill="#d7e9d6" />

        <g>
          <rect x="66" y="356" width="10" height="46" rx="4" fill="#8a6a45" />
          <circle cx="71" cy="342" r="30" fill="#4fae63" />
          <circle cx="51" cy="354" r="20" fill="#5cb96f" />
          <circle cx="91" cy="354" r="20" fill="#5cb96f" />
        </g>

        <g>
          <rect x="172" y="262" width="252" height="150" rx="10" fill="url(#wall)" stroke="#dbe5f1" />
          <path d="M158 264 L298 172 L438 264 Z" fill="#c9d6ea" />
          <g transform="translate(298 218)">
            <g transform="skewX(-32) scale(1 0.62)">
              <g fill="url(#panel)" stroke="#0a2f6e" strokeWidth="1.5">
                <rect x="-118" y="-58" width="52" height="34" rx="2" />
                <rect x="-60" y="-58" width="52" height="34" rx="2" />
                <rect x="-2" y="-58" width="52" height="34" rx="2" />
                <rect x="-118" y="-20" width="52" height="34" rx="2" />
                <rect x="-60" y="-20" width="52" height="34" rx="2" />
                <rect x="-2" y="-20" width="52" height="34" rx="2" />
              </g>
              <g stroke="#6f9bff" strokeWidth="1" opacity="0.8">
                <line x1="-92" y1="-58" x2="-92" y2="14" />
                <line x1="-34" y1="-58" x2="-34" y2="14" />
                <line x1="24" y1="-58" x2="24" y2="14" />
                <line x1="-118" y1="-41" x2="50" y2="-41" />
                <line x1="-118" y1="-3" x2="50" y2="-3" />
              </g>
            </g>
          </g>
          <rect x="210" y="326" width="46" height="86" rx="6" fill="#0b3f9e" />
          <circle cx="246" cy="370" r="3.4" fill="#ffd97a" />
          <rect x="298" y="318" width="54" height="46" rx="6" fill="url(#win)" stroke="#e6b74d" />
          <rect x="370" y="318" width="40" height="46" rx="6" fill="url(#win)" stroke="#e6b74d" />
          <line x1="325" y1="318" x2="325" y2="364" stroke="#e6b74d" strokeWidth="2" />
          <line x1="298" y1="341" x2="352" y2="341" stroke="#e6b74d" strokeWidth="2" />
        </g>

        <g>
          <rect x="438" y="348" width="70" height="64" rx="8" fill="#ffffff" stroke="#dbe5f1" />
          <rect x="450" y="362" width="46" height="8" rx="3" fill="#1a56db" />
          <rect x="450" y="376" width="46" height="8" rx="3" fill="#1a56db" />
          <rect x="450" y="390" width="46" height="8" rx="3" fill="#9fc0ff" />
        </g>

        <g className="animate-floaty">
          <rect x="66" y="184" width="150" height="66" rx="14" fill="#ffffff" stroke="#e2eaf6" />
          <rect x="80" y="200" width="34" height="34" rx="9" fill="#eaf1ff" />
          <path
            d="M92 210l-6 9h9l-6 9"
            stroke="#1a56db"
            strokeWidth="2.4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text x="124" y="208" fontFamily="var(--font-heading)" fontSize="13" fontWeight="700" fill="#0d1b2f">
            Hybrid Inverter
          </text>
          <text x="124" y="226" fontFamily="var(--font-body)" fontSize="12" fill="#55647a">
            5&ndash;10 kVA
          </text>
        </g>

        <g className="animate-floaty-delay">
          <rect x="392" y="236" width="170" height="66" rx="14" fill="#ffffff" stroke="#e2eaf6" />
          <rect x="406" y="252" width="34" height="34" rx="9" fill="#eaf1ff" />
          <rect x="412" y="260" width="22" height="18" rx="3" fill="none" stroke="#1a56db" strokeWidth="2.2" />
          <line x1="434" y1="265" x2="438" y2="265" stroke="#1a56db" strokeWidth="2.2" />
          <text x="450" y="260" fontFamily="var(--font-heading)" fontSize="13" fontWeight="700" fill="#0d1b2f">
            Lithium Battery
          </text>
          <text x="450" y="278" fontFamily="var(--font-body)" fontSize="12" fill="#55647a">
            5&ndash;15 kWh &middot; LiFePO&#8324;
          </text>
        </g>

        <g className="animate-floaty">
          <rect x="148" y="418" width="178" height="60" rx="14" fill="#ffffff" stroke="#e2eaf6" />
          <rect x="162" y="432" width="32" height="32" rx="9" fill="#eaf1ff" />
          <path
            d="M168 446a5 5 0 0 1 5-5h6l5 4v3a5 5 0 0 1-5 5h-6a5 5 0 0 1-5-5Z"
            fill="none"
            stroke="#1a56db"
            strokeWidth="2"
          />
          <text x="204" y="442" fontFamily="var(--font-heading)" fontSize="13" fontWeight="700" fill="#0d1b2f">
            CCTV &amp; Security
          </text>
          <text x="204" y="460" fontFamily="var(--font-body)" fontSize="12" fill="#55647a">
            24/7 solar-powered
          </text>
        </g>
      </svg>
    </div>
  );
}

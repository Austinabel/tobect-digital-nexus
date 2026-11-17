import { cn } from "@/lib/utils";
import { IconSun, IconBatteryCharge, IconHouse } from "@/components/icons";

/**
 * Hero product showcase: rendered solar panels, a hybrid inverter and a
 * lithium battery with floating "System Overview" and "Energy Independence"
 * cards. Drawn as SVG (no third-party product photos or brand marks), so it
 * stays crisp at any size and never implies a specific manufacturer.
 * Swap for real product renders/photos when Tobecat has them.
 */

function FlowArrow() {
  return (
    <span aria-hidden className="relative mx-1 mt-[-22px] h-[3px] min-w-4 flex-1 overflow-hidden rounded-full bg-[#d6e2f5]">
      <span className="animate-flow-x absolute inset-y-0 left-0 w-1/2 rounded-full bg-gradient-to-r from-transparent via-[#22b35e] to-transparent" />
    </span>
  );
}

function FlowNode({ Icon, label, tone }: { Icon: typeof IconSun; label: string; tone: string }) {
  return (
    <span className="flex w-[27%] shrink-0 flex-col items-center text-center">
      <span className={cn("grid size-10 place-items-center rounded-xl sm:size-11", tone)}>
        <Icon className="size-5 sm:size-[22px]" />
      </span>
      <span className="mt-1.5 font-heading text-[0.62rem] font-semibold leading-tight text-ink sm:text-[0.66rem]">{label}</span>
    </span>
  );
}

export function SystemOverviewCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-white/70 bg-white/95 p-3.5 shadow-[0_24px_50px_-20px_rgba(4,14,35,0.55)] backdrop-blur", className)}>
      <div className="flex items-center justify-between">
        <span className="font-heading text-[0.78rem] font-bold text-ink">System Overview</span>
        <span className="inline-flex items-center gap-1 text-[0.6rem] font-semibold text-[#17733b]">
          <span className="size-1.5 animate-pulse rounded-full bg-[#22b35e]" />
          Live flow
        </span>
      </div>
      <div className="mt-3 flex items-center">
        <FlowNode Icon={IconSun} label="Solar Generation" tone="bg-[#fff4dc] text-[#e29b0c]" />
        <FlowArrow />
        <FlowNode Icon={IconBatteryCharge} label="Battery Storage" tone="bg-[#e6f7ed] text-[#17733b]" />
        <FlowArrow />
        <FlowNode Icon={IconHouse} label="Home Power" tone="bg-mist text-blue" />
      </div>
    </div>
  );
}

/** `gradientId` must be unique per instance: the card renders twice (desktop overlay + mobile stack). */
export function EnergyIndependenceCard({ className, gradientId = "gauge" }: { className?: string; gradientId?: string }) {
  // Purely illustrative gauge — deliberately shows no percentage, so it can't be read as a performance claim.
  return (
    <div className={cn("rounded-2xl border border-white/70 bg-white/95 p-3.5 text-center shadow-[0_24px_50px_-20px_rgba(4,14,35,0.55)] backdrop-blur", className)}>
      <span className="font-heading text-[0.76rem] font-bold text-ink">Energy Independence</span>
      <svg viewBox="0 0 120 68" aria-hidden className="mx-auto mt-1.5 block w-[78%] max-w-[130px]">
        <defs>
          <linearGradient id={`${gradientId}-grad`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#f5a623" />
            <stop offset="0.55" stopColor="#7cc84a" />
            <stop offset="1" stopColor="#22b35e" />
          </linearGradient>
        </defs>
        <path d="M12 60a48 48 0 0 1 96 0" fill="none" stroke="#e4ecf7" strokeWidth="11" strokeLinecap="round" />
        <path
          d="M12 60a48 48 0 0 1 96 0"
          fill="none"
          stroke={`url(#${gradientId}-grad)`}
          strokeWidth="11"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray="86 100"
          className="animate-gauge"
        />
        <path d="M60 60 L92 34" stroke="#0b1930" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="60" cy="60" r="6" fill="#0b1930" />
      </svg>
      <span className="mt-0.5 block font-heading text-[0.8rem] font-bold text-[#17733b]">Day &amp; Night Power</span>
      <span className="block text-[0.62rem] text-slate">Solar + battery backup</span>
    </div>
  );
}

function SolarPanel({ transform }: { transform: string }) {
  return (
    <g transform={transform}>
      <rect x="-6" y="-6" width="182" height="292" rx="7" fill="url(#frameGrad)" />
      <rect x="0" y="0" width="170" height="280" rx="3" fill="url(#cellGrad)" />
      <rect x="0" y="0" width="170" height="280" rx="3" fill="url(#cellPattern)" />
      <path d="M0 0h170v280H0z" fill="url(#sheenGrad)" />
    </g>
  );
}

export function HeroEquipment({ className, showCards = true }: { className?: string; showCards?: boolean }) {
  return (
    <div className={cn("relative mx-auto w-full max-w-[600px]", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[45%] size-[110%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(31,99,230,0.38),rgba(31,99,230,0)_62%)]"
      />
      <svg
        viewBox="0 0 600 520"
        role="img"
        aria-label="Solar panels, a hybrid inverter and a lithium battery — the core of a Tobecat solar system"
        className="relative block w-full drop-shadow-[0_40px_40px_rgba(0,0,0,0.35)] sm:w-[86%]"
      >
        <defs>
          <linearGradient id="frameGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#eef2f7" />
            <stop offset="0.5" stopColor="#b9c4d2" />
            <stop offset="1" stopColor="#8592a4" />
          </linearGradient>
          <linearGradient id="cellGrad" x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0" stopColor="#1d3f86" />
            <stop offset="0.6" stopColor="#0e2557" />
            <stop offset="1" stopColor="#0a1a3e" />
          </linearGradient>
          <pattern id="cellPattern" width="28.33" height="28" patternUnits="userSpaceOnUse">
            <rect width="28.33" height="28" fill="none" stroke="#3a64b6" strokeOpacity="0.55" strokeWidth="1.2" />
            <path d="M9.4 0v28M18.9 0v28" stroke="#6f95e0" strokeOpacity="0.18" strokeWidth="0.6" />
          </pattern>
          <linearGradient id="sheenGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.32" />
            <stop offset="0.35" stopColor="#ffffff" stopOpacity="0.04" />
            <stop offset="0.6" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0.12" />
          </linearGradient>
          <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#e3e9f2" />
          </linearGradient>
          <linearGradient id="sideGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#c3cddb" />
            <stop offset="1" stopColor="#9eabbd" />
          </linearGradient>
          <linearGradient id="screenGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#13284a" />
            <stop offset="1" stopColor="#081428" />
          </linearGradient>
          <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
        </defs>

        {/* ground shadow */}
        <ellipse cx="300" cy="470" rx="250" ry="26" fill="#000" opacity="0.35" filter="url(#softShadow)" />

        {/* panel mounts */}
        <g stroke="#7d8a9c" strokeWidth="7" strokeLinecap="round">
          <path d="M250 300 L232 452" />
          <path d="M392 286 L410 452" />
          <path d="M470 276 L492 440" />
        </g>

        {/* two portrait solar panels, angled for depth */}
        <SolarPanel transform="translate(178 34) skewY(-7) scale(0.98)" />
        <SolarPanel transform="translate(352 16) skewY(-7) scale(0.98)" />

        {/* cable from battery to inverter */}
        <path d="M262 420 C 300 470, 330 470, 352 432" fill="none" stroke="#2a3446" strokeWidth="6" strokeLinecap="round" />

        {/* ---------- hybrid inverter ---------- */}
        <g>
          <path d="M240 206 L266 220 L266 424 L240 438 Z" fill="url(#sideGrad)" />
          <rect x="66" y="196" width="176" height="246" rx="16" fill="url(#bodyGrad)" stroke="#d3dce8" />
          <rect x="66" y="196" width="176" height="10" rx="5" fill="#ffffff" />
          {/* screen */}
          <rect x="94" y="232" width="120" height="70" rx="8" fill="url(#screenGrad)" />
          <text x="104" y="254" fill="#7fb2ff" fontFamily="var(--font-heading)" fontSize="9" fontWeight="600" letterSpacing="1">
            PV INPUT
          </text>
          <text x="104" y="281" fill="#ffffff" fontFamily="var(--font-heading)" fontSize="20" fontWeight="700">
            ON
          </text>
          <g fill="#3ddc84">
            <rect x="160" y="268" width="8" height="14" rx="1.5" />
            <rect x="171" y="262" width="8" height="20" rx="1.5" />
            <rect x="182" y="256" width="8" height="26" rx="1.5" />
            <rect x="193" y="250" width="8" height="32" rx="1.5" opacity="0.45" />
          </g>
          {/* status LEDs + buttons */}
          <circle cx="104" cy="322" r="4.5" fill="#22b35e" />
          <circle cx="119" cy="322" r="4.5" fill="#1556d9" />
          <circle cx="134" cy="322" r="4.5" fill="#f5a623" />
          <g fill="#e1e8f2" stroke="#c8d2e0">
            <rect x="160" y="316" width="16" height="12" rx="3" />
            <rect x="180" y="316" width="16" height="12" rx="3" />
            <rect x="200" y="316" width="14" height="12" rx="3" />
          </g>
          <text x="154" y="358" textAnchor="middle" fill="#8a97ab" fontFamily="var(--font-heading)" fontSize="9.5" fontWeight="700" letterSpacing="2.2">
            HYBRID INVERTER
          </text>
          <rect x="94" y="372" width="120" height="3" rx="1.5" fill="#1556d9" opacity="0.85" />
          {/* vents */}
          <g stroke="#cfd8e4" strokeWidth="3" strokeLinecap="round">
            <path d="M100 396h108M100 406h108M100 416h108" />
          </g>
          {/* cable glands */}
          <g fill="#3a4558">
            <rect x="96" y="441" width="14" height="12" rx="3" />
            <rect x="122" y="441" width="14" height="12" rx="3" />
            <rect x="172" y="441" width="14" height="12" rx="3" />
            <rect x="198" y="441" width="14" height="12" rx="3" />
          </g>
        </g>

        {/* ---------- lithium battery ---------- */}
        <g>
          <path d="M478 286 L500 298 L500 446 L478 458 Z" fill="url(#sideGrad)" />
          <rect x="330" y="276" width="150" height="182" rx="14" fill="url(#bodyGrad)" stroke="#d3dce8" />
          <rect x="330" y="276" width="150" height="26" rx="13" fill="#25324a" />
          <rect x="330" y="290" width="150" height="12" fill="#25324a" />
          <rect x="378" y="268" width="54" height="12" rx="6" fill="#3a4558" />
          {/* state-of-charge bar */}
          <g>
            <rect x="352" y="322" width="106" height="20" rx="6" fill="#eef3fa" stroke="#d3dce8" />
            <rect x="357" y="327" width="21" height="10" rx="2.5" fill="#22b35e" />
            <rect x="382" y="327" width="21" height="10" rx="2.5" fill="#22b35e" />
            <rect x="407" y="327" width="21" height="10" rx="2.5" fill="#22b35e" />
            <rect x="432" y="327" width="21" height="10" rx="2.5" fill="#22b35e" className="animate-soc" />
          </g>
          <text x="405" y="372" textAnchor="middle" fill="#0b1930" fontFamily="var(--font-heading)" fontSize="15" fontWeight="800">
            LiFePO
            <tspan fontSize="10" dy="4">
              4
            </tspan>
          </text>
          <text x="405" y="390" textAnchor="middle" fill="#8a97ab" fontFamily="var(--font-heading)" fontSize="8.5" fontWeight="700" letterSpacing="2">
            LITHIUM BATTERY
          </text>
          <g stroke="#d8e0ea" strokeWidth="3" strokeLinecap="round">
            <path d="M356 414h98M356 424h98M356 434h98" />
          </g>
        </g>
      </svg>

      {showCards && (
        <>
          {/* floating cards — overlaid from sm up; stacked below the render on phones */}
          <SystemOverviewCard className="animate-float-soft absolute right-0 top-[-4%] hidden w-[50%] sm:block lg:right-[-5%]" />
          <EnergyIndependenceCard gradientId="gauge-desktop" className="animate-float-soft-delay absolute right-0 top-[47%] hidden w-[30%] sm:block lg:right-[-5%]" />
          <div className="mt-4 grid grid-cols-[1.45fr_1fr] gap-2.5 sm:hidden">
            <SystemOverviewCard />
            <EnergyIndependenceCard gradientId="gauge-mobile" />
          </div>
        </>
      )}
    </div>
  );
}

import type { CSSProperties } from "react";

/**
 * Layered wave along the bottom of the shop hero, flowing continuously.
 * Each wave repeats seamlessly every 1440 units; it is drawn as ONE path
 * spanning two periods (no joins, so no hairline seams), and the CSS
 * animation (`.wave-track` / `.wave-swell` in globals.css) slides it by
 * exactly one period and loops while the layer gently rises and falls.
 * Pure CSS — no JavaScript — and still for visitors who prefer reduced motion.
 */
const PERIOD = 1440;

/** One period of curve: start height + C/S segments ending at x = PERIOD at the start height. */
const LAYERS = [
  // back: deep brand blue, slow, flows right
  { start: 50, curve: "C360 0 1080 100 1440 50", fill: "#1556d9", opacity: 0.55, speed: "26s", direction: "reverse", swell: 1.06, swellSpeed: "7s" },
  // middle: bright blue, medium, flows left
  { start: 70, curve: "C240 30 480 110 720 70 S1200 30 1440 70", fill: "#5b8ff2", opacity: 0.6, speed: "18s", direction: "normal", swell: 1.12, swellSpeed: "5.5s" },
  // front: white (matches the section below), quickest, flows right
  { start: 92, curve: "C180 122 360 62 540 92 S900 122 1080 92 S1260 62 1440 92", fill: "#ffffff", opacity: 1, speed: "13s", direction: "reverse", swell: 1.2, swellSpeed: "4.5s" },
];

/** Shift every x coordinate of a C/S segment string by `dx` (numbers come in x,y pairs). */
function shiftX(curve: string, dx: number) {
  let i = 0;
  return curve.replace(/-?\d+(\.\d+)?/g, (n) => String(i++ % 2 === 0 ? Number(n) + dx : Number(n)));
}

/** Two periods as a single filled shape. */
function doubledPath(start: number, curve: string) {
  return `M0 ${start} ${curve} ${shiftX(curve, PERIOD)} V140 H0Z`;
}

export function HeroWave() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[60px] overflow-hidden sm:h-[80px] lg:h-[100px]">
      {LAYERS.map((layer, i) => (
        <div
          key={i}
          className="wave-swell absolute inset-0"
          style={{ opacity: layer.opacity, "--wave-swell": layer.swell, "--wave-swell-speed": layer.swellSpeed } as CSSProperties}
        >
          <svg
            viewBox={`0 0 ${PERIOD * 2} 140`}
            preserveAspectRatio="none"
            className="wave-track block h-full w-[200%] will-change-transform"
            style={{ "--wave-speed": layer.speed, "--wave-direction": layer.direction } as CSSProperties}
          >
            <path d={doubledPath(layer.start, layer.curve)} fill={layer.fill} />
          </svg>
        </div>
      ))}
    </div>
  );
}

/**
 * Brands shown in the homepage brand strip. Logos are the brands' own,
 * taken from their official websites (public/brands/). A brand without a
 * logo file is shown as its name until an official logo is supplied.
 */
export interface ShowcaseBrand {
  name: string;
  /** file in /public/brands, with its pixel size */
  logo?: { src: string; width: number; height: number };
}

export const SHOWCASE_BRANDS: ShowcaseBrand[] = [
  { name: "Felicity Solar", logo: { src: "/brands/felicity-solar.png", width: 347, height: 120 } },
  { name: "Cola Solar", logo: { src: "/brands/cola-solar.png", width: 284, height: 41 } },
  { name: "Deye", logo: { src: "/brands/deye.png", width: 301, height: 120 } },
  { name: "Luxwatt", logo: { src: "/brands/luxwatt.png", width: 500, height: 101 } },
  { name: "SVC Energy", logo: { src: "/brands/svc-energy.png", width: 293, height: 120 } },
  { name: "BEVE", logo: { src: "/brands/beve.png", width: 344, height: 87 } },
  { name: "Hithium", logo: { src: "/brands/hithium.svg", width: 205, height: 49 } },
  { name: "Sako", logo: { src: "/brands/sako.png", width: 330, height: 120 } },
  { name: "Haisic" },
  { name: "Cworth Energy", logo: { src: "/brands/cworth-energy.png", width: 433, height: 69 } },
];

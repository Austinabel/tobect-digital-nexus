/** An installation case study. Edited in Admin → Pages → Projects (real projects only). */
export interface Project {
  slug: string;
  title: string;
  location: string;
  /** e.g. "10 kVA hybrid" */
  systemCapacity: string;
  inverter?: string;
  battery?: string;
  panels?: string;
  description: string;
  /** photo URL of the actual installation */
  image?: string;
}

/**
 * A customer testimonial. Edited in Admin → Pages → Testimonials (only
 * genuine reviews published with the customer's permission).
 */
export interface Testimonial {
  /** customer name or an approved display name */
  name: string;
  quote: string;
  /** product or service purchased */
  purchase?: string;
  /** 1–5, only when the customer actually gave a rating */
  rating?: number;
  /** only with the customer's permission */
  photo?: string;
  location?: string;
}

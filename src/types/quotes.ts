
export interface BaseQuote {
  id: string;
  date: string;
  full_name: string;
  email: string;
  phone: string;
  status: string;
  quote_id: string;
}

export interface DigitalServiceQuote extends BaseQuote {
  type: "digital";
  company?: string;
  budget: string;
  primary_service: string;
  additional_services?: string[];
  timeframe: string;
  project_details: string;
}

export interface ProductQuote extends BaseQuote {
  type: "product";
  address: string;
  product_category: string;
  product: string;
  quantity: number;
  installation?: boolean;
  additional_info?: string;
}

export type Quote = DigitalServiceQuote | ProductQuote;

// Status badge colors
export const statusColors: Record<string, string> = {
  "New": "bg-blue-100 text-blue-800",
  "Contacted": "bg-purple-100 text-purple-800",
  "Quote Sent": "bg-yellow-100 text-yellow-800",
  "Pending": "bg-orange-100 text-orange-800",
  "Won": "bg-green-100 text-green-800",
  "Lost": "bg-red-100 text-red-800"
};

export interface QuotesManagerProps {
  quoteType?: "digital" | "product";
}

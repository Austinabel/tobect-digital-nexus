
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  image_url?: string;
}

// Mock data types
export interface Order {
  id: string;
  date: string;
  customer: string;
  items: number;
  total: number;
  status: string;
}

export interface Ticket {
  id: string;
  date: string;
  customer: string;
  subject: string;
  status: string;
}

export interface Transaction {
  id: string;
  date: string;
  type: string;
  amount: number;
  method: string;
  status: string;
}

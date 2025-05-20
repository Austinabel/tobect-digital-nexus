
import { Battery, Cctv, CircleDollarSign, Sun, Zap } from 'lucide-react';
import React from 'react';

// Define product categories and items
export const productCategories = [
  {
    id: 'solar-panels',
    name: 'Solar Panels',
    icon: <Sun className="h-5 w-5" />,
    items: [
      { id: 1, name: 'Premium 500W Monocrystalline Panel', price: 250000 },
      { id: 2, name: 'Commercial 1KW Solar Array', price: 520000 },
      { id: 3, name: 'Portable 100W Solar Panel', price: 65000 }
    ]
  },
  {
    id: 'batteries',
    name: 'Batteries',
    icon: <Battery className="h-5 w-5" />,
    items: [
      { id: 4, name: 'Lithium 5kWh Battery Bank', price: 750000 },
      { id: 5, name: 'Deep Cycle Gel Battery 200Ah', price: 180000 },
      { id: 6, name: 'Advanced LiFePO4 Battery 100Ah', price: 350000 }
    ]
  },
  {
    id: 'inverters',
    name: 'Inverters',
    icon: <Zap className="h-5 w-5" />,
    items: [
      { id: 7, name: '5kW Hybrid Inverter', price: 650000 },
      { id: 8, name: '2kW Pure Sine Wave Inverter', price: 230000 },
      { id: 9, name: '10kW Three-Phase Inverter', price: 1200000 }
    ]
  },
  {
    id: 'cctv',
    name: 'CCTV Cameras',
    icon: <Cctv className="h-5 w-5" />,
    items: [
      { id: 10, name: '4K Dome Security Camera', price: 45000 },
      { id: 11, name: 'Wireless Home Security Camera Set', price: 120000 },
      { id: 12, name: 'AI-Powered PTZ Camera', price: 85000 }
    ]
  },
  {
    id: 'generators',
    name: 'Solar Generators',
    icon: <CircleDollarSign className="h-5 w-5" />,
    items: [
      { id: 13, name: 'Portable 1500Wh Solar Generator', price: 380000 },
      { id: 14, name: '3000W Home Backup System', price: 720000 },
      { id: 15, name: 'Commercial 5kW Solar Generator', price: 1500000 }
    ]
  }
];

// Format price in Naira
export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

// Find selected product details
export const getSelectedProduct = (categoryId: string, productId: string) => {
  const category = productCategories.find(cat => cat.id === categoryId);
  if (!category) return null;
  
  const product = category.items.find(item => item.id.toString() === productId);
  return product || null;
};


import { Battery, Cctv, CircleDollarSign, Sun, Zap } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Define product type
interface ProductItem {
  id: number | string;
  name: string;
  price: number;
  description?: string;
}

// Define database product type that includes category
interface DatabaseProduct extends ProductItem {
  category: string;
}

// Define product category type
interface ProductCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  items: ProductItem[];
}

// Default product categories and items
const defaultProductCategories: ProductCategory[] = [
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

// Fetch products from Supabase and merge with default categories
const fetchProductsFromSupabase = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*');
    
    if (error) {
      console.error("Error fetching products:", error);
      return defaultProductCategories;
    }
    
    if (!data || data.length === 0) {
      return defaultProductCategories;
    }
    
    // Group products by category
    const productsByCategory: Record<string, ProductItem[]> = {};
    
    data.forEach((product: DatabaseProduct) => {
      const categoryName = product.category;
      const categoryId = categoryName.toLowerCase().replace(/\s+/g, '-');
      
      if (!productsByCategory[categoryId]) {
        productsByCategory[categoryId] = [];
      }
      
      productsByCategory[categoryId].push({
        id: product.id,
        name: product.name,
        price: product.price,
        description: product.description
      });
    });
    
    // Create updated categories array
    const updatedCategories = defaultProductCategories.map(category => {
      const updatedItems = productsByCategory[category.id] || [];
      return {
        ...category,
        items: updatedItems.length > 0 ? updatedItems : category.items
      };
    });
    
    // Add any new categories from database
    Object.keys(productsByCategory).forEach(categoryId => {
      if (!updatedCategories.find(cat => cat.id === categoryId)) {
        // We need to get the category name from any product in this category
        const productsInCategory = productsByCategory[categoryId];
        if (productsInCategory.length > 0) {
          // Get the category name from the database directly
          const { data } = await supabase
            .from('products')
            .select('category')
            .eq('id', productsInCategory[0].id)
            .single();
            
          const categoryName = data ? data.category : categoryId.replace(/-/g, ' ');
          
          updatedCategories.push({
            id: categoryId,
            name: categoryName,
            icon: <CircleDollarSign className="h-5 w-5" />, // Default icon for new categories
            items: productsInCategory
          });
        }
      }
    });
    
    return updatedCategories;
  } catch (error) {
    console.error("Error processing products:", error);
    return defaultProductCategories;
  }
};

// Initialize productCategories with default data
export let productCategories: ProductCategory[] = [...defaultProductCategories];

// Update productCategories from database
(async () => {
  productCategories = await fetchProductsFromSupabase();
})();

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

// Hook to get product categories from Supabase
export const useProductCategories = () => {
  const [categories, setCategories] = useState<ProductCategory[]>(productCategories);
  
  useEffect(() => {
    const fetchAndSetCategories = async () => {
      const updatedCategories = await fetchProductsFromSupabase();
      setCategories(updatedCategories);
      productCategories = updatedCategories; // Update the exported variable
    };
    
    fetchAndSetCategories();
    
    // Subscribe to product changes
    const channel = supabase
      .channel('public:products')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'products' }, 
        () => {
          fetchAndSetCategories();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  return categories;
};

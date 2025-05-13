
import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define product type
export type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  image?: string;
};

// Define category type with items property
export type ProductCategory = {
  id: string;
  name: string;
  items: Product[];
};

// Initial product data
const initialProductCategories: ProductCategory[] = [
  {
    id: 'solar-panels',
    name: 'Solar Panels',
    items: [
      {
        id: 1, 
        name: 'Premium 500W Monocrystalline Panel', 
        price: 250000, 
        stock: 15,
        category: 'Solar Panels',
        description: 'High-efficiency monocrystalline solar panel with 500W output, perfect for residential installations.'
      },
      {
        id: 2, 
        name: 'Commercial 1KW Solar Array', 
        price: 520000, 
        stock: 10,
        category: 'Solar Panels',
        description: 'Industrial-grade 1KW solar array designed for commercial applications with extended warranty.'
      },
      {
        id: 3, 
        name: 'Portable 100W Solar Panel', 
        price: 65000, 
        stock: 20,
        category: 'Solar Panels',
        description: 'Lightweight and foldable 100W solar panel, ideal for camping and emergency power needs.'
      }
    ]
  },
  {
    id: 'batteries',
    name: 'Batteries',
    items: [
      {
        id: 4, 
        name: 'Lithium 5kWh Battery Bank', 
        price: 750000, 
        stock: 8,
        category: 'Batteries',
        description: 'Long-lasting lithium battery bank with 5kWh capacity and built-in BMS for smart energy management.'
      },
      {
        id: 5, 
        name: 'Deep Cycle Gel Battery 200Ah', 
        price: 180000, 
        stock: 12,
        category: 'Batteries',
        description: 'Maintenance-free deep cycle gel battery with 200Ah capacity for reliable energy storage.'
      },
      {
        id: 6, 
        name: 'Advanced LiFePO4 Battery 100Ah', 
        price: 350000, 
        stock: 15,
        category: 'Batteries',
        description: 'Premium LiFePO4 battery with 100Ah capacity, offering 5000+ cycles and 10-year warranty.'
      }
    ]
  },
  {
    id: 'inverters',
    name: 'Inverters',
    items: [
      {
        id: 7, 
        name: '5kW Hybrid Inverter', 
        price: 650000, 
        stock: 7,
        category: 'Inverters',
        description: 'Smart hybrid inverter with 5kW capacity, compatible with both on-grid and off-grid systems.'
      },
      {
        id: 8, 
        name: '2kW Pure Sine Wave Inverter', 
        price: 230000, 
        stock: 10,
        category: 'Inverters',
        description: 'High-quality pure sine wave inverter with 2kW capacity for sensitive electronics.'
      },
      {
        id: 9, 
        name: '10kW Three-Phase Inverter', 
        price: 1200000, 
        stock: 5,
        category: 'Inverters',
        description: 'Heavy-duty three-phase inverter with 10kW capacity for industrial applications.'
      }
    ]
  },
  {
    id: 'cctv',
    name: 'CCTV Cameras',
    items: [
      {
        id: 10, 
        name: '4K Dome Security Camera', 
        price: 45000, 
        stock: 25,
        category: 'CCTV Cameras',
        description: 'Weather-resistant 4K dome security camera with night vision and motion detection.'
      },
      {
        id: 11, 
        name: 'Wireless Home Security Camera Set', 
        price: 120000, 
        stock: 15,
        category: 'CCTV Cameras',
        description: 'Complete wireless security system with 4 cameras, DVR and mobile app monitoring.'
      },
      {
        id: 12, 
        name: 'AI-Powered PTZ Camera', 
        price: 85000, 
        stock: 20,
        category: 'CCTV Cameras',
        description: 'Smart PTZ camera with facial recognition, auto-tracking and 360° coverage.'
      }
    ]
  },
  {
    id: 'generators',
    name: 'Solar Generators',
    items: [
      {
        id: 13, 
        name: 'Portable 1500Wh Solar Generator', 
        price: 380000, 
        stock: 8,
        category: 'Solar Generators',
        description: 'Compact 1500Wh solar generator with multiple outlets, perfect for camping and emergencies.'
      },
      {
        id: 14, 
        name: '3000W Home Backup System', 
        price: 720000, 
        stock: 6,
        category: 'Solar Generators',
        description: 'Complete home backup solution with 3000W output and expandable battery capacity.'
      },
      {
        id: 15, 
        name: 'Commercial 5kW Solar Generator', 
        price: 1500000, 
        stock: 4,
        category: 'Solar Generators',
        description: 'Heavy-duty 5kW solar generator for construction sites and commercial applications.'
      }
    ]
  }
];

// Create the context
type ProductContextType = {
  productCategories: ProductCategory[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: number) => void;
  getProductById: (id: number) => Product | undefined;
  getAllProducts: () => Product[];
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Define provider props
interface ProductProviderProps {
  children: ReactNode;
}

// Create provider component
export const ProductProvider: React.FC<ProductProviderProps> = ({ children }) => {
  const [productCategories, setProductCategories] = useState<ProductCategory[]>(initialProductCategories);

  // Get all products as a flat array
  const getAllProducts = (): Product[] => {
    return productCategories.flatMap(category => category.items);
  };

  // Get a product by ID
  const getProductById = (id: number): Product | undefined => {
    for (const category of productCategories) {
      const product = category.items.find(item => item.id === id);
      if (product) return product;
    }
    return undefined;
  };

  // Add a new product
  const addProduct = (product: Omit<Product, 'id'>) => {
    // Generate a new unique ID
    const allProducts = getAllProducts();
    const maxId = allProducts.length > 0 ? Math.max(...allProducts.map(p => p.id)) : 0;
    const newProduct: Product = {
      ...product,
      id: maxId + 1,
    };

    // Find the category to add the product to
    setProductCategories(prevCategories => {
      const updatedCategories = [...prevCategories];
      const categoryIndex = updatedCategories.findIndex(
        c => c.id === product.category.toLowerCase().replace(/\s+/g, '-') || 
             c.name === product.category
      );

      if (categoryIndex >= 0) {
        // If category exists, add product to it
        updatedCategories[categoryIndex] = {
          ...updatedCategories[categoryIndex],
          items: [...updatedCategories[categoryIndex].items, newProduct],
        };
      } else {
        // If category doesn't exist, create new category
        const newCategoryId = product.category.toLowerCase().replace(/\s+/g, '-');
        updatedCategories.push({
          id: newCategoryId,
          name: product.category,
          items: [newProduct],
        });
      }

      return updatedCategories;
    });
  };

  // Update an existing product
  const updateProduct = (updatedProduct: Product) => {
    setProductCategories(prevCategories => {
      return prevCategories.map(category => {
        const productIndex = category.items.findIndex(item => item.id === updatedProduct.id);
        if (productIndex >= 0) {
          // Update product in its current category
          const updatedItems = [...category.items];
          updatedItems[productIndex] = updatedProduct;
          return { ...category, items: updatedItems };
        }
        return category;
      });
    });
  };

  // Delete a product
  const deleteProduct = (id: number) => {
    setProductCategories(prevCategories => {
      return prevCategories.map(category => ({
        ...category,
        items: category.items.filter(item => item.id !== id),
      })).filter(category => category.items.length > 0); // Remove empty categories
    });
  };

  return (
    <ProductContext.Provider value={{ productCategories, addProduct, updateProduct, deleteProduct, getProductById, getAllProducts }}>
      {children}
    </ProductContext.Provider>
  );
};

// Custom hook to use the product context
export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

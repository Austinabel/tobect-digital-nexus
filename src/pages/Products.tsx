
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

// Define product categories and items
const productCategories = [
  {
    id: 'solar-panels',
    name: 'Solar Panels',
    items: [
      {
        id: 1, 
        name: 'Premium 500W Monocrystalline Panel', 
        price: 250000, 
        image: '/lovable-uploads/solar-panel.jpg',
        description: 'High-efficiency monocrystalline solar panel with 500W output, perfect for residential installations.'
      },
      {
        id: 2, 
        name: 'Commercial 1KW Solar Array', 
        price: 520000, 
        image: '/lovable-uploads/solar-panel.jpg',
        description: 'Industrial-grade 1KW solar array designed for commercial applications with extended warranty.'
      },
      {
        id: 3, 
        name: 'Portable 100W Solar Panel', 
        price: 65000, 
        image: '/lovable-uploads/solar-panel.jpg',
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
        image: '/lovable-uploads/battery.jpg',
        description: 'Long-lasting lithium battery bank with 5kWh capacity and built-in BMS for smart energy management.'
      },
      {
        id: 5, 
        name: 'Deep Cycle Gel Battery 200Ah', 
        price: 180000, 
        image: '/lovable-uploads/battery.jpg',
        description: 'Maintenance-free deep cycle gel battery with 200Ah capacity for reliable energy storage.'
      },
      {
        id: 6, 
        name: 'Advanced LiFePO4 Battery 100Ah', 
        price: 350000, 
        image: '/lovable-uploads/battery.jpg',
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
        image: '/lovable-uploads/inverter.jpg',
        description: 'Smart hybrid inverter with 5kW capacity, compatible with both on-grid and off-grid systems.'
      },
      {
        id: 8, 
        name: '2kW Pure Sine Wave Inverter', 
        price: 230000, 
        image: '/lovable-uploads/inverter.jpg',
        description: 'High-quality pure sine wave inverter with 2kW capacity for sensitive electronics.'
      },
      {
        id: 9, 
        name: '10kW Three-Phase Inverter', 
        price: 1200000, 
        image: '/lovable-uploads/inverter.jpg',
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
        image: '/lovable-uploads/cctv.jpg',
        description: 'Weather-resistant 4K dome security camera with night vision and motion detection.'
      },
      {
        id: 11, 
        name: 'Wireless Home Security Camera Set', 
        price: 120000, 
        image: '/lovable-uploads/cctv.jpg',
        description: 'Complete wireless security system with 4 cameras, DVR and mobile app monitoring.'
      },
      {
        id: 12, 
        name: 'AI-Powered PTZ Camera', 
        price: 85000, 
        image: '/lovable-uploads/cctv.jpg',
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
        image: '/lovable-uploads/generator.jpg',
        description: 'Compact 1500Wh solar generator with multiple outlets, perfect for camping and emergencies.'
      },
      {
        id: 14, 
        name: '3000W Home Backup System', 
        price: 720000, 
        image: '/lovable-uploads/generator.jpg',
        description: 'Complete home backup solution with 3000W output and expandable battery capacity.'
      },
      {
        id: 15, 
        name: 'Commercial 5kW Solar Generator', 
        price: 1500000, 
        image: '/lovable-uploads/generator.jpg',
        description: 'Heavy-duty 5kW solar generator for construction sites and commercial applications.'
      }
    ]
  }
];

const Products = () => {
  const [activeTab, setActiveTab] = useState(productCategories[0].id);
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-24 md:pt-28 pb-16 flex-grow bg-gradient-to-b from-tobecatBlue-50/50 to-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-bold text-tobecatGray-900 mb-4 animate-fade-in">
              Our <span className="text-tobecatBlue-600">Products</span>
            </h1>
            <p className="text-lg text-tobecatGray-600 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
              High-quality solar equipment and security solutions for residential and commercial applications.
            </p>
          </div>

          <Tabs defaultValue={productCategories[0].id} className="w-full" onValueChange={setActiveTab}>
            <div className="flex justify-center mb-8">
              <TabsList className="bg-blue-50 p-1 rounded-full">
                {productCategories.map((category) => (
                  <TabsTrigger 
                    key={category.id}
                    value={category.id}
                    className="rounded-full data-[state=active]:bg-blue-600 data-[state=active]:text-white px-4 py-2 transition-all"
                  >
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {productCategories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="mt-6">
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {category.items.map((product) => (
                    <motion.div 
                      key={product.id}
                      className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border border-blue-100"
                      variants={itemVariants}
                    >
                      <div className="h-48 overflow-hidden bg-blue-50 flex items-center justify-center">
                        <div className="text-6xl text-blue-300">
                          {category.id === 'solar-panels' && "☀️"}
                          {category.id === 'batteries' && "🔋"}
                          {category.id === 'inverters' && "⚡"}
                          {category.id === 'cctv' && "🎥"}
                          {category.id === 'generators' && "🔌"}
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-2 text-tobecatGray-900">{product.name}</h3>
                        <p className="text-tobecatGray-600 mb-4 text-sm h-16">{product.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-tobecatBlue-600 text-lg">{formatPrice(product.price)}</span>
                          <Link to={`/get-quote?product=${product.id}&category=${category.id}&section=sales`}>
                            <Button className="bg-gradient-to-r from-tobecatBlue-600 to-tobecatBlue-500 hover:from-tobecatBlue-700 hover:to-tobecatBlue-600 text-white transition-transform hover:scale-105">
                              Purchase
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Products;

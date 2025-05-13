
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { useProducts } from '@/context/ProductContext';

const Products = () => {
  const { productCategories } = useProducts();
  const [activeTab, setActiveTab] = useState(productCategories[0]?.id || '');
  
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

          <Tabs 
            defaultValue={productCategories[0]?.id || ''} 
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="flex justify-center mb-8 overflow-x-auto pb-2">
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

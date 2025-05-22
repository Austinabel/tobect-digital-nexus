
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { formatPrice, useProductCategories } from '@/components/quotes/ProductCategoriesData';
import ScrollToTop from '@/components/ScrollToTop';
import { Image } from 'lucide-react';

const Products = () => {
  const location = useLocation();
  const productCategories = useProductCategories();
  const [activeTab, setActiveTab] = useState('');
  
  useEffect(() => {
    // Set active tab based on URL query param
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    
    if (categoryParam && productCategories.some(cat => cat.id === categoryParam)) {
      setActiveTab(categoryParam);
    } else if (productCategories.length > 0) {
      setActiveTab(productCategories[0].id);
    }
  }, [location.search, productCategories]);
  
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

          {productCategories.length > 0 && (
            <Tabs 
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
                    {category.items.length > 0 ? (
                      category.items.map((product) => (
                        <motion.div 
                          key={product.id}
                          className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border border-blue-100"
                          variants={itemVariants}
                        >
                          <Link to={`/product/${product.id}`} className="block h-48 overflow-hidden bg-blue-50 flex items-center justify-center">
                            {product.image_url ? (
                              <img 
                                src={product.image_url} 
                                alt={product.name} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="text-6xl text-blue-300 flex items-center justify-center h-full w-full">
                                <Image size={64} className="text-blue-300" />
                              </div>
                            )}
                          </Link>
                          <div className="p-6">
                            <Link to={`/product/${product.id}`} className="block">
                              <h3 className="text-xl font-bold mb-2 text-tobecatGray-900 hover:text-tobecatBlue-600 transition-colors">
                                {product.name}
                              </h3>
                              <p className="text-tobecatGray-600 mb-4 text-sm h-16">{product.description || `High-quality ${category.name.toLowerCase()}`}</p>
                            </Link>
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-tobecatBlue-600 text-lg">{formatPrice(product.price)}</span>
                              <Link to={`/product/${product.id}`}>
                                <Button className="bg-gradient-to-r from-tobecatBlue-600 to-tobecatBlue-500 hover:from-tobecatBlue-700 hover:to-tobecatBlue-600 text-white transition-transform hover:scale-105">
                                  View Details
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="col-span-3 text-center py-12">
                        <p className="text-gray-500">No products found in this category.</p>
                      </div>
                    )}
                  </motion.div>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      </div>
      <ScrollToTop />
      <Footer />
    </div>
  );
};

export default Products;

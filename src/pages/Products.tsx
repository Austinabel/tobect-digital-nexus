
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Filter } from 'lucide-react';
import { formatPrice } from '@/components/quotes/ProductCategoriesData';
import ScrollToTop from '@/components/ScrollToTop';
import { supabase } from '@/integrations/supabase/client';
import { motion } from "framer-motion";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Types
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  stock: number;
  image_url?: string;
}

const PRODUCTS_PER_PAGE = 12; // Number of products to show per page

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'all';
  
  // Fetch products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*');
        
        if (error) {
          throw error;
        }
        
        setProducts(data || []);
        
        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set((data || []).map(product => product.category))
        );
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  // Filtered products based on search and selected category
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeCategory]);
  
  const handleCategoryChange = (category: string) => {
    if (category === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearFilters = () => {
    setSearchQuery('');
    handleCategoryChange('all');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <ScrollToTop />
      
      <div className="pt-20 md:pt-24 pb-16 flex-grow">
        <div className="container mx-auto px-4 md:px-6">
          <section className="mb-12">
            <div className="text-center mb-10">
              <motion.h1 
                className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-tobecatBlue-700 to-tobecatBlue-500 inline-block text-transparent bg-clip-text"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Our Products
              </motion.h1>
              <motion.p 
                className="text-lg text-tobecatGray-600 max-w-3xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Explore our range of high-quality renewable energy products and security solutions designed to meet your needs.
              </motion.p>
            </div>
            
            {/* Search and filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input 
                  placeholder="Search products by name, description, or category..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={clearFilters}
              >
                <Filter size={18} />
                <span>Clear Filters</span>
              </Button>
            </div>

            {/* Results count */}
            {!isLoading && (
              <div className="mb-4 text-sm text-gray-600">
                {filteredProducts.length === 0 ? (
                  <span>No products found</span>
                ) : (
                  <span>
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} products
                    {searchQuery && ` for "${searchQuery}"`}
                  </span>
                )}
              </div>
            )}
            
            {/* Category tabs */}
            <Tabs defaultValue={activeCategory} onValueChange={handleCategoryChange}>
              <div className="overflow-x-auto">
                <TabsList className="mb-8 w-full justify-start">
                  <TabsTrigger value="all" className="px-4 py-2">
                    All Products
                  </TabsTrigger>
                  
                  {categories.map(category => (
                    <TabsTrigger 
                      key={category} 
                      value={category} 
                      className="px-4 py-2"
                    >
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              
              {/* Products grid */}
              <TabsContent value={activeCategory} className="mt-0">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : currentProducts.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                      {currentProducts.map((product) => (
                        <motion.div
                          key={product.id}
                          className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all border border-gray-100 group"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Link to={`/product/${product.id}`} className="block">
                            <div className="aspect-square overflow-hidden bg-gray-100">
                              {product.image_url ? (
                                <img 
                                  src={product.image_url} 
                                  alt={product.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="text-gray-400">No image</span>
                                </div>
                              )}
                            </div>
                            <div className="p-4">
                              <span className="text-sm text-tobecatBlue-600 font-medium block mb-1">{product.category}</span>
                              <h3 className="font-semibold text-lg mb-2 text-gray-800 line-clamp-2">{product.name}</h3>
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-tobecatBlue-700">{formatPrice(product.price)}</span>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  product.stock > 0 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                </span>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex justify-center mt-8">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious 
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (currentPage > 1) handlePageChange(currentPage - 1);
                                }}
                                className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                              />
                            </PaginationItem>
                            
                            {/* Page numbers */}
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                              let pageNumber;
                              if (totalPages <= 5) {
                                pageNumber = i + 1;
                              } else if (currentPage <= 3) {
                                pageNumber = i + 1;
                              } else if (currentPage >= totalPages - 2) {
                                pageNumber = totalPages - 4 + i;
                              } else {
                                pageNumber = currentPage - 2 + i;
                              }
                              
                              return (
                                <PaginationItem key={pageNumber}>
                                  <PaginationLink
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handlePageChange(pageNumber);
                                    }}
                                    isActive={currentPage === pageNumber}
                                    className="cursor-pointer"
                                  >
                                    {pageNumber}
                                  </PaginationLink>
                                </PaginationItem>
                              );
                            })}
                            
                            {totalPages > 5 && currentPage < totalPages - 2 && (
                              <PaginationItem>
                                <PaginationEllipsis />
                              </PaginationItem>
                            )}
                            
                            <PaginationItem>
                              <PaginationNext 
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (currentPage < totalPages) handlePageChange(currentPage + 1);
                                }}
                                className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 mb-4">
                      {searchQuery 
                        ? `No products found matching "${searchQuery}"` 
                        : "No products found for the selected criteria."
                      }
                    </p>
                    <Button 
                      variant="link" 
                      onClick={clearFilters}
                      className="mt-2"
                    >
                      Clear all filters
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </section>
          
          {/* CTA Section */}
          <section className="mt-16 bg-gradient-to-br from-tobecatBlue-600 to-tobecatBlue-800 rounded-xl p-8 md:p-12 text-white">
            <div className="text-center md:max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Need Help Choosing the Right Product?</h2>
              <p className="mb-6 text-tobecatBlue-50">
                Our team of experts is ready to assist you in finding the perfect solution for your needs. 
                Request a custom quote tailored to your specific requirements.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/quote">
                  <Button size="lg" className="bg-white text-tobecatBlue-700 hover:bg-tobecatBlue-50">
                    Get a Custom Quote
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                    Contact Our Sales Team
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Products;

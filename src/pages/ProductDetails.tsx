
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ShoppingCart, Package, Star, Check, ChevronRight, CircleX } from 'lucide-react';
import { formatPrice } from '@/components/quotes/ProductCategoriesData';
import ScrollToTop from '@/components/ScrollToTop';

interface ProductImage {
  id: string;
  url: string;
  product_id: string;
  is_primary: boolean;
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  image_url?: string;
  features?: string[];
  specifications?: Record<string, string>;
  images?: ProductImage[];
}

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const { toast } = useToast();
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  
  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        if (!id) return;
        
        // Fetch product details
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
          
        if (productError) throw productError;
        
        // Fetch product images
        const { data: imageData, error: imageError } = await supabase
          .from('product_images')
          .select('*')
          .eq('product_id', id)
          .order('is_primary', { ascending: false });
          
        if (imageError) {
          console.error("Error fetching images:", imageError);
          // Continue without images
        }
        
        const productWithImages = {
          ...productData,
          images: imageData || [],
          // Placeholder features and specifications if not in database
          features: productData.features || [
            "High-efficiency performance",
            "Long-lasting durability",
            "Premium quality materials",
            "Professional installation available",
            "Industry-leading warranty"
          ],
          specifications: productData.specifications || {
            "Dimensions": "Standard",
            "Weight": "Industry standard",
            "Material": "Premium quality",
            "Warranty": "1 Year manufacturer warranty",
            "Origin": "Imported"
          }
        };
        
        setProduct(productWithImages);
        
        // Set the active image to the primary image or the first image
        if (imageData && imageData.length > 0) {
          const primaryImage = imageData.find(img => img.is_primary);
          setActiveImage(primaryImage ? primaryImage.url : imageData[0].url);
        } else if (productWithImages.image_url) {
          setActiveImage(productWithImages.image_url);
        }
        
        // Fetch related products (same category)
        if (productData.category) {
          const { data: relatedData, error: relatedError } = await supabase
            .from('products')
            .select('*')
            .eq('category', productData.category)
            .neq('id', id)
            .limit(4);
            
          if (relatedError) {
            console.error("Error fetching related products:", relatedError);
          } else {
            setRelatedProducts(relatedData || []);
          }
        }
        
      } catch (error) {
        console.error("Error fetching product details:", error);
        toast({
          title: "Error",
          description: "Failed to load product details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProduct();
  }, [id, toast]);
  
  const handleAddToCart = () => {
    toast({
      title: "Added to cart",
      description: `${product?.name} has been added to your cart`,
    });
  };
  
  const handleGetQuote = () => {
    // Redirect to quote page with product pre-selected
    window.location.href = `/quote?product=${id}&category=${product?.category.toLowerCase().replace(/\s+/g, '-')}&section=sales`;
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="pt-24 md:pt-28 pb-16 flex-grow flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded-lg w-full max-w-2xl"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="pt-24 md:pt-28 pb-16 flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h2>
            <p className="text-gray-600 mb-8">The product you're looking for doesn't exist or has been removed.</p>
            <Link to="/products">
              <Button className="bg-tobecatBlue-600 hover:bg-tobecatBlue-700">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-24 md:pt-28 pb-16 flex-grow bg-gradient-to-b from-tobecatBlue-50/50 to-white">
        <div className="container mx-auto px-4 md:px-6">
        
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-gray-500 mb-6">
            <Link to="/" className="hover:text-tobecatBlue-600">Home</Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <Link to="/products" className="hover:text-tobecatBlue-600">Products</Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <Link to={`/products?category=${product.category.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-tobecatBlue-600">{product.category}</Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-tobecatBlue-600 font-medium">{product.name}</span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main image */}
              <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-md h-80 md:h-96">
                {activeImage ? (
                  <img 
                    src={activeImage} 
                    alt={product.name} 
                    className="w-full h-full object-contain p-4"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-50">
                    <Package className="h-32 w-32 text-blue-300" />
                  </div>
                )}
              </div>
              
              {/* Thumbnail images */}
              {product.images && product.images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {product.images.map((image) => (
                    <div 
                      key={image.id}
                      onClick={() => setActiveImage(image.url)}
                      className={`cursor-pointer border-2 rounded-md w-20 h-20 flex-shrink-0 transition-all ${
                        activeImage === image.url 
                          ? 'border-tobecatBlue-600' 
                          : 'border-transparent hover:border-tobecatBlue-300'
                      }`}
                    >
                      <img 
                        src={image.url} 
                        alt={`${product.name} view`}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <div className="flex items-center mb-4">
                  <div className="flex mr-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">5.0 (12 reviews)</span>
                </div>
                <div className="text-2xl font-bold text-tobecatBlue-600 mb-4">
                  {formatPrice(product.price)}
                </div>
                <p className="text-gray-600">
                  {product.description}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </div>
                <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                  {product.category}
                </div>
              </div>
              
              <div className="flex space-x-4">
                <Button 
                  className="flex-1 bg-tobecatBlue-600 hover:bg-tobecatBlue-700"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                </Button>
                <Button 
                  className="flex-1 bg-gradient-to-r from-tobecatBlue-600 to-tobecatBlue-500 hover:from-tobecatBlue-700 hover:to-tobecatBlue-600"
                  onClick={handleGetQuote}
                >
                  Get Quote
                </Button>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-medium text-gray-900 mb-2">Key Features</h3>
                <ul className="space-y-2">
                  {product.features && product.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          {/* Product Details Tabs */}
          <Tabs defaultValue="specifications" className="mb-16">
            <TabsList className="w-full border-b pb-0 mb-6 grid grid-cols-3">
              <TabsTrigger value="specifications" className="data-[state=active]:bg-blue-50 rounded-t-md">
                Specifications
              </TabsTrigger>
              <TabsTrigger value="description" className="data-[state=active]:bg-blue-50 rounded-t-md">
                Full Description
              </TabsTrigger>
              <TabsTrigger value="reviews" className="data-[state=active]:bg-blue-50 rounded-t-md">
                Reviews
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="specifications" className="pt-2">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-xl font-bold mb-4 text-gray-800">Technical Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex border-b border-gray-100 pb-2">
                      <span className="font-medium text-gray-700 w-1/2">{key}:</span>
                      <span className="text-gray-600">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="description" className="pt-2">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-xl font-bold mb-4 text-gray-800">Product Description</h3>
                <div className="prose max-w-none text-gray-600">
                  <p>{product.description}</p>
                  <p className="mt-4">
                    Our {product.category} products are designed to provide maximum efficiency and reliability
                    for both residential and commercial applications. Each product undergoes rigorous testing
                    to ensure it meets our strict quality standards.
                  </p>
                  <p className="mt-4">
                    We provide full installation services and after-sales support to ensure you get the most
                    out of your investment. Contact our team for more information about customized solutions.
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="pt-2">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Customer Reviews</h3>
                  <Button variant="outline">Write a Review</Button>
                </div>
                
                <div className="space-y-6">
                  {/* Placeholder for reviews */}
                  <div className="flex items-start space-x-4 border-b border-gray-100 pb-6">
                    <div className="bg-tobecatBlue-100 text-tobecatBlue-800 h-10 w-10 rounded-full flex items-center justify-center font-bold">
                      JD
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-medium text-gray-900">John Doe</h4>
                        <span className="text-sm text-gray-500">1 month ago</span>
                      </div>
                      <div className="flex mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="mt-2 text-gray-600">
                        Great product! It exceeded all my expectations and the quality is outstanding.
                        Installation was straightforward and customer service was excellent.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-tobecatBlue-100 text-tobecatBlue-800 h-10 w-10 rounded-full flex items-center justify-center font-bold">
                      MS
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-medium text-gray-900">Mary Smith</h4>
                        <span className="text-sm text-gray-500">2 months ago</span>
                      </div>
                      <div className="flex mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="mt-2 text-gray-600">
                        This product has been a game changer for my home energy system.
                        The performance is excellent and it was worth every penny. Highly recommended!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <Link 
                    to={`/product/${relatedProduct.id}`} 
                    key={relatedProduct.id}
                    className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200"
                  >
                    <div className="h-48 overflow-hidden bg-blue-50 flex items-center justify-center">
                      {relatedProduct.image_url ? (
                        <img 
                          src={relatedProduct.image_url} 
                          alt={relatedProduct.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="h-16 w-16 text-blue-300" />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">{relatedProduct.name}</h3>
                      <p className="text-tobecatBlue-600 font-bold">
                        {formatPrice(relatedProduct.price)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
          
        </div>
      </div>
      <ScrollToTop />
      <Footer />
    </div>
  );
};

export default ProductDetails;

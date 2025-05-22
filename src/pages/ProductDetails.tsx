import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/components/quotes/ProductCategoriesData';
import { ArrowLeft, Package, Truck, Shield, ShoppingCart, Star, ChevronRight, Plus, Minus } from 'lucide-react';
import { ProductImage } from '@/types/productImages';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ScrollToTop from '@/components/ScrollToTop';
import { motion } from "framer-motion";
import ReviewForm from '@/components/product/ReviewForm';
import ReviewsList from '@/components/product/ReviewsList';
import { ProductReview } from '@/types/productReviews';
import { fetchProductReviews, getProductRating } from '@/components/admin/products/ProductReviewService';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image_url?: string;
}

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<ProductImage | null>(null);
  const [activeTab, setActiveTab] = useState('description');
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch product details
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
        
        if (productError) throw productError;
        
        setProduct(product);
        
        // Use fetch to get product images since Supabase client doesn't know about the new table yet
        try {
          const response = await fetch(
            `https://xyrdhogqwhlpbfftgokj.supabase.co/rest/v1/product_images?product_id=eq.${id}&order=is_primary.desc,created_at.asc`, 
            {
              headers: {
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cmRob2dxd2hscGJmZnRnb2tqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzI2MTEsImV4cCI6MjA2MzM0ODYxMX0.aK2o3zBR9ioNmON5ae9yG-_MJuYBEYej9pf8151XOZA',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cmRob2dxd2hscGJmZnRnb2tqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzI2MTEsImV4cCI6MjA2MzM0ODYxMX0.aK2o3zBR9ioNmON5ae9yG-_MJuYBEYej9pf8151XOZA'
              }
            }
          );
          const images = await response.json() as ProductImage[];
          setProductImages(images);
          
          // Set the primary image or first image as selected image
          const primaryImage = images.find(img => img.is_primary);
          setSelectedImage(primaryImage || (images.length > 0 ? images[0] : null));
        } catch (imageError) {
          console.error("Error fetching images:", imageError);
          // Fall back to using the product's main image_url if available
          if (product?.image_url) {
            setProductImages([{
              id: 'main',
              product_id: product.id,
              url: product.image_url,
              is_primary: true
            }]);
            
            setSelectedImage({
              id: 'main',
              product_id: product.id,
              url: product.image_url,
              is_primary: true
            });
          }
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    const loadProductReviews = async () => {
      if (!id) return;
      
      setLoadingReviews(true);
      try {
        // Load approved reviews
        const reviewsData = await fetchProductReviews(id);
        setReviews(reviewsData);
        setReviewCount(reviewsData.length);
        
        // Get average rating
        const rating = await getProductRating(id);
        setAverageRating(rating);
      } catch (error) {
        console.error("Error loading reviews:", error);
      } finally {
        setLoadingReviews(false);
      }
    };

    if (id) {
      fetchProduct();
      loadProductReviews();
    }
  }, [id]);

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      if (value < 1) {
        setQuantity(1);
      } else if (product && value > product.stock) {
        setQuantity(product.stock);
      } else {
        setQuantity(value);
      }
    }
  };

  const handleReviewSubmitted = () => {
    // Reload reviews after a new submission
    loadProductReviews();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 md:px-6 pt-28 pb-16 flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading product details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 md:px-6 pt-28 pb-16 flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
            <p className="text-lg text-gray-600 mb-8">{error || "Product not found"}</p>
            <Link to="/products">
              <Button>Return to Products</Button>
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
      <ScrollToTop />
      
      <div className="pt-24 md:pt-28 pb-16 flex-grow">
        <div className="container mx-auto px-4 md:px-6">
          {/* Breadcrumb */}
          <nav className="flex mb-6 text-sm text-gray-500">
            <ol className="flex items-center space-x-2">
              <li>
                <Link to="/" className="hover:text-tobecatBlue-600">Home</Link>
              </li>
              <li><ChevronRight size={14} /></li>
              <li>
                <Link to="/products" className="hover:text-tobecatBlue-600">Products</Link>
              </li>
              <li><ChevronRight size={14} /></li>
              <li>
                <Link 
                  to={`/products?category=${encodeURIComponent(product.category)}`} 
                  className="hover:text-tobecatBlue-600"
                >
                  {product.category}
                </Link>
              </li>
              <li><ChevronRight size={14} /></li>
              <li className="text-tobecatBlue-600 font-medium truncate max-w-[200px]">{product.name}</li>
            </ol>
          </nav>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left side - Product Images */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Main image */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-4 aspect-square">
                {selectedImage ? (
                  <img 
                    src={selectedImage.url} 
                    alt={product.name} 
                    className="w-full h-full object-contain p-4"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <Package size={64} className="text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* Thumbnail gallery */}
              {productImages.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {productImages.map((image) => (
                    <div 
                      key={image.id}
                      onClick={() => setSelectedImage(image)}
                      className={`cursor-pointer border rounded-md overflow-hidden aspect-square transition-all ${
                        selectedImage?.id === image.id 
                          ? 'border-tobecatBlue-500 ring-2 ring-tobecatBlue-200' 
                          : 'border-gray-200 hover:border-tobecatBlue-300'
                      }`}
                    >
                      <img 
                        src={image.url}
                        alt={`${product.name} view`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
            
            {/* Right side - Product Info */}
            <motion.div 
              className="flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <div className="flex items-center mb-4">
                  <div className="flex items-center text-yellow-500 mr-2">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={16} 
                        fill={i < Math.round(averageRating) ? "currentColor" : "none"} 
                        className={i < Math.round(averageRating) ? "text-yellow-500" : "text-gray-300"}
                      />
                    ))}
                  </div>
                  <span className="text-gray-500 text-sm">
                    {reviewCount > 0 
                      ? `(${reviewCount} Review${reviewCount !== 1 ? 's' : ''})` 
                      : '(No reviews yet)'}
                  </span>
                </div>
                
                <div className="text-3xl font-bold text-tobecatBlue-600 mb-6">{formatPrice(product.price)}</div>
                
                <div className="prose prose-blue max-w-none mb-8">
                  <p className="text-gray-600">{product.description}</p>
                </div>
                
                {/* Product highlights */}
                <div className="bg-blue-50 rounded-lg p-4 mb-8">
                  <h3 className="font-medium text-tobecatBlue-700 mb-3">Product Highlights</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="bg-tobecatBlue-100 p-1 rounded-full text-tobecatBlue-700 mr-2 mt-0.5">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                      <span>High efficiency and performance</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-tobecatBlue-100 p-1 rounded-full text-tobecatBlue-700 mr-2 mt-0.5">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                      <span>Durable construction for long-term use</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-tobecatBlue-100 p-1 rounded-full text-tobecatBlue-700 mr-2 mt-0.5">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                      <span>Compatible with a variety of systems</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-tobecatBlue-100 p-1 rounded-full text-tobecatBlue-700 mr-2 mt-0.5">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                      <span>Easy installation and maintenance</span>
                    </li>
                  </ul>
                </div>
                
                {/* Stock status */}
                <div className="mb-6">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    product.stock > 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
                  </span>
                </div>
                
                {/* Quantity selector */}
                {product.stock > 0 && (
                  <div className="mb-6">
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <div className="flex items-center w-36">
                      <button 
                        type="button"
                        onClick={decrementQuantity}
                        disabled={quantity <= 1}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 h-10 w-10 flex items-center justify-center rounded-l-md transition-colors border border-r-0 border-gray-300 disabled:opacity-50"
                      >
                        <Minus size={16} />
                      </button>
                      <input
                        type="number"
                        id="quantity"
                        min="1"
                        max={product.stock}
                        value={quantity}
                        onChange={handleQuantityChange}
                        className="h-10 w-full text-center border-y border-gray-300 focus:outline-none focus:ring-1 focus:ring-tobecatBlue-500"
                      />
                      <button 
                        type="button"
                        onClick={incrementQuantity}
                        disabled={quantity >= product.stock}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 h-10 w-10 flex items-center justify-center rounded-r-md transition-colors border border-l-0 border-gray-300 disabled:opacity-50"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Button 
                    className="bg-gradient-to-r from-tobecatBlue-600 to-tobecatBlue-500 hover:from-tobecatBlue-700 hover:to-tobecatBlue-600 text-white px-8 py-6 rounded-lg flex items-center justify-center gap-2 text-lg transition-transform hover:scale-105"
                    disabled={product.stock === 0}
                    onClick={() => console.log(`Added ${quantity} of ${product.name} to cart`)}
                  >
                    <ShoppingCart />
                    Add to Cart {quantity > 1 ? `(${quantity})` : ''}
                  </Button>
                  
                  <Link to="/quote" className="w-full sm:w-auto">
                    <Button 
                      variant="outline"
                      className="border-tobecatBlue-300 text-tobecatBlue-600 hover:bg-tobecatBlue-50 w-full px-8 py-6 rounded-lg flex items-center justify-center gap-2 text-lg"
                    >
                      Request Quote
                    </Button>
                  </Link>
                </div>
                
                {/* Shipping & Returns */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start">
                      <Truck className="text-tobecatBlue-500 mr-3 mt-1" size={20} />
                      <div>
                        <h4 className="font-medium text-gray-900">Free Shipping</h4>
                        <p className="text-sm text-gray-500">For orders above ₦500,000</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Shield className="text-tobecatBlue-500 mr-3 mt-1" size={20} />
                      <div>
                        <h4 className="font-medium text-gray-900">2 Year Warranty</h4>
                        <p className="text-sm text-gray-500">Full coverage warranty</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Product details tabs */}
          <div className="mt-16">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="border-b w-full justify-start">
                <TabsTrigger value="description" className="pb-2 pt-1 px-4 text-base">Description</TabsTrigger>
                <TabsTrigger value="specifications" className="pb-2 pt-1 px-4 text-base">Specifications</TabsTrigger>
                <TabsTrigger value="reviews" className="pb-2 pt-1 px-4 text-base">
                  Reviews {reviewCount > 0 && `(${reviewCount})`}
                </TabsTrigger>
                <TabsTrigger value="shipping" className="pb-2 pt-1 px-4 text-base">Shipping & Returns</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="py-6">
                <div className="prose max-w-none">
                  <h3 className="text-xl font-semibold mb-4">Product Description</h3>
                  <p>{product.description}</p>
                  <p className="mt-4">
                    This high-quality {product.category.toLowerCase()} is designed to provide exceptional performance
                    and reliability for both residential and commercial applications. Manufactured using premium materials
                    and advanced technology, it offers superior efficiency and durability.
                  </p>
                  <p className="mt-4">
                    Our team of experts has carefully selected this product to ensure it meets our strict standards for
                    quality, performance, and value. Whether you're looking to upgrade your existing system or starting
                    a new installation, this {product.name} is an excellent choice.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="specifications" className="py-6">
                <div className="prose max-w-none">
                  <h3 className="text-xl font-semibold mb-4">Technical Specifications</h3>
                  <table className="w-full border-collapse">
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 font-medium">Category</td>
                        <td className="py-3">{product.category}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 font-medium">Model</td>
                        <td className="py-3">{product.name}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 font-medium">Warranty</td>
                        <td className="py-3">2 Years</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 font-medium">Origin</td>
                        <td className="py-3">Nigeria</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 font-medium">Certification</td>
                        <td className="py-3">ISO 9001, CE</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </TabsContent>
              
              <TabsContent value="reviews" className="py-6">
                <div className="prose max-w-none">
                  <h3 className="text-xl font-semibold mb-4">Customer Reviews</h3>
                  
                  {loadingReviews ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-500">Loading reviews...</p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <ReviewsList reviews={reviews} />
                      
                      <div className="pt-8 border-t border-gray-200">
                        <ReviewForm 
                          productId={id || ''} 
                          onReviewSubmitted={handleReviewSubmitted}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="shipping" className="py-6">
                <div className="prose max-w-none">
                  <h3 className="text-xl font-semibold mb-4">Shipping & Returns</h3>
                  <h4 className="font-medium mt-6 mb-2">Shipping</h4>
                  <ul>
                    <li>Free shipping on orders above ₦500,000</li>
                    <li>Standard shipping: 3-5 business days</li>
                    <li>Express shipping: 1-2 business days (additional fees apply)</li>
                    <li>Installation services available (contact us for pricing)</li>
                  </ul>
                  
                  <h4 className="font-medium mt-6 mb-2">Returns</h4>
                  <ul>
                    <li>30-day return policy for unused items in original packaging</li>
                    <li>Defective items can be returned for replacement within warranty period</li>
                    <li>Contact customer service to initiate a return</li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Back to Products link */}
          <div className="mt-12">
            <Link to="/products" className="inline-flex items-center text-tobecatBlue-600 hover:text-tobecatBlue-800">
              <ArrowLeft size={16} className="mr-2" />
              Back to Products
            </Link>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProductDetails;

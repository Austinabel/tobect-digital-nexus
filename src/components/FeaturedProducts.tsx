
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Battery, Zap, Cctv, Sun } from 'lucide-react';
import { motion, useInView } from "framer-motion";
import { useProducts } from '@/context/ProductContext';

const FeaturedProducts = () => {
  const { productCategories } = useProducts();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  
  // Get featured products (first product from each category)
  const featuredProducts = productCategories.slice(0, 4).map(category => {
    // Get first product or define default values to avoid type errors
    const product = category.items[0] || { 
      description: `High-quality ${category.name.toLowerCase()} for residential and commercial applications.`
    };
    
    const icons = {
      'solar-panels': <Sun size={24} className="text-blue-500" />,
      'batteries': <Battery size={24} className="text-green-500" />,
      'inverters': <Zap size={24} className="text-orange-500" />,
      'cctv': <Cctv size={24} className="text-purple-500" />
    };
    
    const colors = {
      'solar-panels': "bg-blue-50",
      'batteries': "bg-green-50",
      'inverters': "bg-orange-50",
      'cctv': "bg-purple-50",
      'generators': "bg-red-50"
    };
    
    const emojis = {
      'solar-panels': "☀️",
      'batteries': "🔋",
      'inverters': "⚡",
      'cctv': "🎥",
      'generators': "🔌"
    };
    
    return {
      id: category.id,
      name: category.name,
      description: product.description || `High-quality ${category.name.toLowerCase()} for residential and commercial applications.`,
      icon: icons[category.id as keyof typeof icons] || <Sun size={24} className="text-blue-500" />,
      emoji: emojis[category.id as keyof typeof emojis] || "⚙️",
      link: `/products?category=${category.id}`,
      color: colors[category.id as keyof typeof colors] || "bg-gray-50"
    };
  });
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <section className="py-16 bg-gradient-to-b from-white to-tobecatBlue-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-bold text-tobecatGray-900 mb-4">
            Featured <span className="text-tobecatBlue-600">Products</span>
          </h2>
          <p className="text-lg text-tobecatGray-600 max-w-2xl mx-auto">
            Discover our premium selection of solar equipment and security solutions
          </p>
        </div>
        
        <motion.div 
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {featuredProducts.map((product) => (
            <motion.div 
              key={product.id} 
              className="flex flex-col h-full bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border border-blue-100"
              variants={itemVariants}
            >
              <div className={`h-48 ${product.color} flex items-center justify-center p-4`}>
                <div className="text-6xl">
                  {product.emoji}
                </div>
              </div>
              <div className="p-6 flex-grow flex flex-col">
                <div className="flex items-center mb-3">
                  {product.icon}
                  <h3 className="ml-2 text-lg font-bold text-tobecatGray-900">{product.name}</h3>
                </div>
                <p className="text-tobecatGray-600 mb-4 flex-grow">{product.description}</p>
                <Link to={product.link} className="mt-auto">
                  <Button 
                    variant="outline" 
                    className="w-full border-blue-300 text-blue-600 hover:bg-blue-50 transition-all group"
                  >
                    View Products 
                    <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        <div className="mt-12 text-center">
          <Link to="/products">
            <Button className="bg-gradient-to-r from-tobecatBlue-600 to-tobecatBlue-500 hover:from-tobecatBlue-700 hover:to-tobecatBlue-600 text-white px-8 py-6 rounded-md text-lg transition-transform hover:scale-[1.01] shadow-lg">
              Explore All Products
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;

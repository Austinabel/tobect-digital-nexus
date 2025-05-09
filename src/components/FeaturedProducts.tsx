
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Battery, Zap, Cctv, Sun } from 'lucide-react';
import { motion, useInView } from "framer-motion";

const featuredProducts = [
  {
    id: 1,
    name: "Premium Solar Panels",
    description: "High-efficiency monocrystalline solar panels for residential and commercial use.",
    icon: <Sun size={24} className="text-blue-500" />,
    image: "/lovable-uploads/solar-panel.jpg",
    link: "/products?category=solar-panels",
    color: "bg-blue-50"
  },
  {
    id: 2,
    name: "Lithium Battery Banks",
    description: "State-of-the-art lithium battery storage solutions for reliable power supply.",
    icon: <Battery size={24} className="text-green-500" />,
    image: "/lovable-uploads/battery.jpg",
    link: "/products?category=batteries",
    color: "bg-green-50"
  },
  {
    id: 3,
    name: "Hybrid Inverters",
    description: "Smart hybrid inverters compatible with both on-grid and off-grid systems.",
    icon: <Zap size={24} className="text-orange-500" />,
    image: "/lovable-uploads/inverter.jpg",
    link: "/products?category=inverters",
    color: "bg-orange-50"
  },
  {
    id: 4,
    name: "Security Cameras",
    description: "Advanced CCTV security solutions for home and business protection.",
    icon: <Cctv size={24} className="text-purple-500" />,
    image: "/lovable-uploads/cctv.jpg",
    link: "/products?category=cctv",
    color: "bg-purple-50"
  }
];

const FeaturedProducts = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  
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
                  {product.id === 1 && "☀️"}
                  {product.id === 2 && "🔋"}
                  {product.id === 3 && "⚡"}
                  {product.id === 4 && "🎥"}
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

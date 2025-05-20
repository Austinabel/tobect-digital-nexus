
import { Card } from '@/components/ui/card';
import { SubCategory, ServiceCategory } from '@/data/services';
import { ChevronDown } from 'lucide-react';
import * as Icons from 'lucide-react';
import { motion } from 'framer-motion';

interface ServiceCardProps {
  service: ServiceCategory;
}

const ServiceCard = ({ service }: ServiceCardProps) => {
  // Get the icon component more safely with type casting
  const IconComponent = service.icon && typeof service.icon === 'string' 
    ? (Icons as any)[service.icon] || Icons.FileText
    : Icons.FileText;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true, margin: "-50px" }}
    >
      <Card className="service-card p-6 h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:border-tobecatBlue-400 overflow-hidden relative group">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-tobecatBlue-100 rounded-lg text-tobecatBlue-600 group-hover:bg-tobecatBlue-200 transition-colors duration-300">
            <motion.div 
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.7, type: "spring" }}
            >
              {IconComponent && <IconComponent size={24} />}
            </motion.div>
          </div>
        </div>
        <h3 className="text-xl font-semibold text-tobecatGray-800 mb-2 group-hover:text-tobecatBlue-600 transition-colors duration-300">{service.title}</h3>
        <p className="text-tobecatGray-600 mb-4 flex-grow">{service.description}</p>
        
        <div className="flex items-center text-tobecatBlue-600 font-medium mb-2">
          <span className="mr-1">Our Specialties</span>
          <motion.div
            animate={{ rotate: service.subcategories.length > 0 ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown size={16} />
          </motion.div>
        </div>
        
        <div className="service-subcategories overflow-hidden">
          <ul className="pl-4 space-y-1 text-tobecatGray-700">
            {service.subcategories.map((subcat: SubCategory, index) => (
              <motion.li
                key={subcat.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className="flex items-center"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-tobecatBlue-500 mr-2"></span>
                {subcat.name}
              </motion.li>
            ))}
          </ul>
        </div>
      </Card>
    </motion.div>
  );
};

export default ServiceCard;

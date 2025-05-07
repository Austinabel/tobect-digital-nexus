
import { Card } from '@/components/ui/card';
import { SubCategory, ServiceCategory } from '@/data/services';
import { ChevronDown } from 'lucide-react';
import * as Icons from 'lucide-react';

interface ServiceCardProps {
  service: ServiceCategory;
}

const ServiceCard = ({ service }: ServiceCardProps) => {
  // Get the icon component more safely with type casting
  const IconComponent = service.icon && typeof service.icon === 'string' 
    ? (Icons as any)[service.icon] || Icons.FileText
    : Icons.FileText;
  
  return (
    <Card className="service-card p-6 h-full flex flex-col transition-all hover:shadow-lg hover:border-tobecatBlue-400 overflow-hidden relative">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-tobecatBlue-100 rounded-lg text-tobecatBlue-600">
          {IconComponent && <IconComponent size={24} />}
        </div>
      </div>
      <h3 className="text-xl font-semibold text-tobecatGray-800 mb-2">{service.title}</h3>
      <p className="text-tobecatGray-600 mb-4 flex-grow">{service.description}</p>
      
      <div className="flex items-center text-tobecatBlue-600 font-medium mb-2">
        <span className="mr-1">Our Specialties</span>
        <ChevronDown size={16} />
      </div>
      
      <div className="service-subcategories overflow-hidden">
        <ul className="pl-4 space-y-1 text-tobecatGray-700">
          {service.subcategories.map((subcat: SubCategory) => (
            <li key={subcat.id} className="flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-tobecatBlue-500 mr-2"></span>
              {subcat.name}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
};

export default ServiceCard;

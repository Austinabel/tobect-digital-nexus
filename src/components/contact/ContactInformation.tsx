
import { Mail, Phone, MapPin } from 'lucide-react';

interface ContactInformationProps {
  className?: string;
}

const ContactInformation = ({ className }: ContactInformationProps) => {
  return (
    <div className={className}>
      <h2 className="text-3xl md:text-4xl font-bold text-tobecatGray-900 mb-6">
        Get In <span className="text-tobecatBlue-600">Touch</span>
      </h2>
      <p className="text-lg text-tobecatGray-600 mb-8">
        Have questions about our services? Ready to start your project? Contact us today for a free consultation.
      </p>
      
      <div className="space-y-6">
        <div className="flex items-start">
          <div className="mr-4 bg-white p-3 rounded-lg shadow-sm">
            <Phone className="h-6 w-6 text-tobecatBlue-600" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-tobecatGray-800">Phone</h4>
            <p className="text-tobecatGray-600">+234 800 TOBECAT</p>
            <p className="text-tobecatGray-600">+234 80 34885760</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="mr-4 bg-white p-3 rounded-lg shadow-sm">
            <Mail className="h-6 w-6 text-tobecatBlue-600" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-tobecatGray-800">Email</h4>
            <p className="text-tobecatGray-600">tobecattech@gmail.com</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="mr-4 bg-white p-3 rounded-lg shadow-sm">
            <MapPin className="h-6 w-6 text-tobecatBlue-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInformation;

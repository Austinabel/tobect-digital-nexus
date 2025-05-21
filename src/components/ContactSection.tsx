
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ContactSection = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast({
        title: "Error",
        description: "Please fill all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Send form data to the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: formData
      });

      if (error) {
        throw new Error(error.message || 'Something went wrong. Please try again.');
      }

      // Success
      toast({
        title: "Success!",
        description: "Your message has been sent successfully.",
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error: any) {
      console.error("Contact form error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send your message. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-tobecatBlue-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
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
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="mr-4 bg-white p-3 rounded-lg shadow-sm">
                  <Mail className="h-6 w-6 text-tobecatBlue-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-tobecatGray-800">Email</h4>
                  <p className="text-tobecatGray-600">info@tobecat.com</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="mr-4 bg-white p-3 rounded-lg shadow-sm">
                  <MapPin className="h-6 w-6 text-tobecatBlue-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-tobecatGray-800">Location</h4>
                  <p className="text-tobecatGray-600">
                    Tobecat Headquarters<br />
                    Lagos, Nigeria
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
              <h3 className="text-xl font-semibold text-tobecatGray-800 mb-6">Send Us a Message</h3>
              
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-tobecatGray-700 mb-1">
                      Full Name
                    </label>
                    <Input 
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe" 
                      className="w-full"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-tobecatGray-700 mb-1">
                      Email Address
                    </label>
                    <Input 
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      type="email"
                      placeholder="john@example.com" 
                      className="w-full"
                      required 
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-tobecatGray-700 mb-1">
                    Subject
                  </label>
                  <Input 
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can we help you?" 
                    className="w-full" 
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-tobecatGray-700 mb-1">
                    Message
                  </label>
                  <Textarea 
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about your project..." 
                    className="w-full min-h-[120px]"
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-tobecatBlue-600 hover:bg-tobecatBlue-700 text-white py-6"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    "Send Message"
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;

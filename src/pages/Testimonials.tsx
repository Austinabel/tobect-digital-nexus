
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Star, Loader2 } from 'lucide-react';
import ScrollToTop from '@/components/ScrollToTop';
import { supabase } from '@/integrations/supabase/client';

type Testimonial = {
  id: string;
  name: string;
  position: string;
  content: string;
  rating: number;
  image_url: string | null;
  service: string;
};

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('testimonials')
        .select('*');

      if (error) {
        throw error;
      }

      setTestimonials(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching testimonials:', err);
      setError('Failed to load testimonials. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to render stars based on rating
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, index) => (
      <Star
        key={index}
        size={18}
        fill={index < rating ? "#FFC107" : "none"}
        stroke={index < rating ? "#FFC107" : "#CBD5E0"}
      />
    ));
  };
  
  return (
    <div className="min-h-screen">
      <Navbar />
      <ScrollToTop />
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-tobecatGray-900">Client Testimonials</h1>
            <p className="text-xl text-tobecatGray-600">What our clients say about working with us</p>
          </div>
          
          <div className="bg-tobecatBlue-600 text-white p-8 rounded-lg mb-16 text-center">
            <h2 className="text-3xl font-bold mb-4">Our Client Satisfaction Rate</h2>
            <div className="text-6xl font-bold mb-4">98%</div>
            <div className="flex justify-center mb-4">
              {renderStars(5)}
            </div>
            <p className="max-w-2xl mx-auto">
              Based on over 200 client projects completed in the last 3 years. We pride ourselves on delivering exceptional results and fostering long-term partnerships with our clients.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-tobecatBlue-500" />
            </div>
          ) : error ? (
            <div className="text-center py-8 bg-red-50 rounded-lg border border-red-100">
              <p className="text-red-600">{error}</p>
              <button 
                onClick={fetchTestimonials}
                className="mt-4 px-4 py-2 bg-tobecatBlue-600 text-white rounded-md hover:bg-tobecatBlue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : testimonials.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-tobecatGray-600">No testimonials available at this time.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="bg-white rounded-lg overflow-hidden shadow-md p-6 transition-transform hover:shadow-lg hover:-translate-y-1">
                  <div className="flex items-center mb-4">
                    <div className={`${testimonial.image_url ? 'bg-cover bg-center' : 'bg-tobecatGray-200'} w-16 h-16 rounded-full mr-4 flex-shrink-0`} 
                         style={testimonial.image_url ? { backgroundImage: `url(${testimonial.image_url})` } : {}}></div>
                    <div>
                      <h3 className="font-bold text-tobecatGray-900">{testimonial.name}</h3>
                      <p className="text-sm text-tobecatGray-600">{testimonial.position}</p>
                    </div>
                  </div>
                  <div className="flex mb-4">
                    {renderStars(testimonial.rating)}
                  </div>
                  <p className="text-tobecatGray-700 mb-4">"{testimonial.content}"</p>
                  <div className="text-sm text-tobecatBlue-600 font-medium">
                    Service: {testimonial.service}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-16 bg-tobecatGray-100 p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4 text-tobecatGray-900">Ready to experience our services?</h2>
            <p className="text-tobecatGray-700 mb-6 max-w-2xl mx-auto">
              Join our growing list of satisfied clients and let us help your business reach its full potential.
            </p>
            <a 
              href="#contact" 
              className="inline-block px-8 py-3 bg-tobecatBlue-600 hover:bg-tobecatBlue-700 text-white rounded-md transition-colors shadow-md"
            >
              Contact Us Today
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Testimonials;

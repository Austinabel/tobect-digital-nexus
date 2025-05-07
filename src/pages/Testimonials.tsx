
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Star } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      position: 'CEO, TechStart Ltd',
      content: 'Working with Tobecat has been transformative for our business. Their team revamped our entire online presence, resulting in a 40% increase in customer inquiries. The attention to detail and commitment to quality is unmatched.',
      rating: 5,
      image: 'bg-tobecatGray-200',
      service: 'Web Development & Branding'
    },
    {
      id: 2,
      name: 'Michael Adeyemi',
      position: 'Marketing Director, Retail Chain',
      content: 'The social media management provided by Tobecat has revolutionized our online engagement. Their strategic approach helped us connect with our audience in meaningful ways, driving both brand awareness and sales.',
      rating: 5,
      image: 'bg-tobecatGray-200',
      service: 'Social Media Management'
    },
    {
      id: 3,
      name: 'Amina Hassan',
      position: 'Founder, EdTech Startup',
      content: 'From concept to launch, Tobecat guided us through the development of our educational app with professionalism and expertise. The final product exceeded our expectations and our users love the intuitive design.',
      rating: 5,
      image: 'bg-tobecatGray-200',
      service: 'App Development'
    },
    {
      id: 4,
      name: 'David Okonkwo',
      position: 'Operations Manager, Logistics Company',
      content: 'The team at Tobecat helped us navigate the complex process of business registration and compliance. Their knowledge saved us time and potential headaches, allowing us to focus on growing our operations.',
      rating: 4,
      image: 'bg-tobecatGray-200',
      service: 'CAC & Business Registration'
    },
    {
      id: 5,
      name: 'Elizabeth Nwoke',
      position: 'Creative Director, Design Agency',
      content: 'The branding package delivered by Tobecat perfectly captured our company\'s essence. From logo to complete visual identity, their work helped us stand out in a competitive market.',
      rating: 5,
      image: 'bg-tobecatGray-200',
      service: 'Graphics & Design'
    },
    {
      id: 6,
      name: 'John Peters',
      position: 'CFO, Financial Services',
      content: 'Tobecat\'s digital marketing campaigns generated measurable ROI for our business. Their data-driven approach and transparent reporting gave us confidence in the investment.',
      rating: 4,
      image: 'bg-tobecatGray-200',
      service: 'Marketing & Advertising'
    },
  ];
  
  // Helper function to render stars based on rating
  const renderStars = (rating) => {
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white rounded-lg overflow-hidden shadow-md p-6">
                <div className="flex items-center mb-4">
                  <div className={`${testimonial.image} w-16 h-16 rounded-full mr-4 flex-shrink-0`}></div>
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

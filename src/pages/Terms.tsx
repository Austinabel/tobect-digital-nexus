
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useEffect } from 'react';

const Terms = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Terms of Service</h1>
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
            <p>Welcome to Tobecat. These Terms of Service ("Terms") govern your use of our website, products, and services. By accessing or using our services, you agree to be bound by these Terms. If you do not agree with any part of these Terms, you may not use our services.</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">2. Definitions</h2>
            <ul className="list-disc pl-5 space-y-2 my-4">
              <li><strong>Service:</strong> Refers to the website, applications, products, and services provided by Tobecat.</li>
              <li><strong>User:</strong> Any individual or entity that accesses or uses our Service.</li>
              <li><strong>Content:</strong> Any information, data, text, images, graphics, or other materials uploaded, downloaded, or appearing on our Service.</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">3. Account Registration</h2>
            <p>Some parts of our Service may require you to create an account. You are responsible for:</p>
            <ul className="list-disc pl-5 space-y-2 my-4">
              <li>Providing accurate information during registration.</li>
              <li>Maintaining the security and confidentiality of your account credentials.</li>
              <li>All activities that occur under your account.</li>
            </ul>
            <p>We reserve the right to suspend or terminate your account if any information provided is inaccurate, misleading, or if you have violated these Terms.</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Intellectual Property</h2>
            <p>All content included on or comprising the Service, including text, graphics, logos, images, and software, is the property of Tobecat or our licensors and is protected by copyright, trademark, and other intellectual property laws. You may not reproduce, modify, distribute, or use any content from our Service without our prior written consent.</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">5. User Obligations</h2>
            <p>You agree to:</p>
            <ul className="list-disc pl-5 space-y-2 my-4">
              <li>Comply with all applicable laws and regulations.</li>
              <li>Not engage in any activity that could harm, disable, or overburden our Service.</li>
              <li>Not attempt to gain unauthorized access to any part of the Service.</li>
              <li>Not use the Service for any illegal or unauthorized purpose.</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Payment Terms</h2>
            <p>For paid services:</p>
            <ul className="list-disc pl-5 space-y-2 my-4">
              <li>You agree to pay all fees according to the prices and terms then in effect.</li>
              <li>Payments are non-refundable unless otherwise stated or required by law.</li>
              <li>We may change our fees at any time with reasonable notice.</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">7. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, Tobecat shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use or inability to use the Service.</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">8. Disclaimers</h2>
            <p>Our Service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no warranties, expressed or implied, regarding the operation of our Service or the information, content, or materials included on our Service.</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">9. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with the laws of Nigeria, without regard to its conflict of law principles.</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">10. Changes to Terms</h2>
            <p>We reserve the right to modify these Terms at any time. If we make material changes, we will notify you through our Service or by other means to provide you with an opportunity to review the changes before they become effective. Your continued use of our Service after the changes take effect constitutes your agreement to the revised Terms.</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">11. Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us at:</p>
            <p className="mt-2">
              Email: legal@tobecat.com<br />
              Phone: +234 800 TOBECAT<br />
              Address: Lagos, Nigeria
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Terms;

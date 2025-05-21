
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useEffect } from 'react';

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Privacy Policy</h1>
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
            <p>At Tobecat ("we," "our," or "us"), we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our services, or communicate with us.</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">2. Information We Collect</h2>
            <p>We may collect the following types of information:</p>
            <ul className="list-disc pl-5 space-y-2 my-4">
              <li><strong>Personal Information:</strong> Name, email address, phone number, company name, and other contact details you provide.</li>
              <li><strong>Usage Data:</strong> Information on how you use our website, including pages visited, time spent, and interactions.</li>
              <li><strong>Technical Data:</strong> IP address, browser type, device information, operating system, and other technology identifiers.</li>
              <li><strong>Marketing Preferences:</strong> Your preferences in receiving marketing communications from us.</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">3. How We Collect Information</h2>
            <p>We collect information through:</p>
            <ul className="list-disc pl-5 space-y-2 my-4">
              <li>Direct interactions when you fill out forms, register for events, or contact us.</li>
              <li>Automated technologies including cookies and similar tracking technologies.</li>
              <li>Third parties and public sources, including business partners, analytics providers, and search engines.</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">4. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-5 space-y-2 my-4">
              <li>Provide, maintain, and improve our services.</li>
              <li>Process transactions and fulfill orders.</li>
              <li>Communicate with you about services, updates, and promotions.</li>
              <li>Analyze usage patterns to enhance user experience.</li>
              <li>Comply with legal obligations.</li>
              <li>Prevent fraudulent activities and enhance security.</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Data Sharing and Disclosure</h2>
            <p>We may share your information with:</p>
            <ul className="list-disc pl-5 space-y-2 my-4">
              <li>Service providers who perform services on our behalf.</li>
              <li>Professional advisers including lawyers, bankers, and insurers.</li>
              <li>Regulatory authorities, law enforcement, and other governmental agencies when required by law.</li>
              <li>Business partners with your consent or where permitted by law.</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Data Security</h2>
            <p>We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">7. Your Privacy Rights</h2>
            <p>Depending on your location, you may have the right to:</p>
            <ul className="list-disc pl-5 space-y-2 my-4">
              <li>Access your personal information.</li>
              <li>Correct inaccurate personal information.</li>
              <li>Delete your personal information.</li>
              <li>Object to or restrict the processing of your data.</li>
              <li>Data portability.</li>
              <li>Withdraw consent at any time.</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">8. Children's Privacy</h2>
            <p>Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If we discover that we have collected personal information from a child, we will promptly delete it.</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">9. Changes to Privacy Policy</h2>
            <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">10. Contact Us</h2>
            <p>If you have any questions or concerns about our Privacy Policy or our data practices, please contact us at:</p>
            <p className="mt-2">
              Email: privacy@tobecat.com<br />
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

export default PrivacyPolicy;

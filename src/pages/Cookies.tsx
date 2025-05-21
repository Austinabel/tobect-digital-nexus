
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useEffect } from 'react';

const Cookies = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Cookie Policy</h1>
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
            <p>This Cookie Policy explains how Tobecat ("we", "us", or "our") uses cookies and similar technologies to recognize you when you visit our website. It explains what these technologies are and why we use them, as well as your rights to control our use of them.</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">2. What Are Cookies?</h2>
            <p>Cookies are small data files placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners to make their websites work, or to work more efficiently, as well as to provide reporting information.</p>
            <p>Cookies set by the website owner (in this case, Tobecat) are called "first-party cookies". Cookies set by parties other than the website owner are called "third-party cookies". Third-party cookies enable third-party features or functionality to be provided on or through the website (e.g., advertising, interactive content, and analytics).</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">3. Types of Cookies We Use</h2>
            <p>We use the following types of cookies:</p>
            <ul className="list-disc pl-5 space-y-2 my-4">
              <li><strong>Essential Cookies:</strong> These are cookies that are required for the operation of our website. They include, for example, cookies that enable you to log into secure areas of our website or use a shopping cart.</li>
              <li><strong>Analytical/Performance Cookies:</strong> These allow us to recognize and count the number of visitors and to see how visitors move around our website when they are using it. This helps us to improve the way our website works, for example, by ensuring that users are finding what they are looking for easily.</li>
              <li><strong>Functionality Cookies:</strong> These are used to recognize you when you return to our website. This enables us to personalize our content for you and remember your preferences.</li>
              <li><strong>Targeting Cookies:</strong> These cookies record your visit to our website, the pages you have visited, and the links you have followed. We will use this information to make our website and the advertising displayed on it more relevant to your interests.</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">4. How to Control Cookies</h2>
            <p>You can set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website, though your access to some functionality and areas may be restricted. As the means by which you can refuse cookies through your web browser controls varies from browser to browser, you should visit your browser's help menu for more information.</p>
            <p>Most advertising networks offer you a way to opt out of targeted advertising. If you would like to find out more information, please visit <a href="http://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">http://www.aboutads.info/choices/</a> or <a href="http://www.youronlinechoices.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">http://www.youronlinechoices.com</a>.</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Cookies We Use</h2>
            <p>The specific cookies we use may include:</p>
            <table className="min-w-full border border-gray-300 my-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Purpose</th>
                  <th className="border p-2">Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2">_ga</td>
                  <td className="border p-2">Used by Google Analytics to distinguish users.</td>
                  <td className="border p-2">2 years</td>
                </tr>
                <tr>
                  <td className="border p-2">_gid</td>
                  <td className="border p-2">Used by Google Analytics to distinguish users.</td>
                  <td className="border p-2">24 hours</td>
                </tr>
                <tr>
                  <td className="border p-2">_gat</td>
                  <td className="border p-2">Used by Google Analytics to throttle request rate.</td>
                  <td className="border p-2">1 minute</td>
                </tr>
                <tr>
                  <td className="border p-2">__session</td>
                  <td className="border p-2">Used to maintain session state.</td>
                  <td className="border p-2">Session</td>
                </tr>
              </tbody>
            </table>

            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Updates to This Policy</h2>
            <p>We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal, or regulatory reasons. Please therefore re-visit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.</p>
            <p>The date at the top of this Cookie Policy indicates when it was last updated.</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">7. Contact Us</h2>
            <p>If you have any questions about our use of cookies or this Cookie Policy, please contact us at:</p>
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

export default Cookies;

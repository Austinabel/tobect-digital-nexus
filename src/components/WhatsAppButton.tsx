
import { MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";

const WhatsAppButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button after scrolling a bit
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const phoneNumber = "+2348000TOBECAT"; // Replace with your actual WhatsApp number
  const message = "Hello! I'm interested in your services.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div 
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
        isVisible ? "scale-100 opacity-100" : "scale-90 opacity-0"
      }`}
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-14 h-14 bg-green-500 rounded-full shadow-lg hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
        aria-label="Chat on WhatsApp"
      >
        <MessageSquare size={28} className="text-white" />
      </a>
    </div>
  );
};

export default WhatsAppButton;

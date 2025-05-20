
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ScrollToTop from "@/components/ScrollToTop";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center bg-gradient-to-b from-tobecatBlue-50/50 to-white py-20">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white p-8 rounded-xl shadow-lg border border-tobecatBlue-100">
            <h1 className="text-7xl font-bold text-tobecatBlue-600 mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-tobecatGray-900 mb-6">Page not found</h2>
            <p className="text-tobecatGray-600 mb-8">
              The page you're looking for doesn't exist or has been moved.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                onClick={() => window.history.back()}
                variant="outline" 
                className="flex items-center justify-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
              </Button>
              <Link to="/">
                <Button className="bg-tobecatBlue-600 hover:bg-tobecatBlue-700 text-white w-full sm:w-auto">
                  Return to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default NotFound;

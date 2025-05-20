
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Quote } from '@/types/quotes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DigitalServiceQuoteForm from '@/components/quotes/DigitalServiceQuoteForm';
import ProductQuoteForm from '@/components/quotes/ProductQuoteForm';
import SuccessDialog from '@/components/quotes/SuccessDialog';
import ScrollToTop from '@/components/ScrollToTop';

const GetQuote = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("digital");
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [submittedData, setSubmittedData] = useState<Quote | null>(null);
  const [quoteType, setQuoteType] = useState<"digital" | "product">("digital");

  // Parse URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get('section');
    
    if (section === 'sales') {
      setActiveTab('sales');
    }
  }, [location]);
  
  const handleQuoteSubmitSuccess = (data: any) => {
    setSubmittedData(data);
    setQuoteType(data.type);
    setSuccessDialogOpen(true);
  };

  // Success Dialog close handler
  const handleCloseSuccessDialog = () => {
    setSuccessDialogOpen(false);
    setSubmittedData(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-24 md:pt-28 pb-16 flex-grow bg-gradient-to-b from-tobecatBlue-50 to-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-5xl font-bold text-tobecatGray-900 mb-4 animate-fade-in">
              Get a <span className="text-tobecatBlue-600">Quote</span>
            </h1>
            <p className="text-lg text-tobecatGray-600 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Tell us what you're looking for and we'll provide you with a customized solution.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-4xl mx-auto">
            <div className="flex justify-center mb-8">
              <TabsList className="grid grid-cols-2 h-14 bg-blue-50 p-1 rounded-lg">
                <TabsTrigger 
                  value="digital" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-tobecatBlue-600 data-[state=active]:to-tobecatBlue-500 data-[state=active]:text-white rounded-md text-sm md:text-base py-3 transition-all"
                >
                  Digital Services
                </TabsTrigger>
                <TabsTrigger 
                  value="sales" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-tobecatBlue-600 data-[state=active]:to-tobecatBlue-500 data-[state=active]:text-white rounded-md text-sm md:text-base py-3 transition-all"
                >
                  Product Purchase
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="digital" className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <DigitalServiceQuoteForm onSubmitSuccess={handleQuoteSubmitSuccess} />
            </TabsContent>

            <TabsContent value="sales" className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <ProductQuoteForm onSubmitSuccess={handleQuoteSubmitSuccess} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Success Dialog */}
      <SuccessDialog 
        open={successDialogOpen} 
        onOpenChange={setSuccessDialogOpen}
        submittedData={submittedData}
        quoteType={quoteType}
        onClose={handleCloseSuccessDialog}
      />

      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default GetQuote;

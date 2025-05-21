
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductsManager from "./ProductsManager";
import BlogPostManager from "./BlogPostManager";
import PortfolioManager from "./PortfolioManager";
import QuotesManager from "./QuotesManager";
import TestimonialsManager from "./TestimonialsManager";
import JobApplicationsManager from "./JobApplicationsManager";
import { Package, FileText, Image, MessageSquare, ShoppingCart, Settings, Star, Briefcase } from "lucide-react";

const AdminTabs = () => {
  return (
    <Tabs defaultValue="products" className="w-full">
      <TabsList className="w-full">
        <TabsTrigger value="products" className="flex items-center gap-2">
          <Package className="w-4 h-4" />
          <span>Products</span>
        </TabsTrigger>
        <TabsTrigger value="productQuotes" className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4" />
          <span>Product Quotes</span>
        </TabsTrigger>
        <TabsTrigger value="serviceQuotes" className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          <span>Service Quotes</span>
        </TabsTrigger>
        <TabsTrigger value="portfolio" className="flex items-center gap-2">
          <Image className="w-4 h-4" />
          <span>Portfolio</span>
        </TabsTrigger>
        <TabsTrigger value="blog" className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          <span>Blog</span>
        </TabsTrigger>
        <TabsTrigger value="testimonials" className="flex items-center gap-2">
          <Star className="w-4 h-4" />
          <span>Testimonials</span>
        </TabsTrigger>
        <TabsTrigger value="applications" className="flex items-center gap-2">
          <Briefcase className="w-4 h-4" />
          <span>Job Applications</span>
        </TabsTrigger>
      </TabsList>
      <div className="p-4 border rounded-lg mt-4">
        <TabsContent value="products">
          <ProductsManager />
        </TabsContent>
        <TabsContent value="productQuotes">
          <QuotesManager quoteType="product" />
        </TabsContent>
        <TabsContent value="serviceQuotes">
          <QuotesManager quoteType="digital" />
        </TabsContent>
        <TabsContent value="portfolio">
          <PortfolioManager />
        </TabsContent>
        <TabsContent value="blog">
          <BlogPostManager />
        </TabsContent>
        <TabsContent value="testimonials">
          <TestimonialsManager />
        </TabsContent>
        <TabsContent value="applications">
          <JobApplicationsManager />
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default AdminTabs;

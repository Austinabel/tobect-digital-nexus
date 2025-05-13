
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductsManager from "./ProductsManager";
import BlogPostManager from "./BlogPostManager";
import PortfolioManager from "./PortfolioManager";
import QuotesManager from "./QuotesManager";
import { Package, FileText, Image, MessageSquare } from "lucide-react";

const AdminTabs = () => {
  return (
    <Tabs defaultValue="products" className="w-full">
      <TabsList className="w-full">
        <TabsTrigger value="products" className="flex items-center gap-2">
          <Package className="w-4 h-4" />
          <span>Products</span>
        </TabsTrigger>
        <TabsTrigger value="portfolio" className="flex items-center gap-2">
          <Image className="w-4 h-4" />
          <span>Portfolio</span>
        </TabsTrigger>
        <TabsTrigger value="blog" className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          <span>Blog</span>
        </TabsTrigger>
        <TabsTrigger value="quotes" className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          <span>Quotes</span>
        </TabsTrigger>
      </TabsList>
      <div className="p-4 border rounded-lg mt-4">
        <TabsContent value="products">
          <ProductsManager />
        </TabsContent>
        <TabsContent value="portfolio">
          <PortfolioManager />
        </TabsContent>
        <TabsContent value="blog">
          <BlogPostManager />
        </TabsContent>
        <TabsContent value="quotes">
          <QuotesManager />
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default AdminTabs;

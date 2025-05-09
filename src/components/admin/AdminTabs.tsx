
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BlogPostManager from "./BlogPostManager";
import PortfolioManager from "./PortfolioManager";

const AdminTabs = () => {
  const [activeTab, setActiveTab] = useState("blog");
  
  return (
    <Tabs defaultValue="blog" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-2 w-full max-w-md mb-8">
        <TabsTrigger value="blog">Blog Posts</TabsTrigger>
        <TabsTrigger value="portfolio">Portfolio Items</TabsTrigger>
      </TabsList>
      
      <TabsContent value="blog" className="space-y-4">
        <BlogPostManager />
      </TabsContent>
      
      <TabsContent value="portfolio" className="space-y-4">
        <PortfolioManager />
      </TabsContent>
    </Tabs>
  );
};

export default AdminTabs;


import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BlogPostManager from "./BlogPostManager";
import PortfolioManager from "./PortfolioManager";

const AdminTabs = () => {
  const [activeTab, setActiveTab] = useState("blog");
  const [animate, setAnimate] = useState(false);
  
  useEffect(() => {
    setAnimate(true);
    const timer = setTimeout(() => setAnimate(false), 500);
    return () => clearTimeout(timer);
  }, [activeTab]);

  return (
    <div className="relative bg-gradient-to-br from-white to-tobecatBlue-50 p-6 rounded-lg shadow-lg border border-tobecatBlue-100">
      <div className="absolute top-0 right-0 w-64 h-64 bg-tobecatBlue-100 rounded-full filter blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-tobecatAccent-purple rounded-full filter blur-3xl opacity-10"></div>
      
      <Tabs 
        defaultValue="blog" 
        value={activeTab} 
        onValueChange={(value) => {
          setActiveTab(value);
        }}
        className="relative z-10"
      >
        <TabsList className="grid grid-cols-2 w-full max-w-md mb-8 bg-tobecatBlue-100 p-1 rounded-lg">
          <TabsTrigger 
            value="blog"
            className={`
              transition-all duration-300
              data-[state=active]:bg-tobecatBlue-600 data-[state=active]:text-white 
              data-[state=active]:shadow-md data-[state=active]:scale-105
              hover:bg-tobecatBlue-200
            `}
          >
            Blog Posts
          </TabsTrigger>
          <TabsTrigger 
            value="portfolio"
            className={`
              transition-all duration-300
              data-[state=active]:bg-tobecatBlue-600 data-[state=active]:text-white 
              data-[state=active]:shadow-md data-[state=active]:scale-105
              hover:bg-tobecatBlue-200
            `}
          >
            Portfolio Items
          </TabsTrigger>
        </TabsList>
        
        <div className={`transition-all duration-300 ${animate ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'}`}>
          <TabsContent value="blog" className="space-y-4 animate-fade-in">
            <BlogPostManager />
          </TabsContent>
          
          <TabsContent value="portfolio" className="space-y-4 animate-fade-in">
            <PortfolioManager />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default AdminTabs;

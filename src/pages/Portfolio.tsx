
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  image: string;
  client: string | null;
  description: string;
  link: string | null;
  date: string;
  featured: boolean | null;
}

const Portfolio = () => {
  const [projects, setProjects] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState<string[]>(['All']);
  
  useEffect(() => {
    const fetchPortfolioItems = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('portfolio_items')
          .select('*');
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setProjects(data);
          
          // Extract unique categories from portfolio items
          const uniqueCategories = Array.from(
            new Set(data.map((item: PortfolioItem) => item.category))
          );
          
          // Fetch the category names mapping
          const categoryNames: Record<string, string> = {
            'web-design': 'Web Design',
            'web-development': 'Web Development',
            'mobile-app': 'Mobile App',
            'graphic-design': 'Graphic Design',
            'branding': 'Branding',
            'marketing': 'Digital Marketing',
            'seo': 'SEO'
          };
          
          // Map category IDs to their display names and include 'All'
          setCategories(['All', ...uniqueCategories.map(
            (cat: string) => categoryNames[cat] || cat
          )]);
        }
      } catch (error) {
        console.error("Error fetching portfolio items:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPortfolioItems();
  }, []);
  
  // Filter projects based on selected category
  const filteredProjects = selectedCategory === 'All' 
    ? projects 
    : projects.filter(project => {
        // Map the display name back to ID for comparison
        const categoryMapping: Record<string, string> = {
          'Web Design': 'web-design',
          'Web Development': 'web-development',
          'Mobile App': 'mobile-app',
          'Graphic Design': 'graphic-design',
          'Branding': 'branding',
          'Digital Marketing': 'marketing',
          'SEO': 'seo'
        };
        
        const categoryId = categoryMapping[selectedCategory] || selectedCategory;
        return project.category === categoryId;
      });
  
  const getCategoryDisplayName = (categoryId: string): string => {
    const categoryNames: Record<string, string> = {
      'web-design': 'Web Design',
      'web-development': 'Web Development',
      'mobile-app': 'Mobile App',
      'graphic-design': 'Graphic Design',
      'branding': 'Branding',
      'marketing': 'Digital Marketing',
      'seo': 'SEO'
    };
    
    return categoryNames[categoryId] || categoryId;
  };
  
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-tobecatGray-900">Our Portfolio</h1>
            <p className="text-xl text-tobecatGray-600">Showcasing our best work across various industries</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-6 py-2 rounded-full ${
                  selectedCategory === category 
                    ? 'bg-tobecatBlue-500 text-white' 
                    : 'bg-white border border-tobecatGray-200 text-tobecatGray-700'
                } hover:bg-tobecatBlue-50 hover:border-tobecatBlue-200 transition-colors`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md">
                  <Skeleton className="h-60 w-full" />
                  <div className="p-6">
                    <Skeleton className="h-4 w-24 mb-3" />
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project) => (
                <div key={project.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  <div className="h-60 overflow-hidden">
                    {project.image ? (
                      <img 
                        src={project.image} 
                        alt={project.title} 
                        className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                      />
                    ) : (
                      <div className="bg-tobecatGray-200 h-full flex items-center justify-center">
                        <span className="text-tobecatGray-500">Project Image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <span className="inline-block px-3 py-1 text-sm rounded-full bg-tobecatBlue-50 text-tobecatBlue-700 mb-3">
                      {getCategoryDisplayName(project.category)}
                    </span>
                    <h3 className="text-xl font-bold mb-2 text-tobecatGray-900">{project.title}</h3>
                    <p className="text-tobecatGray-600 mb-4">{project.description}</p>
                    {project.link ? (
                      <a 
                        href={project.link} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-tobecatBlue-600 hover:text-tobecatBlue-800 font-medium transition-colors"
                      >
                        View Case Study →
                      </a>
                    ) : (
                      <span className="inline-block text-tobecatGray-400">
                        Case Study Coming Soon
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium text-tobecatGray-700">No projects found in this category</h3>
              <p className="text-tobecatGray-500 mt-2">Try selecting a different category or check back later</p>
            </div>
          )}
          
          {filteredProjects.length > 0 && filteredProjects.length % 3 === 0 && (
            <div className="mt-12 text-center">
              <button className="px-8 py-3 bg-tobecatBlue-600 hover:bg-tobecatBlue-700 text-white rounded-md transition-colors shadow-md">
                Load More Projects
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Portfolio;

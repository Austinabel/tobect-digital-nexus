
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

const categories = [
  { id: "web-design", name: "Web Design" },
  { id: "web-development", name: "Web Development" },
  { id: "mobile-app", name: "Mobile App" },
  { id: "graphic-design", name: "Graphic Design" },
  { id: "branding", name: "Branding" },
  { id: "marketing", name: "Digital Marketing" },
  { id: "seo", name: "SEO" }
];

const PortfolioManager = () => {
  const { toast } = useToast();
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isEditingItem, setIsEditingItem] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Omit<PortfolioItem, 'id'>>({
    title: '',
    category: '',
    image: '',
    client: '',
    description: '',
    link: '',
    date: new Date().toISOString().split('T')[0],
    featured: false
  });

  // Fetch portfolio items from Supabase
  const fetchPortfolioItems = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('portfolio_items')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      setPortfolioItems(data || []);
    } catch (error) {
      console.error("Error fetching portfolio items:", error);
      toast({
        title: "Error",
        description: "Failed to fetch portfolio items",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioItems();
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      category: '',
      image: '',
      client: '',
      description: '',
      link: '',
      date: new Date().toISOString().split('T')[0],
      featured: false
    });
  };

  const handleAddItem = async () => {
    if (!formData.title || !formData.category || !formData.description) {
      toast({
        title: "Error",
        description: "Title, category and description are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('portfolio_items')
        .insert([formData]);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Portfolio item added successfully",
      });
      
      setIsAddingItem(false);
      resetForm();
      fetchPortfolioItems();
    } catch (error) {
      console.error("Error adding portfolio item:", error);
      toast({
        title: "Error",
        description: "Failed to add portfolio item",
        variant: "destructive",
      });
    }
  };

  const handleEditItem = async () => {
    if (!isEditingItem) return;
    
    if (!formData.title || !formData.category || !formData.description) {
      toast({
        title: "Error",
        description: "Title, category and description are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('portfolio_items')
        .update(formData)
        .eq('id', isEditingItem);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Portfolio item updated successfully",
      });
      
      setIsEditingItem(null);
      resetForm();
      fetchPortfolioItems();
    } catch (error) {
      console.error("Error updating portfolio item:", error);
      toast({
        title: "Error",
        description: "Failed to update portfolio item",
        variant: "destructive",
      });
    }
  };

  const startEditing = (item: PortfolioItem) => {
    setIsEditingItem(item.id);
    setFormData({
      title: item.title,
      category: item.category,
      image: item.image,
      client: item.client,
      description: item.description,
      link: item.link,
      date: item.date,
      featured: item.featured
    });
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('portfolio_items')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Portfolio item deleted successfully",
      });
      
      fetchPortfolioItems();
    } catch (error) {
      console.error("Error deleting portfolio item:", error);
      toast({
        title: "Error",
        description: "Failed to delete portfolio item",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Portfolio</h2>
        {!isAddingItem && !isEditingItem && (
          <Button onClick={() => setIsAddingItem(true)}>
            <Plus size={16} className="mr-1" /> Add New Project
          </Button>
        )}
      </div>
      
      {(isAddingItem || isEditingItem !== null) && (
        <Card className="mb-8 p-6">
          <h3 className="text-xl font-bold mb-4">
            {isEditingItem !== null ? "Edit Project" : "Add New Project"}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Project Title*
              </label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Project title"
                required
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category*
              </label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleSelectChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                Image URL*
              </label>
              <Input
                id="image"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                placeholder="Image URL for the project"
                required
              />
            </div>
            
            <div>
              <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-1">
                Client
              </label>
              <Input
                id="client"
                name="client"
                value={formData.client || ''}
                onChange={handleInputChange}
                placeholder="Client name"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description*
              </label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Project description"
                className="min-h-[120px]"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-1">
                  Project Link
                </label>
                <Input
                  id="link"
                  name="link"
                  value={formData.link || ''}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                />
              </div>
              
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Completion Date*
                </label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                id="featured"
                name="featured"
                type="checkbox"
                checked={formData.featured || false}
                onChange={(e) => handleCheckboxChange('featured', e.target.checked)}
                className="h-4 w-4 text-tobecatBlue-600 rounded border-gray-300"
              />
              <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                Featured project (shown prominently)
              </label>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAddingItem(false);
                  setIsEditingItem(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={isEditingItem !== null ? handleEditItem : handleAddItem}
                className="bg-tobecatBlue-600 hover:bg-tobecatBlue-700 text-white"
              >
                {isEditingItem !== null ? "Update Project" : "Add Project"}
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      <div className="space-y-4">
        <h3 className="text-xl font-semibold mb-2">Existing Projects</h3>
        
        {isLoading ? (
          <p className="text-gray-500 italic">Loading portfolio items...</p>
        ) : portfolioItems.length === 0 ? (
          <p className="text-gray-500 italic">No portfolio items available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {portfolioItems.map(item => (
              <Card key={item.id} className="overflow-hidden">
                <div className="relative aspect-video">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover"
                  />
                  {item.featured && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                      Featured
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-medium">{item.title}</h4>
                      <p className="text-sm text-gray-500">{categories.find(c => c.id === item.category)?.name || item.category}</p>
                      {item.client && (
                        <p className="text-sm text-gray-600">Client: {item.client}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEditing(item)}
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  </div>
                  <p className="mt-2 text-gray-600 line-clamp-2">{item.description}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioManager;

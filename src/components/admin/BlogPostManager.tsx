
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Plus, Pencil, Trash, Upload, Image } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  image_url?: string;
}

const BlogPostManager = () => {
  const { toast } = useToast();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isAddingPost, setIsAddingPost] = useState(false);
  const [isEditingPost, setIsEditingPost] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Omit<BlogPost, 'id'>>({
    title: '',
    excerpt: '',
    content: '',
    author: '',
    date: new Date().toISOString().split('T')[0],
    image_url: ''
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Fetch blog posts from Supabase
  const fetchBlogPosts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setBlogPosts(data || []);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      toast({
        title: "Error",
        description: "Failed to fetch blog posts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      author: '',
      date: new Date().toISOString().split('T')[0],
      image_url: ''
    });
    setPreviewImage(null);
  };

  const handleAddPost = async () => {
    if (!formData.title || !formData.content) {
      toast({
        title: "Error",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('blog_posts')
        .insert([formData]);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Blog post added successfully",
      });
      
      setIsAddingPost(false);
      resetForm();
      fetchBlogPosts();
    } catch (error) {
      console.error("Error adding blog post:", error);
      toast({
        title: "Error",
        description: "Failed to add blog post",
        variant: "destructive",
      });
    }
  };

  const handleEditPost = async () => {
    if (!isEditingPost) return;
    
    if (!formData.title || !formData.content) {
      toast({
        title: "Error",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('blog_posts')
        .update(formData)
        .eq('id', isEditingPost);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Blog post updated successfully",
      });
      
      setIsEditingPost(null);
      resetForm();
      fetchBlogPosts();
    } catch (error) {
      console.error("Error updating blog post:", error);
      toast({
        title: "Error",
        description: "Failed to update blog post",
        variant: "destructive",
      });
    }
  };

  const startEditing = (post: BlogPost) => {
    setIsEditingPost(post.id);
    setFormData({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      author: post.author,
      date: post.date.split('T')[0],
      image_url: post.image_url || ''
    });
    setPreviewImage(post.image_url || null);
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Blog post deleted successfully",
      });
      
      fetchBlogPosts();
    } catch (error) {
      console.error("Error deleting blog post:", error);
      toast({
        title: "Error",
        description: "Failed to delete blog post",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you'd upload this to a server and get a URL back
      // For this demo, we'll just create a local object URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);
      setFormData(prev => ({ ...prev, image_url: objectUrl }));
      
      toast({
        title: "Image selected",
        description: "Image ready to be uploaded with post",
      });
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Blog Posts</h2>
        {!isAddingPost && !isEditingPost && (
          <Button 
            onClick={() => setIsAddingPost(true)}
            className="bg-tobecatBlue-600 hover:bg-tobecatBlue-700 transition-all transform hover:scale-105"
          >
            <Plus size={16} className="mr-1" /> Add New Post
          </Button>
        )}
      </div>
      
      {(isAddingPost || isEditingPost !== null) && (
        <Card className="mb-8 p-6 border-l-4 border-l-tobecatBlue-500 animate-fade-in bg-gradient-to-r from-white to-tobecatBlue-50">
          <h3 className="text-xl font-bold mb-4">
            {isEditingPost !== null ? "Edit Post" : "Add New Post"}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title*
              </label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Post title"
                required
                className="focus:border-tobecatBlue-400 focus:ring-tobecatBlue-300"
              />
            </div>
            
            <div>
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
                Excerpt*
              </label>
              <Input
                id="excerpt"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleInputChange}
                placeholder="Brief excerpt (displayed in listings)"
                required
                className="focus:border-tobecatBlue-400 focus:ring-tobecatBlue-300"
              />
            </div>
            
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Content*
              </label>
              <Textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Post content"
                className="min-h-[200px] focus:border-tobecatBlue-400 focus:ring-tobecatBlue-300"
                required
              />
            </div>

            <div className="border-2 border-dashed border-tobecatBlue-300 rounded-lg p-6 bg-tobecatBlue-50 transition-all hover:bg-tobecatBlue-100">
              <div className="flex flex-col items-center">
                <Image className="h-12 w-12 text-tobecatBlue-500 mb-2" />
                <p className="mb-2 text-sm text-tobecatGray-600">Upload a featured image for your blog post</p>
                
                <label htmlFor="image-upload" className="cursor-pointer bg-tobecatBlue-600 hover:bg-tobecatBlue-700 text-white py-2 px-4 rounded flex items-center transition-transform hover:scale-105">
                  <Upload size={16} className="mr-2" />
                  Choose Image
                  <input 
                    id="image-upload" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    className="hidden" 
                  />
                </label>
                
                {previewImage && (
                  <div className="mt-4 w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preview</label>
                    <div className="relative mt-2 rounded-lg overflow-hidden border border-tobecatBlue-300 animate-fade-in">
                      <img 
                        src={previewImage} 
                        alt="Preview" 
                        className="w-full h-48 object-cover transition-transform hover:scale-105 duration-300" 
                      />
                      <button 
                        onClick={() => {
                          setPreviewImage(null);
                          setFormData(prev => ({ ...prev, image_url: '' }));
                        }} 
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-4 w-full">
                  <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">
                    Or paste image URL directly:
                  </label>
                  <Input
                    id="image_url"
                    name="image_url"
                    type="text"
                    value={formData.image_url}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                    className="focus:border-tobecatBlue-400 focus:ring-tobecatBlue-300"
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
                  Author*
                </label>
                <Input
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  placeholder="Author name"
                  required
                  className="focus:border-tobecatBlue-400 focus:ring-tobecatBlue-300"
                />
              </div>
              
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date*
                </label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className="focus:border-tobecatBlue-400 focus:ring-tobecatBlue-300"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAddingPost(false);
                  setIsEditingPost(null);
                  resetForm();
                }}
                className="border-tobecatBlue-300 hover:bg-tobecatBlue-50"
              >
                Cancel
              </Button>
              <Button 
                onClick={isEditingPost !== null ? handleEditPost : handleAddPost}
                className="bg-tobecatBlue-600 hover:bg-tobecatBlue-700 text-white transition-transform hover:scale-105"
              >
                {isEditingPost !== null ? "Update Post" : "Add Post"}
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      <div className="space-y-4">
        <h3 className="text-xl font-semibold mb-4">Existing Posts</h3>
        
        {isLoading ? (
          <p className="text-gray-500 italic">Loading blog posts...</p>
        ) : blogPosts.length === 0 ? (
          <p className="text-gray-500 italic">No blog posts available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {blogPosts.map(post => (
              <Card 
                key={post.id} 
                className="overflow-hidden border-l-4 border-l-tobecatBlue-500 transition-all hover:shadow-lg hover:scale-[1.02]"
              >
                {post.image_url && (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={post.image_url} 
                      alt={post.title} 
                      className="w-full h-full object-cover transition-transform hover:scale-110 duration-500" 
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex justify-between">
                    <div>
                      <h4 className="text-lg font-medium text-tobecatBlue-800">{post.title}</h4>
                      <p className="text-sm text-gray-500">
                        By {post.author} on {new Date(post.date).toLocaleDateString()}
                      </p>
                      <p className="mt-2 text-gray-600">{post.excerpt}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEditing(post)}
                        className="text-tobecatBlue-600 hover:text-tobecatBlue-800 hover:bg-tobecatBlue-50"
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeletePost(post.id)}
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPostManager;

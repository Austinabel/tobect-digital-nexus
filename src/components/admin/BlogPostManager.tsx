
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Plus, Pencil, Trash } from 'lucide-react';

// Mock blog posts data (in a real app, this would come from a database)
const initialBlogPosts = [
  {
    id: 1,
    title: "The Future of Web Development",
    excerpt: "Exploring the latest trends and technologies in web development.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    author: "John Doe",
    date: "2025-04-15"
  },
  {
    id: 2,
    title: "UX Design Principles for 2025",
    excerpt: "Essential UX design principles every designer should know.",
    content: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    author: "Jane Smith",
    date: "2025-04-10"
  }
];

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
}

const BlogPostManager = () => {
  const { toast } = useToast();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(initialBlogPosts);
  const [isAddingPost, setIsAddingPost] = useState(false);
  const [isEditingPost, setIsEditingPost] = useState<number | null>(null);
  const [formData, setFormData] = useState<Omit<BlogPost, 'id'>>({
    title: '',
    excerpt: '',
    content: '',
    author: '',
    date: new Date().toISOString().split('T')[0]
  });

  const resetForm = () => {
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      author: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleAddPost = () => {
    if (!formData.title || !formData.content) {
      toast({
        title: "Error",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }

    const newPost = {
      id: blogPosts.length > 0 ? Math.max(...blogPosts.map(post => post.id)) + 1 : 1,
      ...formData
    };

    setBlogPosts([...blogPosts, newPost]);
    setIsAddingPost(false);
    resetForm();
    
    toast({
      title: "Success",
      description: "Blog post added successfully",
    });
  };

  const handleEditPost = () => {
    if (!isEditingPost) return;
    
    if (!formData.title || !formData.content) {
      toast({
        title: "Error",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }

    const updatedPosts = blogPosts.map(post => 
      post.id === isEditingPost ? { ...post, ...formData } : post
    );

    setBlogPosts(updatedPosts);
    setIsEditingPost(null);
    resetForm();
    
    toast({
      title: "Success",
      description: "Blog post updated successfully",
    });
  };

  const startEditing = (post: BlogPost) => {
    setIsEditingPost(post.id);
    setFormData({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      author: post.author,
      date: post.date
    });
  };

  const handleDeletePost = (id: number) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      setBlogPosts(blogPosts.filter(post => post.id !== id));
      
      toast({
        title: "Success",
        description: "Blog post deleted successfully",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Blog Posts</h2>
        {!isAddingPost && !isEditingPost && (
          <Button onClick={() => setIsAddingPost(true)}>
            <Plus size={16} className="mr-1" /> Add New Post
          </Button>
        )}
      </div>
      
      {(isAddingPost || isEditingPost !== null) && (
        <Card className="mb-8 p-6">
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
                className="min-h-[200px]"
                required
              />
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
              >
                Cancel
              </Button>
              <Button 
                onClick={isEditingPost !== null ? handleEditPost : handleAddPost}
                className="bg-tobecatBlue-600 hover:bg-tobecatBlue-700 text-white"
              >
                {isEditingPost !== null ? "Update Post" : "Add Post"}
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      <div className="space-y-4">
        <h3 className="text-xl font-semibold mb-2">Existing Posts</h3>
        
        {blogPosts.length === 0 ? (
          <p className="text-gray-500 italic">No blog posts available.</p>
        ) : (
          blogPosts.map(post => (
            <Card key={post.id} className="p-4 border-l-4 border-l-tobecatBlue-500">
              <div className="flex justify-between">
                <div>
                  <h4 className="text-lg font-medium">{post.title}</h4>
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
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDeletePost(post.id)}
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default BlogPostManager;


import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { BlogPost, BlogPostFormData } from './types';

export const useBlogPost = () => {
  const { toast } = useToast();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isAddingPost, setIsAddingPost] = useState(false);
  const [isEditingPost, setIsEditingPost] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<BlogPostFormData>({
    title: '',
    excerpt: '',
    content: '',
    author: '',
    date: new Date().toISOString().split('T')[0],
    image_url: ''
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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
    if (!formData.title || !formData.content || !formData.excerpt) {
      toast({
        title: "Error",
        description: "Title, excerpt and content are required",
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
    
    if (!formData.title || !formData.content || !formData.excerpt) {
      toast({
        title: "Error",
        description: "Title, excerpt and content are required",
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content?.split(/\s+/).length || 0;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readTime} min read`;
  };

  return {
    blogPosts,
    isAddingPost,
    setIsAddingPost,
    isEditingPost,
    setIsEditingPost,
    isLoading,
    formData,
    setFormData,
    previewImage,
    setPreviewImage,
    resetForm,
    handleAddPost,
    handleEditPost,
    startEditing,
    handleDeletePost,
    formatDate,
    calculateReadTime,
  };
};

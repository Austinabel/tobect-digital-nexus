
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Clock, User, ChevronLeft, Share2 } from 'lucide-react';

const BlogDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBlogPost = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        setPost(data);
      } catch (error: any) {
        setError(error.message);
        toast({
          title: "Error",
          description: "Failed to load blog post",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchBlogPost();
    }
  }, [id, toast]);

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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Blog post link copied to clipboard",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-16 container mx-auto px-4 flex items-center justify-center">
          <div className="animate-pulse space-y-8 w-full max-w-3xl">
            <div className="h-8 bg-tobecatGray-200 rounded w-3/4"></div>
            <div className="h-4 bg-tobecatGray-200 rounded w-1/4"></div>
            <div className="h-64 bg-tobecatGray-200 rounded"></div>
            <div className="space-y-4">
              <div className="h-4 bg-tobecatGray-200 rounded"></div>
              <div className="h-4 bg-tobecatGray-200 rounded"></div>
              <div className="h-4 bg-tobecatGray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-16 container mx-auto px-4 flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold mb-4 text-tobecatGray-800">Blog post not found</h2>
          <p className="text-tobecatGray-600 mb-8">The blog post you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link to="/blog">Return to Blog</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <Button 
                variant="ghost" 
                asChild 
                className="mb-4 text-tobecatGray-600 hover:text-tobecatBlue-600"
              >
                <Link to="/blog" className="flex items-center">
                  <ChevronLeft size={16} className="mr-1" />
                  Back to all posts
                </Link>
              </Button>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-tobecatGray-900">{post.title}</h1>
              
              <div className="flex flex-wrap items-center text-tobecatGray-600 mb-6 gap-4">
                <div className="flex items-center">
                  <User size={16} className="mr-1" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center">
                  <CalendarIcon size={16} className="mr-1" />
                  <span>{formatDate(post.date)}</span>
                </div>
                <div className="flex items-center">
                  <Clock size={16} className="mr-1" />
                  <span>{calculateReadTime(post.content)}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-auto" 
                  onClick={handleShare}
                >
                  <Share2 size={16} className="mr-1" />
                  Share
                </Button>
              </div>
            </div>
            
            {post.image_url && (
              <div className="mb-8">
                <img 
                  src={post.image_url} 
                  alt={post.title} 
                  className="w-full h-auto rounded-lg shadow-md" 
                />
              </div>
            )}
            
            <div className="prose prose-lg max-w-none text-left">
              {post.content.split('\n').map((paragraph: string, idx: number) => (
                paragraph.trim() ? <p key={idx} className="mb-4 text-tobecatGray-700 text-left">{paragraph}</p> : <br key={idx} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default BlogDetail;

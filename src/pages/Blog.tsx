
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { CalendarIcon, Clock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Blog = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [page, setPage] = useState(0);
  const postsPerPage = 6;
  const [hasMore, setHasMore] = useState(true);
  
  useEffect(() => {
    const fetchBlogPosts = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .order('date', { ascending: false })
          .range(page * postsPerPage, (page + 1) * postsPerPage - 1);
        
        if (error) {
          throw error;
        }
        
        if (data) {
          if (page === 0) {
            setPosts(data);
          } else {
            setPosts(prevPosts => [...prevPosts, ...data]);
          }
          
          setHasMore(data.length === postsPerPage);
        }
      } catch (error: any) {
        console.error("Error fetching blog posts:", error);
        toast({
          title: "Error",
          description: "Failed to load blog posts",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBlogPosts();
  }, [page, toast]);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content?.split(/\s+/).length || 0;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readTime} min read`;
  };
  
  const loadMore = () => {
    setPage(prevPage => prevPage + 1);
  };
  
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-tobecatGray-900">Our Blog</h1>
            <p className="text-xl text-tobecatGray-600">Insights, guides, and industry news</p>
          </div>
          
          {isLoading && page === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
                  <div className="bg-tobecatGray-200 h-48"></div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-6 w-20 bg-tobecatGray-200 rounded"></div>
                      <div className="h-4 w-24 bg-tobecatGray-200 rounded"></div>
                    </div>
                    <div className="h-7 bg-tobecatGray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-tobecatGray-200 rounded mb-4"></div>
                    <div className="h-4 bg-tobecatGray-200 rounded mb-4 w-5/6"></div>
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-24 bg-tobecatGray-200 rounded"></div>
                      <div className="h-4 w-16 bg-tobecatGray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <div key={post.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  <Link to={`/blog/${post.id}`}>
                    {post.image_url ? (
                      <div className="h-48 overflow-hidden">
                        <img 
                          src={post.image_url} 
                          alt={post.title} 
                          className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                        />
                      </div>
                    ) : (
                      <div className="bg-tobecatGray-200 h-48 flex items-center justify-center">
                        <span className="text-tobecatGray-500">Blog Image</span>
                      </div>
                    )}
                  </Link>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-block px-3 py-1 text-xs rounded-full bg-tobecatBlue-50 text-tobecatBlue-700">
                        Blog
                      </span>
                      <span className="text-tobecatGray-500 text-sm flex items-center">
                        <CalendarIcon size={14} className="mr-1" />
                        {formatDate(post.date)}
                      </span>
                    </div>
                    <Link to={`/blog/${post.id}`}>
                      <h3 className="text-xl font-bold mb-2 text-tobecatGray-900 hover:text-tobecatBlue-600 transition-colors text-left">
                        {post.title}
                      </h3>
                    </Link>
                    <p className="text-tobecatGray-600 mb-4 text-left">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <Link 
                        to={`/blog/${post.id}`}
                        className="inline-block text-tobecatBlue-600 hover:text-tobecatBlue-800 font-medium transition-colors"
                      >
                        Read More →
                      </Link>
                      <div className="flex items-center text-tobecatGray-500 text-sm">
                        <Clock size={14} className="mr-1" />
                        <span>{calculateReadTime(post.content)}</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center text-tobecatGray-500 text-sm">
                      <User size={14} className="mr-1" />
                      <span>{post.author}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl text-tobecatGray-700 mb-4">No blog posts available yet</h3>
              <p className="text-tobecatGray-500">Check back soon for new articles and insights!</p>
            </div>
          )}
          
          {hasMore && posts.length > 0 && (
            <div className="mt-12 text-center">
              <Button 
                onClick={loadMore}
                className="px-8 py-3 h-auto bg-tobecatBlue-600 hover:bg-tobecatBlue-700 text-white rounded-md transition-colors shadow-md"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Load More Articles'}
              </Button>
            </div>
          )}
        </div>
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Blog;

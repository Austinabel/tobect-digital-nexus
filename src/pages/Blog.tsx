
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Blog = () => {
  const posts = [
    {
      id: 1,
      title: '10 Web Design Trends to Watch in 2025',
      excerpt: 'Explore the latest design trends that are shaping the web development landscape this year.',
      date: 'May 3, 2025',
      category: 'Design',
      readTime: '5 min read',
      image: 'bg-tobecatGray-200'
    },
    {
      id: 2,
      title: 'How to Choose the Right Tech Stack for Your Project',
      excerpt: 'A comprehensive guide to selecting technologies that align with your business requirements.',
      date: 'April 27, 2025',
      category: 'Development',
      readTime: '8 min read',
      image: 'bg-tobecatGray-200'
    },
    {
      id: 3,
      title: 'The Impact of AI on Digital Marketing Strategies',
      excerpt: 'Discover how artificial intelligence is revolutionizing the way companies approach digital marketing.',
      date: 'April 15, 2025',
      category: 'Marketing',
      readTime: '6 min read',
      image: 'bg-tobecatGray-200'
    },
    {
      id: 4,
      title: 'Streamlining Your Business Registration Process in Nigeria',
      excerpt: 'Expert tips on navigating the CAC registration system efficiently and avoiding common pitfalls.',
      date: 'April 2, 2025',
      category: 'Business',
      readTime: '7 min read',
      image: 'bg-tobecatGray-200'
    },
    {
      id: 5,
      title: 'Best Practices for Mobile App UI Design',
      excerpt: 'Learn the essential principles that lead to intuitive, user-friendly mobile applications.',
      date: 'March 20, 2025',
      category: 'Design',
      readTime: '5 min read',
      image: 'bg-tobecatGray-200'
    },
    {
      id: 6,
      title: 'How to Build an Effective Social Media Strategy',
      excerpt: 'A step-by-step approach to creating and implementing a social media plan that drives engagement.',
      date: 'March 12, 2025',
      category: 'Social Media',
      readTime: '9 min read',
      image: 'bg-tobecatGray-200'
    },
  ];
  
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-tobecatGray-900">Our Blog</h1>
            <p className="text-xl text-tobecatGray-600">Insights, guides, and industry news</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <div className={`${post.image} h-48 flex items-center justify-center`}>
                  <span className="text-tobecatGray-500">Blog Image</span>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-block px-3 py-1 text-xs rounded-full bg-tobecatBlue-50 text-tobecatBlue-700">
                      {post.category}
                    </span>
                    <span className="text-tobecatGray-500 text-sm">{post.date}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-tobecatGray-900">{post.title}</h3>
                  <p className="text-tobecatGray-600 mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <a 
                      href="#" 
                      className="inline-block text-tobecatBlue-600 hover:text-tobecatBlue-800 font-medium transition-colors"
                    >
                      Read More →
                    </a>
                    <span className="text-tobecatGray-500 text-sm">{post.readTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <button className="px-8 py-3 bg-tobecatBlue-600 hover:bg-tobecatBlue-700 text-white rounded-md transition-colors shadow-md">
              Load More Articles
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Blog;

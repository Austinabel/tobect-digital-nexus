
import React from 'react';
import { BlogPost } from './types';
import BlogPostCard from './BlogPostCard';

interface BlogPostListProps {
  posts: BlogPost[];
  isLoading: boolean;
  onEdit: (post: BlogPost) => void;
  onDelete: (id: string) => void;
  formatDate: (dateString: string) => string;
  calculateReadTime: (content: string) => string;
}

const BlogPostList: React.FC<BlogPostListProps> = ({
  posts,
  isLoading,
  onEdit,
  onDelete,
  formatDate,
  calculateReadTime,
}) => {
  if (isLoading) {
    return <p className="text-gray-500 italic">Loading blog posts...</p>;
  }

  if (posts.length === 0) {
    return <p className="text-gray-500 italic">No blog posts available.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {posts.map(post => (
        <BlogPostCard
          key={post.id}
          post={post}
          onEdit={onEdit}
          onDelete={onDelete}
          formatDate={formatDate}
          calculateReadTime={calculateReadTime}
        />
      ))}
    </div>
  );
};

export default BlogPostList;

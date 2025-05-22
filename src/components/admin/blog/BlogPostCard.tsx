
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Pencil, Trash, Eye } from 'lucide-react';
import { BlogPost } from './types';

interface BlogPostCardProps {
  post: BlogPost;
  onEdit: (post: BlogPost) => void;
  onDelete: (id: string) => void;
  formatDate: (dateString: string) => string;
  calculateReadTime: (content: string) => string;
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({ 
  post, 
  onEdit, 
  onDelete,
  formatDate,
  calculateReadTime
}) => {
  return (
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
          <div className="flex-1">
            <h4 className="text-lg font-medium text-tobecatBlue-800">{post.title}</h4>
            <p className="text-sm text-gray-500 mb-2">
              By {post.author} on {formatDate(post.date)}
            </p>
            <p className="mt-2 text-gray-600 line-clamp-2">{post.excerpt}</p>
            <div className="mt-2 text-xs text-gray-500">
              {calculateReadTime(post.content)} • {post.content.split(/\s+/).filter(Boolean).length} words
            </div>
          </div>
          <div className="flex flex-col gap-2 ml-4">
            <Button
              size="sm"
              variant="outline"
              asChild
              className="text-tobecatBlue-600 hover:text-tobecatBlue-800 hover:bg-tobecatBlue-50"
            >
              <Link to={`/blog/${post.id}`} target="_blank">
                <Eye size={16} />
              </Link>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(post)}
              className="text-tobecatBlue-600 hover:text-tobecatBlue-800 hover:bg-tobecatBlue-50"
            >
              <Pencil size={16} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={() => onDelete(post.id)}
            >
              <Trash size={16} />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BlogPostCard;

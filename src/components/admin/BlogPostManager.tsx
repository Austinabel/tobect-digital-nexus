
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BlogPostForm } from './blog/BlogPostForm';
import BlogPostList from './blog/BlogPostList';
import { useBlogPost } from './blog/useBlogPost';

const BlogPostManager = () => {
  const {
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
    calculateReadTime
  } = useBlogPost();

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
          
          <BlogPostForm 
            formData={formData}
            setFormData={setFormData}
            previewImage={previewImage}
            setPreviewImage={setPreviewImage}
            handleSubmit={isEditingPost !== null ? handleEditPost : handleAddPost}
            onCancel={() => {
              setIsAddingPost(false);
              setIsEditingPost(null);
              resetForm();
            }}
            isEditing={isEditingPost !== null}
          />
        </Card>
      )}
      
      <div className="space-y-4">
        <h3 className="text-xl font-semibold mb-4">Existing Posts</h3>
        
        <BlogPostList 
          posts={blogPosts}
          isLoading={isLoading}
          onEdit={startEditing}
          onDelete={handleDeletePost}
          formatDate={formatDate}
          calculateReadTime={calculateReadTime}
        />
      </div>
    </div>
  );
};

export default BlogPostManager;


import { useState, ChangeEvent } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Image, Trash } from 'lucide-react';

interface BlogPostFormProps {
  formData: BlogPostFormData;
  setFormData: (data: BlogPostFormData) => void;
  previewImage: string | null;
  setPreviewImage: (image: string | null) => void;
  handleSubmit: () => void;
  onCancel: () => void;
  isEditing: boolean;
}

export interface BlogPostFormData {
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  image_url?: string;
}

export const BlogPostForm: React.FC<BlogPostFormProps> = ({
  formData,
  setFormData,
  previewImage,
  setPreviewImage,
  handleSubmit,
  onCancel,
  isEditing
}) => {
  const { toast } = useToast();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you'd upload this to a server and get a URL back
      // For this demo, we'll just create a local object URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);
      setFormData({ ...formData, image_url: objectUrl });
      
      toast({
        title: "Image selected",
        description: "Image ready to be uploaded with post",
      });
    }
  };

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content?.split(/\s+/).filter(Boolean).length || 0;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readTime} min read`;
  };

  return (
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
          Excerpt* <span className="text-xs text-gray-500">(A brief summary displayed in listings, 150-200 characters recommended)</span>
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
        <div className="text-xs text-gray-500 mt-1">
          {formData.excerpt.length} characters
          {formData.excerpt.length > 200 && (
            <span className="text-yellow-600"> (recommended: 200 or fewer)</span>
          )}
        </div>
      </div>
      
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
          Content* <span className="text-xs text-gray-500">(Use line breaks for paragraphs)</span>
        </label>
        <Textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleInputChange}
          placeholder="Post content"
          className="min-h-[250px] focus:border-tobecatBlue-400 focus:ring-tobecatBlue-300"
          required
        />
        <div className="text-xs text-gray-500 mt-1">
          Word count: {formData.content.split(/\s+/).filter(Boolean).length} words
          <span className="ml-2">|</span>
          <span className="ml-2">Estimated read time: {calculateReadTime(formData.content)}</span>
        </div>
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
                    setFormData({ ...formData, image_url: '' });
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
              value={formData.image_url || ''}
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
          onClick={onCancel}
          className="border-tobecatBlue-300 hover:bg-tobecatBlue-50"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          className="bg-tobecatBlue-600 hover:bg-tobecatBlue-700 text-white transition-transform hover:scale-105"
        >
          {isEditing ? "Update Post" : "Add Post"}
        </Button>
      </div>
    </div>
  );
};

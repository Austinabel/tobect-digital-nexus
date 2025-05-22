
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Image, UploadCloud, X, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ImageUploaderProps {
  productId: string;
  onImagesChange: (images: ProductImage[]) => void;
  existingImages?: ProductImage[];
}

export interface ProductImage {
  id: string;
  url: string;
  product_id: string;
  is_primary: boolean;
}

const ImageUploader = ({ productId, onImagesChange, existingImages = [] }: ImageUploaderProps) => {
  const [images, setImages] = useState<ProductImage[]>(existingImages);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files.length) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const newImages: ProductImage[] = [];
      
      // Process each file
      for (let i = 0; i < Math.min(files.length, 5); i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${productId}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${fileName}`;
        
        // Upload file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('product_images')
          .upload(filePath, file);
          
        if (uploadError) {
          throw uploadError;
        }
        
        // Get public URL
        const { data: urlData } = supabase
          .storage
          .from('product_images')
          .getPublicUrl(filePath);
          
        // Insert record in product_images table
        const { data: imageData, error: dbError } = await supabase
          .from('product_images')
          .insert({
            product_id: productId,
            url: urlData.publicUrl,
            is_primary: images.length === 0 && i === 0 // First image is primary if no other images exist
          })
          .select()
          .single();
          
        if (dbError) {
          throw dbError;
        }
        
        newImages.push(imageData as ProductImage);
        setUploadProgress(Math.round(((i + 1) / Math.min(files.length, 5)) * 100));
      }
      
      // Update state with new images
      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);
      onImagesChange(updatedImages);
      
      toast({
        title: "Images uploaded",
        description: `${newImages.length} images have been uploaded successfully.`,
      });
      
    } catch (error) {
      console.error("Error uploading images:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your images.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset file input
      e.target.value = '';
    }
  };
  
  const handleDelete = async (imageId: string) => {
    try {
      // Delete from the database
      const { error: dbError } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId);
        
      if (dbError) throw dbError;
      
      // Update state
      const updatedImages = images.filter(img => img.id !== imageId);
      setImages(updatedImages);
      onImagesChange(updatedImages);
      
      toast({
        title: "Image deleted",
        description: "The image has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting image:", error);
      toast({
        title: "Deletion failed",
        description: "There was an error deleting the image.",
        variant: "destructive",
      });
    }
  };
  
  const makeImagePrimary = async (imageId: string) => {
    try {
      // Set all images to not primary
      await supabase
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', productId);
        
      // Set selected image as primary
      const { error } = await supabase
        .from('product_images')
        .update({ is_primary: true })
        .eq('id', imageId);
        
      if (error) throw error;
      
      // Update state
      const updatedImages = images.map(img => ({
        ...img,
        is_primary: img.id === imageId
      }));
      setImages(updatedImages);
      onImagesChange(updatedImages);
      
      toast({
        title: "Primary image set",
        description: "The primary product image has been updated.",
      });
    } catch (error) {
      console.error("Error setting primary image:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating the primary image.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label htmlFor="product-images" className="flex items-center space-x-2 cursor-pointer">
          <Button 
            type="button" 
            variant="outline"
            disabled={isUploading}
            className="flex items-center gap-2"
            onClick={() => document.getElementById('product-images')?.click()}
          >
            <UploadCloud className="h-4 w-4" />
            {isUploading ? `Uploading... ${uploadProgress}%` : 'Upload Images'}
          </Button>
          <span className="text-sm text-gray-500">(Max 5 images)</span>
        </label>
        <input
          id="product-images"
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
          max={5}
        />
      </div>
      
      {/* Image Preview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-4">
        {images.map((image) => (
          <div 
            key={image.id} 
            className={`relative border rounded-md overflow-hidden h-32 group ${
              image.is_primary ? 'ring-2 ring-tobecatBlue-500' : ''
            }`}
          >
            <img 
              src={image.url} 
              alt="Product" 
              className="w-full h-full object-cover"
            />
            
            {/* Delete button */}
            <button 
              onClick={() => handleDelete(image.id)}
              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
            
            {/* Set as primary button */}
            {!image.is_primary && (
              <button 
                onClick={() => makeImagePrimary(image.id)}
                className="absolute bottom-1 right-1 bg-tobecatBlue-500 text-white p-1 rounded-full hover:bg-tobecatBlue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Set as primary image"
              >
                <Check className="h-4 w-4" />
              </button>
            )}
            
            {/* Primary badge */}
            {image.is_primary && (
              <div className="absolute bottom-1 left-1 bg-tobecatBlue-500 text-white px-2 py-0.5 rounded-full text-xs">
                Primary
              </div>
            )}
          </div>
        ))}
        
        {/* Placeholder for empty slots */}
        {Array.from({ length: Math.max(0, 5 - images.length) }).map((_, index) => (
          <div 
            key={`placeholder-${index}`}
            className="border border-dashed border-gray-300 rounded-md h-32 flex items-center justify-center bg-gray-50"
            onClick={() => document.getElementById('product-images')?.click()}
          >
            <Image className="h-8 w-8 text-gray-300" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageUploader;

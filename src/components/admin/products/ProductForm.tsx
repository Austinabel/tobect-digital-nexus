import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ImageUploader from "../../product/ImageUploader";
import { ProductImage } from "@/types/productImages";

// Form schema for adding new products
const productSchema = z.object({
  name: z.string().min(2, { message: "Product name must be at least 2 characters." }),
  category: z.string().min(2, { message: "Category is required." }),
  price: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Price must be a number",
  }),
  stock: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Stock must be a number",
  }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  image_url: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  isEditing: boolean;
  editingProductId: string | null;
  onSave: (data: ProductFormValues) => Promise<void>;
  onCancel: () => void;
  initialValues?: ProductFormValues;
  categories: string[];
}

const ProductForm = ({ 
  isEditing, 
  editingProductId, 
  onSave, 
  onCancel,
  initialValues,
  categories
}: ProductFormProps) => {
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const { toast } = useToast();

  // Form for adding new products
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialValues || {
      name: "",
      category: "",
      price: "",
      stock: "",
      description: "",
      image_url: "",
    },
  });

  useEffect(() => {
    if (initialValues) {
      form.reset(initialValues);
    }
  }, [initialValues, form]);

  useEffect(() => {
    if (editingProductId) {
      fetchProductImages(editingProductId);
    }
  }, [editingProductId]);

  const fetchProductImages = async (productId: string): Promise<ProductImage[]> => {
    try {
      // Need to use rpc directly as Supabase client doesn't know about the new table yet
      const { data, error } = await supabase
        .rpc('get_product_images', { p_product_id: productId })
        .returns<ProductImage[]>();

      if (error) {
        throw error;
      }
      
      if (data) {
        setProductImages(data);
        return data;
      }
      
      return [];
    } catch (error) {
      console.error("Error fetching product images:", error);
      toast({
        title: "Error",
        description: "Failed to fetch product images",
        variant: "destructive",
      });
      return [];
    }
  };

  const handleImagesChange = (images: ProductImage[]) => {
    setProductImages(images);
    
    // Set the primary image URL as the product image_url
    const primaryImage = images.find(img => img.is_primary);
    if (primaryImage) {
      form.setValue('image_url', primaryImage.url);
    } else if (images.length > 0) {
      form.setValue('image_url', images[0].url);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-4 py-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="Premium Solar Panel" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value} 
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Price (₦)</FormLabel>
                <FormControl>
                  <Input placeholder="250000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input placeholder="15" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="High-efficiency monocrystalline solar panel..." 
                  className="min-h-32" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Images</FormLabel>
              <FormControl>
                <>
                  <Input 
                    type="hidden" 
                    {...field} 
                  />
                  {editingProductId && (
                    <ImageUploader 
                      productId={editingProductId} 
                      onImagesChange={handleImagesChange}
                      existingImages={productImages}
                    />
                  )}
                  {!editingProductId && (
                    <div className="text-sm text-gray-500 mb-2">
                      Save the product first to upload images.
                    </div>
                  )}
                </>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-gradient-to-r from-tobecatBlue-600 to-tobecatBlue-500 hover:from-tobecatBlue-700 hover:to-tobecatBlue-600 text-white"
          >
            {isEditing ? "Update Product" : "Add Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductForm;

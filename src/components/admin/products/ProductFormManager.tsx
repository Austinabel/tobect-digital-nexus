
import { useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ProductForm, { ProductFormValues } from './ProductForm';
import { Product } from '@/types/product';
import { ProductImage } from "@/types/productImages";

interface ProductFormManagerProps {
  isSheetOpen: boolean;
  setIsSheetOpen: (isOpen: boolean) => void;
  isEditing: boolean;
  editingProductId: string | null;
  fetchProducts: () => Promise<void>;
  resetForm: () => void;
  productImages: ProductImage[];
  setProductImages: (images: ProductImage[]) => void;
  initialFormValues: ProductFormValues | undefined;
  categories: string[];
}

const ProductFormManager = ({
  isSheetOpen,
  setIsSheetOpen,
  isEditing,
  editingProductId,
  fetchProducts,
  resetForm,
  productImages,
  setProductImages,
  initialFormValues,
  categories
}: ProductFormManagerProps) => {
  const { toast } = useToast();

  const onSubmit = async (data: ProductFormValues) => {
    try {
      const productData = {
        name: data.name,
        category: data.category,
        price: parseInt(data.price),
        stock: parseInt(data.stock),
        description: data.description,
        image_url: data.image_url || null,
      };
      
      let result;
      let newProductId: string | null = null;
      
      if (isEditing && editingProductId) {
        // Update existing product
        result = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProductId);
          
        if (result.error) throw result.error;
        
        toast({
          title: "Product Updated",
          description: `${data.name} has been updated.`,
        });
        
        newProductId = editingProductId;
      } else {
        // Add new product
        result = await supabase
          .from('products')
          .insert([productData])
          .select();
          
        if (result.error) throw result.error;
        
        if (result.data && result.data.length > 0) {
          newProductId = result.data[0].id;
        }
        
        toast({
          title: "Product Added",
          description: `${data.name} has been added to your product catalog.`,
        });
      }
      
      // If we have images and a product ID, we need to update the product_id for each image
      if (productImages.length > 0 && newProductId) {
        try {
          // Update product_id for each image
          for (const image of productImages) {
            await supabase
              .from('product_images')
              .update({ product_id: newProductId })
              .eq('id', image.id);
          }
        } catch (error) {
          console.error("Error updating product_id for images:", error);
        }
      }
      
      resetForm();
      fetchProducts(); // Refresh the product list
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'add'} product`,
        variant: "destructive",
      });
    }
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={(open) => {
      setIsSheetOpen(open);
      if (!open) resetForm();
    }}>
      <SheetContent className="overflow-y-auto w-full max-w-2xl">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Edit Product" : "Add New Product"}</SheetTitle>
          <SheetDescription>
            {isEditing 
              ? "Update the details of your existing product." 
              : "Fill in the details to add a new product to your inventory."}
          </SheetDescription>
        </SheetHeader>
        
        <ProductForm 
          isEditing={isEditing} 
          editingProductId={editingProductId} 
          onSave={onSubmit} 
          onCancel={resetForm}
          initialValues={initialFormValues}
          categories={categories}
        />
      </SheetContent>
    </Sheet>
  );
};

export default ProductFormManager;

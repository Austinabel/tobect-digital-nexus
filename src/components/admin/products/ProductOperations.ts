
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { ProductImage } from "@/types/productImages";
import { ProductFormValues } from "./ProductForm";

/**
 * Handle product deletion
 */
export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    // Delete associated images first
    await supabase
      .from('product_images')
      .delete()
      .eq('product_id', id);
    
    // Then delete the product
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting product:", error);
    return false;
  }
};

/**
 * Prepare a product for editing
 */
export const prepareProductForEdit = (product: Product): ProductFormValues => {
  return {
    name: product.name,
    category: product.category,
    price: product.price.toString(),
    stock: product.stock.toString(),
    description: product.description,
    image_url: product.image_url || "",
  };
};

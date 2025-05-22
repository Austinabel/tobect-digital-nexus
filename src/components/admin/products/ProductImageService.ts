
import { supabase } from "@/integrations/supabase/client";
import { ProductImage } from "@/types/productImages";

/**
 * Fetch product images for a specific product
 */
export const fetchProductImages = async (productId: string): Promise<ProductImage[]> => {
  try {
    // Use the RPC function to fetch images
    const { data, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('is_primary', { ascending: false });

    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error fetching product images:", error);
    return [];
  }
};

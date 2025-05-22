
import { supabase } from "@/integrations/supabase/client";
import { ProductReview, ProductReviewFormData } from "@/types/productReviews";

/**
 * Fetch product reviews for a specific product
 */
export const fetchProductReviews = async (productId: string, adminView: boolean = false): Promise<ProductReview[]> => {
  try {
    let query = supabase
      .from('product_reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
      
    // For non-admin views, only show approved reviews
    if (!adminView) {
      query = query.eq('approved', true);
    }
    
    const { data, error } = await query;

    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    return [];
  }
};

/**
 * Submit a new product review
 */
export const submitProductReview = async (productId: string, reviewData: ProductReviewFormData): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('product_reviews')
      .insert([{
        product_id: productId,
        reviewer_name: reviewData.name,
        reviewer_email: reviewData.email,
        rating: reviewData.rating,
        comment: reviewData.comment
      }]);

    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error submitting review:", error);
    return false;
  }
};

/**
 * Update a review's approval status
 */
export const updateReviewApproval = async (reviewId: string, approved: boolean): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('product_reviews')
      .update({ approved })
      .eq('id', reviewId);

    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error updating review approval:", error);
    return false;
  }
};

/**
 * Delete a product review
 */
export const deleteReview = async (reviewId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('product_reviews')
      .delete()
      .eq('id', reviewId);

    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting review:", error);
    return false;
  }
};

/**
 * Get the average rating for a product
 */
export const getProductRating = async (productId: string): Promise<number> => {
  try {
    const { data, error } = await supabase
      .rpc('get_product_rating', { p_product_id: productId });

    if (error) {
      throw error;
    }
    
    return data || 0;
  } catch (error) {
    console.error("Error getting product rating:", error);
    return 0;
  }
};

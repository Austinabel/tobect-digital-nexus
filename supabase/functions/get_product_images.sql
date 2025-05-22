
-- This function retrieves all images for a specific product
CREATE OR REPLACE FUNCTION public.get_product_images(p_product_id UUID)
RETURNS SETOF public.product_images
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT * FROM public.product_images 
  WHERE product_id = p_product_id
  ORDER BY is_primary DESC, created_at ASC;
$$;

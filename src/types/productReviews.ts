
export interface ProductReview {
  id: string;
  product_id: string;
  reviewer_name: string;
  reviewer_email: string;
  rating: number;
  comment: string;
  approved: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface ProductReviewFormData {
  name: string;
  email: string;
  rating: number;
  comment: string;
}

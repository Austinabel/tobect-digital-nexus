
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ProductReview } from '@/types/productReviews';
import { 
  fetchProductReviews, 
  updateReviewApproval, 
  deleteReview 
} from './ProductReviewService';
import ReviewsLoading from './reviews/ReviewsLoading';
import ReviewsEmptyState from './reviews/ReviewsEmptyState';
import ReviewItem from './reviews/ReviewItem';

const ReviewsTab = () => {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const loadReviews = async () => {
    setIsLoading(true);
    try {
      // Fetch all reviews for admin view
      const reviews = await fetchProductReviews('', true);
      setReviews(reviews);
    } catch (error) {
      console.error("Error loading reviews:", error);
      toast({
        title: "Error",
        description: "Failed to load reviews",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadReviews();
  }, []);
  
  const handleApprovalChange = async (reviewId: string, approved: boolean) => {
    const success = await updateReviewApproval(reviewId, approved);
    
    if (success) {
      // Update local state
      setReviews(reviews.map(review => 
        review.id === reviewId ? { ...review, approved } : review
      ));
      
      toast({
        title: `Review ${approved ? 'Approved' : 'Unapproved'}`,
        description: `The review has been ${approved ? 'approved and is now public' : 'unapproved and is now hidden'}`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update review status",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteReview = async (reviewId: string) => {
    const success = await deleteReview(reviewId);
    
    if (success) {
      // Remove from local state
      setReviews(reviews.filter(review => review.id !== reviewId));
      
      toast({
        title: "Review Deleted",
        description: "The review has been permanently removed",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to delete review",
        variant: "destructive",
      });
    }
  };
  
  if (isLoading) {
    return <ReviewsLoading />;
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Product Reviews</h3>
        <Button onClick={loadReviews}>Refresh</Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Reviewer</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.length === 0 ? (
              <ReviewsEmptyState />
            ) : (
              reviews.map((review) => (
                <ReviewItem 
                  key={review.id}
                  review={review}
                  onApprovalChange={handleApprovalChange}
                  onDelete={handleDeleteReview}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ReviewsTab;

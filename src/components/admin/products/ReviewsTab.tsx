import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Badge,
  Button,
  Switch,
  Skeleton
} from "@/components/ui/button";
import { Star, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { ProductReview } from '@/types/productReviews';
import { 
  fetchProductReviews, 
  updateReviewApproval, 
  deleteReview 
} from './ProductReviewService';

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
  
  const renderRating = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            fill={rating >= star ? "currentColor" : "none"}
            className={rating >= star ? "text-yellow-500" : "text-gray-300"}
          />
        ))}
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <div>
        <h3 className="text-lg font-medium mb-4">Product Reviews</h3>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
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
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No reviews found
                </TableCell>
              </TableRow>
            ) : (
              reviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell className="max-w-[150px] truncate">
                    {review.product_id}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{review.reviewer_name}</div>
                    <div className="text-gray-500 text-sm">{review.reviewer_email}</div>
                  </TableCell>
                  <TableCell>{renderRating(review.rating)}</TableCell>
                  <TableCell className="max-w-[200px]">
                    <div className="line-clamp-2">{review.comment}</div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(review.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={!!review.approved} 
                        onCheckedChange={(checked) => 
                          handleApprovalChange(review.id, checked)
                        }
                      />
                      <span>
                        {review.approved ? (
                          <Badge variant="success" className="bg-green-500">Approved</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100">Pending</Badge>
                        )}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                          <Trash2 size={16} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Review</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the review.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteReview(review.id)}
                            className="bg-red-500 hover:bg-red-600 text-white"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ReviewsTab;

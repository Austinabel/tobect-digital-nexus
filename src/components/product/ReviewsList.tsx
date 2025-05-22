
import React from "react";
import { Star } from "lucide-react";
import { format } from "date-fns";
import { ProductReview } from "@/types/productReviews";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";

interface ReviewsListProps {
  reviews: ProductReview[];
}

const ReviewsList: React.FC<ReviewsListProps> = ({ reviews }) => {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-2">No reviews yet for this product.</p>
        <p className="text-sm text-gray-400">Be the first to share your experience!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{review.reviewer_name}</h4>
                <div className="flex items-center space-x-1 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      fill={review.rating >= star ? "currentColor" : "none"}
                      className={review.rating >= star ? "text-yellow-500" : "text-gray-300"}
                    />
                  ))}
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {format(new Date(review.created_at), "MMM d, yyyy")}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{review.comment}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ReviewsList;

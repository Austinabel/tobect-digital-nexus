
import React from 'react';
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { format } from 'date-fns';
import { ProductReview } from '@/types/productReviews';
import ReviewRating from './ReviewRating';
import DeleteReviewDialog from './DeleteReviewDialog';

interface ReviewItemProps {
  review: ProductReview;
  onApprovalChange: (reviewId: string, approved: boolean) => Promise<void>;
  onDelete: (reviewId: string) => Promise<void>;
}

const ReviewItem = ({ review, onApprovalChange, onDelete }: ReviewItemProps) => {
  return (
    <TableRow key={review.id}>
      <TableCell className="max-w-[150px] truncate">
        {review.product_id}
      </TableCell>
      <TableCell>
        <div className="font-medium">{review.reviewer_name}</div>
        <div className="text-gray-500 text-sm">{review.reviewer_email}</div>
      </TableCell>
      <TableCell>
        <ReviewRating rating={review.rating} />
      </TableCell>
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
              onApprovalChange(review.id, checked)
            }
          />
          <span>
            {review.approved ? (
              <Badge variant="default" className="bg-green-500 hover:bg-green-600">Approved</Badge>
            ) : (
              <Badge variant="outline" className="bg-gray-100">Pending</Badge>
            )}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <DeleteReviewDialog 
          onDelete={() => onDelete(review.id)} 
        />
      </TableCell>
    </TableRow>
  );
};

export default ReviewItem;

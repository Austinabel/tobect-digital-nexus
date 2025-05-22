
import React from 'react';
import { Star } from 'lucide-react';

interface ReviewRatingProps {
  rating: number;
}

const ReviewRating = ({ rating }: ReviewRatingProps) => {
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

export default ReviewRating;

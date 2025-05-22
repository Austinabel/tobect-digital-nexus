
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

const ReviewsLoading = () => {
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
};

export default ReviewsLoading;

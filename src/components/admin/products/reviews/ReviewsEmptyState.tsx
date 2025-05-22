
import React from 'react';
import { TableRow, TableCell } from "@/components/ui/table";

const ReviewsEmptyState = () => {
  return (
    <TableRow>
      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
        No reviews found
      </TableCell>
    </TableRow>
  );
};

export default ReviewsEmptyState;

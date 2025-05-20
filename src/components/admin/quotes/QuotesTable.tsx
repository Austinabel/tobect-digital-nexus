
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Quote, statusColors } from "@/types/quotes";
import { Loader2 } from "lucide-react";

interface QuotesTableProps {
  quotes: Quote[];
  isLoading: boolean;
  quoteType?: "digital" | "product";
  onViewDetails: (quote: Quote) => void;
  onDeleteQuote: (quote: Quote) => void;
}

const QuotesTable = ({ 
  quotes, 
  isLoading, 
  quoteType, 
  onViewDetails, 
  onDeleteQuote 
}: QuotesTableProps) => {
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-tobecatBlue-500" />
        <span className="ml-2">Loading quotes...</span>
      </div>
    );
  }
  
  if (quotes.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        <p>No quote requests found.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Client</TableHead>
          {!quoteType && <TableHead>Type</TableHead>}
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {quotes.map((quote) => (
          <TableRow key={quote.id}>
            <TableCell className="font-medium">{quote.quote_id}</TableCell>
            <TableCell>{quote.date}</TableCell>
            <TableCell>{quote.full_name}</TableCell>
            {!quoteType && (
              <TableCell>
                {quote.type === "digital" ? "Digital Service" : "Product Purchase"}
              </TableCell>
            )}
            <TableCell>
              <Badge variant="outline" className={statusColors[quote.status] || "bg-gray-100 text-gray-800"}>
                {quote.status}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(quote)}
                >
                  Details
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDeleteQuote(quote)}
                >
                  Delete
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default QuotesTable;

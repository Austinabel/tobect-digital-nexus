
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { QuotesManagerProps } from "@/types/quotes";
import QuotesTable from "./quotes/QuotesTable";
import QuoteDetailsDialog from "./quotes/QuoteDetailsDialog";
import DeleteQuoteDialog from "./quotes/DeleteQuoteDialog";
import { useQuotes } from "@/hooks/use-quotes";

const QuotesManager = ({ quoteType }: QuotesManagerProps) => {
  const {
    quotes,
    isLoading,
    selectedQuote,
    detailsOpen,
    setDetailsOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    viewQuoteDetails,
    confirmDeleteQuote,
    deleteQuote,
    updateQuoteStatus
  } = useQuotes(quoteType);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-tobecatGray-900">
          {quoteType === "digital" 
            ? "Service Quote Requests" 
            : quoteType === "product" 
              ? "Product Quote Requests" 
              : "All Quote Requests"}
        </h2>
        <Button className="bg-gradient-to-r from-tobecatBlue-600 to-tobecatBlue-500 hover:from-tobecatBlue-700 hover:to-tobecatBlue-600 text-white">
          <FileText size={16} className="mr-2" /> Export Quotes
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <QuotesTable 
          quotes={quotes}
          isLoading={isLoading}
          quoteType={quoteType}
          onViewDetails={viewQuoteDetails}
          onDeleteQuote={confirmDeleteQuote}
        />
      </div>

      {/* Quote Details Dialog */}
      <QuoteDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        quote={selectedQuote}
        onUpdateStatus={updateQuoteStatus}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteQuoteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDelete={deleteQuote}
      />
    </div>
  );
};

export default QuotesManager;

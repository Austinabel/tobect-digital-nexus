
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Quote } from "@/types/quotes";
import { useToast } from "@/hooks/use-toast";

export const useQuotes = (quoteType?: "digital" | "product") => {
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch quotes from Supabase
  useEffect(() => {
    const fetchQuotes = async () => {
      setIsLoading(true);
      try {
        let query = supabase
          .from('quotes')
          .select('*')
          
        // Filter by quote type if specified
        if (quoteType) {
          query = query.eq('type', quoteType);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        
        if (data) {
          // Convert Supabase data to Quote type
          const formattedQuotes: Quote[] = data.map(quote => {
            const baseQuote = {
              id: quote.id,
              date: new Date(quote.date).toISOString().split('T')[0],
              full_name: quote.full_name,
              email: quote.email,
              phone: quote.phone,
              status: quote.status,
              quote_id: quote.quote_id,
            };
            
            if (quote.type === 'digital') {
              return {
                ...baseQuote,
                type: 'digital' as const,
                company: quote.company,
                budget: quote.budget || '',
                primary_service: quote.primary_service || '',
                additional_services: quote.additional_services as string[],
                timeframe: quote.timeframe || '',
                project_details: quote.project_details || '',
              };
            } else {
              return {
                ...baseQuote,
                type: 'product' as const,
                address: quote.address || '',
                product_category: quote.product_category || '',
                product: quote.product || '',
                quantity: quote.quantity || 1,
                installation: quote.installation || false,
                additional_info: quote.additional_info,
              };
            }
          });
          
          setQuotes(formattedQuotes);
        }
      } catch (error: any) {
        console.error("Error fetching quotes:", error);
        toast({
          title: "Error fetching quotes",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuotes();
  }, [toast, quoteType]);

  const viewQuoteDetails = (quote: Quote) => {
    setSelectedQuote(quote);
    setDetailsOpen(true);
  };

  const confirmDeleteQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    setDeleteDialogOpen(true);
  };

  const deleteQuote = async () => {
    if (!selectedQuote) return;
    
    try {
      const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('id', selectedQuote.id);
      
      if (error) throw error;
      
      setQuotes(quotes.filter(quote => quote.id !== selectedQuote.id));
      setDeleteDialogOpen(false);
      
      toast({
        title: "Quote deleted",
        description: `Quote ${selectedQuote.quote_id} has been deleted.`,
      });
    } catch (error: any) {
      console.error("Error deleting quote:", error);
      toast({
        title: "Error deleting quote",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateQuoteStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('quotes')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      
      setQuotes(quotes.map(quote => 
        quote.id === id ? { ...quote, status } : quote
      ));
      
      setDetailsOpen(false);
      toast({
        title: "Status updated",
        description: `Quote status has been updated to ${status}.`,
      });
    } catch (error: any) {
      console.error("Error updating quote status:", error);
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
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
  };
};

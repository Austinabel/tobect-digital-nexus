
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { FileText, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Types for quotes
interface DigitalServiceQuote {
  id: string;
  type: "digital";
  date: string;
  fullName: string;
  email: string;
  phone: string;
  company?: string;
  budget: string;
  primaryService: string;
  additionalServices?: string[];
  timeframe: string;
  projectDetails: string;
  status: string;
}

interface ProductQuote {
  id: string;
  type: "product";
  date: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  productCategory: string;
  product: string;
  quantity: number;
  installation?: boolean;
  additionalInfo?: string;
  status: string;
}

type Quote = DigitalServiceQuote | ProductQuote;

// Mock data for client quotes
const mockQuotes: Quote[] = [
  {
    id: "QT-2023-001",
    type: "product",
    date: "2023-06-10",
    fullName: "John Smith",
    email: "john.smith@example.com",
    phone: "+234 712 345 678",
    address: "123 Solar Street, Lagos",
    productCategory: "Solar Panels",
    product: "Premium Solar Panel",
    quantity: 5,
    installation: true,
    additionalInfo: "Need installation on a flat roof",
    status: "New"
  },
  {
    id: "QT-2023-002",
    type: "product",
    date: "2023-06-12",
    fullName: "Emily Johnson",
    email: "emily.johnson@example.com",
    phone: "+234 723 456 789",
    address: "456 Battery Road, Abuja",
    productCategory: "Batteries",
    product: "Lithium Battery Bank",
    quantity: 2,
    installation: true,
    additionalInfo: "Replacing existing lead-acid batteries",
    status: "Contacted"
  },
  {
    id: "QT-2023-003",
    type: "digital",
    date: "2023-06-15",
    fullName: "Michael Brown",
    email: "michael.brown@example.com",
    phone: "+234 734 567 890",
    company: "TechSolutions Inc",
    budget: "2000000-5000000",
    primaryService: "1",
    additionalServices: ["2", "4"],
    timeframe: "1-3months",
    projectDetails: "We need a comprehensive website redesign with e-commerce functionality",
    status: "Quote Sent"
  },
  {
    id: "QT-2023-004",
    type: "digital",
    date: "2023-06-18",
    fullName: "Sarah Davis",
    email: "sarah.davis@example.com",
    phone: "+234 745 678 901",
    company: "Davis Security Inc.",
    budget: "500000-2000000",
    primaryService: "3",
    timeframe: "asap",
    projectDetails: "Need a mobile app for our security business to monitor CCTV cameras",
    status: "Pending"
  },
];

// Status badge colors
const statusColors: Record<string, string> = {
  "New": "bg-blue-100 text-blue-800",
  "Contacted": "bg-purple-100 text-purple-800",
  "Quote Sent": "bg-yellow-100 text-yellow-800",
  "Pending": "bg-orange-100 text-orange-800",
  "Won": "bg-green-100 text-green-800",
  "Lost": "bg-red-100 text-red-800"
};

const QuotesManager = () => {
  const { toast } = useToast();
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quotes, setQuotes] = useState(mockQuotes);

  const viewQuoteDetails = (quote: Quote) => {
    setSelectedQuote(quote);
    setDetailsOpen(true);
  };

  const confirmDeleteQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    setDeleteDialogOpen(true);
  };

  const deleteQuote = () => {
    if (selectedQuote) {
      setQuotes(quotes.filter(quote => quote.id !== selectedQuote.id));
      setDeleteDialogOpen(false);
      toast({
        title: "Quote deleted",
        description: `Quote ${selectedQuote.id} has been deleted.`,
      });
    }
  };

  const updateQuoteStatus = (id: string, status: string) => {
    setQuotes(quotes.map(quote => 
      quote.id === id ? { ...quote, status } : quote
    ));
    setDetailsOpen(false);
    toast({
      title: "Status updated",
      description: `Quote status has been updated to ${status}.`,
    });
  };

  const formatBudget = (budget: string) => {
    switch(budget) {
      case "<500000": return "Less than ₦500,000";
      case "500000-2000000": return "₦500,000 - ₦2,000,000";
      case "2000000-5000000": return "₦2,000,000 - ₦5,000,000";
      case "5000000-10000000": return "₦5,000,000 - ₦10,000,000";
      case "10000000+": return "Above ₦10,000,000";
      default: return budget;
    }
  };

  const formatTimeframe = (timeframe: string) => {
    switch(timeframe) {
      case "asap": return "As soon as possible";
      case "1-3months": return "1-3 months";
      case "3-6months": return "3-6 months";
      case "6months+": return "6+ months";
      default: return timeframe;
    }
  };

  // Helper to get service name from ID (in a real app, this would fetch from the database)
  const getServiceName = (id: string) => {
    const services: Record<string, string> = {
      "1": "Web Design & Development",
      "2": "Mobile App Development",
      "3": "Digital Marketing",
      "4": "SEO Optimization",
      "5": "Social Media Management"
    };
    return services[id] || id;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-tobecatGray-900">Quote Requests</h2>
        <Button className="bg-gradient-to-r from-tobecatBlue-600 to-tobecatBlue-500 hover:from-tobecatBlue-700 hover:to-tobecatBlue-600 text-white">
          <FileText size={16} className="mr-2" /> Export Quotes
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotes.map((quote) => (
              <TableRow key={quote.id}>
                <TableCell className="font-medium">{quote.id}</TableCell>
                <TableCell>{quote.date}</TableCell>
                <TableCell>{quote.fullName}</TableCell>
                <TableCell>
                  {quote.type === "digital" ? "Digital Service" : "Product Purchase"}
                </TableCell>
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
                      onClick={() => viewQuoteDetails(quote)}
                    >
                      Details
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => confirmDeleteQuote(quote)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Quote Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quote Request Details - {selectedQuote?.id}</DialogTitle>
            <DialogDescription>
              {selectedQuote?.type === "digital" 
                ? "Digital Service Quote Request" 
                : "Product Purchase Quote Request"
              }
            </DialogDescription>
          </DialogHeader>

          {selectedQuote && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase">Client Information</h3>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p>{selectedQuote.fullName}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p>{selectedQuote.email}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p>{selectedQuote.phone}</p>
                </div>
                
                {selectedQuote.type === "digital" && selectedQuote.company && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Company</p>
                    <p>{selectedQuote.company}</p>
                  </div>
                )}
                
                {selectedQuote.type === "product" && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Delivery Address</p>
                    <p>{selectedQuote.address}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-500">Current Status</p>
                  <Badge variant="outline" className={`mt-1 ${statusColors[selectedQuote.status] || ""}`}>
                    {selectedQuote.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                {selectedQuote.type === "digital" ? (
                  <>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase">Service Information</h3>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Budget Range</p>
                      <p>{formatBudget(selectedQuote.budget)}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Primary Service</p>
                      <p>{getServiceName(selectedQuote.primaryService)}</p>
                    </div>
                    
                    {selectedQuote.additionalServices && selectedQuote.additionalServices.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Additional Services</p>
                        <ul className="list-disc list-inside">
                          {selectedQuote.additionalServices.map(serviceId => (
                            <li key={serviceId}>{getServiceName(serviceId)}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Timeframe</p>
                      <p>{formatTimeframe(selectedQuote.timeframe)}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Project Details</p>
                      <p className="whitespace-pre-wrap">{selectedQuote.projectDetails}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase">Product Information</h3>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Category</p>
                      <p>{selectedQuote.productCategory}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Product</p>
                      <p>{selectedQuote.product}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Quantity</p>
                      <p>{selectedQuote.quantity}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Installation Required</p>
                      <p>{selectedQuote.installation ? "Yes" : "No"}</p>
                    </div>
                    
                    {selectedQuote.additionalInfo && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Additional Information</p>
                        <p className="whitespace-pre-wrap">{selectedQuote.additionalInfo}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-wrap gap-2">
            <div className="w-full mt-4 border-t pt-4">
              <p className="text-sm font-medium text-gray-500 mb-2">Update Status</p>
              <div className="flex flex-wrap gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                  onClick={() => selectedQuote && updateQuoteStatus(selectedQuote.id, 'New')}
                >
                  New
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="bg-purple-100 text-purple-800 hover:bg-purple-200"
                  onClick={() => selectedQuote && updateQuoteStatus(selectedQuote.id, 'Contacted')}
                >
                  Contacted
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                  onClick={() => selectedQuote && updateQuoteStatus(selectedQuote.id, 'Quote Sent')}
                >
                  Quote Sent
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="bg-green-100 text-green-800 hover:bg-green-200"
                  onClick={() => selectedQuote && updateQuoteStatus(selectedQuote.id, 'Won')}
                >
                  Won
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="bg-red-100 text-red-800 hover:bg-red-200"
                  onClick={() => selectedQuote && updateQuoteStatus(selectedQuote.id, 'Lost')}
                >
                  Lost
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the quote request from your database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteQuote} className="bg-red-600 hover:bg-red-700">
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default QuotesManager;

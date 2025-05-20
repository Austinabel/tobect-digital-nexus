
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Quote, statusColors } from "@/types/quotes";
import { formatBudget, formatTimeframe, getServiceName } from "@/utils/quoteFormatters";

interface QuoteDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: Quote | null;
  onUpdateStatus: (id: string, status: string) => void;
}

const QuoteDetailsDialog = ({
  open,
  onOpenChange,
  quote,
  onUpdateStatus
}: QuoteDetailsDialogProps) => {
  if (!quote) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quote Request Details - {quote.quote_id}</DialogTitle>
          <DialogDescription>
            {quote.type === "digital" 
              ? "Digital Service Quote Request" 
              : "Product Purchase Quote Request"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase">Client Information</h3>
            
            <div>
              <p className="text-sm font-medium text-gray-500">Name</p>
              <p>{quote.full_name}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p>{quote.email}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500">Phone</p>
              <p>{quote.phone}</p>
            </div>
            
            {quote.type === "digital" && quote.company && (
              <div>
                <p className="text-sm font-medium text-gray-500">Company</p>
                <p>{quote.company}</p>
              </div>
            )}
            
            {quote.type === "product" && (
              <div>
                <p className="text-sm font-medium text-gray-500">Delivery Address</p>
                <p>{quote.address}</p>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-gray-500">Current Status</p>
              <Badge variant="outline" className={`mt-1 ${statusColors[quote.status] || ""}`}>
                {quote.status}
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            {quote.type === "digital" ? (
              <>
                <h3 className="text-sm font-semibold text-gray-500 uppercase">Service Information</h3>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Budget Range</p>
                  <p>{formatBudget(quote.budget)}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Primary Service</p>
                  <p>{getServiceName(quote.primary_service)}</p>
                </div>
                
                {quote.additional_services && quote.additional_services.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Additional Services</p>
                    <ul className="list-disc list-inside">
                      {quote.additional_services.map(serviceId => (
                        <li key={serviceId}>{getServiceName(serviceId)}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Timeframe</p>
                  <p>{formatTimeframe(quote.timeframe)}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Project Details</p>
                  <p className="whitespace-pre-wrap">{quote.project_details}</p>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-sm font-semibold text-gray-500 uppercase">Product Information</h3>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Category</p>
                  <p>{quote.product_category}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Product</p>
                  <p>{quote.product}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Quantity</p>
                  <p>{quote.quantity}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Installation Required</p>
                  <p>{quote.installation ? "Yes" : "No"}</p>
                </div>
                
                {quote.additional_info && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Additional Information</p>
                    <p className="whitespace-pre-wrap">{quote.additional_info}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-wrap gap-2">
          <div className="w-full mt-4 border-t pt-4">
            <p className="text-sm font-medium text-gray-500 mb-2">Update Status</p>
            <div className="flex flex-wrap gap-2">
              <Button 
                size="sm" 
                variant="outline"
                className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                onClick={() => onUpdateStatus(quote.id, 'New')}
              >
                New
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="bg-purple-100 text-purple-800 hover:bg-purple-200"
                onClick={() => onUpdateStatus(quote.id, 'Contacted')}
              >
                Contacted
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                onClick={() => onUpdateStatus(quote.id, 'Quote Sent')}
              >
                Quote Sent
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="bg-green-100 text-green-800 hover:bg-green-200"
                onClick={() => onUpdateStatus(quote.id, 'Won')}
              >
                Won
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="bg-red-100 text-red-800 hover:bg-red-200"
                onClick={() => onUpdateStatus(quote.id, 'Lost')}
              >
                Lost
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuoteDetailsDialog;

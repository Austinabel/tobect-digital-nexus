
import React from 'react';
import { Quote } from '@/types/quotes';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSelectedProduct } from './ProductCategoriesData';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submittedData: Quote | null;
  quoteType: "digital" | "product";
  onClose: () => void;
}

const SuccessDialog = ({ 
  open, 
  onOpenChange, 
  submittedData, 
  quoteType,
  onClose
}: SuccessDialogProps) => {
  if (!submittedData) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-tobecatBlue-600">
            Request Submitted Successfully!
          </DialogTitle>
          <DialogDescription className="text-center">
            Your {quoteType === "digital" ? "digital service quote" : "product order"} request has been received.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-tobecatBlue-50 p-4 rounded-lg border border-tobecatBlue-100">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-green-100 rounded-full p-2">
              <Check className="h-6 w-6 text-green-600" />
            </div>
          </div>
          
          {quoteType === "digital" ? (
            <div className="text-center">
              <p className="font-medium">Thank you, {submittedData.full_name}!</p>
              <p className="text-sm text-tobecatGray-600 mt-2">
                We've received your digital service request. Our team will review your requirements and contact you within 24-48 hours at {submittedData.email} or {submittedData.phone} to discuss your project further.
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="font-medium">Thank you, {submittedData.full_name}!</p>
              <p className="text-sm text-tobecatGray-600 mt-2">
                We've received your product order request for {
                  (submittedData as any).quantity
                }x {(submittedData as any).product}. Our team will contact you shortly at {submittedData.email} or {submittedData.phone} to confirm your order details.
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter className="sm:justify-center">
          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-tobecatBlue-600 to-tobecatBlue-500 hover:from-tobecatBlue-700 hover:to-tobecatBlue-600 text-white"
          >
            Close <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessDialog;

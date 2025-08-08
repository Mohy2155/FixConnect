import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Stars } from "@/components/ui/stars";
import { Quote, Company } from "@shared/schema";

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: Quote & {
    company?: Company;
  };
  onApprove: (quoteId: string) => void;
  onDecline: (quoteId: string) => void;
}

export function QuoteModal({ 
  isOpen, 
  onClose, 
  quote, 
  onApprove, 
  onDecline 
}: QuoteModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto" data-testid="modal-quote">
        <DialogHeader>
          <DialogTitle>Quote Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {quote.company && (
            <div className="flex items-center space-x-3">
              {quote.company.logo ? (
                <img
                  src={quote.company.logo}
                  alt="Company logo"
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">Logo</span>
                </div>
              )}
              
              <div>
                <h4 className="font-medium text-gray-800" data-testid="text-quote-company-name">
                  {quote.company.name}
                </h4>
                <Stars 
                  rating={Number(quote.company.rating)} 
                  size="sm" 
                  showNumber 
                  reviewCount={quote.company.reviewCount}
                />
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Part Cost</span>
              <span className="text-sm font-medium" data-testid="text-part-cost">
                AED {Number(quote.partCost).toFixed(2)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Labor</span>
              <span className="text-sm font-medium" data-testid="text-labor-cost">
                AED {Number(quote.laborCost).toFixed(2)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Service Fee</span>
              <span className="text-sm font-medium" data-testid="text-service-fee">
                AED {Number(quote.serviceFee).toFixed(2)}
              </span>
            </div>
            
            <div className="border-t pt-2 flex justify-between">
              <span className="font-medium text-gray-800">Total</span>
              <span className="font-bold text-lg text-primary" data-testid="text-total-cost">
                AED {Number(quote.totalCost).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {quote.estimatedDuration && (
              <div className="text-sm text-gray-600">
                Estimated completion: 
                <span className="font-medium ml-1" data-testid="text-estimated-duration">
                  {quote.estimatedDuration}
                </span>
              </div>
            )}
            
            {quote.warranty && (
              <div className="text-sm text-gray-600">
                Warranty: 
                <span className="font-medium ml-1" data-testid="text-warranty">
                  {quote.warranty}
                </span>
              </div>
            )}
            
            {quote.notes && (
              <div className="text-sm text-gray-600">
                <div className="font-medium">Notes:</div>
                <p className="mt-1" data-testid="text-quote-notes">{quote.notes}</p>
              </div>
            )}
          </div>

          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => onDecline(quote.id)}
              data-testid="button-decline-quote"
            >
              Decline
            </Button>
            <Button 
              className="flex-1 bg-success hover:bg-green-600"
              onClick={() => onApprove(quote.id)}
              data-testid="button-approve-quote"
            >
              Approve & Book
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

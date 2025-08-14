import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Shield, MapPin } from "lucide-react";
import { Quote, Company } from "@shared/schema";
import { format } from "date-fns";

interface QuoteModalProps {
  quote: Quote & { company?: Company } | null;
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  onDecline: () => void;
}

export function QuoteModal({
  quote,
  isOpen,
  onClose,
  onAccept,
  onDecline,
}: QuoteModalProps) {
  if (!quote) return null;

  const totalCost = Number(quote.totalCost);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-testid="modal-quote">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Service Quote</DialogTitle>
          <DialogDescription>
            Review the quote details and decide whether to accept or decline
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Company Info */}
          {quote.company && (
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              {quote.company.logo ? (
                <img
                  src={quote.company.logo}
                  alt={`${quote.company.name} logo`}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">Logo</span>
                </div>
              )}
              <div>
                <h4 className="font-medium text-gray-800" data-testid="text-company-name">
                  {quote.company.name}
                </h4>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  {quote.company.responseTime && (
                    <span className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{quote.company.responseTime}</span>
                    </span>
                  )}
                  {quote.company.isVerified && (
                    <Badge variant="secondary" className="text-xs">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Quote Details */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Part Cost</span>
              <span className="font-medium">AED {Number(quote.partCost).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Labor Cost</span>
              <span className="font-medium">AED {Number(quote.laborCost).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Service Fee</span>
              <span className="font-medium">AED {Number(quote.serviceFee).toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center text-lg">
              <span className="font-semibold text-gray-800">Total Cost</span>
              <span className="font-bold text-primary" data-testid="text-total-cost">
                AED {totalCost.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-2">
            {quote.estimatedDuration && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Estimated Duration: {quote.estimatedDuration}</span>
              </div>
            )}
            {quote.warranty && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Shield className="h-4 w-4" />
                <span>Warranty: {quote.warranty}</span>
              </div>
            )}
            {quote.validUntil && (
              <div className="text-sm text-gray-600">
                Valid until: {format(new Date(quote.validUntil), "PPP")}
              </div>
            )}
          </div>

          {/* Notes */}
          {quote.notes && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-medium text-blue-800 mb-1">Notes</h5>
              <p className="text-sm text-blue-700" data-testid="text-quote-notes">
                {quote.notes}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex space-x-2">
          <Button
            variant="outline"
            onClick={onDecline}
            className="flex-1"
            data-testid="button-decline-quote"
          >
            Decline
          </Button>
          <Button
            onClick={onAccept}
            className="flex-1"
            data-testid="button-accept-quote"
          >
            Accept Quote
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Stars } from "@/components/ui/stars";
import { Clock, MapPin, CheckCircle } from "lucide-react";
import { Company } from "@shared/schema";

interface CompanyCardProps {
  company: Company & {
    distance?: string;
    estimatedPrice?: string;
  };
  onRequestQuote: (companyId: string) => void;
}

export function CompanyCard({ company, onRequestQuote }: CompanyCardProps) {
  return (
    <Card className="mb-3" data-testid={`card-company-${company.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          {company.logo ? (
            <img
              src={company.logo}
              alt={`${company.name} logo`}
              className="w-16 h-16 rounded-lg object-cover shadow-sm"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400 text-xs">No Logo</span>
            </div>
          )}
          
          <div className="flex-1">
            <div className="flex justify-between items-start mb-1">
              <h4 className="font-medium text-gray-800" data-testid={`text-company-name-${company.id}`}>
                {company.name}
              </h4>
              <Stars 
                rating={Number(company.rating) || 0} 
                size="sm" 
                showNumber 
                reviewCount={company.reviewCount || undefined}
              />
            </div>
            
            <p className="text-sm text-gray-600 mb-2" data-testid={`text-company-description-${company.id}`}>
              {company.description}
            </p>
            
            <div className="flex items-center space-x-3 text-xs text-gray-500 mb-2">
              {company.responseTime && (
                <span className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span data-testid={`text-response-time-${company.id}`}>
                    {company.responseTime}
                  </span>
                </span>
              )}
              
              {company.distance && (
                <span className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span data-testid={`text-distance-${company.id}`}>
                    {company.distance}
                  </span>
                </span>
              )}
              
              {company.isVerified && (
                <span className="flex items-center space-x-1">
                  <CheckCircle className="h-3 w-3 text-success" />
                  <span className="text-success">Verified</span>
                </span>
              )}
            </div>
            
            <div className="flex justify-between items-center">
              {company.estimatedPrice && (
                <div className="text-sm">
                  <span className="text-gray-500">Est. Quote: </span>
                  <span className="font-medium text-gray-800" data-testid={`text-estimated-price-${company.id}`}>
                    {company.estimatedPrice}
                  </span>
                </div>
              )}
              
              <Button 
                size="sm"
                onClick={() => onRequestQuote(company.id)}
                data-testid={`button-request-quote-${company.id}`}
              >
                Request Quote
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

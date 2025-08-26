import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stars } from "@/components/ui/stars";
import { BottomNavigation } from "@/components/bottom-navigation";
import { ArrowLeft, MapPin, Phone, MessageSquare, Mail, Clock, Users } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { Company } from "@shared/schema";

export default function CompanyProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [match, params] = useRoute('/companies/:companyId');
  
  const companyId = params?.companyId;

  // Fetch company details
  const { data: company, isLoading } = useQuery<Company>({
    queryKey: ['/api/companies', companyId],
    enabled: !!companyId,
  });

  const handleBack = () => {
    history.back();
  };

  const handleContact = () => {
    if (company) {
      navigate(`/messages?companyId=${company.id}`);
    }
  };

  const handleRequestQuote = () => {
    if (company) {
      navigate(`/service-request?companyId=${company.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-sm mx-auto bg-surface min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading company profile...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="max-w-sm mx-auto bg-surface min-h-screen">
        <header className="bg-primary text-white px-4 py-3 shadow-lg">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 text-white bg-white/10 hover:bg-blue-600 border border-white/20"
              onClick={handleBack}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-medium">Company Profile</h1>
          </div>
        </header>
        
        <div className="p-4 text-center">
          <h2 className="text-lg font-medium text-gray-800 mb-2">Company Not Found</h2>
          <p className="text-gray-600 mb-4">The requested company profile could not be found.</p>
          <Button onClick={handleBack}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto bg-surface min-h-screen relative">
      {/* Header */}
      <header className="bg-primary text-white px-4 py-3 shadow-lg">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            className="p-2 text-white bg-white/10 hover:bg-blue-600 border border-white/20"
            onClick={handleBack}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-medium">Company Profile</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20">
        {/* Company Info */}
        <div className="p-4">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                {company.logo ? (
                  <img
                    src={company.logo}
                    alt={`${company.name} logo`}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">Logo</span>
                  </div>
                )}
                <div className="flex-1">
                  <CardTitle className="text-lg" data-testid="text-company-name">
                    {company.name}
                  </CardTitle>
                  <Stars 
                    rating={Number(company.rating) || 0} 
                    size="sm" 
                    showNumber 
                    reviewCount={company.reviewCount || 0}
                  />
                  <Badge className="mt-1" data-testid="badge-company-status">
                    {company.isVerified ? "Verified Company" : "Company"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {company.description && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">About</h4>
                  <p className="text-gray-600 text-sm" data-testid="text-company-description">
                    {company.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 text-sm">
                {company.contactPhone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span data-testid="text-company-phone">{company.contactPhone}</span>
                  </div>
                )}

                {company.licenseNumber && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">License:</span>
                    <span data-testid="text-company-license">{company.licenseNumber}</span>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">Rating:</span>
                  <span data-testid="text-company-rating">
                    {Number(company.rating).toFixed(1)} / 5.0
                  </span>
                </div>
              </div>

              {company.specialties && company.specialties.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {company.specialties.map((specialty: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="px-4 pb-4">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleContact}
              data-testid="button-contact-company"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Send Message
            </Button>
            
            <Button
              className="flex-1"
              onClick={handleRequestQuote}
              data-testid="button-request-quote"
            >
              Request Quote
            </Button>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
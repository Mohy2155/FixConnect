import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { BottomNavigation } from "@/components/bottom-navigation";
import { CompanyCard } from "@/components/company-card";
import { QuoteModal } from "@/components/quote-modal";
import { ArrowLeft, Filter, SortAsc } from "lucide-react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Company, Quote } from "@shared/schema";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function CompanyListings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [selectedQuote, setSelectedQuote] = useState<Quote & { company?: Company } | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  // Mock category ID - in real implementation this would come from route params or context
  const categoryId = "plumbing"; // This should be passed from service request

  // Fetch companies for the selected category
  const { data: companies = [], isLoading: companiesLoading } = useQuery<Company[]>({
    queryKey: ['/api/companies'],
    queryParams: { categoryId },
  });

  // Request quote mutation
  const requestQuoteMutation = useMutation({
    mutationFn: async (data: { companyId: string; serviceRequestId: string }) => {
      // In real implementation, this would create a quote request
      // For now, we'll simulate a quote response
      const mockQuote: Quote & { company?: Company } = {
        id: 'quote-1',
        serviceRequestId: data.serviceRequestId,
        companyId: data.companyId,
        partCost: '280',
        laborCost: '120', 
        serviceFee: '50',
        totalCost: '450',
        estimatedDuration: '2-3 hours',
        warranty: '1 year on parts, 6 months on labor',
        notes: 'High-quality replacement parts included',
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        isAccepted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        company: companies.find(c => c.id === data.companyId),
      };
      
      setSelectedQuote(mockQuote);
      setShowQuoteModal(true);
      return mockQuote;
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to request quote",
        variant: "destructive",
      });
    },
  });

  // Quote approval mutation
  const approveQuoteMutation = useMutation({
    mutationFn: async (quoteId: string) => {
      await apiRequest('POST', `/api/quotes/${quoteId}/accept`);
    },
    onSuccess: () => {
      toast({
        title: "Quote Approved",
        description: "The service has been booked successfully",
      });
      setShowQuoteModal(false);
      navigate('/jobs');
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to approve quote",
        variant: "destructive",
      });
    },
  });

  const handleBack = () => {
    navigate('/');
  };

  const handleRequestQuote = (companyId: string) => {
    // In real implementation, get the actual service request ID
    const serviceRequestId = 'mock-request-id';
    requestQuoteMutation.mutate({ companyId, serviceRequestId });
  };

  const handleApproveQuote = (quoteId: string) => {
    approveQuoteMutation.mutate(quoteId);
  };

  const handleDeclineQuote = () => {
    setShowQuoteModal(false);
    setSelectedQuote(null);
    toast({
      title: "Quote Declined",
      description: "You can request quotes from other companies",
    });
  };

  // Mock companies data with enhanced info
  const mockCompanies = [
    {
      id: 'company-1',
      userId: 'user-1',
      name: 'Al Waha Plumbing',
      description: 'Certified plumbing specialists with 15+ years experience in UAE',
      logo: null,
      licenseNumber: 'PL-2023-001',
      isVerified: true,
      rating: '4.8',
      reviewCount: 127,
      responseTime: '2-4 hours',
      serviceAreas: ['Dubai', 'Sharjah'],
      specialties: ['Residential', 'Commercial'],
      createdAt: new Date(),
      updatedAt: new Date(),
      distance: '3.2 km away',
      estimatedPrice: 'AED 380-520',
    },
    {
      id: 'company-2', 
      userId: 'user-2',
      name: 'Dubai Fix Masters',
      description: 'Premium home maintenance services across Dubai and Abu Dhabi',
      logo: null,
      licenseNumber: 'PL-2023-002',
      isVerified: true,
      rating: '4.9',
      reviewCount: 89,
      responseTime: '1-2 hours',
      serviceAreas: ['Dubai', 'Abu Dhabi'],
      specialties: ['Emergency', 'Premium'],
      createdAt: new Date(),
      updatedAt: new Date(),
      distance: '1.8 km away', 
      estimatedPrice: 'AED 420-580',
    },
  ];

  return (
    <div className="max-w-sm mx-auto bg-surface min-h-screen relative">
      {/* Header */}
      <header className="bg-primary text-white px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-blue-600 text-white"
              onClick={handleBack}
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-medium">Available Companies</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-blue-600 text-white"
              data-testid="button-filter"
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-blue-600 text-white"
              data-testid="button-sort"
            >
              <SortAsc className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 pb-20">
        {companiesLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-surface rounded-lg shadow-md p-4 animate-pulse">
                <div className="flex items-start space-x-3">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : mockCompanies.length > 0 ? (
          <div>
            {mockCompanies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                onRequestQuote={handleRequestQuote}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No companies found for this service</p>
            <Button onClick={handleBack} data-testid="button-go-back">
              Go Back
            </Button>
          </div>
        )}
      </main>

      {/* Quote Modal */}
      {selectedQuote && (
        <QuoteModal
          isOpen={showQuoteModal}
          onClose={() => setShowQuoteModal(false)}
          quote={selectedQuote}
          onApprove={handleApproveQuote}
          onDecline={handleDeclineQuote}
        />
      )}

      <BottomNavigation />
    </div>
  );
}

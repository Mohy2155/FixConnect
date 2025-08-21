import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BottomNavigation } from "@/components/bottom-navigation";
import { ArrowLeft, Clock, MapPin, DollarSign, Briefcase, MessageSquare } from "lucide-react";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ServiceRequest, Quote, Company } from "@shared/schema";
import { isUnauthorizedError } from "@/lib/authUtils";
import { format } from "date-fns";

export default function CompanyDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Fetch company profile
  const { data: company } = useQuery<Company>({
    queryKey: ['/api/companies/profile'],
    enabled: !!user,
  });

  // Fetch available jobs for quotes
  const { data: availableJobs = [], isLoading: jobsLoading } = useQuery<ServiceRequest[]>({
    queryKey: ['/api/service-requests/available'],
    enabled: !!user,
  });

  // Fetch company quotes
  const { data: companyQuotes = [], isLoading: quotesLoading } = useQuery<(Quote & { serviceRequest: ServiceRequest })[]>({
    queryKey: ['/api/quotes/company'],
    enabled: !!company,
  });

  // Create quote mutation
  const createQuoteMutation = useMutation({
    mutationFn: async (quoteData: any) => {
      return await apiRequest('POST', '/api/quotes', quoteData);
    },
    onSuccess: () => {
      toast({
        title: "Quote Submitted",
        description: "Your quote has been sent to the customer.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/service-requests'] });
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
        description: "Failed to create quote",
        variant: "destructive",
      });
    },
  });

  const handleBack = () => {
    navigate('/');
  };

  const handleSubmitQuote = (jobId: string) => {
    // For now, use a standard quote amount
    // In real implementation, this would open a modal with quote form
    const amount = 500; // AED
    
    if (!company) {
      toast({
        title: "Error",
        description: "Company profile not found",
        variant: "destructive",
      });
      return;
    }

    createQuoteMutation.mutate({
      serviceRequestId: jobId,
      companyId: company.id,
      amount: amount,
      notes: `Quote for service request ${jobId}`,
    });
  };

  const handleContactCustomer = (jobId: string) => {
    navigate(`/messages?jobId=${jobId}`);
  };

  const getStatusColor = (status?: string | null) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'quoted': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status?: string | null) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'quoted': return 'Quoted';
      case 'approved': return 'Approved';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      default: return 'Unknown';
    }
  };

  if (!user || (user && !company)) {
    return (
      <div className="max-w-sm mx-auto bg-surface min-h-screen">
        <div className="p-4 text-center">
          <h2 className="text-lg font-medium text-gray-800 mb-2">Company Dashboard</h2>
          <p className="text-gray-600 mb-4">You need to create a company profile first.</p>
          <Button onClick={() => navigate('/profile')}>Create Company Profile</Button>
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
            className="p-2 hover:bg-blue-600 text-white"
            onClick={handleBack}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-medium">Company Dashboard</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20">
        <div className="p-4">
          <Tabs defaultValue="available-jobs" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="available-jobs">Available Jobs</TabsTrigger>
              <TabsTrigger value="my-quotes">My Quotes</TabsTrigger>
            </TabsList>
            
            {/* Available Jobs */}
            <TabsContent value="available-jobs" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-800">Available Jobs</h3>
                <Badge variant="secondary" data-testid="badge-available-count">
                  {availableJobs.length} available
                </Badge>
              </div>

              {jobsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <Card>
                        <CardContent className="p-4">
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              ) : availableJobs.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No jobs available</p>
                    <p className="text-sm text-gray-400">Check back later for new opportunities</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {availableJobs.map((job) => (
                    <Card key={job.id} data-testid={`job-card-${job.id}`}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-800" data-testid={`job-title-${job.id}`}>
                            {job.title}
                          </h4>
                          <Badge className={getStatusColor(job.status)}>
                            {getStatusText(job.status)}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {job.description}
                        </p>
                        
                        <div className="space-y-1 mb-3">
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <MapPin className="h-3 w-3" />
                            <span>{job.address}</span>
                          </div>
                          
                          {job.budget && (
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <DollarSign className="h-3 w-3" />
                              <span>Budget: AED {Number(job.budget).toFixed(2)}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>Posted {job.createdAt ? format(new Date(job.createdAt), "MMM dd") : "Recently"}</span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => handleSubmitQuote(job.id)}
                            data-testid={`button-quote-${job.id}`}
                          >
                            Submit Quote
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleContactCustomer(job.id)}
                            data-testid={`button-contact-${job.id}`}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            {/* My Quotes */}
            <TabsContent value="my-quotes" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-800">My Quotes</h3>
                <Badge variant="secondary" data-testid="badge-quotes-count">
                  {companyQuotes.length} quotes
                </Badge>
              </div>

              {quotesLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="animate-pulse">
                      <Card>
                        <CardContent className="p-4">
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              ) : companyQuotes.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No quotes submitted</p>
                    <p className="text-sm text-gray-400">Submit your first quote from available jobs</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {companyQuotes.map((quote) => (
                    <Card key={quote.id} data-testid={`quote-card-${quote.id}`}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-800">
                            {quote.serviceRequest?.title}
                          </h4>
                          <Badge 
                            variant={quote.isAccepted ? "default" : "secondary"}
                            data-testid={`quote-status-${quote.id}`}
                          >
                            {quote.isAccepted ? "Accepted" : "Pending"}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 mb-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Total Cost</span>
                            <span className="font-medium text-primary">
                              AED {Number(quote.totalCost).toFixed(2)}
                            </span>
                          </div>
                          
                          {quote.estimatedDuration && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Duration</span>
                              <span>{quote.estimatedDuration}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>Submitted {quote.createdAt ? format(new Date(quote.createdAt), "MMM dd") : "Recently"}</span>
                          </div>
                        </div>
                        
                        {quote.notes && (
                          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded mb-3">
                            {quote.notes}
                          </p>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => quote.serviceRequest && handleContactCustomer(quote.serviceRequest.id)}
                          data-testid={`button-contact-customer-${quote.id}`}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Contact Customer
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
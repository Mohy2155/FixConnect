import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Stars } from "@/components/ui/stars";
import { BottomNavigation } from "@/components/bottom-navigation";
import { ArrowLeft, Clock, MapPin, Phone, MessageSquare, Star, CheckCircle } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ServiceRequest, Quote, Company } from "@shared/schema";
import { isUnauthorizedError } from "@/lib/authUtils";
import { format } from "date-fns";

export default function JobDetails() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [match, params] = useRoute('/jobs/:jobId');
  
  const jobId = params?.jobId;

  // Fetch job details
  const { data: job, isLoading: jobLoading } = useQuery<ServiceRequest>({
    queryKey: ['/api/service-requests', jobId],
    enabled: !!jobId,
  });

  // Fetch quotes for this job
  const { data: quotes = [], isLoading: quotesLoading } = useQuery<(Quote & { company: Company })[]>({
    queryKey: ['/api/service-requests', jobId, 'quotes'],
    enabled: !!jobId,
  });

  // Accept quote mutation
  const acceptQuoteMutation = useMutation({
    mutationFn: async (quoteId: string) => {
      return await apiRequest('POST', `/api/quotes/${quoteId}/accept`, {});
    },
    onSuccess: () => {
      toast({
        title: "Quote Accepted",
        description: "The service provider will contact you soon to schedule the work.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/service-requests'] });
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
        description: "Failed to accept quote",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleBack = () => {
    navigate('/jobs');
  };

  const handleContactService = () => {
    navigate(`/messages?jobId=${jobId}`);
  };

  const handleAcceptQuote = (quoteId: string) => {
    acceptQuoteMutation.mutate(quoteId);
  };

  const handleRejectQuote = (quoteId: string) => {
    toast({
      title: "Quote Rejected",
      description: "The quote has been rejected. You can still accept other quotes.",
    });
  };

  const handleContactCompany = (companyId: string) => {
    navigate(`/messages?jobId=${jobId}&companyId=${companyId}`);
  };

  const getStatusColor = (status?: string | null) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'quoted': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
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
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  };

  if (!match) {
    return null;
  }

  if (jobLoading) {
    return (
      <div className="max-w-sm mx-auto bg-surface min-h-screen">
        <div className="p-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-32 bg-gray-200 rounded mb-4"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-sm mx-auto bg-surface min-h-screen">
        <div className="p-4 text-center">
          <h2 className="text-lg font-medium text-gray-800 mb-2">Job Not Found</h2>
          <p className="text-gray-600 mb-4">The requested job could not be found.</p>
          <Button onClick={handleBack}>Back to Jobs</Button>
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
          <h1 className="text-xl font-medium">Job Details</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-16">
        {/* Job Info */}
        <div className="p-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <CardTitle className="text-lg" data-testid="text-job-title">
                  {job.title}
                </CardTitle>
                <Badge className={getStatusColor(job.status)} data-testid="badge-job-status">
                  {getStatusText(job.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600" data-testid="text-job-description">
                {job.description}
              </p>
              
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <MapPin className="h-4 w-4" />
                <span data-testid="text-job-address">{job.address}</span>
              </div>
              
              {job.preferredDate && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>Preferred Date: {format(new Date(job.preferredDate), "PPP")}</span>
                </div>
              )}
              
              {job.budget && (
                <div className="text-sm text-gray-500">
                  Budget: AED {Number(job.budget).toFixed(2)}
                </div>
              )}
              
              {job.images && job.images.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-800">Images</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {job.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Job image ${index + 1}`}
                        className="w-full h-24 object-cover rounded border"
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quotes Section */}
        {quotes.length > 0 && (
          <div className="px-4 pb-4">
            <h3 className="text-lg font-medium text-gray-800 mb-3">
              Quotes Received ({quotes.length})
            </h3>
            
            <div className="space-y-3">
              {quotes.map((quote) => (
                <Card key={quote.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    {/* Company Info */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {quote.company?.logo ? (
                          <img
                            src={quote.company.logo}
                            alt={`${quote.company.name} logo`}
                            className="w-10 h-10 rounded object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                            <span className="text-gray-400 text-xs">Logo</span>
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium text-gray-800">
                            {quote.company?.name}
                          </h4>
                          {quote.company && (
                            <Stars 
                              rating={Number(quote.company.rating) || 0} 
                              size="sm" 
                              showNumber 
                              reviewCount={quote.company.reviewCount || 0}
                            />
                          )}
                        </div>
                      </div>
                      
                      {quote.isAccepted && (
                        <Badge variant="secondary" className="text-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Accepted
                        </Badge>
                      )}
                    </div>

                    {/* Quote Details */}
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Cost</span>
                        <span className="font-medium text-lg text-primary">
                          AED {Number(quote.totalCost).toFixed(2)}
                        </span>
                      </div>
                      
                      {quote.estimatedDuration && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Duration</span>
                          <span>{quote.estimatedDuration}</span>
                        </div>
                      )}
                      
                      {quote.warranty && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Warranty</span>
                          <span>{quote.warranty}</span>
                        </div>
                      )}
                    </div>

                    {quote.notes && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          {quote.notes}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => quote.company && handleContactCompany(quote.company.id)}
                        data-testid={`button-contact-${quote.id}`}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Contact
                      </Button>
                      
                      {!quote.isAccepted && job.status === 'quoted' && (
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleAcceptQuote(quote.id)}
                          disabled={acceptQuoteMutation.isPending}
                          data-testid={`button-accept-${quote.id}`}
                        >
                          {acceptQuoteMutation.isPending ? "Accepting..." : "Accept"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No Quotes State */}
        {quotes.length === 0 && !quotesLoading && job.status === 'pending' && (
          <div className="px-4 text-center">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-medium text-yellow-800 mb-1">Waiting for Quotes</h3>
              <p className="text-sm text-yellow-700">
                Companies will send you quotes soon. You'll be notified when they arrive.
              </p>
            </div>
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BottomNavigation } from "@/components/bottom-navigation";
import { JobCard } from "@/components/job-card";
import { ArrowLeft, Filter, Search, Plus } from "lucide-react";
import { useLocation } from "wouter";
import { ServiceRequest } from "@shared/schema";
import { isUnauthorizedError } from "@/lib/authUtils";

// Review form schema
const reviewSchema = z.object({
  rating: z.number().min(1, "Please select a rating").max(5),
  comment: z.string().optional(),
});

type ReviewForm = z.infer<typeof reviewSchema>;

export default function Jobs() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [selectedJobForReview, setSelectedJobForReview] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all_time');

  // Fetch user's service requests
  const { data: serviceRequests = [], isLoading } = useQuery<ServiceRequest[]>({
    queryKey: ['/api/service-requests'],
    enabled: !!user,
  });

  const handleBack = () => {
    navigate('/');
  };

  const handleViewDetails = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleRateService = (jobId: string) => {
    setSelectedJobForReview(jobId);
    setShowReviewDialog(true);
  };

  const handleCreateRequest = () => {
    navigate('/service-request');
  };

  // Review form
  const reviewForm = useForm<ReviewForm>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: "",
    },
  });

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async (data: ReviewForm) => {
      if (!selectedJobForReview) throw new Error("No job selected");
      
      const selectedJob = serviceRequests.find(j => j.id === selectedJobForReview);
      if (!selectedJob) throw new Error("Job not found");
      
      // Find the accepted quote to get the company ID
      const acceptedQuote = await apiRequest('GET', `/api/service-requests/${selectedJobForReview}/quotes`);
      const quotes = await acceptedQuote.json();
      const approved = quotes.find((q: any) => q.isAccepted);
      
      if (!approved) throw new Error("No approved quote found");
      
      return apiRequest('POST', '/api/reviews', {
        serviceRequestId: selectedJobForReview,
        companyId: approved.companyId,
        rating: data.rating,
        comment: data.comment || null,
      });
    },
    onSuccess: () => {
      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      });
      setShowReviewDialog(false);
      setSelectedJobForReview(null);
      reviewForm.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/service-requests'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmitReview = (data: ReviewForm) => {
    submitReviewMutation.mutate(data);
  };

  // Filter jobs based on active filter and advanced filters
  const filteredJobs = serviceRequests.filter(job => {
    // Basic filter
    if (activeFilter === 'active' && (!job.status || !['pending', 'quoted', 'approved', 'in_progress'].includes(job.status))) return false;
    if (activeFilter === 'completed' && job.status !== 'completed') return false;
    
    // Advanced filters
    if (statusFilter !== 'all' && job.status !== statusFilter) return false;
    
    if (dateRange !== 'all_time' && job.createdAt) {
      const jobDate = new Date(job.createdAt);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - jobDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dateRange === 'last_week' && diffDays > 7) return false;
      if (dateRange === 'last_month' && diffDays > 30) return false;
      if (dateRange === 'last_3_months' && diffDays > 90) return false;
    }
    
    return true;
  });

  // Mock enhanced job data - in real app this would come from joined queries
  const enhancedJobs = filteredJobs.map(job => ({
    ...job,
    companyName: job.status !== 'pending' ? 'Al Waha Plumbing Services' : undefined,
    companyRating: job.status !== 'pending' ? 4.8 : undefined,
    estimatedPrice: 'AED 450',
    progress: job.status === 'in_progress' ? 75 : undefined,
  }));

  const statusCounts = {
    all: serviceRequests.length,
    active: serviceRequests.filter(r => r.status && ['pending', 'quoted', 'approved', 'in_progress'].includes(r.status)).length,
    completed: serviceRequests.filter(r => r.status === 'completed').length,
  };

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
            <h1 className="text-xl font-medium">My Jobs</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-blue-600 text-white"
              onClick={() => navigate('/search')}
              data-testid="button-search"
            >
              <Search className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-blue-600 text-white"
              onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
              data-testid="button-filter"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="p-4 bg-surface border-b border-gray-100">
        <div className="flex space-x-2">
          <Button
            variant={activeFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            className="flex-1"
            onClick={() => setActiveFilter('all')}
            data-testid="button-filter-all"
          >
            All ({statusCounts.all})
          </Button>
          <Button
            variant={activeFilter === 'active' ? 'default' : 'outline'}
            size="sm"
            className="flex-1"
            onClick={() => setActiveFilter('active')}
            data-testid="button-filter-active"
          >
            Active ({statusCounts.active})
          </Button>
          <Button
            variant={activeFilter === 'completed' ? 'default' : 'outline'}
            size="sm"
            className="flex-1"
            onClick={() => setActiveFilter('completed')}
            data-testid="button-filter-completed"
          >
            Completed ({statusCounts.completed})
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilter && (
        <div className="p-4 bg-gray-50 border-b border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Advanced Filters</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="quoted">Quoted</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_time">All Time</SelectItem>
                  <SelectItem value="last_week">Last Week</SelectItem>
                  <SelectItem value="last_month">Last Month</SelectItem>
                  <SelectItem value="last_3_months">Last 3 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end mt-3">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => {
                setStatusFilter('all');
                setDateRange('all_time');
              }}
              className="text-xs"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="p-4 pb-20">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="space-y-2 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : enhancedJobs.length > 0 ? (
          <div className="space-y-3">
            {enhancedJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onViewDetails={handleViewDetails}
                onRateService={job.status === 'completed' ? handleRateService : undefined}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-lg font-semibold mb-2">
                {activeFilter === 'all' 
                  ? 'No Jobs Yet' 
                  : activeFilter === 'active' 
                  ? 'No Active Jobs'
                  : 'No Completed Jobs'
                }
              </h3>
              <p className="text-gray-600 mb-4">
                {activeFilter === 'all' 
                  ? 'Start by creating your first service request'
                  : activeFilter === 'active'
                  ? 'You have no active service requests'
                  : 'You have no completed jobs to review'
                }
              </p>
              {(activeFilter === 'all' || activeFilter === 'active') && (
                <Button 
                  onClick={handleCreateRequest}
                  data-testid="button-create-first-job"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Service Request
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        {enhancedJobs.length > 0 && (
          <Card className="mt-6">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Quick Stats</h3>
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <div className="text-lg font-bold text-accent">
                    {serviceRequests.filter(r => r.status === 'pending').length}
                  </div>
                  <div className="text-gray-600">Pending</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-primary">
                    {serviceRequests.filter(r => r.status === 'in_progress').length}
                  </div>
                  <div className="text-gray-600">In Progress</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-success">
                    {serviceRequests.filter(r => r.status === 'completed').length}
                  </div>
                  <div className="text-gray-600">Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Floating Action Button */}
      <Button
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-accent hover:bg-orange-600 shadow-lg"
        onClick={handleCreateRequest}
        data-testid="button-floating-create-job"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <BottomNavigation />

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Rate Your Experience</DialogTitle>
          </DialogHeader>
          
          <Form {...reviewForm}>
            <form onSubmit={reviewForm.handleSubmit(onSubmitReview)} className="space-y-6">
              {/* Star Rating */}
              <FormField
                control={reviewForm.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How would you rate the service? (1-5 stars)</FormLabel>
                    <FormControl>
                      <div className="flex justify-center space-x-1">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => field.onChange(rating)}
                            className="p-1"
                          >
                            <Star
                              className={`h-8 w-8 transition-colors ${
                                rating <= field.value 
                                  ? "fill-yellow-400 text-yellow-400" 
                                  : "text-gray-300 hover:text-yellow-200"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </FormControl>
                    <div className="text-center text-sm text-gray-600">
                      {field.value > 0 ? `${field.value}/5 stars` : 'Select a rating'}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Comment */}
              <FormField
                control={reviewForm.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Leave a comment (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Share your experience with other homeowners..."
                        rows={4}
                        className="resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowReviewDialog(false);
                    reviewForm.reset();
                  }}
                  disabled={submitReviewMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={submitReviewMutation.isPending || reviewForm.watch('rating') === 0}
                >
                  {submitReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

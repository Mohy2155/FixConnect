import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BottomNavigation } from "@/components/bottom-navigation";
import { JobCard } from "@/components/job-card";
import { ArrowLeft, Filter, Search, Plus } from "lucide-react";
import { useLocation } from "wouter";
import { ServiceRequest } from "@shared/schema";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Jobs() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed'>('all');

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
    toast({
      title: "Rating Service",
      description: "Rating feature coming soon!",
    });
  };

  const handleCreateRequest = () => {
    navigate('/service-request');
  };

  // Filter jobs based on active filter
  const filteredJobs = serviceRequests.filter(job => {
    if (activeFilter === 'active') {
      return job.status && ['pending', 'quoted', 'approved', 'in_progress'].includes(job.status);
    }
    if (activeFilter === 'completed') {
      return job.status === 'completed';
    }
    return true; // 'all'
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
              data-testid="button-search"
            >
              <Search className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-blue-600 text-white"
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
    </div>
  );
}

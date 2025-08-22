import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BottomNavigation } from "@/components/bottom-navigation";
import { ServiceCategories } from "@/components/service-categories";
import { JobCard } from "@/components/job-card";
import { Bell, Plus } from "lucide-react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { ServiceCategory, ServiceRequest } from "@shared/schema";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Home() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [userRole, setUserRole] = useState<'homeowner' | 'company'>('homeowner');

  // Initialize data on first load
  useEffect(() => {
    const initData = async () => {
      try {
        await apiRequest('GET', '/api/init');
      } catch (error) {
        console.error('Init error:', error);
      }
    };
    initData();
  }, []);

  // Fetch service categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<ServiceCategory[]>({
    queryKey: ['/api/categories'],
  });

  // Fetch user's service requests
  const { data: serviceRequests = [], isLoading: requestsLoading } = useQuery<ServiceRequest[]>({
    queryKey: ['/api/service-requests'],
    enabled: !!user && userRole === 'homeowner',
  });

  // Fetch unread message count
  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ['/api/messages/unread-count'],
    enabled: !!user,
  });

  // Role switching - redirects to proper auth endpoints
  const handleRoleSwitch = (role: 'homeowner' | 'company') => {
    if (role === userRole) return; // No change needed
    
    toast({
      title: "Switching Account Type",
      description: "Redirecting to re-authenticate...",
    });
    
    // Redirect to role-specific login
    setTimeout(() => {
      window.location.href = `/api/login/${role}`;
    }, 500);
  };

  useEffect(() => {
    if (!authLoading && !user) {
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
    
    if (user?.role) {
      setUserRole(user.role as 'homeowner' | 'company');
    }
  }, [user, authLoading, toast]);

  const handleCategorySelect = (category: ServiceCategory) => {
    navigate(`/service-request?categoryId=${category.id}`);
  };

  const handleViewJobDetails = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleCreateRequest = () => {
    navigate('/service-request');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const recentJobs = serviceRequests.slice(0, 2).map(job => ({
    ...job,
    companyName: "Sample Company", // This would come from joined data
    companyRating: 4.8,
    estimatedPrice: "AED 450",
    progress: job.status === 'in_progress' ? 75 : undefined,
  }));

  return (
    <div className="max-w-sm mx-auto bg-surface min-h-screen relative">
      {/* Header */}
      <header className="bg-primary text-white px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🔧</div>
            <h1 className="text-xl font-medium">FixConnect</h1>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm"
              className="p-2 hover:bg-blue-600 text-white"
              onClick={() => navigate('/messages')}
              data-testid="button-notifications"
            >
              <Bell className="h-5 w-5" />
            </Button>
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-sm font-medium" data-testid="text-user-initials">
                {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Role Selector */}
      <div className="p-4 bg-surface shadow-sm border-b border-gray-100">
        <div className="flex space-x-2">
          <Button
            variant={userRole === 'homeowner' ? 'default' : 'outline'}
            size="sm"
            className={`flex-1 transition-all duration-200 ${
              userRole === 'homeowner' 
                ? 'bg-black hover:bg-gray-800 text-white shadow-lg scale-105 font-semibold border-2 border-black' 
                : 'text-gray-600 hover:text-gray-800 hover:border-gray-400 border-2 border-gray-300'
            }`}
            onClick={() => handleRoleSwitch('homeowner')}
            data-testid="button-homeowner-role"
          >
            Homeowner
          </Button>
          <Button
            variant={userRole === 'company' ? 'default' : 'outline'}
            size="sm"
            className={`flex-1 transition-all duration-200 ${
              userRole === 'company' 
                ? 'bg-black hover:bg-gray-800 text-white shadow-lg scale-105 font-semibold border-2 border-black' 
                : 'text-gray-600 hover:text-gray-800 hover:border-gray-400 border-2 border-gray-300'
            }`}
            onClick={() => handleRoleSwitch('company')}
            data-testid="button-company-role"
          >
            Company
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="pb-16">
        {userRole === 'homeowner' ? (
          <>
            {/* Welcome Section */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-teal-50">
              <div className="mb-4">
                <img
                  src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400"
                  alt="Professional maintenance service"
                  className="w-full h-32 object-cover rounded-lg shadow-md"
                />
              </div>
              <h2 className="text-lg font-medium text-gray-800 mb-2" data-testid="text-welcome-message">
                Welcome back, {user?.firstName || 'User'}!
              </h2>
              <p className="text-sm text-gray-600 mb-3">
                Need maintenance? Connect with certified professionals in UAE
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <Card>
                  <CardContent className="p-3">
                    <div className="text-2xl font-bold text-primary" data-testid="text-active-jobs">
                      {serviceRequests.filter(r => r.status && ['pending', 'quoted', 'approved', 'in_progress'].includes(r.status)).length}
                    </div>
                    <div className="text-xs text-gray-500">Active Jobs</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3">
                    <div className="text-2xl font-bold text-secondary" data-testid="text-completed-jobs">
                      {serviceRequests.filter(r => r.status === 'completed').length}
                    </div>
                    <div className="text-xs text-gray-500">Completed</div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Quick Request</h3>
              
              {categoriesLoading ? (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-4 text-center">
                        <div className="w-8 h-8 bg-gray-200 rounded mx-auto mb-2 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <ServiceCategories
                  categories={categories.filter((category, index, self) => 
                    index === self.findIndex(c => c.name === category.name)
                  ).slice(0, 4)} // Remove duplicates by name and show only first 4
                  onCategorySelect={handleCategorySelect}
                  className="mb-4"
                />
              )}

              {/* Custom Request Button */}
              <Button
                className="w-full bg-primary hover:bg-blue-700 flex items-center justify-center space-x-2"
                onClick={handleCreateRequest}
                data-testid="button-create-custom-request"
              >
                <Plus className="h-4 w-4" />
                <span>Create Custom Request</span>
              </Button>
            </div>

            {/* Recent Jobs */}
            <div className="px-4 pb-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium text-gray-800">Recent Jobs</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/jobs')}
                  data-testid="button-view-all-jobs"
                >
                  View All
                </Button>
              </div>

              {requestsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 2 }).map((_, i) => (
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
              ) : recentJobs.length > 0 ? (
                <div>
                  {recentJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onViewDetails={handleViewJobDetails}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-500 mb-3">No recent jobs</p>
                    <Button onClick={handleCreateRequest} data-testid="button-create-first-request">
                      Create Your First Request
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        ) : (
          /* Company View */
          <div className="p-4">
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🏢</div>
              <h3 className="text-xl font-bold mb-2">Company Dashboard</h3>
              <p className="text-gray-600 mb-6">
                Manage your business profile and view service requests
              </p>
              <div className="space-y-3">
                <Button className="w-full" onClick={() => navigate('/company-onboarding')} data-testid="button-complete-registration">
                  Complete Registration
                </Button>
                <Button className="w-full" onClick={() => navigate('/company-dashboard')} data-testid="button-dashboard">
                  Go to Dashboard
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate('/profile')} data-testid="button-manage-profile">
                  Manage Profile
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <Button
        className="fixed bottom-16 right-4 w-12 h-12 rounded-full bg-accent hover:bg-orange-600 shadow-lg"
        onClick={handleCreateRequest}
        data-testid="button-floating-request"
      >
        <Plus className="h-5 w-5" />
      </Button>

      <BottomNavigation unreadCount={unreadData?.count || 0} />
    </div>
  );
}

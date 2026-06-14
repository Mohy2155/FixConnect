import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BottomNavigation } from "@/components/bottom-navigation";
import { 
  Building, 
  FileText, 
  Users, 
  DollarSign, 
  Calendar,
  Star,
  Bell,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  Plus
} from "lucide-react";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ServiceRequest, Company, Quote } from "@shared/schema";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function CompanyDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch company profile
  const { data: company, isLoading: companyLoading } = useQuery<Company>({
    queryKey: ['/api/company/profile'],
    enabled: !!user && user.role === 'company',
  });

  // Fetch job requests for company
  const { data: jobRequests = [], isLoading: jobsLoading } = useQuery<ServiceRequest[]>({
    queryKey: ['/api/company/job-requests'],
    enabled: !!user && user.role === 'company',
  });

  // Fetch company quotes
  const { data: quotes = [], isLoading: quotesLoading } = useQuery<Quote[]>({
    queryKey: ['/api/company/quotes'],
    enabled: !!user && user.role === 'company',
  });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'company')) {
      toast({
        title: "Access Denied",
        description: "Company access required. Please switch to company account.",
        variant: "destructive",
      });
      navigate('/');
    } else if (!companyLoading && user?.role === 'company' && !company) {
      // Redirect to onboarding if company profile is not set up
      toast({
        title: "Profile Setup Required",
        description: "Please complete your company profile setup first.",
      });
      navigate('/company-onboarding');
    }
  }, [user, authLoading, company, companyLoading, toast, navigate]);

  const handleRoleSwitch = () => {
    toast({
      title: "Switching to Homeowner",
      description: "Redirecting to homeowner dashboard...",
    });
    
    setTimeout(() => {
      window.location.href = "/auth?role=homeowner";
    }, 500);
  };

  const handleProfileSetup = () => {
    navigate('/company-onboarding');
  };

  if (authLoading || companyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Company not verified or incomplete profile
  if (!company || !company.isVerified) {
    return (
      <div className="max-w-sm mx-auto bg-surface min-h-screen">
        {/* Header */}
        <header className="bg-primary text-white px-4 py-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Building className="h-6 w-6" />
              <h1 className="text-xl font-medium">Company Dashboard</h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRoleSwitch}
              className="text-white bg-white/10 hover:bg-blue-600 border border-white/20"
              data-testid="button-switch-homeowner"
            >
              Switch to Homeowner
            </Button>
          </div>
        </header>

        <div className="p-4 space-y-6">
          {!company ? (
            // No company profile
            <Card>
              <CardContent className="p-6 text-center">
                <Building className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Company Profile Required</h3>
                <p className="text-gray-600 mb-4">
                  Complete your company profile to start receiving job requests
                </p>
                <Button onClick={handleProfileSetup} data-testid="button-setup-profile">
                  <Plus className="h-4 w-4 mr-2" />
                  Setup Company Profile
                </Button>
              </CardContent>
            </Card>
          ) : (
            // Company pending verification
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                <h3 className="text-lg font-semibold mb-2">Verification Pending</h3>
                <p className="text-gray-600 mb-4">
                  Your company profile is under review. You'll be notified once approved.
                </p>
                <div className="space-y-2 text-sm text-left bg-gray-50 p-4 rounded-lg">
                  <p><strong>Company:</strong> {company.name}</p>
                  <p><strong>License:</strong> {company.licenseNumber}</p>
                  <p><strong>Status:</strong> <Badge variant="outline" className="text-yellow-600">Pending Review</Badge></p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => navigate('/company-profile')}
                  className="mt-4"
                  data-testid="button-edit-profile"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <BottomNavigation />
      </div>
    );
  }

  // Main company dashboard for verified companies
  const newJobRequests = jobRequests.filter(job => job.status === 'pending');
  const ongoingJobs = jobRequests.filter(job => job.status === 'in_progress');
  const completedJobs = jobRequests.filter(job => job.status === 'completed');
  const cancelledJobs = jobRequests.filter(job => job.status === 'cancelled');

  return (
    <div className="max-w-sm mx-auto bg-surface min-h-screen">
      {/* Header */}
      <header className="bg-primary text-white px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Building className="h-6 w-6" />
            <div>
              <h1 className="text-lg font-medium">Company Dashboard</h1>
              <p className="text-sm opacity-90">{company.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/messages')}
              className="text-white hover:bg-blue-600 p-2"
              data-testid="button-messages"
            >
              <Bell className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRoleSwitch}
              className="text-white hover:bg-blue-600 text-xs px-2"
              data-testid="button-switch-homeowner"
            >
              Switch
            </Button>
          </div>
        </div>
      </header>

      <div className="pb-20">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white border-b">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="jobs" className="text-xs">Jobs</TabsTrigger>
            <TabsTrigger value="earnings" className="text-xs">Earnings</TabsTrigger>
            <TabsTrigger value="profile" className="text-xs">Profile</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="p-4 space-y-4">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-3 text-center">
                  <div className="text-2xl font-bold text-blue-600" data-testid="text-new-requests">
                    {newJobRequests.length}
                  </div>
                  <div className="text-xs text-gray-500">New Requests</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <div className="text-2xl font-bold text-green-600" data-testid="text-ongoing-jobs">
                    {ongoingJobs.length}
                  </div>
                  <div className="text-xs text-gray-500">Ongoing</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <div className="text-2xl font-bold text-gray-600" data-testid="text-completed-jobs">
                    {completedJobs.length}
                  </div>
                  <div className="text-xs text-gray-500">Completed</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <div className="text-2xl font-bold text-yellow-600" data-testid="text-rating">
                    {company.rating || '0.0'}
                  </div>
                  <div className="text-xs text-gray-500">Rating</div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setActiveTab('jobs')}
                  data-testid="button-view-requests"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View New Requests ({newJobRequests.length})
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/company-calendar')}
                  data-testid="button-view-schedule"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  View Schedule
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setActiveTab('profile')}
                  data-testid="button-update-profile"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Update Profile
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {jobRequests.slice(0, 3).length > 0 ? (
                  <div className="space-y-3">
                    {jobRequests.slice(0, 3).map((job) => (
                      <div key={job.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <div>
                          <p className="text-sm font-medium">{job.title}</p>
                          <p className="text-xs text-gray-500">{job.status}</p>
                        </div>
                        <Badge variant={
                          job.status === 'pending' ? 'default' :
                          job.status === 'in_progress' ? 'secondary' :
                          job.status === 'completed' ? 'default' : 'destructive'
                        }>
                          {job.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="p-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Job Management</h3>
              
              {/* New Requests */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>New Requests</span>
                    <Badge>{newJobRequests.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {newJobRequests.length > 0 ? (
                    <div className="space-y-3">
                      {newJobRequests.map((job) => (
                        <div key={job.id} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{job.title}</h4>
                            <Button
                              size="sm"
                              onClick={() => navigate(`/company-jobs/${job.id}`)}
                              data-testid={`button-view-${job.id}`}
                            >
                              View
                            </Button>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{job.description}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Customer: {job.customerId}</span>
                            <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No new requests</p>
                  )}
                </CardContent>
              </Card>

              {/* Ongoing Jobs */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>Ongoing Jobs</span>
                    <Badge variant="secondary">{ongoingJobs.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {ongoingJobs.length > 0 ? (
                    <div className="space-y-3">
                      {ongoingJobs.map((job) => (
                        <div key={job.id} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{job.title}</h4>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/company-jobs/${job.id}`)}
                              data-testid={`button-manage-${job.id}`}
                            >
                              Manage
                            </Button>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{job.description}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>In Progress</span>
                            <span>{new Date(job.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No ongoing jobs</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings" className="p-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Earnings & Payments</h3>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Monthly Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">AED 2,450</div>
                      <div className="text-xs text-gray-500">This Month</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">AED 1,890</div>
                      <div className="text-xs text-gray-500">Last Month</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Payment Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Pending</span>
                      <span className="font-medium text-yellow-600">AED 850</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Paid</span>
                      <span className="font-medium text-green-600">AED 1,600</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Overdue</span>
                      <span className="font-medium text-red-600">AED 0</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Company Profile</h3>
                <Button
                  size="sm"
                  onClick={() => navigate('/company-profile')}
                  data-testid="button-edit-company-profile"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Company Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Company Name</label>
                    <p className="text-sm">{company.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">License Number</label>
                    <p className="text-sm">{company.licenseNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Service Areas</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {company.serviceAreas?.map((area) => (
                        <Badge key={area} variant="outline" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Specialties</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {company.specialties?.map((specialty) => (
                        <Badge key={specialty} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Verification Status</label>
                    <div className="mt-1">
                      <Badge variant={company.isVerified ? 'default' : 'destructive'}>
                        {company.isVerified ? 'Verified' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Overall Rating</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{company.rating || '0.0'}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Reviews</span>
                    <span className="font-medium">{company.reviewCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Response Time</span>
                    <span className="font-medium">{company.responseTime || 'Not set'}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNavigation />
    </div>
  );
}
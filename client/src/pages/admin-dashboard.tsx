import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Trash2, CheckCircle, XCircle, Building2, User, Phone, Mail, MapPin, Calendar } from "lucide-react";

interface PendingCompany {
  id: string;
  name: string;
  description?: string;
  licenseNumber?: string;
  userId: string;
  phone?: string;
  email?: string;
  serviceAreas?: string[];
  specialties?: string[];
  isVerified: boolean;
  createdAt: string;
}

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"pending" | "users" | "companies">("pending");

  // Fetch pending companies
  const { data: pendingCompanies = [], isLoading: loadingCompanies } = useQuery({
    queryKey: ['/api/admin/companies/pending'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/companies/pending');
      return response.json();
    },
  });

  // Fetch all users
  const { data: allUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/users');
      return response.json();
    },
  });

  // Fetch all companies
  const { data: allCompanies = [], isLoading: loadingAllCompanies } = useQuery({
    queryKey: ['/api/admin/companies'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/companies');
      return response.json();
    },
  });

  // Approve company mutation
  const approveCompanyMutation = useMutation({
    mutationFn: async (companyId: string) => {
      await apiRequest('POST', `/api/admin/companies/${companyId}/approve`);
    },
    onSuccess: () => {
      toast({
        title: "Company Approved",
        description: "The company has been successfully approved and can now use the platform.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/companies/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/companies'] });
    },
    onError: () => {
      toast({
        title: "Approval Failed",
        description: "Failed to approve company. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Reject company mutation
  const rejectCompanyMutation = useMutation({
    mutationFn: async (companyId: string) => {
      await apiRequest('POST', `/api/admin/companies/${companyId}/reject`);
    },
    onSuccess: () => {
      toast({
        title: "Company Rejected",
        description: "The company application has been rejected.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/companies/pending'] });
    },
    onError: () => {
      toast({
        title: "Rejection Failed",
        description: "Failed to reject company. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest('DELETE', `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      toast({
        title: "User Deleted",
        description: "The user has been successfully removed from the platform.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
    onError: () => {
      toast({
        title: "Deletion Failed",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete company mutation
  const deleteCompanyMutation = useMutation({
    mutationFn: async (companyId: string) => {
      await apiRequest('DELETE', `/api/admin/companies/${companyId}`);
    },
    onSuccess: () => {
      toast({
        title: "Company Deleted",
        description: "The company has been successfully removed from the platform.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/companies'] });
    },
    onError: () => {
      toast({
        title: "Deletion Failed",
        description: "Failed to delete company. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout');
      window.location.href = '/auth';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Building2 className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">FixConnect Admin</h1>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("pending")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "pending"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Pending Approvals ({pendingCompanies.length})
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "users"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              All Users ({allUsers.length})
            </button>
            <button
              onClick={() => setActiveTab("companies")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "companies"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              All Companies ({allCompanies.length})
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Pending Approvals Tab */}
          {activeTab === "pending" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Pending Company Approvals</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Review and approve company registrations after verifying their trade licenses.
                </p>
              </div>

              {loadingCompanies ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading pending companies...</p>
                </div>
              ) : pendingCompanies.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Pending Approvals</h3>
                    <p className="text-gray-600 dark:text-gray-400">All company registrations have been processed.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {pendingCompanies.map((company: PendingCompany) => (
                    <Card key={company.id} className="border-l-4 border-l-yellow-400">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="flex items-center space-x-2">
                              <Building2 className="h-5 w-5" />
                              <span>{company.name}</span>
                              <Badge variant="secondary">Pending Review</Badge>
                            </CardTitle>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              Registered: {new Date(company.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => approveCompanyMutation.mutate(company.id)}
                              disabled={approveCompanyMutation.isPending}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => rejectCompanyMutation.mutate(company.id)}
                              disabled={rejectCompanyMutation.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <p className="text-sm"><strong>Description:</strong> {company.description || "Not provided"}</p>
                            <p className="text-sm"><strong>License Number:</strong> {company.licenseNumber || "Not provided"}</p>
                            {company.serviceAreas && (
                              <p className="text-sm"><strong>Service Areas:</strong> {company.serviceAreas.join(", ")}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            {company.specialties && (
                              <p className="text-sm"><strong>Specialties:</strong> {company.specialties.join(", ")}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* All Users Tab */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">All Users</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Manage all registered users on the platform.
                </p>
              </div>

              {loadingUsers ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading users...</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {allUsers.map((user: User) => (
                    <Card key={user.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-4">
                            <User className="h-8 w-8 text-gray-400" />
                            <div>
                              <h3 className="font-medium">{user.firstName} {user.lastName}</h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span className="flex items-center"><Mail className="h-4 w-4 mr-1" />{user.email}</span>
                                {user.phone && <span className="flex items-center"><Phone className="h-4 w-4 mr-1" />{user.phone}</span>}
                                <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>{user.role}</Badge>
                              </div>
                            </div>
                          </div>
                          {user.role !== 'admin' && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteUserMutation.mutate(user.id)}
                              disabled={deleteUserMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* All Companies Tab */}
          {activeTab === "companies" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">All Companies</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Manage all companies on the platform.
                </p>
              </div>

              {loadingAllCompanies ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading companies...</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {allCompanies.map((company: PendingCompany) => (
                    <Card key={company.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-4">
                            <Building2 className="h-8 w-8 text-gray-400" />
                            <div>
                              <h3 className="font-medium">{company.name}</h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <Badge variant={company.isVerified ? 'default' : 'secondary'}>
                                  {company.isVerified ? 'Verified' : 'Pending'}
                                </Badge>
                                {company.licenseNumber && <span>License: {company.licenseNumber}</span>}
                                <span className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {new Date(company.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteCompanyMutation.mutate(company.id)}
                            disabled={deleteCompanyMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
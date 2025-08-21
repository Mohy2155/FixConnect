import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BottomNavigation } from "@/components/bottom-navigation";
import { Stars } from "@/components/ui/stars";
import { ArrowLeft, User, Building, LogOut, Edit, Camera } from "lucide-react";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertCompanySchema, Company } from "@shared/schema";
import { isUnauthorizedError } from "@/lib/authUtils";
import { z } from "zod";

const companyFormSchema = insertCompanySchema.omit({
  userId: true,
  id: true,
  createdAt: true,
  updatedAt: true,
});

const profileFormSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type CompanyForm = z.infer<typeof companyFormSchema>;
type ProfileForm = z.infer<typeof profileFormSchema>;

export default function Profile() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'company'>('profile');

  const form = useForm<CompanyForm>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: '',
      description: '',
      licenseNumber: '',
      responseTime: '2-4 hours',
      serviceAreas: ['Dubai'],
      specialties: [],
    },
  });

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      address: user?.address || '',
    },
  });

  // Personal profile update mutation
  const profileMutation = useMutation({
    mutationFn: async (data: ProfileForm) => {
      return await apiRequest('PUT', `/api/users/${user?.id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Personal profile updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setIsEditing(false);
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
        description: "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  // Fetch company profile if user is a company
  const { data: company, isLoading: companyLoading } = useQuery<Company>({
    queryKey: ['/api/companies', user?.id],
    enabled: !!user && user.role === 'company',
  });

  // Company profile creation/update mutation
  const companyMutation = useMutation({
    mutationFn: async (data: CompanyForm) => {
      if (company) {
        return await apiRequest('PUT', `/api/companies/${company.id}`, data);
      } else {
        return await apiRequest('POST', '/api/companies', data);
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: company ? "Company profile updated" : "Company profile created",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      setIsEditing(false);
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
        description: "Failed to save company profile",
        variant: "destructive",
      });
    },
  });

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
  }, [user, authLoading, toast]);

  useEffect(() => {
    if (company) {
      form.reset({
        name: company.name,
        description: company.description || '',
        licenseNumber: company.licenseNumber || '',
        responseTime: company.responseTime || '2-4 hours',
        serviceAreas: company.serviceAreas || ['Dubai'],
        specialties: company.specialties || [],
      });
    }
  }, [company, form]);

  const handleBack = () => {
    navigate('/');
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const onSubmit = (data: CompanyForm) => {
    companyMutation.mutate(data);
  };

  const onProfileSubmit = (data: ProfileForm) => {
    profileMutation.mutate(data);
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
            <h1 className="text-xl font-medium">Profile</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-blue-600 text-white"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="p-4 bg-surface border-b border-gray-100">
        <div className="flex space-x-2">
          <Button
            variant={activeTab === 'profile' ? 'default' : 'outline'}
            size="sm"
            className="flex-1"
            onClick={() => setActiveTab('profile')}
            data-testid="button-profile-tab"
          >
            <User className="h-4 w-4 mr-2" />
            Personal
          </Button>
          {user?.role === 'company' && (
            <Button
              variant={activeTab === 'company' ? 'default' : 'outline'}
              size="sm"
              className="flex-1"
              onClick={() => setActiveTab('company')}
              data-testid="button-company-tab"
            >
              <Building className="h-4 w-4 mr-2" />
              Business
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="p-4 pb-20 space-y-4">
        {activeTab === 'profile' ? (
          /* Personal Profile */
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold">
                    {user?.profileImageUrl ? (
                      <img
                        src={user.profileImageUrl}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <span data-testid="text-user-avatar">
                        {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold" data-testid="text-user-name">
                      {user?.firstName && user?.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : user?.email
                      }
                    </h3>
                    <p className="text-gray-600" data-testid="text-user-email">
                      {user?.email}
                    </p>
                    <Badge variant="secondary" className="mt-1">
                      {user?.role === 'company' ? 'Company' : 'Homeowner'}
                    </Badge>
                  </div>
                </div>

                {!isEditing ? (
                  <>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium">Phone:</span>
                        <span className="ml-2 text-gray-600" data-testid="text-user-phone">
                          {user?.phone || 'Not provided'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Address:</span>
                        <span className="ml-2 text-gray-600" data-testid="text-user-address">
                          {user?.address || 'Not provided'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Member since:</span>
                        <span className="ml-2 text-gray-600">
                          {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                        </span>
                      </div>
                    </div>

                    <Button 
                      className="w-full mt-4" 
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                      data-testid="button-edit-profile"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </>
                ) : (
                  /* Personal Profile Edit Form */
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={profileForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="First name" 
                                  {...field} 
                                  data-testid="input-first-name"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Last name" 
                                  {...field} 
                                  data-testid="input-last-name"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={profileForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="+971 50 123 4567" 
                                {...field} 
                                data-testid="input-phone"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Full address"
                                className="h-16 resize-none"
                                {...field}
                                data-testid="textarea-address"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex space-x-3">
                        <Button 
                          type="submit"
                          className="flex-1"
                          disabled={profileMutation.isPending}
                          data-testid="button-save-profile"
                        >
                          {profileMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button 
                          type="button"
                          variant="outline" 
                          onClick={() => setIsEditing(false)}
                          data-testid="button-cancel-profile-edit"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={() => toast({ title: "Feature Coming Soon", description: "Notification settings will be available in the next update" })}
                  data-testid="button-notifications"
                >
                  Notification Settings
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={() => toast({ title: "Feature Coming Soon", description: "Privacy & security settings will be available in the next update" })}
                  data-testid="button-privacy"
                >
                  Privacy & Security
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={() => toast({ title: "Help & Support", description: "Contact support@fixconnect.ae for assistance" })}
                  data-testid="button-help"
                >
                  Help & Support
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={() => toast({ title: "Terms & Conditions", description: "Please visit our website for full terms and conditions" })}
                  data-testid="button-terms"
                >
                  Terms & Conditions
                </Button>
                
                {/* Role Switch Section */}
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-sm font-medium mb-3">Account Type</p>
                  {user?.role === 'homeowner' ? (
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-blue-600"
                      onClick={() => window.location.href = '/api/login/company'}
                      data-testid="button-switch-to-company"
                    >
                      <Building className="h-4 w-4 mr-2" />
                      Switch to Company Account
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-blue-600"
                      onClick={() => window.location.href = '/api/login/homeowner'}
                      data-testid="button-switch-to-homeowner"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Switch to Homeowner Account
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          /* Company Profile */
          <>
            {company && !isEditing ? (
              /* Display Company Profile */
              <>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                        {company.logo ? (
                          <img
                            src={company.logo}
                            alt="Company logo"
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        ) : (
                          <Building className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold" data-testid="text-company-name">
                            {company.name}
                          </h3>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setIsEditing(true)}
                            data-testid="button-edit-company"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Stars rating={Number(company.rating)} size="sm" />
                          <span className="text-sm text-gray-600">
                            ({company.reviewCount} reviews)
                          </span>
                        </div>
                        {company.isVerified && (
                          <Badge variant="default" className="mt-2">
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4" data-testid="text-company-description">
                      {company.description}
                    </p>

                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">License:</span>
                        <span className="ml-2 text-gray-600">{company.licenseNumber}</span>
                      </div>
                      <div>
                        <span className="font-medium">Response Time:</span>
                        <span className="ml-2 text-gray-600">{company.responseTime}</span>
                      </div>
                      <div>
                        <span className="font-medium">Service Areas:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {company.serviceAreas?.map((area) => (
                            <Badge key={area} variant="secondary" className="text-xs">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Specialties:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {company.specialties?.map((specialty) => (
                            <Badge key={specialty} variant="outline" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Business Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Business Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-primary">
                          {company.reviewCount}
                        </div>
                        <div className="text-sm text-gray-600">Total Reviews</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-secondary">
                          {Number(company.rating).toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-600">Average Rating</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              /* Edit/Create Company Profile */
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {company ? 'Edit Business Profile' : 'Create Business Profile'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Your company name" 
                                {...field} 
                                data-testid="input-company-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe your company and services"
                                className="h-20 resize-none"
                                {...field}
                                data-testid="textarea-company-description"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="licenseNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>License Number</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Business license number" 
                                {...field} 
                                data-testid="input-license-number"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="responseTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Typical Response Time</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-response-time">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Within 1 hour">Within 1 hour</SelectItem>
                                <SelectItem value="1-2 hours">1-2 hours</SelectItem>
                                <SelectItem value="2-4 hours">2-4 hours</SelectItem>
                                <SelectItem value="4-8 hours">4-8 hours</SelectItem>
                                <SelectItem value="Same day">Same day</SelectItem>
                                <SelectItem value="Next day">Next day</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex space-x-2">
                        <Button 
                          type="submit" 
                          className="flex-1"
                          disabled={companyMutation.isPending}
                          data-testid="button-save-company"
                        >
                          {companyMutation.isPending ? "Saving..." : "Save Profile"}
                        </Button>
                        {company && (
                          <Button 
                            type="button"
                            variant="outline" 
                            onClick={() => setIsEditing(false)}
                            data-testid="button-cancel-edit"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}

            {!company && !isEditing && (
              <Card>
                <CardContent className="p-6 text-center">
                  <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Complete Your Business Profile</h3>
                  <p className="text-gray-600 mb-4">
                    Create your company profile to start receiving service requests
                  </p>
                  <Button 
                    onClick={() => setIsEditing(true)}
                    data-testid="button-create-company-profile"
                  >
                    Create Business Profile
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}

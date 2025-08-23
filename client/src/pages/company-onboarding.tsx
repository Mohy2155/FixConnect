import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Upload, FileText, X } from "lucide-react";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { z } from "zod";

const companyOnboardingSchema = z.object({
  legalCompanyName: z.string().min(2, "Legal company name is required"),
  website: z.string().url("Please enter a valid website URL").optional().or(z.literal("")),
  phone: z.string().min(8, "Phone number is required"),
  email: z.string().email("Valid email address is required"),
  serviceTypes: z.array(z.string()).min(1, "Please select at least one service type"),
  serviceAreas: z.array(z.string()).min(1, "Please select at least one service area"),
  description: z.string().min(50, "Please provide at least 50 characters describing your company"),
});

type CompanyOnboardingForm = z.infer<typeof companyOnboardingSchema>;

const SERVICE_TYPES = [
  { id: 'plumbing', name: 'Plumbing' },
  { id: 'electrical', name: 'Electrical' },
  { id: 'ac-cooling', name: 'AC & Cooling' },
  { id: 'appliances', name: 'Appliances' },
  { id: 'cleaning', name: 'Cleaning' },
  { id: 'painting', name: 'Painting' },
  { id: 'carpentry', name: 'Carpentry' },
  { id: 'landscaping', name: 'Landscaping' },
];

const SERVICE_AREAS = [
  'Dubai',
  'Abu Dhabi',
  'Sharjah',
  'Ajman',
  'Fujairah',
  'Ras Al Khaimah',
  'Umm Al Quwain',
];

export default function CompanyOnboarding() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tradeLicense, setTradeLicense] = useState<File | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const form = useForm<CompanyOnboardingForm>({
    resolver: zodResolver(companyOnboardingSchema),
    defaultValues: {
      legalCompanyName: '',
      website: '',
      phone: '',
      email: user?.email || '',
      serviceTypes: [],
      serviceAreas: [],
      description: '',
    },
  });

  const onboardingMutation = useMutation({
    mutationFn: async (data: CompanyOnboardingForm) => {
      const formData = new FormData();
      
      // Add all form fields
      Object.entries(data).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value as string);
        }
      });

      // Add trade license file
      if (tradeLicense) {
        formData.append('tradeLicense', tradeLicense);
      }

      return await apiRequest('POST', '/api/companies/onboarding', formData);
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted",
        description: "Your company registration has been submitted for review. You'll be notified once approved.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      navigate('/');
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Please login again to continue",
          variant: "destructive",
        });
        window.location.href = "/api/login";
        return;
      }
      toast({
        title: "Error",
        description: "Failed to submit company registration. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF, JPEG, or PNG file",
          variant: "destructive",
        });
        return;
      }

      if (file.size > maxSize) {
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      setTradeLicense(file);
    }
  };

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const removeTradeLicense = () => {
    setTradeLicense(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = (data: CompanyOnboardingForm) => {
    if (!tradeLicense) {
      toast({
        title: "Trade License Required",
        description: "Please upload your trade license document",
        variant: "destructive",
      });
      return;
    }
    onboardingMutation.mutate(data);
  };

  const nextStep = async () => {
    const fieldsToValidate = currentStep === 1 
      ? ['legalCompanyName', 'phone', 'email', 'website']
      : currentStep === 2 
      ? ['serviceTypes', 'serviceAreas']
      : ['description'];

    const isValid = await form.trigger(fieldsToValidate as any);
    if (isValid && (currentStep !== 1 || tradeLicense)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else if (currentStep === 1 && !tradeLicense) {
      toast({
        title: "Trade License Required",
        description: "Please upload your trade license to continue",
        variant: "destructive",
      });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleBack = () => {
    navigate('/');
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
          <h1 className="text-xl font-medium">Company Registration</h1>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="p-4 bg-surface border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Step {currentStep} of {totalSteps}</span>
          <span className="text-sm text-gray-500">
            {currentStep === 1 ? 'Company Info' : currentStep === 2 ? 'Services' : 'Description'}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-4 pb-20">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Step 1: Company Information */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Company Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="legalCompanyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Legal Company Name *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your legal company name"
                            className="placeholder:text-gray-400"
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
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Phone *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="+971 50 123 4567"
                            className="placeholder:text-gray-400"
                            {...field} 
                            data-testid="input-phone"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Email *</FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="info@company.com"
                            className="placeholder:text-gray-400"
                            {...field} 
                            data-testid="input-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://www.company.com"
                            className="placeholder:text-gray-400"
                            {...field} 
                            data-testid="input-website"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Trade License Upload */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Trade License *</label>
                    <div 
                      className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-gray-300 transition-colors"
                      onClick={handleFileUploadClick}
                    >
                      {!tradeLicense ? (
                        <>
                          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Upload your trade license</p>
                          <p className="text-xs text-gray-400 mt-1">PDF, JPEG, or PNG (max 5MB)</p>
                        </>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-6 w-6 text-primary" />
                            <span className="text-sm text-gray-700">{tradeLicense.name}</span>
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="h-8 w-8 rounded-full p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeTradeLicense();
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        className="hidden" 
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileSelect}
                        data-testid="input-trade-license"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Services and Areas */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Services & Coverage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Service Types */}
                  <FormField
                    control={form.control}
                    name="serviceTypes"
                    render={() => (
                      <FormItem>
                        <FormLabel>Services Provided *</FormLabel>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          {SERVICE_TYPES.map((service) => (
                            <FormField
                              key={service.id}
                              control={form.control}
                              name="serviceTypes"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={service.id}
                                    className="flex flex-row items-center space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(service.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, service.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== service.id
                                                )
                                              )
                                        }}
                                        data-testid={`checkbox-service-${service.id}`}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal">
                                      {service.name}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Service Areas */}
                  <FormField
                    control={form.control}
                    name="serviceAreas"
                    render={() => (
                      <FormItem>
                        <FormLabel>Areas Served *</FormLabel>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          {SERVICE_AREAS.map((area) => (
                            <FormField
                              key={area}
                              control={form.control}
                              name="serviceAreas"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={area}
                                    className="flex flex-row items-center space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(area)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, area])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== area
                                                )
                                              )
                                        }}
                                        data-testid={`checkbox-area-${area.toLowerCase().replace(' ', '-')}`}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal">
                                      {area}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 3: Company Description */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Company Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>About Your Company *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your company, experience, certifications, and what makes you stand out. This will be visible to potential customers."
                            className="h-32 resize-none placeholder:text-gray-400"
                            {...field}
                            data-testid="textarea-description"
                          />
                        </FormControl>
                        <div className="text-xs text-gray-500 mt-1">
                          {field.value?.length || 0}/500 characters (minimum 50 required)
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Review Process</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Your application will be reviewed within 2-3 business days</li>
                      <li>• We will verify your trade license and company information</li>
                      <li>• Once approved, you can start receiving service requests</li>
                      <li>• You'll receive an email notification upon approval</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex space-x-3">
              {currentStep > 1 && (
                <Button 
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="flex-1"
                  data-testid="button-previous"
                >
                  Previous
                </Button>
              )}
              
              {currentStep < totalSteps ? (
                <Button 
                  type="button"
                  onClick={nextStep}
                  className="flex-1"
                  data-testid="button-next"
                >
                  Next
                </Button>
              ) : (
                <Button 
                  type="submit"
                  disabled={onboardingMutation.isPending}
                  className="flex-1"
                  data-testid="button-submit"
                >
                  {onboardingMutation.isPending ? "Submitting..." : "Submit Application"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </main>

      <BottomNavigation />
    </div>
  );
}
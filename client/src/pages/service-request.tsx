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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select-fixed";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { BottomNavigation } from "@/components/bottom-navigation";
import { ArrowLeft, Camera } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertServiceRequestSchema, ServiceCategory, ServicePart } from "@shared/schema";
import { isUnauthorizedError } from "@/lib/authUtils";
import { z } from "zod";

const serviceRequestFormSchema = insertServiceRequestSchema.extend({
  preferredDate: z.string().optional(),
  contactPhone: z.string().min(1, "Contact phone number is required"),
  propertyType: z.string().min(1, "Property type is required"),
  emergencyLevel: z.string().min(1, "Emergency level is required"),
}).omit({
  customerId: true,
  createdAt: true,
  updatedAt: true,
  id: true,
});

type ServiceRequestForm = z.infer<typeof serviceRequestFormSchema>;

export default function ServiceRequest() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [match] = useRoute('/service-request');
  
  const urlParams = new URLSearchParams(window.location.search);
  const initialCategoryId = urlParams.get('categoryId');

  const form = useForm<ServiceRequestForm>({
    resolver: zodResolver(serviceRequestFormSchema),
    defaultValues: {
      categoryId: initialCategoryId || '',
      title: '',
      description: '',
      address: '',
      contactPhone: '',
      propertyType: '',
      emergencyLevel: 'normal',
      accessInstructions: '',
      priority: 'medium',
      status: 'pending',
    },
  });

  const selectedCategoryId = form.watch('categoryId');

  // Fetch service categories
  const { data: categories = [] } = useQuery<ServiceCategory[]>({
    queryKey: ['/api/categories'],
  });

  // Fetch parts for selected category
  const { data: parts = [] } = useQuery<ServicePart[]>({
    queryKey: ['/api/categories', selectedCategoryId, 'parts'],
    enabled: !!selectedCategoryId,
  });

  // Get selected category for display
  const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);

  // Service request creation mutation
  const createRequestMutation = useMutation({
    mutationFn: async (data: ServiceRequestForm) => {
      const payload = {
        ...data,
        preferredDate: data.preferredDate ? new Date(data.preferredDate) : undefined,
      };
      return await apiRequest('POST', '/api/service-requests', payload);
    },
    onSuccess: () => {
      toast({
        title: "Request Created",
        description: "Your service request has been submitted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/service-requests'] });
      navigate('/company-listings');
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
        description: "Failed to create service request",
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

  const onSubmit = (data: ServiceRequestForm) => {
    if (!selectedCategory) {
      toast({
        title: "Error",
        description: "Please select a service category",
        variant: "destructive",
      });
      return;
    }

    createRequestMutation.mutate(data);
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
          <h1 className="text-xl font-medium">
            {selectedCategory ? `${selectedCategory.name} Service` : 'Service Request'}
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 pb-20">
        <Card>
          <CardHeader>
            <CardTitle>Request Service</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="Select service category..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {parts.length > 0 && (
                  <FormField
                    control={form.control}
                    name="partId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specific Item/Part</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                          <FormControl>
                            <SelectTrigger data-testid="select-part">
                              <SelectValue placeholder="Select item..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {parts.map((part) => (
                              <SelectItem key={part.id} value={part.id}>
                                {part.name}
                              </SelectItem>
                            ))}
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Brief description of the service needed" 
                          {...field} 
                          className="placeholder:text-gray-400"
                          data-testid="input-title"
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
                      <FormLabel>Issue Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the problem in detail..."
                          className="h-20 resize-none placeholder:text-gray-400"
                          {...field}
                          data-testid="textarea-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Address</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Full address including building, area, emirate"
                          className="h-16 resize-none placeholder:text-gray-400"
                          {...field}
                          data-testid="textarea-address"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value || undefined}
                          className="grid grid-cols-2 gap-3 sm:flex sm:space-x-6"
                          data-testid="radio-property-type"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="apartment" id="apartment" />
                            <Label htmlFor="apartment">Apartment</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="villa" id="villa" />
                            <Label htmlFor="villa">Villa</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="house" id="house" />
                            <Label htmlFor="house">House</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="office" id="office" />
                            <Label htmlFor="office">Office</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone Number *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="+971 50 123 4567" 
                          {...field} 
                          className="placeholder:text-gray-400"
                          data-testid="input-contact-phone"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emergencyLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Level *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-4"
                          data-testid="radio-emergency-level"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="normal" id="normal" />
                            <Label htmlFor="normal">Normal</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="urgent" id="urgent" />
                            <Label htmlFor="urgent">Urgent</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="emergency" id="emergency" />
                            <Label htmlFor="emergency">Emergency</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accessInstructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Access Instructions</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="How can the technician access your property? (apartment number, building entrance, gate code, etc.)"
                          className="h-16 resize-none placeholder:text-gray-400"
                          {...field}
                          data-testid="textarea-access-instructions"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger data-testid="select-priority">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="preferredDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Date (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          data-testid="input-preferred-date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget (AED) (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Expected budget for this service"
                          {...field}
                          onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          value={field.value || ''}
                          data-testid="input-budget"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Photo Upload Section */}
                <div>
                  <Label className="text-sm font-medium">Upload Photos (Optional)</Label>
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center mt-2">
                    <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Tap to add photos of the issue</p>
                    <Input 
                      type="file" 
                      className="hidden" 
                      multiple 
                      accept="image/*"
                      data-testid="input-photos"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-blue-700"
                  disabled={createRequestMutation.isPending}
                  data-testid="button-submit-request"
                >
                  {createRequestMutation.isPending ? "Creating..." : "Find Service Providers"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  );
}

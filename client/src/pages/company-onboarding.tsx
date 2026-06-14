import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Upload, Building, FileText, MapPin, Wrench } from "lucide-react";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

const uaeAreas = [
  'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'
];

const serviceTypes = [
  'Plumbing', 'Electrical', 'AC & Cooling', 'Appliances', 'Cleaning', 'Painting'
];

export default function CompanyOnboarding() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  
  // Form data
  const [companyData, setCompanyData] = useState({
    legalName: '',
    licenseNumber: '',
    description: '',
    serviceAreas: [] as string[],
    serviceTypes: [] as string[],
    responseTime: '',
    phone: '',
    address: '',
  });
  
  const [licenseFile, setLicenseFile] = useState<File | null>(null);

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate('/company-dashboard');
    }
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleServiceAreaChange = (area: string, checked: boolean) => {
    if (checked) {
      setCompanyData(prev => ({
        ...prev,
        serviceAreas: [...prev.serviceAreas, area]
      }));
    } else {
      setCompanyData(prev => ({
        ...prev,
        serviceAreas: prev.serviceAreas.filter(a => a !== area)
      }));
    }
  };

  const handleServiceTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setCompanyData(prev => ({
        ...prev,
        serviceTypes: [...prev.serviceTypes, type]
      }));
    } else {
      setCompanyData(prev => ({
        ...prev,
        serviceTypes: prev.serviceTypes.filter(t => t !== type)
      }));
    }
  };

  const companyRegistrationMutation = useMutation({
    mutationFn: async (data: typeof companyData & { licenseFile?: File }) => {
      const formData = new FormData();
      formData.append('legalName', data.legalName);
      formData.append('licenseNumber', data.licenseNumber);
      formData.append('description', data.description);
      formData.append('serviceAreas', JSON.stringify(data.serviceAreas));
      formData.append('serviceTypes', JSON.stringify(data.serviceTypes));
      formData.append('responseTime', data.responseTime);
      formData.append('phone', data.phone);
      formData.append('address', data.address);
      
      if (data.licenseFile) {
        formData.append('tradeLicense', data.licenseFile);
      }
      
      return await apiRequest('POST', '/api/company/register', formData);
    },
    onSuccess: () => {
      toast({
        title: "Registration Submitted",
        description: "Your company profile has been submitted for review. You'll be notified once approved.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/company/profile'] });
      navigate('/company-dashboard');
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Please log in to continue.",
          variant: "destructive",
        });
        window.location.href = "/auth";
        return;
      }
      toast({
        title: "Registration Failed",
        description: "Failed to submit company registration. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!companyData.legalName || !companyData.licenseNumber || !licenseFile || 
        companyData.serviceAreas.length === 0 || companyData.serviceTypes.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and upload your trade license.",
        variant: "destructive",
      });
      return;
    }

    companyRegistrationMutation.mutate({
      ...companyData,
      licenseFile
    });
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return companyData.legalName && companyData.licenseNumber && licenseFile;
      case 2:
        return companyData.serviceAreas.length > 0 && companyData.serviceTypes.length > 0;
      case 3:
        return companyData.description && companyData.responseTime;
      default:
        return false;
    }
  };

  return (
    <div className="max-w-sm mx-auto bg-surface min-h-screen">
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
          <div>
            <h1 className="text-xl font-medium">Company Registration</h1>
            <p className="text-sm opacity-90">Step {step} of 3</p>
          </div>
        </div>
      </header>

      <div className="p-4">
        {/* Progress Bar */}
        <div className="mb-6">
          <Progress value={(step / 3) * 100} className="w-full" />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Legal Info</span>
            <span>Services</span>
            <span>Details</span>
          </div>
        </div>

        {/* Step 1: Legal Information */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>Legal Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="legal-name">Company Legal Name *</Label>
                <Input
                  id="legal-name"
                  value={companyData.legalName}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, legalName: e.target.value }))}
                  placeholder="Enter your company's legal name"
                  data-testid="input-legal-name"
                />
              </div>

              <div>
                <Label htmlFor="license-number">Trade License Number *</Label>
                <Input
                  id="license-number"
                  value={companyData.licenseNumber}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, licenseNumber: e.target.value }))}
                  placeholder="Enter your trade license number"
                  data-testid="input-license-number"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={companyData.phone}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+971 XX XXX XXXX"
                  data-testid="input-phone"
                />
              </div>

              <div>
                <Label htmlFor="address">Business Address</Label>
                <Textarea
                  id="address"
                  value={companyData.address}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter your business address"
                  rows={3}
                  data-testid="textarea-address"
                />
              </div>

              <div>
                <Label>Upload Trade License *</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setLicenseFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="license-upload"
                  />
                  <label htmlFor="license-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      {licenseFile ? licenseFile.name : 'Click to upload trade license'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PDF or Image files only</p>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Service Areas & Types */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Service Coverage</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium">Service Areas in UAE *</Label>
                <p className="text-sm text-gray-600 mb-3">Select the areas where you provide services</p>
                <div className="space-y-2">
                  {uaeAreas.map((area) => (
                    <div key={area} className="flex items-center space-x-2">
                      <Checkbox
                        id={`area-${area}`}
                        checked={companyData.serviceAreas.includes(area)}
                        onCheckedChange={(checked) => 
                          handleServiceAreaChange(area, checked as boolean)
                        }
                        data-testid={`checkbox-area-${area.toLowerCase().replace(/\s+/g, '-')}`}
                      />
                      <Label htmlFor={`area-${area}`} className="text-sm">
                        {area}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">Service Types *</Label>
                <p className="text-sm text-gray-600 mb-3">Select the services you provide</p>
                <div className="space-y-2">
                  {serviceTypes.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`service-${type}`}
                        checked={companyData.serviceTypes.includes(type)}
                        onCheckedChange={(checked) => 
                          handleServiceTypeChange(type, checked as boolean)
                        }
                        data-testid={`checkbox-service-${type.toLowerCase().replace(/\s+/g, '-')}`}
                      />
                      <Label htmlFor={`service-${type}`} className="text-sm">
                        {type}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Additional Details */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Company Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="description">Company Description *</Label>
                <Textarea
                  id="description"
                  value={companyData.description}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your company, experience, and what makes you unique"
                  rows={4}
                  data-testid="textarea-description"
                />
              </div>

              <div>
                <Label htmlFor="response-time">Typical Response Time *</Label>
                <Select
                  value={companyData.responseTime}
                  onValueChange={(value) => setCompanyData(prev => ({ ...prev, responseTime: value }))}
                >
                  <SelectTrigger data-testid="select-response-time">
                    <SelectValue placeholder="Select response time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-2 hours">1-2 hours</SelectItem>
                    <SelectItem value="2-4 hours">2-4 hours</SelectItem>
                    <SelectItem value="4-8 hours">4-8 hours</SelectItem>
                    <SelectItem value="Same day">Same day</SelectItem>
                    <SelectItem value="Next day">Next day</SelectItem>
                    <SelectItem value="2-3 days">2-3 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Review Process</h4>
                <p className="text-sm text-blue-700">
                  Your application will be reviewed within 2-3 business days. We'll verify your trade license 
                  and contact information before approving your account.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
            data-testid="button-previous"
          >
            Previous
          </Button>
          
          {step < 3 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              data-testid="button-next"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || companyRegistrationMutation.isPending}
              data-testid="button-submit"
            >
              {companyRegistrationMutation.isPending ? 'Submitting...' : 'Submit for Review'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Users, ArrowRight, Shield, CheckCircle } from "lucide-react";

export default function CompanyRegister() {
  const handleCompanySignup = () => {
    window.location.href = "/auth?role=company";
  };

  const handleBackToHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="max-w-sm mx-auto bg-surface min-h-screen">
      {/* Header */}
      <header className="bg-primary text-white px-4 py-6 text-center">
        <Building className="h-12 w-12 mx-auto mb-3" />
        <h1 className="text-2xl font-bold mb-2">Join as a Company</h1>
        <p className="text-sm opacity-90">Connect with customers across the UAE</p>
      </header>

      <div className="p-4 space-y-6">
        {/* Benefits Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Why Join FixConnect?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <Users className="h-5 w-5 text-blue-600 mt-1" />
              <div>
                <h4 className="font-medium">Access Customers</h4>
                <p className="text-sm text-gray-600">Connect with homeowners looking for your services</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-green-600 mt-1" />
              <div>
                <h4 className="font-medium">Verified Platform</h4>
                <p className="text-sm text-gray-600">Build trust with verified business credentials</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-purple-600 mt-1" />
              <div>
                <h4 className="font-medium">Grow Your Business</h4>
                <p className="text-sm text-gray-600">Manage jobs, quotes, and customer relationships</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requirements Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span>Valid UAE trade license</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span>Business registration documents</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span>Professional service experience</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span>UAE business address</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Registration Process */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Registration Process</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center font-bold">1</div>
                <span className="text-sm">Create account and verify identity</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center font-bold">2</div>
                <span className="text-sm">Upload trade license and business details</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center font-bold">3</div>
                <span className="text-sm">Wait for verification (2-3 business days)</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full text-xs flex items-center justify-center font-bold">4</div>
                <span className="text-sm">Start receiving job requests</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleCompanySignup}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 font-semibold"
            data-testid="button-register-company"
          >
            Register as Company
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          
          <Button
            variant="outline"
            onClick={handleBackToHome}
            className="w-full"
            data-testid="button-back-home"
          >
            Back to Home
          </Button>
        </div>

        {/* Legal Notice */}
        <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-600">
          <p className="font-medium mb-2">Important Notice:</p>
          <p>
            By registering as a company, you agree to provide accurate business information 
            and maintain valid licenses throughout your participation on the platform. 
            False information may result in account suspension.
          </p>
        </div>
      </div>
    </div>
  );
}
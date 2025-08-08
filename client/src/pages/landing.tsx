import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, Shield, Clock, Star, MapPin, Phone } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-white px-4 py-6">
        <div className="max-w-sm mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Wrench className="h-8 w-8" />
              <h1 className="text-2xl font-bold">FixConnect</h1>
            </div>
            <Button 
              onClick={handleLogin}
              variant="secondary"
              size="sm"
              data-testid="button-login"
            >
              Login
            </Button>
          </div>
          <p className="text-blue-100 text-lg text-center">
            UAE's Premier Home Maintenance Platform
          </p>
        </div>
      </header>

      {/* Hero Section */}
      <div className="px-4 py-8 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-sm mx-auto text-center">
          <div className="mb-6">
            <img
              src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400"
              alt="Professional UAE maintenance service"
              className="w-full h-48 object-cover rounded-xl shadow-lg"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Connect with Certified Professionals
          </h2>
          <p className="text-gray-600 mb-6">
            Get your home maintenance needs handled by trusted, verified companies across the UAE
          </p>
          <Button 
            onClick={handleLogin}
            size="lg" 
            className="w-full bg-primary hover:bg-blue-700"
            data-testid="button-get-started"
          >
            Get Started
          </Button>
        </div>
      </div>

      {/* Features */}
      <div className="px-4 py-8">
        <div className="max-w-sm mx-auto">
          <h3 className="text-xl font-bold text-center mb-6">Why Choose FixConnect?</h3>
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="h-6 w-6 text-success mt-1" />
                  <div>
                    <h4 className="font-semibold">Verified Professionals</h4>
                    <p className="text-sm text-gray-600">
                      All maintenance companies are licensed and verified
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Clock className="h-6 w-6 text-accent mt-1" />
                  <div>
                    <h4 className="font-semibold">Fast Response</h4>
                    <p className="text-sm text-gray-600">
                      Get quotes within hours, not days
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Star className="h-6 w-6 text-accent mt-1" />
                  <div>
                    <h4 className="font-semibold">Quality Guaranteed</h4>
                    <p className="text-sm text-gray-600">
                      Rated by real customers, quality assured
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-6 w-6 text-secondary mt-1" />
                  <div>
                    <h4 className="font-semibold">UAE-Wide Coverage</h4>
                    <p className="text-sm text-gray-600">
                      Serving all emirates with local expertise
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="px-4 py-8 bg-gray-50">
        <div className="max-w-sm mx-auto">
          <h3 className="text-xl font-bold text-center mb-6">Our Services</h3>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">🔧</div>
                <h4 className="font-semibold mb-1">Plumbing</h4>
                <p className="text-xs text-gray-600">Pipes, faucets, drains</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">⚡</div>
                <h4 className="font-semibold mb-1">Electrical</h4>
                <p className="text-xs text-gray-600">Wiring, outlets, lights</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">❄️</div>
                <h4 className="font-semibold mb-1">AC & Cooling</h4>
                <p className="text-xs text-gray-600">Air conditioning, fans</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">📺</div>
                <h4 className="font-semibold mb-1">Appliances</h4>
                <p className="text-xs text-gray-600">TV, washing machine</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 py-8">
        <div className="max-w-sm mx-auto text-center">
          <h3 className="text-xl font-bold mb-3">Ready to Get Started?</h3>
          <p className="text-gray-600 mb-6">
            Join thousands of satisfied homeowners who trust FixConnect
          </p>
          <Button 
            onClick={handleLogin}
            size="lg" 
            className="w-full bg-success hover:bg-green-600"
            data-testid="button-join-now"
          >
            Join Now - It's Free!
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white px-4 py-8">
        <div className="max-w-sm mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Wrench className="h-6 w-6" />
            <span className="text-lg font-semibold">FixConnect</span>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Connecting UAE homeowners with trusted maintenance professionals
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center space-x-1">
              <Phone className="h-4 w-4" />
              <span>+971-XX-XXXXXX</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>UAE</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

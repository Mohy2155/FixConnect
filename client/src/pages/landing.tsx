import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, Shield, Clock, Star, MapPin, Phone, Home, Building2, Users, Zap, CheckCircle } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '@/components/language-selector';

export default function Landing() {
  const { t } = useTranslation();
  
  const handleHomeownerLogin = () => {
    window.location.href = "/auth";
  };

  const handleCompanyLogin = () => {
    window.location.href = "/auth";
  };

  return (
        <div className="min-h-screen bg-background">
          {/* Header */}
          <header className="bg-blue-600 text-white px-4 py-6">
            <div className="max-w-sm mx-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <Wrench className="h-8 w-8 text-white" />
                  <h1 className="text-2xl font-bold text-white">{t('app.name')}</h1>
                </div>
                <div className="text-white">
                  <LanguageSelector variant="button" size="sm" />
                </div>
              </div>
              <p className="text-white text-lg text-center font-medium">{t('app.tagline')}</p>
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
            {t('landing.hero_title')}
          </h2>
          <p className="text-gray-600 mb-8">
            {t('landing.hero_subtitle')}
          </p>

          {/* User Type Selection */}
          <div className="space-y-4">
            <Card className="p-1 hover:shadow-lg transition-shadow cursor-pointer" onClick={handleHomeownerLogin}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Home className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1 text-left rtl:text-right">
                    <h3 className="font-semibold text-gray-900">{t('landing.homeowner_card.title')}</h3>
                    <p className="text-sm text-gray-600">{t('landing.homeowner_card.subtitle')}</p>
                  </div>
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">→</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-1 hover:shadow-lg transition-shadow cursor-pointer" onClick={handleCompanyLogin}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1 text-left rtl:text-right">
                    <h3 className="font-semibold text-gray-900">{t('landing.company_card.title')}</h3>
                    <p className="text-sm text-gray-600">{t('landing.company_card.subtitle')}</p>
                  </div>
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">→</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Features for Both User Types */}
      <div className="px-4 py-8 bg-gray-50">
        <div className="max-w-sm mx-auto">
          <h3 className="text-xl font-bold text-center mb-6">
            {t('landing.why_choose')}
          </h3>

          {/* Homeowner Benefits */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
              <Home className="h-5 w-5 text-blue-600" />
              <h4 className="font-semibold text-blue-900">{t('landing.homeowner_benefits.title')}</h4>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Verified Professionals</p>
                  <p className="text-xs text-gray-600">Licensed & certified companies only</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Fast Response</p>
                  <p className="text-xs text-gray-600">Get multiple quotes within hours</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Quality Guaranteed</p>
                  <p className="text-xs text-gray-600">Rated by real customers</p>
                </div>
              </div>
            </div>
          </div>

          {/* Company Benefits */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Building2 className="h-5 w-5 text-green-600" />
              <h4 className="font-semibold text-green-900">For Service Companies</h4>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">More Customers</p>
                  <p className="text-xs text-gray-600">Access to homeowners across UAE</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Easy Management</p>
                  <p className="text-xs text-gray-600">Simple quote and job tracking</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Grow Your Business</p>
                  <p className="text-xs text-gray-600">Build reputation with reviews</p>
                </div>
              </div>
            </div>
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

            <Card className="col-span-2">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">✨</div>
                <h4 className="font-semibold mb-1">And More!</h4>
                <p className="text-xs text-gray-600">Painting, cleaning, carpentry, and many other services</p>
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
            Join the UAE's fastest-growing maintenance network
          </p>
          <div className="space-y-3">
            <Button
              onClick={handleHomeownerLogin}
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700"
              data-testid="button-homeowner-signup"
            >
              Join as Homeowner - Free!
            </Button>
            <Button
              onClick={handleCompanyLogin}
              size="lg"
              variant="outline"
              className="w-full border-green-600 text-green-600 hover:bg-green-50"
              data-testid="button-company-signup"
            >
              Register Your Company
            </Button>
          </div>
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

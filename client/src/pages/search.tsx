import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select-fixed";
import { Badge } from "@/components/ui/badge";
import { BottomNavigation } from "@/components/bottom-navigation";
import { ServiceCategories } from "@/components/service-categories";
import { CompanyCard } from "@/components/company-card";
import { ArrowLeft, Search as SearchIcon, Filter, MapPin, Star } from "lucide-react";
import { useLocation } from "wouter";
import { ServiceCategory, Company } from "@shared/schema";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Search() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [sortBy, setSortBy] = useState<'rating' | 'distance' | 'price'>('rating');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch service categories
  const { data: categories = [] } = useQuery<ServiceCategory[]>({
    queryKey: ['/api/categories'],
  });

  // Fetch all companies from API
  const { data: companies = [], isLoading: companiesLoading } = useQuery<Company[]>({
    queryKey: ['/api/companies'],
  });

  // Mock companies data for search results
  const mockCompanies = [
    {
      id: 'company-1',
      userId: 'user-1',
      name: 'Al Waha Plumbing Services',
      description: 'Certified plumbing specialists with 15+ years experience in UAE',
      logo: null,
      licenseNumber: 'PL-2023-001',
      isVerified: true,
      rating: '4.8',
      reviewCount: 127,
      responseTime: '2-4 hours',
      serviceAreas: ['Dubai', 'Sharjah'],
      specialties: ['Plumbing', 'Water Heater', 'Pipe Repair'],
      createdAt: new Date(),
      updatedAt: new Date(),
      distance: '3.2 km away',
      estimatedPrice: 'AED 380-520',
    },
    {
      id: 'company-2',
      userId: 'user-2', 
      name: 'Dubai Fix Masters',
      description: 'Premium home maintenance services across Dubai and Abu Dhabi',
      logo: null,
      licenseNumber: 'PL-2023-002',
      isVerified: true,
      rating: '4.9',
      reviewCount: 89,
      responseTime: '1-2 hours',
      serviceAreas: ['Dubai', 'Abu Dhabi'],
      specialties: ['Emergency Repairs', 'Premium Service', 'All Maintenance'],
      createdAt: new Date(),
      updatedAt: new Date(),
      distance: '1.8 km away',
      estimatedPrice: 'AED 420-580',
    },
    {
      id: 'company-3',
      userId: 'user-3',
      name: 'Emirates Electrical Solutions',
      description: 'Licensed electrical contractors serving all of UAE with electrical installations and repairs',
      logo: null,
      licenseNumber: 'EL-2023-003',
      isVerified: true,
      rating: '4.7',
      reviewCount: 156,
      responseTime: '3-5 hours',
      serviceAreas: ['Dubai', 'Sharjah', 'Ajman'],
      specialties: ['Electrical', 'Wiring', 'Circuit Breakers', 'Lighting Installation'],
      createdAt: new Date(),
      updatedAt: new Date(),
      distance: '4.5 km away',
      estimatedPrice: 'AED 250-400',
    },
  ];

  const uaeAreas = [
    'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'
  ];

  const handleBack = () => {
    navigate('/');
  };

  const handleContactCompany = (companyId: string) => {
    navigate(`/messages?companyId=${companyId}`);
  };

  const handleRequestQuote = (companyId: string) => {
    navigate(`/service-request?companyId=${companyId}`);
  };

  const handleCategorySelect = (category: any) => {
    setSelectedCategory(category.id);
  };

  const handleSearch = () => {
    // Search is implemented through filtering - no additional action needed
    // The filteredCompanies and sortedCompanies already handle the search
  };

  // Universal search function that matches any text across all company fields
  const filteredCompanies = companies.filter(company => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    const searchableText = [
      company.name,
      company.description || '',
      company.licenseNumber,
      ...(company.serviceAreas || []),
      ...(company.specialties || [])
    ].join(' ').toLowerCase();
    
    return searchableText.includes(query);
  }).filter(company => {
    // Area filtering
    if (selectedArea && selectedArea !== 'all-areas') {
      return company.serviceAreas?.includes(selectedArea);
    }
    return true;
  }).filter(company => {
    // Category filtering
    if (selectedCategory && selectedCategory !== 'all') {
      const category = categories.find(cat => cat.id === selectedCategory);
      if (category) {
        const categoryName = category.name.toLowerCase();
        const companyText = [
          company.name,
          company.description || '',
          ...(company.specialties || [])
        ].join(' ').toLowerCase();
        return companyText.includes(categoryName);
      }
    }
    return true;
  });

  // Sort companies
  const sortedCompanies = [...filteredCompanies].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return (Number(b.rating) || 0) - (Number(a.rating) || 0);
      case 'distance':
        // Sort by name if no distance data
        return a.name.localeCompare(b.name);
      case 'price':
        // Sort by name if no price data
        return a.name.localeCompare(b.name);
      default:
        return a.name.localeCompare(b.name);
    }
  });

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
          <h1 className="text-xl font-medium">Find Services</h1>
        </div>
      </header>

      {/* Search Section */}
      <div className="p-4 bg-surface border-b border-gray-100">
        <div className="space-y-3">
          <div className="flex space-x-2">
            <Input
              placeholder="Search for services or companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
              data-testid="input-search"
            />
            <Button 
              onClick={handleSearch}
              data-testid="button-search"
            >
              <SearchIcon className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex space-x-2">
            <Select value={selectedArea} onValueChange={setSelectedArea}>
              <SelectTrigger className="flex-1" data-testid="select-area">
                <SelectValue placeholder="All Areas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-areas">All Areas</SelectItem>
                {uaeAreas.map((area) => (
                  <SelectItem key={area} value={area}>
                    {area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              data-testid="button-toggle-filters"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {showFilters && (
            <Card>
              <CardContent className="p-3">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Sort by:</label>
                    <Select value={sortBy} onValueChange={(value: 'rating' | 'distance' | 'price') => setSortBy(value)}>
                      <SelectTrigger data-testid="select-sort">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rating">
                          <div className="flex items-center space-x-2">
                            <Star className="h-4 w-4" />
                            <span>Rating</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="distance">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <span>Distance</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="price">Price</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Filters:</label>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="cursor-pointer">
                        Verified Only
                      </Badge>
                      <Badge variant="outline" className="cursor-pointer">
                        Emergency Service
                      </Badge>
                      <Badge variant="outline" className="cursor-pointer">
                        Same Day Service
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="p-4 pb-20">
        {/* Service Categories */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Browse by Category</h3>
          <ServiceCategories
            categories={categories}
            onCategorySelect={handleCategorySelect}
          />
        </div>

        {/* Search Results */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">
              {searchQuery || selectedArea || selectedCategory 
                ? `Search Results (${sortedCompanies.length})`
                : `Featured Companies (${sortedCompanies.length})`
              }
            </h3>
          </div>

          {companiesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : sortedCompanies.length > 0 ? (
            <div className="space-y-3">
              {sortedCompanies.map((company) => (
                <CompanyCard
                  key={company.id}
                  company={company}
                  onRequestQuote={handleRequestQuote}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria or browse by category
                </p>
                <Button 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('');
                    setSelectedArea('');
                  }}
                  data-testid="button-clear-filters"
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/service-request')}
                data-testid="button-emergency-service"
              >
                🚨 Emergency Service Request
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/service-request')}
                data-testid="button-schedule-maintenance"
              >
                📅 Schedule Maintenance
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/service-request')}
                data-testid="button-get-quote"
              >
                💰 Get Multiple Quotes
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  );
}

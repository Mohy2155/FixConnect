import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Stars } from "@/components/ui/stars";
import { BottomNavigation } from "@/components/bottom-navigation";
import { ArrowLeft, MapPin, Clock, Calendar, DollarSign, MessageCircle } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { ServiceRequest } from "@shared/schema";

export default function JobDetails() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [match, params] = useRoute('/jobs/:id');

  const jobId = params?.id;

  // Fetch job details
  const { data: job, isLoading } = useQuery<ServiceRequest>({
    queryKey: ['/api/service-requests', jobId],
    enabled: !!jobId,
  });

  // Mock job data with additional details
  const mockJobDetails = {
    id: jobId,
    title: 'Kitchen Sink Replacement',
    description: 'The kitchen sink is leaking and needs to be replaced. The faucet is also making strange noises.',
    status: 'in_progress',
    companyName: 'Al Waha Plumbing Services',
    companyRating: 4.8,
    companyReviews: 127,
    estimatedPrice: 'AED 450',
    actualPrice: 'AED 450',
    progress: 75,
    propertyType: 'apartment',
    address: 'Building 123, Dubai Marina, Dubai',
    preferredDate: '2025-01-10',
    priority: 'medium',
    createdAt: '2025-01-08T10:00:00Z',
    estimatedCompletion: '2-3 hours',
    warranty: '1 year on parts, 6 months on labor',
    timeline: [
      {
        status: 'Request Submitted',
        date: '2025-01-08 10:00 AM',
        completed: true,
      },
      {
        status: 'Quote Approved',
        date: '2025-01-08 02:30 PM', 
        completed: true,
      },
      {
        status: 'Technician Assigned',
        date: '2025-01-09 09:00 AM',
        completed: true,
      },
      {
        status: 'Work in Progress',
        date: '2025-01-10 10:00 AM',
        completed: true,
      },
      {
        status: 'Work Completed',
        date: 'In Progress...',
        completed: false,
      },
    ],
  };

  const handleBack = () => {
    navigate('/jobs');
  };

  const handleMessage = () => {
    navigate(`/messages?jobId=${jobId}`);
  };

  const handleRateService = () => {
    toast({
      title: "Rating Service",
      description: "Rating feature coming soon!",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Loading job details...</p>
        </div>
      </div>
    );
  }

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    quoted: "bg-blue-100 text-blue-800",
    approved: "bg-green-100 text-green-800", 
    in_progress: "bg-accent text-white",
    completed: "bg-success text-white",
    cancelled: "bg-gray-100 text-gray-800",
  };

  const statusLabels = {
    pending: "Pending",
    quoted: "Quoted",
    approved: "Approved",
    in_progress: "In Progress", 
    completed: "Completed",
    cancelled: "Cancelled",
  };

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
          <h1 className="text-xl font-medium">Job Details</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 pb-20 space-y-4">
        {/* Job Overview */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg" data-testid="text-job-title">
                  {mockJobDetails.title}
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Job ID: {jobId}
                </p>
              </div>
              <Badge 
                className={statusColors[mockJobDetails.status as keyof typeof statusColors]}
                data-testid="badge-job-status"
              >
                {statusLabels[mockJobDetails.status as keyof typeof statusLabels]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-700" data-testid="text-job-description">
              {mockJobDetails.description}
            </p>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span data-testid="text-job-address">{mockJobDetails.address}</span>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Created: {new Date(mockJobDetails.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Service Provider</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium" data-testid="text-company-name">
                  {mockJobDetails.companyName}
                </h4>
                <Stars 
                  rating={mockJobDetails.companyRating} 
                  size="sm" 
                  showNumber 
                  reviewCount={mockJobDetails.companyReviews}
                  className="mt-1"
                />
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleMessage}
                data-testid="button-message-company"
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                Message
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Progress */}
        {mockJobDetails.status === 'in_progress' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Work Progress</span>
                  <span className="font-medium" data-testid="text-progress-percentage">
                    {mockJobDetails.progress}%
                  </span>
                </div>
                <Progress 
                  value={mockJobDetails.progress} 
                  className="h-3"
                  data-testid="progress-bar"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Estimated completion: {mockJobDetails.estimatedCompletion}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockJobDetails.timeline.map((item, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-3 h-3 rounded-full mt-1 ${
                    item.completed ? 'bg-success' : 'bg-gray-300'
                  }`}></div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      item.completed ? 'text-gray-900' : 'text-gray-500'
                    }`} data-testid={`text-timeline-status-${index}`}>
                      {item.status}
                    </p>
                    <p className="text-xs text-gray-500" data-testid={`text-timeline-date-${index}`}>
                      {item.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cost Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Part Cost</span>
                <span>AED 280.00</span>
              </div>
              <div className="flex justify-between">
                <span>Labor Cost</span>
                <span>AED 120.00</span>
              </div>
              <div className="flex justify-between">
                <span>Service Fee</span>
                <span>AED 50.00</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-primary" data-testid="text-total-cost">
                  {mockJobDetails.actualPrice}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Warranty Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Warranty</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700" data-testid="text-warranty">
              {mockJobDetails.warranty}
            </p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {mockJobDetails.status === 'completed' && (
          <div className="space-y-3">
            <Button 
              className="w-full bg-accent hover:bg-orange-600"
              onClick={handleRateService}
              data-testid="button-rate-service"
            >
              Rate This Service
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleMessage}
              data-testid="button-contact-support"
            >
              Contact Support
            </Button>
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}

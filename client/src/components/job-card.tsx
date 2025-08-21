import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Stars } from "@/components/ui/stars";
import { Progress } from "@/components/ui/progress";
import { ServiceRequest } from "@shared/schema";

interface JobCardProps {
  job: ServiceRequest & {
    companyName?: string;
    companyRating?: number;
    estimatedPrice?: string;
    progress?: number;
  };
  onViewDetails: (jobId: string) => void;
  onRateService?: (jobId: string) => void;
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

export function JobCard({ job, onViewDetails, onRateService }: JobCardProps) {
  const showProgress = job.status === 'in_progress' && job.progress !== undefined;
  const showRateButton = job.status === 'completed' && onRateService;
  
  return (
    <Card className="mb-3" data-testid={`card-job-${job.id}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h4 className="font-medium text-gray-800" data-testid={`text-job-title-${job.id}`}>
              {job.title}
            </h4>
            {job.companyName && (
              <p className="text-sm text-gray-500" data-testid={`text-company-name-${job.id}`}>
                {job.companyName}
              </p>
            )}
          </div>
          {job.companyRating && (
            <Stars 
              rating={job.companyRating} 
              size="sm" 
              showNumber 
              className="ml-2"
            />
          )}
        </div>
        
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center space-x-2">
            <Badge 
              className={job.status ? statusColors[job.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800" : "bg-gray-100 text-gray-800"}
              data-testid={`badge-status-${job.id}`}
            >
              {job.status ? statusLabels[job.status as keyof typeof statusLabels] || job.status : "Unknown"}
            </Badge>
            {job.estimatedPrice && (
              <span className="text-sm font-medium text-gray-800" data-testid={`text-price-${job.id}`}>
                {job.estimatedPrice}
              </span>
            )}
          </div>
          
          <div className="flex space-x-2">
            {showRateButton ? (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onRateService(job.id)}
                data-testid={`button-rate-service-${job.id}`}
              >
                Rate Service
              </Button>
            ) : (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onViewDetails(job.id)}
                data-testid={`button-view-details-${job.id}`}
              >
                View Details
              </Button>
            )}
          </div>
        </div>

        {showProgress && (
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span data-testid={`text-progress-${job.id}`}>{job.progress}%</span>
            </div>
            <Progress 
              value={job.progress} 
              className="h-2"
              data-testid={`progress-bar-${job.id}`}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import ServiceRequest from "@/pages/service-request";
import CompanyListings from "@/pages/company-listings";
import JobDetails from "@/pages/job-details";
import Jobs from "@/pages/jobs";
import Messages from "@/pages/messages";
import Search from "@/pages/search";
import Profile from "@/pages/profile";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/service-request" component={ServiceRequest} />
          <Route path="/company-listings" component={CompanyListings} />
          <Route path="/jobs" component={Jobs} />
          <Route path="/jobs/:id" component={JobDetails} />
          <Route path="/messages" component={Messages} />
          <Route path="/search" component={Search} />
          <Route path="/profile" component={Profile} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

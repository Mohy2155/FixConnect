import { Switch, Route } from "wouter";
import { useEffect } from "react";
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
import CompanyDashboard from "@/pages/company-dashboard";
import CompanyOnboarding from "@/pages/company-onboarding";

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
          <Route path="/company-dashboard" component={CompanyDashboard} />
          <Route path="/company-onboarding" component={CompanyOnboarding} />
          <Route path="/profile" component={Profile} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Alternative approach: Use JavaScript to fix z-index issues
  useEffect(() => {
    const fixDropdownZIndex = () => {
      // Force all dropdown and tooltip elements to highest z-index
      const selectors = [
        '[data-radix-select-content]',
        '[data-radix-popper-content-wrapper]',
        '[data-radix-tooltip-content]',
        '[data-radix-dialog-content]',
        '[data-radix-portal]'
      ];
      
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          const htmlElement = element as HTMLElement;
          htmlElement.style.zIndex = '2147483647';
          htmlElement.style.position = 'fixed';
          htmlElement.style.isolation = 'isolate';
        });
      });
    };

    // Apply fix on initial load
    fixDropdownZIndex();
    
    // Apply fix on DOM changes
    const observer = new MutationObserver(fixDropdownZIndex);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true
    });

    return () => observer.disconnect();
  }, []);

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

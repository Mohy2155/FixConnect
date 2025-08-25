import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { 
  insertServiceRequestSchema,
  insertQuoteSchema,
  insertReviewSchema,
  insertMessageSchema,
  insertCompanySchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Initialize default data
  app.get('/api/init', async (req, res) => {
    try {
      // Check if categories already exist
      const existingCategories = await storage.getServiceCategories();
      if (existingCategories.length > 0) {
        return res.json({ message: 'Already initialized' });
      }

      // Create default service categories
      const categories = [
        {
          name: 'Plumbing',
          icon: 'fas fa-faucet',
          color: '#1976D2',
          description: 'Pipes, faucets, drains'
        },
        {
          name: 'Electrical',
          icon: 'fas fa-bolt', 
          color: '#FF9800',
          description: 'Wiring, outlets, lights'
        },
        {
          name: 'AC & Cooling',
          icon: 'fas fa-snowflake',
          color: '#00796B',
          description: 'Air conditioning, fans'
        },
        {
          name: 'Appliances',
          icon: 'fas fa-tv',
          color: '#1976D2',
          description: 'TV, washing machine'
        }
      ];

      for (const category of categories) {
        const createdCategory = await storage.createServiceCategory(category);
        
        // Create default parts for each category
        const parts = category.name === 'Plumbing' 
          ? ['Kitchen Sink', 'Bathroom Sink', 'Shower Head', 'Toilet', 'Faucet', 'Water Heater', 'Pipes']
          : category.name === 'Electrical'
          ? ['Light Fixtures', 'Outlets', 'Switches', 'Ceiling Fans', 'Circuit Breakers']
          : category.name === 'AC & Cooling'
          ? ['Central AC Unit', 'Window AC', 'Ceiling Fan', 'Exhaust Fan']
          : ['Television', 'Washing Machine', 'Refrigerator', 'Dishwasher', 'Microwave'];

        for (const partName of parts) {
          await storage.createServicePart({
            categoryId: createdCategory.id,
            name: partName,
            description: `${partName} repair and replacement`
          });
        }
      }

      res.json({ message: 'Initialized successfully' });
    } catch (error) {
      console.error('Initialization error:', error);
      res.status(500).json({ message: 'Failed to initialize' });
    }
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Also get company profile if user is a company
      let company = null;
      if (user.role === 'company') {
        company = await storage.getCompanyByUserId(userId);
      }
      
      res.json({ ...user, company });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user role
  app.patch('/api/auth/user/role', isAuthenticated, async (req: any, res) => {
    try {
      const { role } = req.body;
      const userId = req.session.userId;
      
      if (!['homeowner', 'company'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
      }
      
      // Get current user data
      const currentUser = await storage.getUser(userId);
      if (!currentUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Update user role in database via upsert
      await storage.upsertUser({
        ...currentUser,
        role,
      });
      
      // Update session
      req.session.userRole = role;
      
      res.json({ message: 'Role updated successfully' });
    } catch (error) {
      console.error('Error updating user role:', error);
      res.status(500).json({ message: 'Failed to update role' });
    }
  });

  // Update user profile
  app.put('/api/users/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.params.id;
      const authenticatedUserId = req.session.userId;
      
      // Ensure user can only update their own profile
      if (userId !== authenticatedUserId) {
        return res.status(403).json({ message: 'Forbidden: Can only update your own profile' });
      }
      
      const { firstName, lastName, phone, address } = req.body;
      
      // Get current user data to preserve other fields
      const currentUser = await storage.getUser(userId);
      if (!currentUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Update user profile in database via upsert
      const updatedUser = await storage.upsertUser({
        id: userId,
        email: currentUser.email,
        role: currentUser.role,
        firstName: firstName || currentUser.firstName,
        lastName: lastName || currentUser.lastName,
        phone: phone || currentUser.phone,
        address: address || currentUser.address,
        profileImageUrl: currentUser.profileImageUrl,
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ message: 'Failed to update profile' });
    }
  });

  // Service Categories
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getServiceCategories();
      res.json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ message: 'Failed to fetch categories' });
    }
  });

  app.get('/api/categories/:categoryId/parts', async (req, res) => {
    try {
      const { categoryId } = req.params;
      const parts = await storage.getServicePartsByCategory(categoryId);
      res.json(parts);
    } catch (error) {
      console.error('Error fetching parts:', error);
      res.status(500).json({ message: 'Failed to fetch parts' });
    }
  });

  // Companies
  app.get('/api/companies', async (req, res) => {
    try {
      const { categoryId } = req.query;
      let companies;
      if (categoryId) {
        companies = await storage.getCompaniesByServiceCategory(categoryId as string);
      } else {
        // Return all verified companies
        companies = await storage.getCompaniesByServiceCategory('');
      }
      res.json(companies);
    } catch (error) {
      console.error('Error fetching companies:', error);
      res.status(500).json({ message: 'Failed to fetch companies' });
    }
  });

  app.get('/api/companies/:userId', isAuthenticated, async (req, res) => {
    try {
      const { userId } = req.params;
      const company = await storage.getCompanyByUserId(userId);
      res.json(company);
    } catch (error) {
      console.error('Error fetching company:', error);
      res.status(500).json({ message: 'Failed to fetch company' });
    }
  });

  app.post('/api/companies', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const companyData = {
        ...req.body,
        userId,
        isVerified: false,
        rating: '0',
        reviewCount: 0,
      };
      
      const company = await storage.createCompany(companyData);
      res.json(company);
    } catch (error) {
      console.error('Error creating company:', error);
      res.status(500).json({ message: 'Failed to create company' });
    }
  });

  // Company onboarding endpoint
  app.post('/api/companies/onboarding', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Parse form data
      const {
        legalCompanyName,
        website,
        phone,
        email,
        serviceTypes,
        serviceAreas,
        description
      } = req.body;

      // Parse arrays from JSON strings
      const parsedServiceTypes = typeof serviceTypes === 'string' ? JSON.parse(serviceTypes) : serviceTypes;
      const parsedServiceAreas = typeof serviceAreas === 'string' ? JSON.parse(serviceAreas) : serviceAreas;

      // Create company data
      const companyData = {
        name: legalCompanyName,
        description,
        phone,
        email,
        website: website || null,
        licenseNumber: '', // Will be updated once license is processed
        responseTime: '2-4 hours',
        serviceAreas: parsedServiceAreas,
        specialties: parsedServiceTypes,
        userId,
        isVerified: false, // Pending verification
        rating: '0',
        reviewCount: 0,
      };
      
      const company = await storage.createCompany(companyData);
      
      // TODO: Process uploaded trade license file
      // In a real implementation, you would:
      // 1. Store the file securely (e.g., AWS S3, Google Cloud Storage)
      // 2. Queue it for verification by admin staff
      // 3. Extract license number from the document
      
      res.json({
        success: true,
        message: 'Company registration submitted for review',
        companyId: company.id
      });
    } catch (error) {
      console.error('Error submitting company onboarding:', error);
      res.status(500).json({ message: 'Failed to submit company registration' });
    }
  });

  app.put('/api/companies/:companyId', isAuthenticated, async (req: any, res) => {
    try {
      const { companyId } = req.params;
      const userId = req.user.claims.sub;
      
      // Verify company belongs to user
      const existingCompany = await storage.getCompany(companyId);
      if (!existingCompany || existingCompany.userId !== userId) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      
      const company = await storage.updateCompany(companyId, req.body);
      res.json(company);
    } catch (error) {
      console.error('Error updating company:', error);
      res.status(500).json({ message: 'Failed to update company' });
    }
  });

  // Service Requests
  app.get('/api/service-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const serviceRequests = await storage.getServiceRequestsByCustomer(userId);
      res.json(serviceRequests);
    } catch (error) {
      console.error('Error fetching service requests:', error);
      res.status(500).json({ message: 'Failed to fetch service requests' });
    }
  });

  app.post('/api/service-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const requestData = {
        ...req.body,
        customerId: userId,
        status: 'pending',
      };
      
      const serviceRequest = await storage.createServiceRequest(requestData);
      res.json(serviceRequest);
    } catch (error) {
      console.error('Error creating service request:', error);
      res.status(500).json({ message: 'Failed to create service request' });
    }
  });

  // Quotes
  app.get('/api/service-requests/:requestId/quotes', isAuthenticated, async (req, res) => {
    try {
      const { requestId } = req.params;
      const quotes = await storage.getQuotesByServiceRequest(requestId);
      res.json(quotes);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      res.status(500).json({ message: 'Failed to fetch quotes' });
    }
  });

  // Messages  
  app.get('/api/messages/unread-count', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const count = await storage.getUnreadMessageCount(userId);
      res.json({ count });
    } catch (error) {
      console.error('Error fetching unread count:', error);
      res.status(500).json({ message: 'Failed to fetch unread count' });
    }
  });

  app.get('/api/service-requests/:requestId/messages', isAuthenticated, async (req, res) => {
    try {
      const { requestId } = req.params;
      const messages = await storage.getMessagesByServiceRequest(requestId);
      res.json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ message: 'Failed to fetch messages' });
    }
  });

  // Service requests
  app.get('/api/service-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const requests = await storage.getServiceRequestsByCustomer(userId);
      res.json(requests);
    } catch (error) {
      console.error('Service requests fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch service requests' });
    }
  });

  app.post('/api/service-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const requestData = insertServiceRequestSchema.parse({ 
        ...req.body, 
        customerId: userId 
      });
      
      const request = await storage.createServiceRequest(requestData);
      res.json(request);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid request data', errors: error.errors });
      }
      console.error('Service request creation error:', error);
      res.status(500).json({ message: 'Failed to create service request' });
    }
  });

  app.get('/api/service-requests/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const request = await storage.getServiceRequest(id);
      if (!request) {
        return res.status(404).json({ message: 'Service request not found' });
      }
      res.json(request);
    } catch (error) {
      console.error('Service request fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch service request' });
    }
  });

  // Get all companies for search
  app.get('/api/companies', async (req, res) => {
    try {
      const companies = await storage.getAllCompanies();
      res.json(companies);
    } catch (error) {
      console.error('Companies fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch companies' });
    }
  });

  // Company dashboard routes
  app.get('/api/companies/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const company = await storage.getCompanyByUserId(userId);
      if (!company) {
        return res.status(404).json({ message: 'Company profile not found' });
      }
      res.json(company);
    } catch (error) {
      console.error('Company profile fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch company profile' });
    }
  });

  app.get('/api/service-requests/available', isAuthenticated, async (req: any, res) => {
    try {
      // Return all service requests that are in 'pending' status for companies to quote
      const requests = await storage.getServiceRequestsByStatus('pending');
      res.json(requests);
    } catch (error) {
      console.error('Available requests fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch available requests' });
    }
  });

  app.get('/api/quotes/company', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const company = await storage.getCompanyByUserId(userId);
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }
      
      const quotes = await storage.getQuotesByCompany(company.id);
      res.json(quotes);
    } catch (error) {
      console.error('Company quotes fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch company quotes' });
    }
  });

  // Logout endpoint
  app.post('/api/logout', (req, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).json({ message: 'Failed to logout' });
      }
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully' });
    });
  });

  // Remove duplicate role-specific login endpoints - they are defined in replitAuth.ts

  // Company profile endpoints
  app.get('/api/company/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'company') {
        return res.status(401).json({ message: 'Company access required' });
      }

      const company = await storage.getCompanyByUserId(userId);
      if (company) {
        res.json(company);
      } else {
        res.status(404).json({ message: 'Company profile not found' });
      }
    } catch (error) {
      console.error('Error fetching company profile:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/company/register', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const {
        legalName,
        licenseNumber,
        description,
        serviceAreas,
        serviceTypes,
        responseTime,
        phone,
        address
      } = req.body;

      // Parse JSON strings if needed
      const parsedServiceAreas = typeof serviceAreas === 'string' ? JSON.parse(serviceAreas) : serviceAreas;
      const parsedServiceTypes = typeof serviceTypes === 'string' ? JSON.parse(serviceTypes) : serviceTypes;

      const companyData = {
        userId,
        name: legalName,
        description,
        licenseNumber,
        isVerified: false, // Requires admin approval
        serviceAreas: parsedServiceAreas,
        specialties: parsedServiceTypes,
        responseTime,
        rating: '0',
        reviewCount: 0
      };

      const company = await storage.createCompany(companyData);
      
      // Update user role to company
      await storage.updateUser(userId, { role: 'company' });
      
      res.json(company);
    } catch (error) {
      console.error('Error registering company:', error);
      res.status(500).json({ message: 'Failed to register company' });
    }
  });

  app.get('/api/company/job-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'company') {
        return res.status(401).json({ message: 'Company access required' });
      }

      // Get company
      const company = await storage.getCompanyByUserId(userId);
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }

      // Get all service requests that match company's service types
      const allRequests = await storage.getAllServiceRequests();
      const matchingRequests = allRequests.filter(request => 
        company.specialties?.some(specialty => 
          request.categoryId === specialty || request.title?.toLowerCase().includes(specialty.toLowerCase())
        )
      );

      res.json(matchingRequests);
    } catch (error) {
      console.error('Error fetching job requests:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/company/quotes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'company') {
        return res.status(401).json({ message: 'Company access required' });
      }

      const company = await storage.getCompanyByUserId(userId);
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }

      const quotes = await storage.getQuotesByCompanyId(company.id);
      res.json(quotes);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Company approval endpoints - for admin use
  app.get('/api/admin/companies/pending', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      // For now, any authenticated user can access admin functions
      // In production, you'd want proper admin role checking
      if (!user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const pendingCompanies = await storage.getPendingCompanies();
      res.json(pendingCompanies);
    } catch (error) {
      console.error('Error fetching pending companies:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/admin/companies/:companyId/approve', isAuthenticated, async (req: any, res) => {
    try {
      const { companyId } = req.params;
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      // For now, any authenticated user can approve companies
      // In production, you'd want proper admin role checking
      if (!user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      // Check if company exists
      const company = await storage.getCompany(companyId);
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }

      // Approve the company
      const approvedCompany = await storage.approveCompany(companyId);
      
      res.json({ 
        message: 'Company approved successfully',
        company: approvedCompany
      });
    } catch (error) {
      console.error('Error approving company:', error);
      res.status(500).json({ message: 'Failed to approve company' });
    }
  });

  app.post('/api/admin/companies/:companyId/reject', isAuthenticated, async (req: any, res) => {
    try {
      const { companyId } = req.params;
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      // For now, any authenticated user can reject companies
      // In production, you'd want proper admin role checking
      if (!user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      // Check if company exists
      const company = await storage.getCompany(companyId);
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }

      // Reject the company (set isVerified to false)
      const rejectedCompany = await storage.rejectCompany(companyId);
      
      res.json({ 
        message: 'Company rejected successfully',
        company: rejectedCompany
      });
    } catch (error) {
      console.error('Error rejecting company:', error);
      res.status(500).json({ message: 'Failed to reject company' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
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
      const userId = req.user.claims.sub;
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
  app.post('/api/auth/user/role', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { role } = req.body;
      
      if (!['homeowner', 'company'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
      }
      
      await storage.upsertUser({ id: userId, role, updatedAt: new Date() });
      res.json({ message: 'Role updated successfully' });
    } catch (error) {
      console.error('Role update error:', error);
      res.status(500).json({ message: 'Failed to update role' });
    }
  });

  // Service categories
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getServiceCategories();
      res.json(categories);
    } catch (error) {
      console.error('Categories fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch categories' });
    }
  });

  // Service parts by category
  app.get('/api/categories/:categoryId/parts', async (req, res) => {
    try {
      const { categoryId } = req.params;
      const parts = await storage.getServicePartsByCategory(categoryId);
      res.json(parts);
    } catch (error) {
      console.error('Parts fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch parts' });
    }
  });

  // Companies
  app.get('/api/companies', async (req, res) => {
    try {
      const { categoryId } = req.query;
      const companies = categoryId 
        ? await storage.getCompaniesByServiceCategory(categoryId as string)
        : [];
      res.json(companies);
    } catch (error) {
      console.error('Companies fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch companies' });
    }
  });

  // Create company profile
  app.post('/api/companies', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const companyData = insertCompanySchema.parse({ ...req.body, userId });
      
      const company = await storage.createCompany(companyData);
      res.json(company);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid company data', errors: error.errors });
      }
      console.error('Company creation error:', error);
      res.status(500).json({ message: 'Failed to create company' });
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

  // Quotes
  app.get('/api/service-requests/:id/quotes', async (req, res) => {
    try {
      const { id } = req.params;
      const quotes = await storage.getQuotesByServiceRequest(id);
      res.json(quotes);
    } catch (error) {
      console.error('Quotes fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch quotes' });
    }
  });

  app.post('/api/quotes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Verify user is a company
      const company = await storage.getCompanyByUserId(userId);
      if (!company) {
        return res.status(403).json({ message: 'Only companies can create quotes' });
      }
      
      const quoteData = insertQuoteSchema.parse({ 
        ...req.body, 
        companyId: company.id 
      });
      
      const quote = await storage.createQuote(quoteData);
      res.json(quote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid quote data', errors: error.errors });
      }
      console.error('Quote creation error:', error);
      res.status(500).json({ message: 'Failed to create quote' });
    }
  });

  app.post('/api/quotes/:id/accept', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const quote = await storage.updateQuote(id, { isAccepted: true });
      
      // Update service request status
      await storage.updateServiceRequest(quote.serviceRequestId, { 
        status: 'approved' 
      });
      
      res.json(quote);
    } catch (error) {
      console.error('Quote acceptance error:', error);
      res.status(500).json({ message: 'Failed to accept quote' });
    }
  });

  // Reviews
  app.post('/api/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reviewData = insertReviewSchema.parse({ 
        ...req.body, 
        customerId: userId 
      });
      
      const review = await storage.createReview(reviewData);
      res.json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid review data', errors: error.errors });
      }
      console.error('Review creation error:', error);
      res.status(500).json({ message: 'Failed to create review' });
    }
  });

  // Messages
  app.get('/api/service-requests/:id/messages', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const messages = await storage.getMessagesByServiceRequest(id);
      res.json(messages);
    } catch (error) {
      console.error('Messages fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch messages' });
    }
  });

  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messageData = insertMessageSchema.parse({ 
        ...req.body, 
        senderId: userId 
      });
      
      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid message data', errors: error.errors });
      }
      console.error('Message creation error:', error);
      res.status(500).json({ message: 'Failed to create message' });
    }
  });

  app.get('/api/messages/unread-count', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const count = await storage.getUnreadMessageCount(userId);
      res.json({ count });
    } catch (error) {
      console.error('Unread count fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch unread count' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

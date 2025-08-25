import {
  users,
  companies,
  serviceCategories,
  serviceParts,
  serviceRequests,
  quotes,
  reviews,
  messages,
  type User,
  type UpsertUser,
  type InsertUser,
  type ServiceCategory,
  type ServicePart,
  type Company,
  type ServiceRequest,
  type Quote,
  type Review,
  type Message,
  type InsertServiceCategory,
  type InsertServicePart,
  type InsertCompany,
  type InsertServiceRequest,
  type InsertQuote,
  type InsertReview,
  type InsertMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(userData: InsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Service categories
  getServiceCategories(): Promise<ServiceCategory[]>;
  createServiceCategory(category: InsertServiceCategory): Promise<ServiceCategory>;
  
  // Service parts
  getServicePartsByCategory(categoryId: string): Promise<ServicePart[]>;
  createServicePart(part: InsertServicePart): Promise<ServicePart>;
  
  // Companies
  getCompany(id: string): Promise<Company | undefined>;
  getCompanyByUserId(userId: string): Promise<Company | undefined>;
  getAllCompanies(): Promise<Company[]>;
  getPendingCompanies(): Promise<Company[]>;
  getCompaniesByServiceCategory(categoryId: string): Promise<Company[]>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: string, updates: Partial<InsertCompany>): Promise<Company>;
  approveCompany(id: string): Promise<Company>;
  rejectCompany(id: string): Promise<Company>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  
  // Service requests
  getServiceRequest(id: string): Promise<ServiceRequest | undefined>;
  getServiceRequestsByCustomer(customerId: string): Promise<ServiceRequest[]>;
  getServiceRequestsByStatus(status: string): Promise<ServiceRequest[]>;
  createServiceRequest(request: InsertServiceRequest): Promise<ServiceRequest>;
  updateServiceRequest(id: string, updates: Partial<InsertServiceRequest>): Promise<ServiceRequest>;
  
  // Quotes  
  getQuote(id: string): Promise<Quote | undefined>;
  getQuotesByServiceRequest(serviceRequestId: string): Promise<Quote[]>;
  getQuotesByCompany(companyId: string): Promise<Quote[]>;
  getQuotesByCompanyId(companyId: string): Promise<Quote[]>;
  createQuote(quote: InsertQuote): Promise<Quote>;
  updateQuote(id: string, updates: Partial<InsertQuote>): Promise<Quote>;
  getAllServiceRequests(): Promise<ServiceRequest[]>;
  
  // Reviews
  getReviewsByCompany(companyId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Messages
  getMessagesByServiceRequest(serviceRequestId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: string): Promise<void>;
  getUnreadMessageCount(userId: string): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Service categories
  async getServiceCategories(): Promise<ServiceCategory[]> {
    return await db.select().from(serviceCategories);
  }

  async createServiceCategory(category: InsertServiceCategory): Promise<ServiceCategory> {
    const [result] = await db.insert(serviceCategories).values(category).returning();
    return result;
  }

  // Service parts
  async getServicePartsByCategory(categoryId: string): Promise<ServicePart[]> {
    return await db.select().from(serviceParts).where(eq(serviceParts.categoryId, categoryId));
  }

  async createServicePart(part: InsertServicePart): Promise<ServicePart> {
    const [result] = await db.insert(serviceParts).values(part).returning();
    return result;
  }

  // Companies
  async getCompany(id: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }

  async getCompanyByUserId(userId: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.userId, userId));
    return company;
  }

  async getAllCompanies(): Promise<Company[]> {
    return await db.select().from(companies).orderBy(desc(companies.name));
  }

  async getPendingCompanies(): Promise<Company[]> {
    return await db.select().from(companies)
      .where(eq(companies.isVerified, false))
      .orderBy(desc(companies.createdAt));
  }

  async getCompaniesByServiceCategory(categoryId: string): Promise<Company[]> {
    return await db
      .select()
      .from(companies)
      .where(eq(companies.isVerified, true))
      .orderBy(desc(companies.rating));
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const [result] = await db.insert(companies).values(company).returning();
    return result;
  }

  async updateCompany(id: string, updates: Partial<InsertCompany>): Promise<Company> {
    const [result] = await db
      .update(companies)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(companies.id, id))
      .returning();
    return result;
  }

  async approveCompany(id: string): Promise<Company> {
    const [result] = await db
      .update(companies)
      .set({ isVerified: true, updatedAt: new Date() })
      .where(eq(companies.id, id))
      .returning();
    return result;
  }

  async rejectCompany(id: string): Promise<Company> {
    const [result] = await db
      .update(companies)
      .set({ isVerified: false, updatedAt: new Date() })
      .where(eq(companies.id, id))
      .returning();
    return result;
  }

  // Service requests
  async getServiceRequest(id: string): Promise<ServiceRequest | undefined> {
    const [request] = await db.select().from(serviceRequests).where(eq(serviceRequests.id, id));
    return request;
  }

  async getServiceRequestsByCustomer(customerId: string): Promise<ServiceRequest[]> {
    return await db
      .select()
      .from(serviceRequests)
      .where(eq(serviceRequests.customerId, customerId))
      .orderBy(desc(serviceRequests.createdAt));
  }

  async getServiceRequestsByStatus(status: string): Promise<ServiceRequest[]> {
    return await db
      .select()
      .from(serviceRequests)
      .where(eq(serviceRequests.status, status as any))
      .orderBy(desc(serviceRequests.createdAt));
  }

  async createServiceRequest(request: InsertServiceRequest): Promise<ServiceRequest> {
    const [result] = await db.insert(serviceRequests).values(request).returning();
    return result;
  }

  async updateServiceRequest(id: string, updates: Partial<InsertServiceRequest>): Promise<ServiceRequest> {
    const [result] = await db
      .update(serviceRequests)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(serviceRequests.id, id))
      .returning();
    return result;
  }

  // Quotes
  async getQuote(id: string): Promise<Quote | undefined> {
    const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
    return quote;
  }

  async getQuotesByServiceRequest(serviceRequestId: string): Promise<Quote[]> {
    return await db
      .select()
      .from(quotes)
      .where(eq(quotes.serviceRequestId, serviceRequestId))
      .orderBy(quotes.totalCost);
  }

  async getQuotesByCompany(companyId: string): Promise<Quote[]> {
    return await db
      .select()
      .from(quotes)
      .where(eq(quotes.companyId, companyId))
      .orderBy(desc(quotes.createdAt));
  }

  async createQuote(quote: InsertQuote): Promise<Quote> {
    const [result] = await db.insert(quotes).values(quote).returning();
    return result;
  }

  async updateQuote(id: string, updates: Partial<InsertQuote>): Promise<Quote> {
    const [result] = await db
      .update(quotes)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(quotes.id, id))
      .returning();
    return result;
  }

  // Reviews
  async getReviewsByCompany(companyId: string): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.companyId, companyId))
      .orderBy(desc(reviews.createdAt));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [result] = await db.insert(reviews).values(review).returning();
    
    // Update company rating
    const avgRating = await db
      .select({ avg: sql`AVG(${reviews.rating})`, count: sql`COUNT(*)` })
      .from(reviews)
      .where(eq(reviews.companyId, review.companyId));
    
    if (avgRating[0]) {
      await db
        .update(companies)
        .set({
          rating: avgRating[0].avg as string,
          reviewCount: Number(avgRating[0].count),
          updatedAt: new Date(),
        })
        .where(eq(companies.id, review.companyId));
    }
    
    return result;
  }

  // Messages
  async getMessagesByServiceRequest(serviceRequestId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.serviceRequestId, serviceRequestId))
      .orderBy(messages.createdAt);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [result] = await db.insert(messages).values(message).returning();
    return result;
  }

  async markMessageAsRead(id: string): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, id));
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: sql`COUNT(*)` })
      .from(messages)
      .where(and(eq(messages.receiverId, userId), eq(messages.isRead, false)));
    
    return Number(result[0]?.count || 0);
  }

  // Additional methods for company functionality
  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [result] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result;
  }

  async getQuotesByCompanyId(companyId: string): Promise<Quote[]> {
    return await db
      .select()
      .from(quotes)
      .where(eq(quotes.companyId, companyId))
      .orderBy(desc(quotes.createdAt));
  }

  async getAllServiceRequests(): Promise<ServiceRequest[]> {
    return await db
      .select()
      .from(serviceRequests)
      .orderBy(desc(serviceRequests.createdAt));
  }
}

export const storage = new DatabaseStorage();

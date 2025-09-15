import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  pgEnum,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Refresh tokens for JWT authentication
export const refreshTokens = pgTable(
  "refresh_tokens",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id),
    tokenHash: varchar("token_hash").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    revokedAt: timestamp("revoked_at"),
    userAgent: text("user_agent"),
    ipAddress: varchar("ip_address"),
  },
  (table) => [
    index("IDX_refresh_tokens_user_id").on(table.userId),
    index("IDX_refresh_tokens_expires_at").on(table.expiresAt),
    index("IDX_refresh_tokens_token_hash").on(table.tokenHash),
  ],
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  password: varchar("password"), // Optional for migration compatibility
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  phone: varchar("phone"),
  address: text("address"),
  role: varchar("role").notNull().default('homeowner'), // 'homeowner', 'company', or 'admin'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Service categories
export const serviceCategories = pgTable("service_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  icon: varchar("icon").notNull(),
  color: varchar("color").notNull(),
  description: text("description"),
});

// Service subcategories/parts
export const serviceParts = pgTable("service_parts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id").notNull().references(() => serviceCategories.id),
  name: varchar("name").notNull(),
  description: text("description"),
});

// Company profiles
export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  description: text("description"),
  logo: varchar("logo"),
  licenseNumber: varchar("license_number"),
  isVerified: boolean("is_verified").default(false),
  rating: decimal("rating", { precision: 3, scale: 2 }).default('0'),
  reviewCount: integer("review_count").default(0),
  responseTime: varchar("response_time"), // e.g., "2-4 hours"
  serviceAreas: text("service_areas").array(),
  specialties: varchar("specialties").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const jobStatusEnum = pgEnum('job_status', [
  'pending',
  'quoted',
  'approved',
  'in_progress', 
  'completed',
  'cancelled'
]);

export const priorityEnum = pgEnum('priority', ['low', 'medium', 'high', 'urgent']);

// Service requests/jobs
export const serviceRequests = pgTable("service_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull().references(() => users.id),
  categoryId: varchar("category_id").notNull().references(() => serviceCategories.id),
  partId: varchar("part_id").references(() => serviceParts.id),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  propertyType: varchar("property_type").default('apartment'), // 'apartment', 'villa', 'house', 'office'
  address: text("address").notNull(),
  contactPhone: varchar("contact_phone").default(''), // Contact number
  preferredDate: timestamp("preferred_date"),
  emergencyLevel: varchar("emergency_level").default('normal'), // 'normal', 'urgent', 'emergency'
  accessInstructions: text("access_instructions"), // How to access the property
  priority: priorityEnum("priority").default('medium'),
  status: jobStatusEnum("status").default('pending'),
  images: varchar("images").array(),
  budget: decimal("budget", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Quotes from companies
export const quotes = pgTable("quotes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serviceRequestId: varchar("service_request_id").notNull().references(() => serviceRequests.id),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  partCost: decimal("part_cost", { precision: 10, scale: 2 }).notNull(),
  laborCost: decimal("labor_cost", { precision: 10, scale: 2 }).notNull(),
  serviceFee: decimal("service_fee", { precision: 10, scale: 2 }).notNull(),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }).notNull(),
  estimatedDuration: varchar("estimated_duration"), // e.g., "2-3 hours"
  warranty: text("warranty"),
  notes: text("notes"),
  validUntil: timestamp("valid_until"),
  isAccepted: boolean("is_accepted").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reviews and ratings
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serviceRequestId: varchar("service_request_id").notNull().references(() => serviceRequests.id),
  customerId: varchar("customer_id").notNull().references(() => users.id),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Messages between customers and companies
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serviceRequestId: varchar("service_request_id").notNull().references(() => serviceRequests.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  receiverId: varchar("receiver_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  company: one(companies, {
    fields: [users.id],
    references: [companies.userId],
  }),
  serviceRequests: many(serviceRequests),
  reviews: many(reviews),
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "receiver" }),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
  user: one(users, {
    fields: [companies.userId],
    references: [users.id],
  }),
  quotes: many(quotes),
  reviews: many(reviews),
}));

export const serviceCategoriesRelations = relations(serviceCategories, ({ many }) => ({
  parts: many(serviceParts),
  requests: many(serviceRequests),
}));

export const servicePartsRelations = relations(serviceParts, ({ one, many }) => ({
  category: one(serviceCategories, {
    fields: [serviceParts.categoryId],
    references: [serviceCategories.id],
  }),
  requests: many(serviceRequests),
}));

export const serviceRequestsRelations = relations(serviceRequests, ({ one, many }) => ({
  customer: one(users, {
    fields: [serviceRequests.customerId],
    references: [users.id],
  }),
  category: one(serviceCategories, {
    fields: [serviceRequests.categoryId],
    references: [serviceCategories.id],
  }),
  part: one(serviceParts, {
    fields: [serviceRequests.partId],
    references: [serviceParts.id],
  }),
  quotes: many(quotes),
  reviews: many(reviews),
  messages: many(messages),
}));

export const quotesRelations = relations(quotes, ({ one }) => ({
  serviceRequest: one(serviceRequests, {
    fields: [quotes.serviceRequestId],
    references: [serviceRequests.id],
  }),
  company: one(companies, {
    fields: [quotes.companyId],
    references: [companies.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  serviceRequest: one(serviceRequests, {
    fields: [reviews.serviceRequestId],
    references: [serviceRequests.id],
  }),
  customer: one(users, {
    fields: [reviews.customerId],
    references: [users.id],
  }),
  company: one(companies, {
    fields: [reviews.companyId],
    references: [companies.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  serviceRequest: one(serviceRequests, {
    fields: [messages.serviceRequestId],
    references: [serviceRequests.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sender",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receiver",
  }),
}));

// Schema types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const insertServiceCategorySchema = createInsertSchema(serviceCategories);
export const insertServicePartSchema = createInsertSchema(serviceParts);
export const insertCompanySchema = createInsertSchema(companies);
export const insertServiceRequestSchema = createInsertSchema(serviceRequests);
export const insertQuoteSchema = createInsertSchema(quotes);
export const insertReviewSchema = createInsertSchema(reviews);
export const insertMessageSchema = createInsertSchema(messages);
export const insertRefreshTokenSchema = createInsertSchema(refreshTokens);

export type InsertServiceCategory = z.infer<typeof insertServiceCategorySchema>;
export type InsertServicePart = z.infer<typeof insertServicePartSchema>;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type InsertServiceRequest = z.infer<typeof insertServiceRequestSchema>;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertRefreshToken = z.infer<typeof insertRefreshTokenSchema>;

export type ServiceCategory = typeof serviceCategories.$inferSelect;
export type ServicePart = typeof serviceParts.$inferSelect;
export type Company = typeof companies.$inferSelect;
export type ServiceRequest = typeof serviceRequests.$inferSelect;
export type Quote = typeof quotes.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type RefreshToken = typeof refreshTokens.$inferSelect;

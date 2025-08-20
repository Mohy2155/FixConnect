CREATE TYPE "public"."job_status" AS ENUM('pending', 'quoted', 'approved', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."priority" AS ENUM('low', 'medium', 'high', 'urgent');--> statement-breakpoint
CREATE TABLE "companies" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"logo" varchar,
	"license_number" varchar,
	"is_verified" boolean DEFAULT false,
	"rating" numeric(3, 2) DEFAULT '0',
	"review_count" integer DEFAULT 0,
	"response_time" varchar,
	"service_areas" text[],
	"specialties" varchar[],
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_request_id" varchar NOT NULL,
	"sender_id" varchar NOT NULL,
	"receiver_id" varchar NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_request_id" varchar NOT NULL,
	"company_id" varchar NOT NULL,
	"part_cost" numeric(10, 2) NOT NULL,
	"labor_cost" numeric(10, 2) NOT NULL,
	"service_fee" numeric(10, 2) NOT NULL,
	"total_cost" numeric(10, 2) NOT NULL,
	"estimated_duration" varchar,
	"warranty" text,
	"notes" text,
	"valid_until" timestamp,
	"is_accepted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_request_id" varchar NOT NULL,
	"customer_id" varchar NOT NULL,
	"company_id" varchar NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "service_categories" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"icon" varchar NOT NULL,
	"color" varchar NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "service_parts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "service_requests" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" varchar NOT NULL,
	"category_id" varchar NOT NULL,
	"part_id" varchar,
	"title" varchar NOT NULL,
	"description" text NOT NULL,
	"property_type" varchar NOT NULL,
	"address" text NOT NULL,
	"contact_phone" varchar NOT NULL,
	"preferred_date" timestamp,
	"emergency_level" varchar DEFAULT 'normal' NOT NULL,
	"access_instructions" text,
	"priority" "priority" DEFAULT 'medium',
	"status" "job_status" DEFAULT 'pending',
	"images" varchar[],
	"budget" numeric(10, 2),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"phone" varchar,
	"address" text,
	"role" varchar DEFAULT 'homeowner' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_service_request_id_service_requests_id_fk" FOREIGN KEY ("service_request_id") REFERENCES "public"."service_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiver_id_users_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_service_request_id_service_requests_id_fk" FOREIGN KEY ("service_request_id") REFERENCES "public"."service_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_service_request_id_service_requests_id_fk" FOREIGN KEY ("service_request_id") REFERENCES "public"."service_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_parts" ADD CONSTRAINT "service_parts_category_id_service_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."service_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_category_id_service_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."service_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_part_id_service_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."service_parts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");
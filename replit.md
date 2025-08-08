# FixConnect - UAE Home Maintenance Platform

## Overview

FixConnect is a comprehensive mobile-first web application designed to connect homeowners with certified maintenance service providers across the UAE. The platform serves as a marketplace where users can request home maintenance services, receive quotes from verified companies, and manage their service requests through an intuitive interface.

The application caters to two primary user types: homeowners who need maintenance services and service companies that provide those services. It focuses on common UAE home maintenance needs including plumbing, electrical work, AC & cooling services, and appliance repairs.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The client-side application is built using React with TypeScript, implementing a mobile-first responsive design approach. The architecture follows a component-based structure with the following key patterns:

- **Routing**: Uses Wouter for lightweight client-side routing, with conditional routing based on authentication state
- **State Management**: Leverages TanStack Query (React Query) for server state management and caching, eliminating the need for complex global state solutions
- **UI Framework**: Built on shadcn/ui components with Radix UI primitives, providing accessible and customizable UI components
- **Styling**: Utilizes Tailwind CSS with CSS custom properties for consistent theming and responsive design
- **Form Management**: React Hook Form with Zod validation for type-safe form handling

The application is structured around key page components (Home, Service Request, Jobs, Messages, Profile) with shared UI components and hooks for common functionality.

### Backend Architecture

The server follows a RESTful API design built on Express.js with TypeScript, implementing a layered architecture pattern:

- **Route Layer**: Handles HTTP requests and responses, input validation, and error handling
- **Storage Layer**: Abstracts database operations through a well-defined interface, enabling easy testing and potential database migrations
- **Authentication Middleware**: Integrates with Replit's OpenID Connect authentication system for secure user management
- **Session Management**: Uses PostgreSQL-backed sessions with connect-pg-simple for persistent user sessions

The server implements comprehensive logging middleware for API requests and includes proper error handling with structured error responses.

### Data Storage Solutions

The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations:

- **Database Provider**: Neon Database (serverless PostgreSQL) for scalable cloud database hosting
- **ORM**: Drizzle ORM provides compile-time type safety and excellent TypeScript integration
- **Schema Management**: Centralized schema definitions in `shared/schema.ts` ensure consistency between client and server
- **Migration Strategy**: Uses Drizzle Kit for database schema migrations and version control

The database schema supports multi-tenancy with role-based access (homeowners vs. companies) and includes comprehensive relationships between users, companies, service requests, quotes, and messages.

### Authentication and Authorization

Authentication is handled through Replit's OpenID Connect integration:

- **Provider**: Replit OIDC for secure authentication without managing user credentials
- **Session Management**: Server-side sessions stored in PostgreSQL with configurable TTL
- **Authorization**: Role-based access control distinguishing between homeowner and company user types
- **Security**: HTTP-only cookies with secure flags for production environments

The authentication system automatically creates user profiles on first login and supports profile updates for both homeowner and company accounts.

### External Dependencies

- **Replit Authentication**: OpenID Connect provider for user authentication and identity management
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling and automatic scaling
- **shadcn/ui Components**: Pre-built, accessible UI components based on Radix UI primitives
- **TanStack Query**: Server state management, caching, and synchronization
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **React Hook Form**: Form state management and validation
- **Zod**: Runtime type validation and schema definition
- **Date-fns**: Date manipulation and formatting utilities

The application is designed to be deployed on Replit's infrastructure with minimal configuration requirements, leveraging environment variables for database connections and authentication settings.
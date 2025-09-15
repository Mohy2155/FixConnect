# FixConnect

## Overview

FixConnect is a comprehensive service marketplace platform designed for the UAE market, connecting homeowners with verified service companies. The application features a mobile-first design supporting multiple languages (English, Arabic, Hindi, Urdu) with RTL support. The platform facilitates service requests, company onboarding, job management, and real-time messaging between homeowners and service providers.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Styling**: Tailwind CSS with shadcn/ui components for consistent design
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Query (TanStack Query) for server state management and caching
- **Form Handling**: React Hook Form with Zod validation schemas
- **Internationalization**: i18next for multi-language support with automatic RTL detection

### Backend Architecture
- **Runtime**: Node.js with Express server
- **Language**: TypeScript for type safety across the entire stack
- **API Design**: RESTful API with session-based authentication
- **File Structure**: Monorepo structure with shared types and schemas between client and server

### Authentication & Authorization
- **Session Management**: Express sessions with memory store for development
- **Password Security**: Scrypt-based password hashing with salt
- **JWT Integration**: Dual token system with access and refresh tokens
- **Role-based Access**: Support for homeowner, company, and admin roles
- **Multi-role Login**: Separate authentication flows for different user types

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Management**: Centralized schema definitions in shared directory
- **Database Provider**: Neon serverless PostgreSQL with connection pooling
- **Migrations**: Drizzle Kit for database schema migrations

### Component Architecture
- **Design System**: Radix UI primitives with custom styling via Tailwind CSS
- **Mobile-first**: Responsive design optimized for mobile devices
- **Navigation**: Bottom navigation for mobile app-like experience
- **Reusable Components**: Modular component library for consistency

### Business Logic Features
- **Service Categories**: Dynamic category system with icons and descriptions
- **Job Management**: Complete lifecycle from request to completion with status tracking
- **Quote System**: Multi-company bidding with detailed cost breakdowns
- **Review System**: Rating and feedback mechanism for completed services
- **Messaging**: Real-time communication between homeowners and companies
- **Company Verification**: Admin approval process for service providers

## External Dependencies

### UI and Styling
- **Radix UI**: Comprehensive set of accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Type-safe component variants

### Database and ORM
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Type-safe SQL toolkit and query builder
- **Connection Pooling**: @neondatabase/serverless for efficient database connections

### Authentication and Security
- **Express Session**: Session management middleware
- **bcrypt/scrypt**: Password hashing utilities
- **jsonwebtoken**: JWT token generation and verification
- **connect-pg-simple**: PostgreSQL session store

### Development and Build Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Static type checking
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Autoprefixer

### Form and Validation
- **React Hook Form**: Performant form library
- **Zod**: Schema validation library
- **@hookform/resolvers**: Integration between React Hook Form and Zod

### Internationalization
- **i18next**: Internationalization framework
- **react-i18next**: React integration for i18next
- **i18next-browser-languagedetector**: Automatic language detection

### Utilities and Helpers
- **date-fns**: Date manipulation library
- **clsx**: Conditional className utility
- **nanoid**: URL-safe unique ID generator
# Customer Support Chat Application

## Overview

This is a real-time customer support chat application built with React, Express, TypeScript, and Drizzle ORM. The application provides a simple interface for customers to chat with administrators, featuring separate views for users and admins with real-time messaging capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Storage**: PostgreSQL-based session storage using connect-pg-simple
- **API Design**: RESTful API with structured error handling

### Data Storage Solutions
- **Primary Database**: PostgreSQL via Neon Database serverless
- **ORM**: Drizzle ORM with schema-first approach
- **Development Storage**: In-memory storage implementation for development/testing
- **Session Storage**: PostgreSQL-based sessions for user authentication

## Key Components

### Authentication System
- Simple password-based authentication (no username required)
- Role-based access control (admin vs regular users)
- Session-based authentication with persistent storage
- Automatic role-based routing (admins to dashboard, users to chat)

### Chat System
- Real-time messaging through polling (2-second intervals)
- Message threading between users and administrators
- Admin status management (available/busy)
- Responsive chat interface with mobile support

### User Management
- User registration with name and password
- Admin user creation with elevated privileges
- User listing and management for administrators

### UI Components
- Comprehensive shadcn/ui component library integration
- Responsive design with mobile-first approach
- Dark mode support through CSS variables
- Toast notifications for user feedback

## Data Flow

### Authentication Flow
1. User enters password on login page
2. Backend validates password and returns user data
3. Frontend stores user session in localStorage
4. User is redirected based on role (admin/user)

### Messaging Flow
1. User composes message in chat interface
2. Message sent via POST to `/api/messages`
3. Backend stores message with sender/receiver IDs
4. All clients poll for new messages every 2 seconds
5. New messages appear in real-time chat interface

### Admin Management Flow
1. Admin can view all users in sidebar
2. Admin can select users to chat with
3. Admin can toggle availability status
4. Status changes are reflected across all client interfaces

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL driver
- **drizzle-orm**: TypeScript ORM with PostgreSQL support
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight React router
- **express**: Node.js web framework

### UI Dependencies
- **@radix-ui/***: Unstyled, accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **date-fns**: Date formatting and manipulation

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type safety and development experience
- **drizzle-kit**: Database migration and schema management

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite builds React application to `dist/public`
2. **Backend Build**: esbuild bundles Express server to `dist/index.js`
3. **Database Migration**: Drizzle Kit handles schema migrations

### Environment Configuration
- **Development**: Uses Vite dev server with Express API proxy
- **Production**: Serves static files from Express server
- **Database**: Requires `DATABASE_URL` environment variable for PostgreSQL connection

### Production Deployment
- Single Node.js process serving both API and static files
- PostgreSQL database connection via environment variable
- Session storage persisted to database
- Error handling with structured JSON responses

### Development Setup
- Hot module replacement via Vite
- TypeScript checking and compilation
- Database schema synchronization via `db:push` command
- Development banner for Replit integration

The application follows a monorepo structure with shared TypeScript schemas between frontend and backend, ensuring type safety across the full stack. The architecture prioritizes simplicity and real-time user experience while maintaining scalability through proper separation of concerns.
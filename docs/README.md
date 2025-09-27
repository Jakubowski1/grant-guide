# Grant Guide Documentation

Welcome to the Grant Guide documentation. This guide covers the complete architecture, data flow, and services of the Grant Guide application.

## 📚 Table of Contents

### Architecture & Design
- [System Architecture](./architecture/system-architecture.md) - High-level system design and components
- [Database Schema](./architecture/database-schema.md) - Firestore database structure and relationships
- [Authentication Flow](./architecture/authentication-flow.md) - User authentication and authorization system
- [Data Flow](./architecture/data-flow.md) - How data moves through the application

### API Documentation
- [Database Services](./api/database-services.md) - Core database operations and services
- [Authentication Services](./api/authentication-services.md) - User authentication and management
- [Firestore Utils](./api/firestore-utils.md) - Low-level Firestore utilities and helpers
- [Hooks & State Management](./api/hooks-state-management.md) - React hooks and state patterns

### Development & Testing
- [Testing Strategy](./testing-strategy.md) - Testing approach and best practices
- [Development Setup](./development-setup.md) - Local development environment setup
- [Deployment Guide](./deployment-guide.md) - Production deployment procedures

### User Experience
- [User Journey](./user-journey.md) - Complete user experience flow
- [Component Architecture](./component-architecture.md) - UI component organization

## 🚀 Quick Start

1. **System Overview**: Start with [System Architecture](./architecture/system-architecture.md) to understand the big picture
2. **Database Design**: Review [Database Schema](./architecture/database-schema.md) for data structure
3. **Authentication**: Learn about [Authentication Flow](./architecture/authentication-flow.md)
4. **API Reference**: Check [Database Services](./api/database-services.md) for backend operations

## 🔧 Key Technologies

- **Frontend**: Next.js 15.5.2, React 19, TypeScript
- **Backend**: Firebase v12.2.1 (Auth, Firestore, Functions)
- **Styling**: Tailwind CSS, Radix UI
- **State Management**: React Context, custom hooks
- **Testing**: Jest, React Testing Library
- **Build Tools**: Turbopack, Biome

## 📖 Recent Updates

### v1.0.0 - Database Integration & Authentication
- ✅ Complete database service architecture
- ✅ User authentication with Firebase
- ✅ Real-time dashboard data
- ✅ Profile management system
- ✅ Fixed Firestore internal assertion errors
- ✅ Improved TypeScript type safety

---

*Last updated: September 27, 2025*
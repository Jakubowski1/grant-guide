# Testing Scripts Guide

## Available Test Commands

The Themockr project now includes comprehensive testing capabilities with the following npm scripts:

### 🧪 Basic Testing Commands

#### `npm run test`
Runs all tests in the project using Jest.
```bash
npm run test
```

#### `npm run test:setup` 
Runs only the basic setup test to verify Jest configuration is working.
```bash
npm run test:setup
```

### 🔍 Development Testing Commands

#### `npm run test:watch`
Runs tests in watch mode - automatically re-runs tests when files change.
```bash
npm run test:watch
```
*Perfect for development - keeps running and shows test results as you code.*

#### `npm run test:coverage`
Runs all tests and generates a coverage report showing which code is tested.
```bash
npm run test:coverage
```
*Shows detailed coverage statistics and highlights untested code.*

### 🚀 CI/CD Testing Commands

#### `npm run test:ci`
Runs tests suitable for Continuous Integration environments.
```bash
npm run test:ci
```
*Includes coverage reporting, doesn't watch for changes, and passes even with no tests.*

## Test Structure

```
__tests__/
├── setup.test.ts           # Basic Jest setup verification
├── services/               # Tests for backend services
│   ├── auth.test.ts        # Authentication service tests
│   └── database.test.ts    # Database service tests
├── hooks/                  # Tests for React hooks
├── components/             # Tests for React components
└── utils/                  # Tests for utility functions
    └── firestore-utils.test.ts
```

## What's Configured

### ✅ Jest Configuration
- **Framework**: Jest 30.1.3 with React Testing Library
- **Environment**: jsdom for DOM testing
- **TypeScript**: Full TypeScript support
- **Module Mapping**: `@/` aliases work in tests
- **Setup**: Automatic mocking of Firebase and Next.js

### ✅ Testing Libraries
- **Jest**: Core testing framework
- **@testing-library/react**: React component testing
- **@testing-library/jest-dom**: Additional DOM matchers
- **@testing-library/user-event**: User interaction simulation

### ✅ Mocking
- **Firebase**: Authentication, Firestore, and Storage
- **Next.js**: Router, navigation, and dynamic imports
- **DOM APIs**: ResizeObserver and other browser APIs

## Writing Tests

### Example Component Test
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  test('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  test('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Example Service Test
```typescript
import { DatabaseService } from '@/lib/database';

describe('DatabaseService', () => {
  test('should create user profile', async () => {
    const userData = {
      uid: 'test123',
      email: 'test@example.com',
      displayName: 'Test User'
    };

    const result = await DatabaseService.createUserProfile('test123', userData);
    expect(result).toBe(true);
  });
});
```

## Coverage Thresholds

The project is configured with coverage thresholds:
- **Statements**: 70%
- **Branches**: 70% 
- **Functions**: 70%
- **Lines**: 70%

## Running Specific Tests

### Run tests for a specific file:
```bash
npm run test -- auth.test.ts
```

### Run tests matching a pattern:
```bash
npm run test -- --testNamePattern="should create user"
```

### Run tests in a specific directory:
```bash
npm run test -- __tests__/services/
```

## Debugging Tests

### Run tests with detailed output:
```bash
npm run test -- --verbose
```

### Run a single test file in debug mode:
```bash
npm run test -- --runInBand __tests__/setup.test.ts
```

## Integration with CI/CD

The `test:ci` command is designed for continuous integration:
- Runs all tests once (no watch mode)
- Generates coverage reports
- Passes even if no tests exist (`--passWithNoTests`)
- Suitable for GitHub Actions, Jenkins, etc.

## Next Steps for Testing

1. **Write Component Tests**: Test your React components in `__tests__/components/`
2. **Write Service Tests**: Test your database and auth services in `__tests__/services/`
3. **Write Hook Tests**: Test custom React hooks in `__tests__/hooks/`
4. **Add E2E Tests**: Consider adding Playwright for end-to-end testing

The testing infrastructure is fully set up and ready for development! 🎉
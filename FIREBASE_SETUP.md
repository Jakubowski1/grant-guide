# Firebase Authentication Setup

This project uses Firebase for authentication. Follow these steps to set up Firebase authentication:

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Follow the setup wizard

## 2. Enable Authentication

1. In the Firebase console, go to **Authentication** > **Sign-in method**
2. Enable the following sign-in methods:
   - **Email/Password**: Enable this provider
   - **GitHub**: Enable this provider and configure it with your GitHub OAuth App credentials

## 3. Configure GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the form:
   - **Application name**: Grant Guide (or your preferred name)
   - **Homepage URL**: `http://localhost:3000` (for development)
   - **Authorization callback URL**: `https://your-project-id.firebaseapp.com/__/auth/handler`
4. Copy the **Client ID** and **Client Secret**
5. Go back to Firebase Authentication > Sign-in method > GitHub
6. Paste your GitHub OAuth App credentials

## 4. Get Firebase Configuration

1. In Firebase console, go to **Project settings** (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" and select web (</>) 
4. Register your app with a name
5. Copy the Firebase config object

## 5. Set Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Firebase configuration values in `.env.local`:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
   ```

## 6. Update Production URLs

For production deployment:
1. Update GitHub OAuth App with production URLs
2. Add your production domain to Firebase Authentication > Settings > Authorized domains

## Features Implemented

- ✅ Email/Password authentication
- ✅ GitHub OAuth authentication  
- ✅ User registration with additional profile data
- ✅ Authentication state management
- ✅ Route protection (auth guards)
- ✅ User profile data storage in Firestore
- ✅ Sign out functionality
- ⏸️ Google authentication (ready but disabled)

## File Structure

```
src/
├── lib/
│   ├── firebase.ts          # Firebase configuration
│   └── auth.ts              # Authentication utilities
├── providers/
│   └── auth-provider.tsx    # Authentication context provider
├── hooks/
│   └── useAuthGuard.ts      # Route protection hooks
└── app/
    ├── layout.tsx           # Root layout with AuthProvider
    ├── login/page.tsx       # Login page with Firebase auth
    ├── register/page.tsx    # Registration page with Firebase auth
    └── dashboard/page.tsx   # Protected dashboard page
```

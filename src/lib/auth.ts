import {
  type AuthError,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  signInWithEmailAndPassword as firebaseSignIn,
  GithubAuthProvider,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { safeGetDoc, safeSetDoc, safeUpdateDoc } from "./firestore-utils";

// Auth providers
const githubProvider = new GithubAuthProvider();
const googleProvider = new GoogleAuthProvider();

// Add scopes for GitHub
githubProvider.addScope("user:email");

googleProvider.addScope("email");
googleProvider.addScope("profile");

// User data interface
export interface UserData {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL?: string;
  role?: string;
  experience?: string;
  howDidYouHear?: string;
  createdAt: Date;
  lastLoginAt: Date;
}

// Check if email already exists (fallback method)
export const checkEmailExists = async (
  email: string,
): Promise<{ exists: boolean; error: string | null }> => {
  try {
    if (!auth) {
      return {
        exists: false,
        error: "Firebase Auth is not properly initialized",
      };
    }

    // Use fetchSignInMethodsForEmail to check if email exists
    // This is a client-side method that works without Cloud Functions
    const signInMethods = await fetchSignInMethodsForEmail(auth, email);
    return { exists: signInMethods.length > 0, error: null };
  } catch (error) {
    const authError = error as AuthError;

    // Firebase might have email enumeration protection enabled
    // In this case, we can't reliably check if email exists beforehand
    // So we'll return false and let the registration handle the duplicate email error
    if (
      authError.code === "auth/configuration-not-found" ||
      authError.code === "auth/invalid-api-key" ||
      authError.code === "auth/operation-not-allowed"
    ) {
      return { exists: false, error: null };
    }

    return { exists: false, error: getErrorMessage(authError) };
  }
};

// Register with email and password
export const registerWithEmailAndPassword = async (
  email: string,
  password: string,
  displayName: string,
  additionalData: {
    role: string;
    experience: string;
    howDidYouHear: string;
  },
): Promise<{ user: User | null; error: string | null }> => {
  try {
    // Check if Firebase is initialized
    if (!auth || !db) {
      return {
        user: null,
        error:
          "Firebase is not properly initialized. Please check your configuration.",
      };
    }

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;

    // Update the user's display name
    await updateProfile(user, { displayName });

    // Save additional user data to Firestore
    const userData: UserData = {
      uid: user.uid,
      email: user.email || "",
      displayName,
      photoURL: user.photoURL || undefined,
      role: additionalData.role,
      experience: additionalData.experience,
      howDidYouHear: additionalData.howDidYouHear,
      createdAt: new Date(),
      lastLoginAt: new Date(),
    };

    await safeSetDoc(doc(db, "users", user.uid), userData);

    return { user, error: null };
  } catch (error) {
    const authError = error as AuthError;
    return { user: null, error: getErrorMessage(authError) };
  }
};

// Sign in with email and password
export const signInWithEmailAndPassword = async (
  email: string,
  password: string,
): Promise<{ user: User | null; error: string | null }> => {
  try {
    if (!auth) {
      return { user: null, error: "Firebase Auth is not properly initialized" };
    }

    const userCredential = await firebaseSignIn(auth, email, password);
    const user = userCredential.user;

    // Update last login time
    if (user && db) {
      await updateUserLastLogin(user.uid);
    }

    return { user, error: null };
  } catch (error) {
    const authError = error as AuthError;
    return { user: null, error: getErrorMessage(authError) };
  }
};

// Sign in with GitHub
export const signInWithGitHub = async (): Promise<{
  user: User | null;
  error: string | null;
}> => {
  try {
    if (!auth || !db) {
      return { user: null, error: "Firebase is not properly initialized" };
    }

    const result = await signInWithPopup(auth, githubProvider);
    const user = result.user;

    // Check if user exists in Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) {
      // Create user document if it doesn't exist
      const userData: UserData = {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName,
        photoURL: user.photoURL || undefined,
        createdAt: new Date(),
        lastLoginAt: new Date(),
      };
      await safeSetDoc(doc(db, "users", user.uid), userData);
    } else {
      // Update last login time
      await updateUserLastLogin(user.uid);
    }

    return { user, error: null };
  } catch (error) {
    const authError = error as AuthError;
    return { user: null, error: getErrorMessage(authError) };
  }
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<{
  user: User | null;
  error: string | null;
}> => {
  try {
    if (!auth || !db) {
      return { user: null, error: "Firebase is not properly initialized" };
    }

    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if user exists in Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) {
      // Create user document if it doesn't exist
      const userData: UserData = {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName,
        photoURL: user.photoURL || undefined,
        createdAt: new Date(),
        lastLoginAt: new Date(),
      };

      await safeSetDoc(doc(db, "users", user.uid), userData);
    } else {
      // Update last login time
      await updateUserLastLogin(user.uid);
    }

    return { user, error: null };
  } catch (error) {
    const authError = error as AuthError;
    return { user: null, error: getErrorMessage(authError) };
  }
};

// Sign out
export const signOutUser = async (): Promise<{ error: string | null }> => {
  try {
    if (!auth) {
      return { error: "Firebase Auth is not properly initialized" };
    }
    await signOut(auth);
    return { error: null };
  } catch (error) {
    const authError = error as AuthError;
    return { error: getErrorMessage(authError) };
  }
};

// Update user's last login time
const updateUserLastLogin = async (uid: string) => {
  try {
    if (!db) {
      console.warn("Firestore is not initialized, skipping last login update");
      return;
    }
    await safeSetDoc(
      doc(db, "users", uid),
      { lastLoginAt: new Date() },
      { merge: true },
    );
  } catch (error) {
    console.error("Error updating last login:", error);
  }
};

// Get user data from Firestore
export const getUserData = async (uid: string): Promise<UserData | null> => {
  try {
    if (!db) {
      console.warn("Firestore is not initialized, skipping user data fetch");
      return null;
    }

    console.log("🔍 getUserData called for uid:", uid);
    const userDoc = await safeGetDoc(doc(db, "users", uid));
    console.log("🔍 User document exists:", userDoc.exists());
    
    if (userDoc.exists()) {
      const data = userDoc.data() as UserData;
      console.log("✅ User data retrieved:", data);
      return data;
    } else {
      console.log("❌ User document does not exist in Firestore for uid:", uid);
      return null;
    }
  } catch (error: unknown) {
    // Handle specific Firebase errors gracefully
    const firebaseError = error as { code?: string; message?: string };
    console.error("❌ Error getting user data:", error);
    
    if (firebaseError?.code === "permission-denied") {
      console.error("❌ Permission denied: User document access not allowed. Check Firestore security rules.");
    } else if (firebaseError?.code === "not-found") {
      console.warn("⚠️ User document not found in Firestore for uid:", uid);
    } else {
      console.warn(
        "Firebase is offline or experiencing connectivity issues. User data will be available when connection is restored.",
      );
    }
    return null;
  }
};

// Auth state listener
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  if (!auth) {
    console.warn("Firebase Auth is not initialized");
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

// Error message helper
const getErrorMessage = (error: AuthError): string => {
  switch (error.code) {
    case "auth/user-not-found":
      return "No account found with this email address.";
    case "auth/wrong-password":
      return "Incorrect password.";
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later.";
    case "auth/operation-not-allowed":
      return "This sign-in method is not enabled.";
    case "auth/popup-closed-by-user":
      return "Sign-in popup was closed before completing the process.";
    case "auth/popup-blocked":
      return "Sign-in popup was blocked by your browser.";
    case "auth/cancelled-popup-request":
      return "Only one popup request is allowed at a time.";
    case "auth/account-exists-with-different-credential":
      return "An account already exists with the same email address but different sign-in credentials.";
    case "auth/requires-recent-login":
      return "This operation requires recent authentication. Please sign in again.";
    case "auth/credential-already-in-use":
      return "This credential is already associated with a different user account.";
    case "auth/invalid-credential":
      return "The provided credential is malformed or has expired.";
    default:
      return error.message || "An unexpected error occurred.";
  }
};

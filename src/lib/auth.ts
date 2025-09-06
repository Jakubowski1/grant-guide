import {
  type AuthError,
  createUserWithEmailAndPassword,
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

// Auth providers
const githubProvider = new GithubAuthProvider();
const googleProvider = new GoogleAuthProvider();

// Add scopes for GitHub
githubProvider.addScope("user:email");

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
      email: user.email!,
      displayName,
      photoURL: user.photoURL || undefined,
      role: additionalData.role,
      experience: additionalData.experience,
      howDidYouHear: additionalData.howDidYouHear,
      createdAt: new Date(),
      lastLoginAt: new Date(),
    };

    await setDoc(doc(db, "users", user.uid), userData);

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
    const userCredential = await firebaseSignIn(auth, email, password);
    const user = userCredential.user;

    // Update last login time
    if (user) {
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
    const result = await signInWithPopup(auth, githubProvider);
    const user = result.user;

    // Check if user exists in Firestore, if not create profile
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) {
      const userData: UserData = {
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName || user.email!.split("@")[0],
        photoURL: user.photoURL || undefined,
        createdAt: new Date(),
        lastLoginAt: new Date(),
      };
      await setDoc(doc(db, "users", user.uid), userData);
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

// Sign in with Google (disabled for now but ready for future use)
export const signInWithGoogle = async (): Promise<{
  user: User | null;
  error: string | null;
}> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if user exists in Firestore, if not create profile
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) {
      const userData: UserData = {
        uid: user.uid,
        email: user.email || "",
        displayName:
          user.displayName || (user.email && user.email.split("@")[0]),
        photoURL: user.photoURL || undefined,
        createdAt: new Date(),
        lastLoginAt: new Date(),
      };
      await setDoc(doc(db, "users", user.uid), userData);
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
export const logout = async (): Promise<{ error: string | null }> => {
  try {
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
    await setDoc(
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
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserData;
    }
    return null;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
};

// Auth state listener
export const onAuthStateChange = (callback: (user: User | null) => void) => {
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
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later.";
    case "auth/popup-closed-by-user":
      return "Sign-in was cancelled.";
    case "auth/cancelled-popup-request":
      return "Sign-in was cancelled.";
    case "auth/popup-blocked":
      return "Popup was blocked by the browser. Please allow popups for this site.";
    case "auth/account-exists-with-different-credential":
      return "An account already exists with the same email but different sign-in credentials.";
    default:
      return error.message || "An error occurred during authentication.";
  }
};

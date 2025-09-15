import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

interface CheckEmailData {
  email: string;
}

export const checkEmailExists = functions.https.onRequest(
  async (req, res): Promise<void> => {
    // Set CORS headers
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.set("Access-Control-Max-Age", "3600");

    // Handle preflight OPTIONS request
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    // Only allow POST requests
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      const data = req.body.data as CheckEmailData;
      const { email } = data;

      // 1. Validate Input
      if (!email || typeof email !== "string") {
        res.status(400).json({
          error: {
            code: "invalid-argument",
            message: "The function must be called with a valid email string.",
          },
        });
        return;
      }

      // 2. Use Firebase Admin SDK to check if user exists by email
      try {
        await admin.auth().getUserByEmail(email);
        // If we reach here, it means getUserByEmail succeeded, so the user exists
        res.status(200).json({ data: { exists: true } });
        return;
      } catch (error: unknown) {
        // 3. Handle specific 'auth/user-not-found' error
        const authError = error as { code?: string };
        if (authError.code === "auth/user-not-found") {
          res.status(200).json({ data: { exists: false } });
          return;
        }

        // 4. Re-throw other unexpected errors
        console.error("Error in checkEmailExists Cloud Function:", error);
        throw error;
      }
    } catch (error: unknown) {
      console.error("Error in checkEmailExists Cloud Function:", error);
      res.status(500).json({
        error: {
          code: "unknown",
          message:
            "An unexpected error occurred while checking email existence.",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      });
    }
  },
);

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

const firebaseApiKey = import.meta.env.VITE_FIREBASE_API_KEY;

// Fetch user account details from Firebase
export async function getAccountInfo(idToken) {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseApiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Failed to fetch user details.");
  }

  if (!data.users || data.users.length === 0) {
    throw new Error("User account not found.");
  }

  const user = data.users[0];

  // Normalize Firebase REST response for React components
  return {
    ...user,
    photoURL: user.photoUrl || "",
    emailVerified: user.emailVerified === true,
  };
}

// Send email verification link
export async function sendEmailVerification(idToken) {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${firebaseApiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requestType: "VERIFY_EMAIL",
        idToken,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    const errorCode = data.error?.message;

    const errorMessages = {
      INVALID_ID_TOKEN: "Your login session has expired. Please log in again.",
      USER_NOT_FOUND: "User account not found. Please log in again.",
      INVALID_EMAIL:
        "The email address associated with this account is invalid.",
      MISSING_EMAIL: "No email address is associated with this account.",
      API_KEY_INVALID: "Firebase API configuration is invalid.",
      TOO_MANY_ATTEMPTS_TRY_LATER: "Too many attempts. Please try again later.",
      OPERATION_NOT_ALLOWED:
        "Email verification is not enabled for this Firebase project.",
    };

    throw new Error(
      errorMessages[errorCode] ||
        "Unable to send verification email. Please try again.",
    );
  }

  return data;
}

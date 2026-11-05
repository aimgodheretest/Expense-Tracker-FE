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

// Send forgotPassword reset link
export async function sendPasswordResetEmailRequest(email) {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${firebaseApiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requestType: "PASSWORD_RESET",
        email: email.trim(),
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    const errorCode = data.error?.message;

    // Keep the response neutral if the account doesn't exist.
    if (errorCode === "EMAIL_NOT_FOUND") {
      return { email, accountNotFound: true };
    }

    const errorMessages = {
      INVALID_EMAIL: "Please enter a valid email address.",
      MISSING_EMAIL: "Email address is required.",
      API_KEY_INVALID: "Firebase API configuration is invalid.",
      TOO_MANY_ATTEMPTS_TRY_LATER: "Too many attempts. Please try again later.",
      OPERATION_NOT_ALLOWED:
        "Password reset is not enabled for this Firebase project.",
      USER_DISABLED: "This account has been disabled.",
    };

    throw new Error(
      errorMessages[errorCode] ||
        "Unable to send password reset email. Please try again.",
    );
  }

  return data;
}

const firebaseDatabaseUrl = import.meta.env.VITE_FIREBASE_DATABASE_URL;

// Get the authenticated user's expense database path
async function getExpenseDatabaseUrl() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please log in to manage your expenses.");
  }

  const idToken = await user.getIdToken();

  if (!firebaseDatabaseUrl) {
    throw new Error(
      "Firebase Realtime Database URL is missing. Check your .env file.",
    );
  }

  const baseUrl = firebaseDatabaseUrl.replace(/\/$/, "");

  return `${baseUrl}/users/${user.uid}/expenses.json?auth=${idToken}`;
}

// POST: Add an expense to Firebase Realtime Database
export async function addExpenseToDatabase(expense) {
  const url = await getExpenseDatabaseUrl();

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(expense),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to save expense. Please try again.");
  }

  return {
    ...expense,
    id: data.name,
  };
}

// GET: Fetch all expenses from Firebase Realtime Database
export async function getExpensesFromDatabase() {
  const url = await getExpenseDatabaseUrl();

  const response = await fetch(url);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Failed to fetch expenses. Please try again.",
    );
  }

  if (!data) {
    return [];
  }

  return Object.entries(data).map(([id, expense]) => ({
    ...expense,
    id,
  }));
}

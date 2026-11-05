import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";

import Signup from "./components/Signup";
import Login from "./components/Login";
import Welcome from "./components/Welcome";
import CompleteProfile from "./components/CompleteProfile";

import {
  auth,
  getAccountInfo,
  sendEmailVerification,
} from "./services/firebase";

function App() {
  const [currentScreen, setCurrentScreen] = useState("login");
  const [userProfile, setUserProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (!isMounted) return;

        localStorage.removeItem("token");
        setUserProfile(null);
        setCurrentScreen("login");
        setAuthLoading(false);

        return;
      }

      try {
        const idToken = await user.getIdToken();

        localStorage.setItem("token", idToken);

        const profile = await getAccountInfo(idToken);

        if (!isMounted) return;

        setUserProfile(profile);
        setCurrentScreen("welcome");
      } catch (error) {
        console.error("Profile fetching error:", error);

        if (!isMounted) return;

        setUserProfile(null);
        setCurrentScreen("login");
        localStorage.removeItem("token");
      } finally {
        if (isMounted) {
          setAuthLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleProfileUpdated = (updatedProfile) => {
    setUserProfile(updatedProfile);
    setCurrentScreen("welcome");
  };

  // Send verification email
  const handleVerifyEmail = async () => {
    if (!auth.currentUser) {
      throw new Error("Please log in again.");
    }

    const idToken = await auth.currentUser.getIdToken(true);

    return sendEmailVerification(idToken);
  };

  // Refresh verification status
  const handleRefreshVerification = async () => {
    if (!auth.currentUser) {
      throw new Error("Please log in again.");
    }

    const idToken = await auth.currentUser.getIdToken(true);
    const profile = await getAccountInfo(idToken);

    setUserProfile(profile);

    return profile.emailVerified;
  };

  // Logout user
  const handleLogout = async () => {
    try {
      await signOut(auth);

      localStorage.removeItem("token");

      // onAuthStateChanged automatically redirects to Login
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (authLoading) {
    return <div className="auth-loading">Loading your profile...</div>;
  }

  return (
    <>
      {currentScreen === "signup" && (
        <Signup onLoginClick={() => setCurrentScreen("login")} />
      )}

      {currentScreen === "login" && (
        <Login onSignupClick={() => setCurrentScreen("signup")} />
      )}

      {currentScreen === "welcome" && (
        <Welcome
          user={userProfile}
          onCompleteProfile={() => setCurrentScreen("profile")}
          onVerifyEmail={handleVerifyEmail}
          onRefreshVerification={handleRefreshVerification}
          onLogout={handleLogout}
        />
      )}

      {currentScreen === "profile" && (
        <CompleteProfile
          user={userProfile}
          onCancel={() => setCurrentScreen("welcome")}
          onUpdated={handleProfileUpdated}
        />
      )}
    </>
  );
}

export default App;

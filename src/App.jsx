import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

import Signup from "./components/Signup";
import Login from "./components/Login";
import Welcome from "./components/Welcome";
import CompleteProfile from "./components/CompleteProfile";

import { auth, getAccountInfo } from "./services/firebase";

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
        // Get a fresh Firebase ID token
        const idToken = await user.getIdToken();

        localStorage.setItem("token", idToken);

        // Fetch saved user details
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

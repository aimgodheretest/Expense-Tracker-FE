import { useState } from "react";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Welcome from "./components/Welcome";
import CompleteProfile from "./components/CompleteProfile";
import { auth } from "./services/firebase";

function App() {
  const [currentScreen, setCurrentScreen] = useState("login");

  const handleLoginSuccess = () => {
    setCurrentScreen("welcome");
  };

  const handleProfileUpdated = () => {
    setCurrentScreen("welcome");
  };

  return (
    <>
      {currentScreen === "signup" && (
        <Signup onLoginClick={() => setCurrentScreen("login")} />
      )}

      {currentScreen === "login" && (
        <Login
          onSignupClick={() => setCurrentScreen("signup")}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {currentScreen === "welcome" && (
        <Welcome
          user={auth.currentUser}
          onCompleteProfile={() => setCurrentScreen("profile")}
        />
      )}

      {currentScreen === "profile" && (
        <CompleteProfile
          onCancel={() => setCurrentScreen("welcome")}
          onUpdated={handleProfileUpdated}
        />
      )}
    </>
  );
}

export default App;

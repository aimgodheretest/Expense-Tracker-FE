import { useState } from "react";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Welcome from "./components/Welcome";

function App() {
  const [currentScreen, setCurrentScreen] = useState("login");

  return (
    <>
      {currentScreen === "signup" && (
        <Signup onLoginClick={() => setCurrentScreen("login")} />
      )}

      {currentScreen === "login" && (
        <Login
          onSignupClick={() => setCurrentScreen("signup")}
          onLoginSuccess={() => setCurrentScreen("welcome")}
        />
      )}

      {currentScreen === "welcome" && <Welcome />}
    </>
  );
}

export default App;

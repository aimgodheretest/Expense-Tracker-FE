import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";

function Login({ onLoginSuccess, onSignupClick }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setLoading(true);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );

      // Retrieve Firebase ID token
      const token = await userCredential.user.getIdToken();

      // Store token
      localStorage.setItem("token", token);

      // Show welcome screen
      onLoginSuccess();
    } catch (error) {
      console.error("Login error:", error.code);

      switch (error.code) {
        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
          setError("Invalid email or password.");
          break;

        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;

        case "auth/too-many-requests":
          setError("Too many attempts. Please try again later.");
          break;

        case "auth/network-request-failed":
          setError("Network error. Please check your connection.");
          break;

        default:
          setError("Unable to login. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <p className="signup-subtitle">SECURE YOUR FINANCES</p>

          <h2>
            Welcome <span>Back</span>
          </h2>

          <p>Login to access your Expense Tracker.</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>

            <input
              type="email"
              id="email"
              className="form-control custom-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>

            <input
              type="password"
              id="password"
              className="form-control custom-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <button
            type="submit"
            className="btn signup-btn w-100"
            disabled={!email.trim() || !password || loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="signup-footer">
          Don't have an account?{" "}
          <button type="button" className="auth-link" onClick={onSignupClick}>
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;

import { useState } from "react";
import { sendPasswordResetEmailRequest } from "../services/firebase";

function ForgotPassword({ onBackToLogin }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess(false);

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      await sendPasswordResetEmailRequest(email.trim());

      setSuccess(true);
    } catch (error) {
      console.error("Password reset error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <p className="signup-subtitle">ACCOUNT RECOVERY</p>

          <h2>
            Forgot <span>Password?</span>
          </h2>

          <p>
            Enter your registered email address and we'll send you a password
            reset link.
          </p>
        </div>

        {loading ? (
          <div className="forgot-password-loader" role="status">
            <div
              className="spinner-border text-danger"
              aria-hidden="true"
            ></div>

            <p>Sending password reset link...</p>
            <span>Please wait.</span>
          </div>
        ) : success ? (
          <div className="forgot-password-success" role="status">
            <p>
              If an account exists with this email, a password reset link has
              been sent.
            </p>

            <p>Please check your inbox and spam folder.</p>

            <button
              type="button"
              className="btn signup-btn w-100"
              onClick={onBackToLogin}
            >
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="resetEmail" className="form-label">
                Email Address
              </label>

              <input
                type="email"
                id="resetEmail"
                className="form-control custom-input"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {error && <div className="alert alert-danger py-2">{error}</div>}

            <button
              type="submit"
              className="btn signup-btn w-100"
              disabled={!email.trim()}
            >
              Send Reset Link
            </button>

            <p className="signup-footer">
              Remember your password?{" "}
              <button
                type="button"
                className="auth-link"
                onClick={onBackToLogin}
              >
                Login
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;

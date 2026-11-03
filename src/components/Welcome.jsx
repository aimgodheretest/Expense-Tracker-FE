import { useState } from "react";

function Welcome({
  user,
  onCompleteProfile,
  onVerifyEmail,
  onRefreshVerification,
}) {
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");
  const [verificationError, setVerificationError] = useState("");

  const isProfileComplete = Boolean(user?.displayName && user?.photoURL);

  const handleSendVerification = async () => {
    try {
      setVerificationLoading(true);
      setVerificationMessage("");
      setVerificationError("");

      await onVerifyEmail();

      setVerificationMessage(
        "Verification email sent! Please check your inbox and spam folder.",
      );
    } catch (error) {
      setVerificationError(error.message);
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    try {
      setVerificationLoading(true);
      setVerificationMessage("");
      setVerificationError("");

      const isVerified = await onRefreshVerification();

      setVerificationMessage(
        isVerified
          ? "Your email has been successfully verified!"
          : "Your email is not verified yet. Please check your inbox.",
      );
    } catch (error) {
      setVerificationError(error.message);
    } finally {
      setVerificationLoading(false);
    }
  };

  // Shared verification section for both profile states
  const verificationSection = (
    <div className="verification-section">
      {user?.emailVerified ? (
        <p className="verification-success">Email verified successfully!</p>
      ) : (
        <>
          <p>Your email is not verified yet.</p>

          <button
            type="button"
            className="btn signup-btn mt-2"
            onClick={handleSendVerification}
            disabled={verificationLoading}
          >
            {verificationLoading ? "Sending..." : "Verify Email"}
          </button>

          <button
            type="button"
            className="btn signup-btn mt-2"
            onClick={handleCheckVerification}
            disabled={verificationLoading}
          >
            I've verified my email
          </button>
        </>
      )}

      {verificationMessage && (
        <p className="verification-message">{verificationMessage}</p>
      )}

      {verificationError && (
        <p className="verification-error">{verificationError}</p>
      )}
    </div>
  );

  // Incomplete profile screen
  if (!isProfileComplete) {
    return (
      <div className="welcome-container">
        <header className="welcome-header">
          <h5>Welcome to Expense Tracker!!!</h5>

          <div className="profile-notice">
            Your profile is incomplete.{" "}
            <button
              type="button"
              className="btn signup-btn"
              onClick={onCompleteProfile}
            >
              Complete now
            </button>
          </div>
        </header>

        {verificationSection}
      </div>
    );
  }

  // Completed profile screen
  return (
    <div className="welcome-container completed-welcome">
      <div className="completed-content">
        <h1>Welcome to Expense Tracker!!!</h1>

        <img src={user.photoURL} alt="Profile" className="profile-avatar" />

        <h3>{user.displayName}</h3>

        <button
          type="button"
          className="btn signup-btn mt-3"
          onClick={onCompleteProfile}
        >
          Edit Profile
        </button>
      </div>

      {verificationSection}
    </div>
  );
}

export default Welcome;

function Welcome({ user, onCompleteProfile }) {
  const isProfileComplete = Boolean(user?.displayName && user?.photoURL);

  // Profile incomplete screen
  if (!isProfileComplete) {
    return (
      <div className="welcome-container">
        <header className="welcome-header">
          <h5>Welcome to Expense Tracker!!!</h5>

          <div className="profile-notice">
            Your profile is incomplete.{" "}
            <button onClick={onCompleteProfile} className="auth-link">
              Complete now
            </button>
          </div>
        </header>
      </div>
    );
  }

  // Profile completed screen
  return (
    <div className="welcome-container completed-welcome">
      <div className="completed-content">
        <h1>Welcome to Expense Tracker!!!</h1>

        <img src={user.photoURL} alt="Profile" className="profile-avatar" />

        <h3>{user.displayName}</h3>
      </div>
    </div>
  );
}

export default Welcome;

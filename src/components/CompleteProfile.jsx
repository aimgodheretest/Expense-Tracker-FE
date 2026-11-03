import { useState } from "react";
import { updateProfile } from "firebase/auth";
import { auth } from "../services/firebase";

function CompleteProfile({ onCancel, onUpdated }) {
  const [fullName, setFullName] = useState(auth.currentUser?.displayName || "");

  const [photoURL, setPhotoURL] = useState(auth.currentUser?.photoURL || "");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim() || !photoURL.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    if (!auth.currentUser) {
      setError("Please login again to update your profile.");
      return;
    }

    try {
      setLoading(true);

      await updateProfile(auth.currentUser, {
        displayName: fullName.trim(),
        photoURL: photoURL.trim(),
      });

      onUpdated();
    } catch (error) {
      console.error("Profile update error:", error);

      setError("Unable to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <header className="welcome-header">
        <h5>Winners never quit, Quitters never win.</h5>

        <div className="profile-notice">
          Your profile is incomplete.
          <span> Complete your details below.</span>
        </div>
      </header>

      <div className="profile-form-container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4>Contact Details</h4>

          <button
            type="button"
            className="btn btn-outline-danger"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleUpdate}>
          <div className="row g-4">
            <div className="col-md-6">
              <label htmlFor="fullName" className="form-label">
                Full Name
              </label>

              <input
                type="text"
                id="fullName"
                className="form-control custom-input"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="photoURL" className="form-label">
                Profile Photo URL
              </label>

              <input
                type="url"
                id="photoURL"
                className="form-control custom-input"
                placeholder="https://example.com/photo.jpg"
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
                required
              />
            </div>
          </div>

          {error && <div className="alert alert-danger mt-3">{error}</div>}

          <button
            type="submit"
            className="btn signup-btn mt-4"
            disabled={!fullName.trim() || !photoURL.trim() || loading}
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CompleteProfile;

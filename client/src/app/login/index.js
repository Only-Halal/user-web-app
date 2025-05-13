import React, { useState } from "react";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Handling form submission (you can later add form validation)
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Email:", email);
    console.log("Password:", password);
  };
  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        height: "100vh",
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: "400px",
          width: "100%",
          padding: "20px",
          backgroundColor: "#fff",
          borderRadius: "20px",
          boxshadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h2 className="text-center mb-4">Welcome!</h2>
        <p> Sign up or log in to continue</p>
        {/* Login form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <input
              type="email"
              className="form-control custom-input"
              id="email"
              placeholder="Enter email"
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
              className="form-control custom-input"
              id="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <button type="submit" className="btn login-pink-btn w-100">
              Login
            </button>
          </div>

          <div className="mt-3 text-center">
            <a href="#" className="text-decoration-none">
              Forgot Password?
            </a>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-3">
            <button className="btn btn-signup w-100">Sign Up</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;

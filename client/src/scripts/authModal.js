import React, { useEffect, useState, useRef } from "react";
import OtpInput from "react-otp-input";
import "bootstrap/dist/css/bootstrap.min.css";
import { app_url } from "../url.js";
import PrivacyPolicy from "../components/privacyPolicy.js";
import { Colors, Fonts, Sizes } from "../constants/styles.js";

const countryCodes = [
  { label: "+1 (US)", value: "+1" },
  // Add more country codes as needed
];

const statesList = [
  { label: "Alabama", value: "AL" },
  { label: "Alaska", value: "AK" },
  // Add all other states...
];

const AuthModal = ({ isOpen, onClose, mode, onLoginSuccess, onChangeMode }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    state: "",
    city: "",
    zipcode: "",
    countryCode: "+1",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [getOtp, setGetOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  const validatePassword = (password) => {
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasCapitalLetter = /[A-Z]/.test(password);
    const hasNumeric = /[0-9]/.test(password);
    const isValidLength = password.length >= 6;
    return hasSpecialChar && hasCapitalLetter && hasNumeric && isValidLength;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handlePhoneChange = (e) => {
    let sanitizedText = e.target.value.replace(/[^0-9]/g, "");
    if (sanitizedText.length > 0 && sanitizedText[0] === "1") {
      sanitizedText = sanitizedText.slice(1);
    }
    if (sanitizedText.length > 10) {
      sanitizedText = sanitizedText.slice(0, 10);
    }
    setFormData((prev) => ({ ...prev, phone: sanitizedText }));
    setError("");
  };

  const handleCountryCodeChange = (e) => {
    setFormData((prev) => ({ ...prev, countryCode: e.target.value }));
    setError("");
  };

  const handleStateChange = (e) => {
    setFormData((prev) => ({ ...prev, state: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (mode === "signup") {
      if (
        !formData.username ||
        !formData.email ||
        !formData.password ||
        !formData.confirmPassword ||
        !formData.phone ||
        !formData.state ||
        !formData.city ||
        !formData.zipcode ||
        !formData.countryCode
      ) {
        setError("All fields are required for signup.");
        setLoading(false);
        return;
      }
      if (!validatePassword(formData.password)) {
        setError(
          "Password must include at least 1 special character, 1 capital letter, 1 numeric character, and be at least 6 characters long."
        );
        setLoading(false);
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
      }
      setShowPrivacyPolicy(true);
    } else {
      if (!formData.email || !formData.password) {
        setError("Email and password are required for login.");
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`${app_url}/userLogin`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Login failed");
        }
        if (data.success) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("userId", data.userId);
          onLoginSuccess(data.userId, data.token);
          setSuccess(data.message);
          setTimeout(() => onClose(), 1000);
        } else {
          setError(data.message || "Login failed");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePrivacyPolicyAccept = async () => {
    setShowPrivacyPolicy(false);
    setLoading(true);
    try {
      const response = await fetch(`${app_url}/resetPasswordOTP`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await response.json();
      if (data.success) {
        setGetOtp(data.otp);
        setShowOtpInput(true);
      } else {
        setError(data.message || "Failed to send OTP");
      }
    } catch (err) {
      setError("Failed to send OTP: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    if (otp === getOtp) {
      try {
        const response = await fetch(`${app_url}/userSignup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password,
            phone: formData.countryCode + formData.phone,
            state: formData.state,
            city: formData.city,
            zipcode: formData.zipcode,
          }),
        });
        const data = await response.json();
        if (data.success) {
          setSuccess(data.message);
          setFormData({
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
            phone: "",
            state: "",
            city: "",
            zipcode: "",
            countryCode: "+1",
          });
          setOtp("");
          setShowOtpInput(false);
          setTimeout(() => onClose(), 2000);
        } else {
          setError(data.message || "Signup failed");
        }
      } catch (err) {
        setError("Signup failed: " + err.message);
      } finally {
        setLoading(false);
      }
    } else {
      setError("Invalid OTP");
      setLoading(false);
    }
  };

  const modalref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalref.current && !modalref.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
      role="dialog"
    >
      <div
        className="modal-dialog modal-dialog-centered"
        role="document"
        ref={modalref}
      >
        <div className="modal-content">
          <button
            type="button"
            className="btn-close position-absolute end-0 me-3 mt-3"
            onClick={onClose}
            aria-label="Close"
          ></button>
          <h6
            className="modal-title text-center w-100 mt-3"
            style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              color: Colors.primaryColor,
            }}
          >
            {mode === "signup" ? "Hello There!" : "Wcome Back!"}
          </h6>
          <div className="modal-header border-0">
            <h5
              className="modal-title text-center w-100"
              style={{
                fontSize: "1.5rem",
                fontWeight: "600",
                color: Colors.grayColor,
              }}
            >
              {mode === "signup"
                ? "Let's setup your account"
                : "Let's get you signed in"}
            </h5>
          </div>
          <div className="modal-body px-4 pb-4 pt-0">
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {!showOtpInput ? (
              <form onSubmit={handleSubmit}>
                {mode === "signup" ? (
                  <>
                    <div className="mb-3">
                      <label
                        htmlFor="username"
                        className="form-label"
                        style={{ fontWeight: "500" }}
                      >
                        Username <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control py-2"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="Enter Username"
                      />
                    </div>

                    <div className="mb-3">
                      <label
                        htmlFor="email"
                        className="form-label"
                        style={{ fontWeight: "500" }}
                      >
                        Email <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        className="form-control py-2"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter Email"
                      />
                    </div>

                    <div className="mb-3">
                      <label
                        htmlFor="password"
                        className="form-label"
                        style={{ fontWeight: "500" }}
                      >
                        Password <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="form-control py-2"
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Enter Password"
                        />
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label
                        htmlFor="confirmPassword"
                        className="form-label"
                        style={{ fontWeight: "500" }}
                      >
                        Confirm Password <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          className="form-control py-2"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="Confirm Password"
                        />
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label
                        htmlFor="phone"
                        className="form-label"
                        style={{ fontWeight: "500" }}
                      >
                        Phone <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <select
                          className="form-select py-2"
                          style={{ maxWidth: "120px" }}
                          name="countryCode"
                          value={formData.countryCode}
                          onChange={handleCountryCodeChange}
                        >
                          {countryCodes.map((code) => (
                            <option key={code.value} value={code.value}>
                              {code.label}
                            </option>
                          ))}
                        </select>
                        <input
                          type="tel"
                          className="form-control py-2"
                          name="phone"
                          value={formData.phone}
                          onChange={handlePhoneChange}
                          placeholder="Enter Phone"
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label
                        htmlFor="zipcode"
                        className="form-label"
                        style={{ fontWeight: "500" }}
                      >
                        Zipcode <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control py-2"
                        id="zipcode"
                        name="zipcode"
                        value={formData.zipcode}
                        onChange={handleInputChange}
                        placeholder="Enter Zipcode"
                      />
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label
                          htmlFor="state"
                          className="form-label"
                          style={{ fontWeight: "500" }}
                        >
                          State <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-select py-2"
                          name="state"
                          value={formData.state}
                          onChange={handleStateChange}
                        >
                          <option value="">Select State</option>
                          {statesList.map((state) => (
                            <option key={state.value} value={state.value}>
                              {state.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label
                          htmlFor="city"
                          className="form-label"
                          style={{ fontWeight: "500" }}
                        >
                          City <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control py-2"
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="Enter City"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn w-100 py-2 mt-3"
                      disabled={loading}
                      style={{
                        backgroundColor: Colors.primaryColor,
                        color: "white",
                        fontWeight: "500",
                        fontSize: "1rem",
                      }}
                    >
                      {loading ? "Processing..." : "Sign Up"}
                    </button>

                    <p className="text-center mt-3">
                      Already have an account?{" "}
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          onChangeMode("login");
                        }}
                        style={{
                          color: Colors.primaryColor,
                          textDecoration: "none",
                        }}
                      >
                        Login
                      </a>
                    </p>
                  </>
                ) : (
                  <>
                    <div className="mb-3">
                      <label
                        htmlFor="email"
                        className="form-label"
                        style={{ fontWeight: "500" }}
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        className="form-control py-2"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter Email"
                      />
                    </div>

                    <div className="mb-3">
                      <label
                        htmlFor="password"
                        className="form-label"
                        style={{ fontWeight: "500" }}
                      >
                        Password
                      </label>
                      <div className="input-group">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="form-control py-2"
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Enter Password"
                        />
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn w-100 py-2 mt-3"
                      disabled={loading}
                      style={{
                        backgroundColor: Colors.primaryColor,
                        color: "white",
                        fontWeight: "500",
                        fontSize: "1rem",
                      }}
                    >
                      {loading ? "Processing..." : "Log In"}
                    </button>

                    <p className="text-center mt-3">
                      Don't have an account?{" "}
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          onChangeMode("signup");
                        }}
                        style={{
                          color: Colors.primaryColor,
                          textDecoration: "none",
                        }}
                      >
                        Sign Up
                      </a>
                    </p>
                  </>
                )}
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit}>
                <div className="mb-3">
                  <label
                    htmlFor="otp"
                    className="form-label"
                    style={{ fontWeight: "500" }}
                  >
                    Enter OTP
                  </label>
                  <OtpInput
                    value={otp}
                    onChange={setOtp}
                    numInputs={6}
                    renderInput={(props) => <input {...props} />}
                    inputStyle={{
                      width: "40px",
                      height: "40px",
                      margin: "0 5px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                      textAlign: "center",
                      fontSize: "16px",
                    }}
                    containerStyle={{ justifyContent: "center" }}
                  />
                  <p className="mt-2">
                    OTP sent to {formData.email}.{" "}
                    <a
                      href="#"
                      onClick={handlePrivacyPolicyAccept}
                      style={{
                        color: Colors.primaryColor,
                        textDecoration: "none",
                      }}
                    >
                      Resend OTP
                    </a>
                  </p>
                </div>
                <button
                  type="submit"
                  className="btn w-100 py-2"
                  disabled={loading}
                  style={{
                    backgroundColor: Colors.primaryColor,
                    color: "white",
                    fontWeight: "500",
                    fontSize: "1rem",
                  }}
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {showPrivacyPolicy && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex="-1"
          role="dialog"
        >
          <div
            className="modal-dialog modal-dialog-centered"
            role="document"
            ref={modalref}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Privacy Policy</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowPrivacyPolicy(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <PrivacyPolicy />
                <button
                  className="btn w-100 py-2 mt-3"
                  onClick={handlePrivacyPolicyAccept}
                  style={{
                    backgroundColor: Colors.primaryColor,
                    color: "white",
                    fontWeight: "500",
                    fontSize: "1rem",
                  }}
                >
                  Accept and Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthModal;

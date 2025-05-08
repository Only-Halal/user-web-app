import React from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SearchPage from "./app/searchpage"; // Import the main App component
import reportWebVitals from "./reportWebVitals";
import LoginPage from "./app/login";
import HomePage from "./app/home";
import "@fortawesome/fontawesome-free/css/all.min.css";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./styles/login.css";
import "./styles/navbar.css";
import "./styles/searchpage.css";

import "bootstrap/dist/js/bootstrap.bundle.min.js"; // Important for toggle functionality

const root = ReactDOM.createRoot(document.getElementById("root"));

// Render the main App component
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        {/* Route for the HomePage */}
        <Route path="/searchpage" element={<SearchPage />} />
        {/* Route for the AboutPage */}

        <Route path="/home" element={<HomePage />} />
        {/* Route for the AboutPage */}
      </Routes>
    </Router>
  </React.StrictMode>
);

// Performance monitoring (optional)
reportWebVitals();

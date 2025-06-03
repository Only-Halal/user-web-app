import React from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SearchPage from "./app/searchpage";
import reportWebVitals from "./reportWebVitals";
import LoginPage from "./app/login";
import HomePage from "./app/home";
import Deliveries from "./app/deliveries";
import RestaurantDetails from "./app/restaurant-details";
import EditProfileScreen from "./app/editProfileScreen";
import { AppProvider } from "./context/appContext";
import "@fortawesome/fontawesome-free/css/all.min.css";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./styles/login.css";
import "./styles/navbar.css";
import "./styles/searchpage.css";
import "./styles/home.css";
import "./styles/slider.css";
import "./styles/footer.css";
import "./styles/deliveries.css";
import "./styles/filter-btn.css";
import "./styles/restaurant-details.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js"; 

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <Router>
      <AppProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="/searchpage" element={<SearchPage />} />

          <Route path="/editProfileScreen" element={<EditProfileScreen />} />

          <Route path="/deliveries" element={<Deliveries />} />

          <Route path="/restaurant-details" element={<RestaurantDetails />} />
        </Routes>
      </AppProvider>
    </Router>
  </React.StrictMode>
);

reportWebVitals();

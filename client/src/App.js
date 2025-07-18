import React from "react";
import ReactDOM from "react-dom/client";
import "./App.css";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import SearchPage from "./pages/searchpage";
import LoginPage from "./pages/login";
import HomePage from "./pages/home";
import Deliveries from "./pages/deliveries";
import RestaurantMenu from "./pages/restaurantMenu";
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
import "./styles/restaurantMenu.css";
import "./styles/modal.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import ViewCart from "./view-cart";
import Navbar from "./components/navbar2";
import Footer from "./components/footer";

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/searchpage" element={<SearchPage />} />
          <Route path="/deliveries" element={<Deliveries />} />
          <Route path="/restaurantMenu" element={<RestaurantMenu />} />
          <Route path="/view-cart" element={<ViewCart />} />
        </>
        <>
          <Route path="/home" element={<HomePage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="*" element={<HomePage />} />
        </>
      </Routes>
      <Footer />
    </BrowserRouter>
  );
};

export default App;

import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faShoppingCart,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import AuthModal from "../../scripts/authModal.js";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("login");
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [userId, setUserId] = useState(localStorage.getItem("userId") || null);
  const navigate = useNavigate();

  // Check auth status on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const id = localStorage.getItem("userId");
    setIsLoggedIn(!!token);
    setUserId(id);
  }, []);

  const openModal = (mode) => {
    setModalMode(mode);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleLoginSuccess = (userId, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("userId", userId);
    setIsLoggedIn(true);
    setUserId(userId);
    closeModal();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setIsLoggedIn(false);
    setUserId(null);
    navigate("/"); // Redirect to home after logout
  };

  const handleChangeMode = (newMode) => {
    setModalMode(newMode);
  };

  const navItems = [
    {
      title: "Home",
      submenu: [
        { title: "Action", link: "#" },
        {
          title: "Sub Menu",
          submenu: [
            { title: "Sub Action 1", link: "#" },
            { title: "Sub Action 2", link: "#" },
          ],
        },
      ],
    },
    {
      title: "About Us",
      submenu: [
        { title: "Action", link: "#" },
        {
          title: "Sub Menu",
          submenu: [
            { title: "Sub Action 1", link: "#" },
            { title: "Sub Action 2", link: "#" },
          ],
        },
      ],
    },
    {
      title: "Catalog",
      submenu: [
        { title: "Action", link: "#" },
        {
          title: "Sub Menu",
          submenu: [
            { title: "Sub Action 1", link: "#" },
            { title: "Sub Action 2", link: "#" },
          ],
        },
      ],
    },
    { title: "Blog", link: "#" },
    { title: "Contact", link: "#" },
  ];

  const renderSubmenu = (items) => {
    return (
      <div className="dropdown-menu">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {item.submenu ? (
              <>
                <a
                  className="dropdown-item dropdown-toggle"
                  href={item.link || "#"}
                >
                  {item.title}
                </a>
                {renderSubmenu(item.submenu)}
              </>
            ) : (
              <a className="dropdown-item" href={item.link || "#"}>
                {item.title}
              </a>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="container-fluid nav-div d-flex align-items-center sticky-top">
      <nav className="navbar navbar-expand-lg navbar-light bg-light custom-nav container">
        <a className="navbar-brand" href="/">
          <img
            src="/logo.webp"
            alt="Logo"
            className="img-fluid"
            style={{ height: "auto", width: "200px" }}
          />
        </a>

        {/* Mobile Toggle */}
        <div className="d-lg-none ms-auto me-3 bg-white">
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarContent"
            aria-controls="navbarContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>

        {/* Main Navigation */}
        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav mx-auto">
            {navItems.map((item, index) => (
              <li
                key={index}
                className={`nav-item ${item.submenu ? "dropdown" : ""}`}
              >
                {item.submenu ? (
                  <>
                    <a
                      className="nav-link dropdown-toggle"
                      href="#"
                      id={`navbarDropdown-${index}`}
                      role="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      {item.title}
                    </a>
                    {renderSubmenu(item.submenu)}
                  </>
                ) : (
                  <a className="nav-link" href={item.link}>
                    {item.title}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Right-side elements */}
        <div className="ms-auto d-flex align-items-center py-lg-5">
          <span className="me-3 nav-right-text d-none d-lg-flex">
            <FontAwesomeIcon icon={faPhone} className="me-1" />
            <span style={{ color: "#F7B614" }} className="me-5">
              +1 234 567 890
            </span>
          </span>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              {isLoggedIn ? (
                <>
                  <li className="nav-item">
                    <a className="nav-link" href={`/editProfile/${userId}`}>
                      Profile
                    </a>
                  </li>
                  <li className="nav-item">
                    <button
                      className="nav-link btn btn-pink"
                      onClick={handleLogout}
                    >
                      Log out
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <button
                      className="nav-link active btn btn-pink"
                      onClick={() => openModal("login")}
                    >
                      Log in
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className="nav-link btn btn-signup"
                      onClick={() => openModal("signup")}
                    >
                      Sign up
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>

          <a href="#" className="nav-link nav-right-text me-5 d-none d-lg-flex">
            <FontAwesomeIcon icon={faShoppingCart} />
          </a>
          <a href="#" className="nav-link nav-right-text d-none d-lg-flex">
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </a>
        </div>
      </nav>

      <AuthModal
        isOpen={modalOpen}
        onClose={closeModal}
        mode={modalMode}
        onLoginSuccess={handleLoginSuccess}
        onChangeMode={handleChangeMode}
      />
    </div>
  );
}

export default Navbar;

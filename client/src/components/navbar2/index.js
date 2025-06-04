import React from "react";
function Navbar() {
  return (
    // navbar div start
    <div className="container-fluid nav-div d-flex align-items-center ">
      <nav className="navbar navbar-expand-lg navbar-light bg-light custom-nav sticky-top container">
        <a class="navbar-brand" href="#">
          <img
            src="/logo.webp"
            alt="Logo"
            className="img-fluid"
            style={{ height: "auto", width: "200px" }}
          />
        </a>
        <div
          class="d-lg-none ms-auto  me-3"
          style={{ backgroundColor: "white" }}
        >
          <button
            class="navbar-toggler "
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarContent"
            aria-controls="navbarContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span class="navbar-toggler-icon"></span>
          </button>
        </div>

        <div class="collapse navbar-collapse" id="navbarContent">
          <div className="mx-auto">
            <ul class="navbar-nav">
              <li class="nav-item dropdown">
                <a
                  class="nav-link dropdown-toggle"
                  href="#"
                  id="navbarDropdown"
                  role="button"
                >
                  Home
                </a>
                <div class="dropdown-menu">
                  <a class="dropdown-item" href="#">
                    Action
                  </a>
                  <a class="dropdown-item dropdown-toggle" href="#">
                    Sub Menu
                  </a>
                  <div class="dropdown-menu">
                    <a class="dropdown-item" href="#">
                      Sub Action 1
                    </a>
                    <a class="dropdown-item" href="#">
                      Sub Action 2
                    </a>
                  </div>
                </div>
              </li>
              <li class="nav-item dropdown">
                <a
                  class="nav-link dropdown-toggle"
                  href="#"
                  id="navbarDropdown"
                  role="button"
                >
                  About Us
                </a>
                <div class="dropdown-menu">
                  <a class="dropdown-item" href="#">
                    Action
                  </a>
                  <a class="dropdown-item dropdown-toggle" href="#">
                    Sub Menu
                  </a>
                  <div class="dropdown-menu">
                    <a class="dropdown-item" href="#">
                      Sub Action 1
                    </a>
                    <a class="dropdown-item" href="#">
                      Sub Action 2
                    </a>
                  </div>
                </div>
              </li>
              <li class="nav-item dropdown">
                <a
                  class="nav-link dropdown-toggle"
                  href="#"
                  id="navbarDropdown"
                  role="button"
                >
                  Catalog
                </a>
                <div class="dropdown-menu">
                  <a class="dropdown-item" href="#">
                    Action
                  </a>
                  <a class="dropdown-item dropdown-toggle" href="#">
                    Sub Menu
                  </a>
                  <div class="dropdown-menu">
                    <a class="dropdown-item" href="#">
                      Sub Action 1
                    </a>
                    <a class="dropdown-item" href="#">
                      Sub Action 2
                    </a>
                  </div>
                </div>
              </li>
              <li class="nav-item">
                <a class="nav-link" s href="#">
                  Blog
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" s href="#">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div class="ms-auto   d-flex align-items-center py-5">
          <span className="me-3 nav-right-text d-none d-lg-flex">
            <i className="fa-solid fa-phone-alt me-1"></i>
            <span style={{ color: "#F7B614" }} className="me-5">
              +1 234 567 890
            </span>
          </span>
          <a
            href="#"
            className="nav-link  nav-right-text me-5 d-none d-lg-flex"
          >
            <i class="fas fa-user"></i>
          </a>
          <a href="#" class="nav-link nav-right-text me-5 d-none d-lg-flex ">
            <i class="fa-solid fa-cart-shopping"></i>
          </a>
          <a href="#" class="nav-link nav-right-text d-none d-lg-flex ">
            <i class="fa-solid fa-magnifying-glass"></i>
          </a>
        </div>
      </nav>
    </div>
    // navbar-div end
  );
}

export default Navbar; // Correct way to export the component

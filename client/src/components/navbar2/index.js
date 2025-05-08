import React from "react";
function Navbar() {
  return (
    <nav class="navbar navbar-expand-lg navbar-light bg-light custom-nav">
      <a class="navbar-brand" href="#">
        <img
          src="/logozomoto.png"
          alt="Logo"
          className="img-fluid"
          style={{ height: "auto", width: "auto" }}
        />
      </a>

      <div class="collapse navbar-collapse">
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
                About
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
              <a class="nav-link" href="#">
                Blog
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div class="ml-auto d-flex align-items-center">
        <span class="mr-3" style={{ color: "#F7B614" }}>
          <i class="fas fa-phone-alt"></i> +1 234 567 890
        </span>
        <a href="#" class="nav-link" style={{ color: "#F7B614" }}>
          <i class="fas fa-user"></i>
        </a>
        <a href="#" class="nav-link" style={{ color: "#F7B614" }}>
          <i class="fas fa-shopping-cart"></i>
        </a>
      </div>
    </nav>
  );
}

export default Navbar; // Correct way to export the component

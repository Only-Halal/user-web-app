import React from "react";
import logoOrange from "../assets/logoOrange.png";
import { Button, Box } from "@mui/material";

function Navbar() {
  return (
    <div className="container-fluid nav-div d-flex align-items-center ">
      <nav className="navbar navbar-expand-lg navbar-light bg-light custom-nav sticky-top container">
        <a class="navbar-brand" href="/">
          <img
            src={logoOrange}
            alt="Logo"
            className="img-fluid"
            style={{ height: "auto", width: "220px" }}
          />
        </a>
        <div
          class="d-lg-none ms-auto me-3"
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
          <Button
            variant="text"
            color="inherit"
            sx={{
              fontWeight: 500,
              textTransform: "none",
              "&:hover": {
                color: "#F7B614",
              },
            }}
          >
            Login
          </Button>
          <Button
            variant="contained"
            color="#F7B614"
            sx={{
              textTransform: "none",
              fontWeight: 500,
              boxShadow: "none",
              borderRadius: 2,
              px: 2.5,
              backgroundColor: "#F7B614",
              color: "#000",
              "&:hover": {
                backgroundColor: "#e4a90d",
              },
            }}
          >
            Sign Up
          </Button>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;

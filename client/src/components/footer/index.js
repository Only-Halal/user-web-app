import React from "react";
import { FaFacebookF, FaInstagram } from "react-icons/fa6";
import { IoLogoLinkedin } from "react-icons/io5";
import { FaGooglePlus } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
import { PiClockCountdownFill } from "react-icons/pi";
import { FaMobileAlt } from "react-icons/fa";
import { PiMapPinSimpleAreaBold } from "react-icons/pi";
import { FaCity } from "react-icons/fa";
function Footer() {
  return (
    <>
      <div className="container">
        <footer class="footer bg-footer">
          <div class="container">
            <div class="row">
              <div class="col-lg-4 col-12 mb-0 mb-md-4 pb-0 pb-md-2">
                <p class="mt-4">
                  Build responsive, mobile-first projects on the web with the
                  world's most popular front-end component library.
                </p>
              </div>
              <div class="col-lg-3 col-md-4 col-12 mt-4 mt-sm-0 pt-2 pt-sm-0">
                <h4 class="text-light footer-head">Landing</h4>
                <ul class="list-unstyled footer-list mt-4">
                  <li>
                    <a href="#" class="text-foot">
                      <i class="mdi mdi-chevron-right mr-1"></i> Agency
                    </a>
                  </li>
                  <li>
                    <a href="#" class="text-foot">
                      <i class="mdi mdi-chevron-right mr-1"></i> Software
                    </a>
                  </li>
                  <li>
                    <a href="#" class="text-foot">
                      <i class="mdi mdi-chevron-right mr-1"></i> Startup
                    </a>
                  </li>
                  <li>
                    <a href="#" class="text-foot">
                      <i class="mdi mdi-chevron-right mr-1"></i> Business
                    </a>
                  </li>
                  <li>
                    <a href="#" class="text-foot">
                      <i class="mdi mdi-chevron-right mr-1"></i> Hosting
                    </a>
                  </li>
                  <li>
                    <a href="#" class="text-foot">
                      <i class="mdi mdi-chevron-right mr-1"></i> Studio
                    </a>
                  </li>
                </ul>
              </div>

              <div class="col-lg-2 col-md-4 col-12 mt-4 mt-sm-0 pt-2 pt-sm-0">
                <h4 class="text-light footer-head">About</h4>
                <ul class="list-unstyled footer-list mt-4">
                  <li>
                    <a href="#" class="text-foot">
                      <i class="mdi mdi-chevron-right mr-1"></i> About us
                    </a>
                  </li>
                  <li>
                    <a href="#" class="text-foot">
                      <i class="mdi mdi-chevron-right mr-1"></i> Services
                    </a>
                  </li>
                  <li>
                    <a href="#" class="text-foot">
                      <i class="mdi mdi-chevron-right mr-1"></i> Team
                    </a>
                  </li>
                  <li>
                    <a href="#" class="text-foot">
                      <i class="mdi mdi-chevron-right mr-1"></i> Terms Policy
                    </a>
                  </li>
                  <li>
                    <a href="#" class="text-foot">
                      <i class="mdi mdi-chevron-right mr-1"></i> Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="#" class="text-foot">
                      <i class="mdi mdi-chevron-right mr-1"></i> Login
                    </a>
                  </li>
                </ul>
              </div>

              <div class="col-lg-3 col-md-4 col-12 mt-4 mt-sm-0 pt-2 pt-sm-0">
                <h4 class="text-light footer-head">Locations</h4>
                <ul class="list-unstyled footer-list mt-4">
                  <li>
                    <a href="#" class="text-foot">
                      <i class="mdi mdi-chevron-right mr-1"></i> San Francisco
                    </a>
                  </li>
                  <li>
                    <a href="#" class="text-foot">
                      <i class="mdi mdi-chevron-right mr-1"></i> Tokio
                    </a>
                  </li>
                  <li>
                    <a href="#" class="text-foot">
                      <i class="mdi mdi-chevron-right mr-1"></i> South Korea
                    </a>
                  </li>
                  <li>
                    <a href="#" class="text-foot">
                      <i class="mdi mdi-chevron-right mr-1"></i> Myanmar
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </footer>
        <footer class="footer bg-footer footer-bar">
          <div class="container text-center">
            <div class="row align-items-center">
              <div class="col-sm-6">
                <div class="text-sm-left">
                  <p class="mb-0">
                    &copy; 2025 . desing with Oh
                    <i class="mdi mdi-heart text-danger"></i>
                  </p>
                </div>
              </div>

              <div class="col-sm-6 mt-4 mt-sm-0 pt-2 pt-sm-0">
                <ul class="list-unstyled text-sm-right social-icon social mb-0">
                  <li class="list-inline-item">
                    <a href="#" class="rounded">
                      <FaFacebookF />
                    </a>
                  </li>
                  <li class="list-inline-item">
                    <a href="#" class="rounded">
                      <FaInstagram />
                    </a>
                  </li>
                  <li class="list-inline-item">
                    <a href="#" class="rounded">
                      <FaTwitter />
                    </a>
                  </li>
                  <li class="list-inline-item">
                    <a href="#" class="rounded">
                      <FaGooglePlus />
                    </a>
                  </li>
                  <li class="list-inline-item">
                    <a href="#" class="rounded">
                      <FaLinkedin />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

export default Footer;

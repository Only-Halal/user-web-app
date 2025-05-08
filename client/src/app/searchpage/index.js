import { useEffect } from "react";
import React from "react";
import Navbar from "../../components/navbar";

import { FaFacebookF, FaInstagram } from "react-icons/fa6";
import { IoLogoLinkedin } from "react-icons/io5";
import { FaGooglePlus } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
import { PiClockCountdownFill } from "react-icons/pi";
import { FaMobileAlt } from "react-icons/fa";
import { PiMapPinSimpleAreaBold } from "react-icons/pi";
import { FaCity } from "react-icons/fa";
function SearchPage() {
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      // const left = document.querySelector(".left-banner");
      const right = document.querySelector(".banner-img");

      // if (left) {
      //   left.style.backgroundPositionY = `${10 + scrollY * 0.2}%`;
      // }
      if (right) {
        right.style.backgroundPositionY = `${10 - scrollY * 0.1}%`;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <>
      <Navbar />

      <div
        className="container-fluid banner"
        style={{ backgroundColor: "#F0F2F2" }}
      >
        <div className="banner-div">
          <div className="row">
            <div className="col-lg-6 col-md-6 col-12 d-flex align-items-center justify-content-center left-banner">
              <div className="text-w-searchbar">
                <h4> Enjoy discounts on your first order</h4>

                <div class="input-group mb-3 ">
                  <input
                    type="text"
                    class="form-control input-text"
                    placeholder="Enter Your address...."
                    aria-label="Recipient's username"
                    aria-describedby="basic-addon2"
                  />
                  <div class="input-group-append">
                    <button
                      class="btn btn-outline-warning find-btn"
                      style={{ backgroundColor: "#f8c146", color: "white" }}
                      type="button"
                    >
                      Find Food
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6 col-md-6 col-12 banner-img"></div>
          </div>
        </div>
      </div>
      {/* fire div start */}
      <div className="fire-div" style={{ backgroundColor: "#f2efe6" }}>
        <div className="container ">
          <h2> Enjoy discounts on your first order </h2>
        </div>
        <div className="container-fluid prepare-food-img"></div>
      </div>
      {/* sit and order div start */}
      <div className="container-fluid sit-order-section">
        <div className="row">
          <div className="col-lg-6 col-xl-6 col-md-2 col-12 sit-order-img m-0 p-0">
            <img src="sit-order.jpg" className="img-fluid" />
          </div>
          <div className="col-lg-6  col-xl-6 col-md-2 col-12 sit-order-right">
            <div className="sit-order-text">
              <h2>
                <div style={{ color: "#F7B614" }}>Sit at Home</div>
                <div style={{ color: "white" }}>we will take care</div>
              </h2>
              <p>
                Proin ornare posuere quam ut euismod. Nam eu nunc vitae orci
                ultrices imperdiet ut id ligula. Sed interdum eros eget sagittis
                rutrum. Vestibulum in elementum mauris. In iaculis odio urna.
              </p>
              <ul className="list-unstyled d-flex flex-wrap gap-4">
                <li className="text-center">
                  <PiClockCountdownFill
                    size={48}
                    style={{ color: "#F7B614" }}
                  />{" "}
                  {/* Size in pixels */}
                  <div>Fast Delivery in 1 hour</div>
                </li>
                <li className="text-center">
                  <FaMobileAlt size={48} style={{ color: "#F7B614" }} />
                  <div>Amazing Mobile App</div>
                </li>
                <li className="text-center">
                  <PiMapPinSimpleAreaBold
                    size={48}
                    style={{ color: "#F7B614" }}
                  />
                  <div>Wide coverage Map </div>
                </li>
                <li className="text-center">
                  <FaCity size={48} style={{ color: "#F7B614" }} />
                  <div>More than 50 Cities</div>
                </li>
              </ul>
              <button className="btn btn-warning rounded-pill read-more">
                Read More
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* find in cities divs */}
      <div className="container">
        <div className="find-in-cities">
          <h2 className="py-3"> Find us in these cities and many more! </h2>
          <div className="row mb-3">
            <div className="col-lg-3 col-md-3 col-12">
              <div className="city-card position-relative overflow-hidden rounded-5">
                <a href="#">
                  <img
                    src="/karachi.jpg"
                    alt="Karachi"
                    className="img-fluid rounded-5 shadow city-img"
                  />
                  <div className="overlay">
                    <h5 className="overlay-text">Karachi</h5>
                  </div>
                </a>
              </div>
            </div>
            <div className="col-lg-3 col-md-3 col-12">
              <div className="city-card position-relative overflow-hidden rounded-5">
                <a href="#">
                  <img
                    src="/lahore.jpg"
                    alt="Lahore"
                    className="img-fluid rounded-5 shadow city-img"
                  />
                  <div className="overlay">
                    <h5 className="overlay-text">Lahore</h5>
                  </div>
                </a>
              </div>
            </div>
            <div className="col-lg-3 col-md-3 col-12">
              <div className="city-card position-relative overflow-hidden rounded-5">
                <a href="#">
                  <img
                    src="/islamabad.jpg"
                    alt="Islamabad"
                    className="img-fluid rounded-5 shadow city-img"
                  />
                  <div className="overlay">
                    <h5 className="overlay-text">Islambad</h5>
                  </div>
                </a>
              </div>
            </div>
            <div className="col-lg-3 col-md-3 col-12">
              <div className="city-card position-relative overflow-hidden rounded-5">
                <a href="#">
                  <img
                    src="/azad-kashmir.jpg"
                    alt="Azad kashmir"
                    className="img-fluid rounded-5 shadow city-img"
                  />
                  <div className="overlay">
                    <h5 className="overlay-text">Azad Kashmir</h5>
                  </div>
                </a>
              </div>
            </div>
          </div>
          {/* second row */}
          <div className="row mb-3">
            <div className="col-lg-3 col-md-3 col-12">
              <div className="city-card position-relative overflow-hidden rounded-5">
                <a href="#">
                  <img
                    src="/karachi.jpg"
                    alt="Karachi"
                    className="img-fluid rounded-5 shadow city-img"
                  />
                  <div className="overlay">
                    <h5 className="overlay-text">Karachi</h5>
                  </div>
                </a>
              </div>
            </div>
            <div className="col-lg-3 col-md-3 col-12">
              <div className="city-card position-relative overflow-hidden rounded-5">
                <a href="#">
                  <img
                    src="/lahore.jpg"
                    alt="Lahore"
                    className="img-fluid rounded-5 shadow city-img"
                  />
                  <div className="overlay">
                    <h5 className="overlay-text">Lahore</h5>
                  </div>
                </a>
              </div>
            </div>
            <div className="col-lg-3 col-md-3 col-12">
              <div className="city-card position-relative overflow-hidden rounded-5">
                <a href="#">
                  <img
                    src="/islamabad.jpg"
                    alt="Islamabad"
                    className="img-fluid rounded-5 shadow city-img"
                  />
                  <div className="overlay">
                    <h5 className="overlay-text">Islambad</h5>
                  </div>
                </a>
              </div>
            </div>
            <div className="col-lg-3 col-md-3 col-12">
              <div className="city-card position-relative overflow-hidden rounded-5">
                <a href="#">
                  <img
                    src="/azad-kashmir.jpg"
                    alt="Azad kashmir"
                    className="img-fluid rounded-5 shadow city-img"
                  />
                  <div className="overlay">
                    <h5 className="overlay-text">Azad Kashmir</h5>
                  </div>
                </a>
              </div>
            </div>
          </div>
          {/* third row starts */}
          <div className="row mb-3">
            <div className="col-lg-3 col-md-3 col-12">
              <div className="city-card position-relative overflow-hidden rounded-5">
                <a href="#">
                  <img
                    src="/karachi.jpg"
                    alt="Karachi"
                    className="img-fluid rounded-5 shadow city-img"
                  />
                  <div className="overlay">
                    <h5 className="overlay-text">Karachi</h5>
                  </div>
                </a>
              </div>
            </div>
            <div className="col-lg-3 col-md-3 col-12">
              <div className="city-card position-relative overflow-hidden rounded-5">
                <a href="#">
                  <img
                    src="/lahore.jpg"
                    alt="Lahore"
                    className="img-fluid rounded-5 shadow city-img"
                  />
                  <div className="overlay">
                    <h5 className="overlay-text">Lahore</h5>
                  </div>
                </a>
              </div>
            </div>
            <div className="col-lg-3 col-md-3 col-12">
              <div className="city-card position-relative overflow-hidden rounded-5">
                <a href="#">
                  <img
                    src="/islamabad.jpg"
                    alt="Islamabad"
                    className="img-fluid rounded-5 shadow city-img"
                  />
                  <div className="overlay">
                    <h5 className="overlay-text">Islambad</h5>
                  </div>
                </a>
              </div>
            </div>
            <div className="col-lg-3 col-md-3 col-12">
              <div className="city-card position-relative overflow-hidden rounded-5">
                <a href="#">
                  <img
                    src="/azad-kashmir.jpg"
                    alt="Azad kashmir"
                    className="img-fluid rounded-5 shadow city-img"
                  />
                  <div className="overlay">
                    <h5 className="overlay-text">Azad Kashmir</h5>
                  </div>
                </a>
              </div>
            </div>
          </div>
          {/* fourth row starts */}
          <div className="row mb-3">
            <div className="col-lg-3 col-md-3 col-12">
              <div className="city-card position-relative overflow-hidden rounded-5">
                <a href="#">
                  <img
                    src="/karachi.jpg"
                    alt="Karachi"
                    className="img-fluid rounded-5 shadow city-img"
                  />
                  <div className="overlay">
                    <h5 className="overlay-text">Karachi</h5>
                  </div>
                </a>
              </div>
            </div>
            <div className="col-lg-3 col-md-3 col-12">
              <div className="city-card position-relative overflow-hidden rounded-5">
                <a href="#">
                  <img
                    src="/lahore.jpg"
                    alt="Lahore"
                    className="img-fluid rounded-5 shadow city-img"
                  />
                  <div className="overlay">
                    <h5 className="overlay-text">Lahore</h5>
                  </div>
                </a>
              </div>
            </div>
            <div className="col-lg-3 col-md-3 col-12">
              <div className="city-card position-relative overflow-hidden rounded-5">
                <a href="#">
                  <img
                    src="/islamabad.jpg"
                    alt="Islamabad"
                    className="img-fluid rounded-5 shadow city-img"
                  />
                  <div className="overlay">
                    <h5 className="overlay-text">Islambad</h5>
                  </div>
                </a>
              </div>
            </div>
            <div className="col-lg-3 col-md-3 col-12">
              <div className="city-card position-relative overflow-hidden rounded-5">
                <a href="#">
                  <img
                    src="/azad-kashmir.jpg"
                    alt="Azad kashmir"
                    className="img-fluid rounded-5 shadow city-img"
                  />
                  <div className="overlay">
                    <h5 className="overlay-text">Azad Kashmir</h5>
                  </div>
                </a>
              </div>
            </div>
          </div>{" "}
          <div className="row mb-3">
            <div className="col-lg-3 col-md-3 col-12">
              <div className="city-card position-relative overflow-hidden rounded-5">
                <a href="#">
                  <img
                    src="/karachi.jpg"
                    alt="Karachi"
                    className="img-fluid rounded-5 shadow city-img"
                  />
                  <div className="overlay">
                    <h5 className="overlay-text">Karachi</h5>
                  </div>
                </a>
              </div>
            </div>
            <div className="col-lg-3 col-md-3 col-12">
              <div className="city-card position-relative overflow-hidden rounded-5">
                <a href="#">
                  <img
                    src="/lahore.jpg"
                    alt="Lahore"
                    className="img-fluid rounded-5 shadow city-img"
                  />
                  <div className="overlay">
                    <h5 className="overlay-text">Lahore</h5>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* get more with app */}
      <div className="container-fluid get-more-app">
        <div className="container">
          <div className="row">
            <div class="col-lg-6 col-12 mb-0 mb-md-4 pb-0 pb-md-2">
              <h2> Get More With Our Application</h2>
              <p>
                Nunc pellentesque orci sed tempor pharetra. Morbi molestie purus
                in interdum facilisis. Mauris commodo mi a egestas sollicitudin.
                Mauris pharetra placerat sem vel fringilla.{" "}
              </p>
            </div>
            <div class="col-lg-6 col-12 mb-0 mb-md-4 pb-0 pb-md-2">
              <img src="mobile.png" />
            </div>
          </div>
        </div>
      </div>

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
    </>
  );
}
export default SearchPage;

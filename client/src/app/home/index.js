import React from "react";

import { useEffect, useState } from "react";
import { useRef } from "react";
import Navbar from "../../components/navbar2";
import { PiClockCountdownFill } from "react-icons/pi";
import { FaMobileAlt } from "react-icons/fa";
import { PiMapPinSimpleAreaBold } from "react-icons/pi";
import { FaCity } from "react-icons/fa";
import { FaRegEnvelope } from "react-icons/fa";
import Slider from "../../components/slider"; //importing slider components
import Cards from "../../components/cards";
import Footer from "../../components/footer-home";

function HomePage() {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  return (
    <>
      <Navbar />
      <div className="container-fluid main-div">
        <div className="inner-div container">
          {/* <div className="eclips-div"> </div> */}

          {/* Content here if any */}

          <div className="row">
            <div
              className="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12 d-flex align-items-center"
              style={{ color: "white" }}
            >
              <div className="banner-text d-block mx-auto">
                <h1>
                  Only Halal
                  <span style={{ display: "block", color: "#f7b614" }}>
                    Food Delivery
                  </span>
                </h1>
                <p>
                  Curabitur imperdiet varius lacus, id placerat purus vulputate
                  non. Fusce in felis vel arcu maximus placerat eu ut arcu. Ut
                  nunc ex, gravida vel porttitor et, pretium ac sapien.
                </p>

                <button className="btn btn-warning rounded read-more-btn mt-5">
                  Read More
                </button>
              </div>
            </div>
            <div
              className="bike col-xl-6 col-lg-6 col-md-12 col-sm-12 col--12 d-flex align-items-center "
              style={{ color: "white" }}
            >
              <img src="/home-rider.png" className="img-fluid" />
            </div>
          </div>
        </div>
        {/* custom shape divider start*/}
        <div class="custom-shape-divider-bottom-1746805622">
          <svg
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"
              class="shape-fill"
            ></path>
          </svg>
        </div>
        {/* custom shape ended */}
      </div>
      {/* slider contaiainer */}
      <Slider />

      <div className="container-fluid sit-order-section py-5">
        <div className="row">
          <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12 sit-order-img m-0 p-0 sit-order-img">
            <img src="sit-order.jpg" className="img-fluid" />
          </div>
          <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12 sit-order-right ">
            <div className="sit-order-text">
              <h1 style={{ fontSize: "3rem" }}>
                <div style={{ color: "#F7B614", fontWeight: "bolder" }}>
                  Sit at Home
                </div>
                <div
                  style={{
                    color: "white",
                    fontWeight: "bolder",
                    marginBottom: "2rem",
                  }}
                >
                  we will take care
                </div>
              </h1>
              <p style={{ lineHeight: "2rem" }}>
                <span style={{ display: "block" }}>
                  Proin ornare posuere quam ut euismod. Nam eu nunc vitae orci
                  ultrices.
                </span>
                <span style={{ display: "block" }}>
                  Imperdiet ut id ligula. Sed interdum eros eget sagittis
                  rutrum.
                </span>
                <span style={{ display: "block" }}>
                  Vestibulum in elementum mauris. In iaculis odio urna.
                </span>
              </p>

              <ul className="list-unstyled d-flex flex-wrap gap-4 justify-center sm:justify-start mb-5 ">
                <li className="text-center">
                  <PiClockCountdownFill
                    className="mb-3"
                    size={48}
                    style={{ color: "#F7B614" }}
                  />{" "}
                  {/* Size in pixels */}
                  <div>Fast Delivery in 1 hour</div>
                </li>
                <li className="text-center">
                  <FaMobileAlt
                    className="mb-3"
                    size={48}
                    style={{ color: "#F7B614" }}
                  />
                  <div>Amazing Mobile App</div>
                </li>
                <li className="text-center">
                  <PiMapPinSimpleAreaBold
                    className="mb-3"
                    size={48}
                    style={{ color: "#F7B614" }}
                  />
                  <div>Wide coverage Map </div>
                </li>
                <li className="text-center">
                  <FaCity
                    size={48}
                    style={{ color: "#F7B614", fontWeight: "bolder" }}
                    className="mb-3"
                  />
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
      {/* card section started */}
      <Cards />
      <div className="container-fluid get-more-app">
        <div className="container">
          <div className="row">
            <div class="col-lg-6 col-md-6 col-sm-12 mb-0 mb-md-4 pb-0 pb-md-2">
              <h2 className="mb-5">Get More With Our Application</h2>
              <p>
                Nunc pellentesque orci sed tempor pharetra. Morbi molestie purus
                in interdum facilisis. Mauris commodo mi a egestas sollicitudin.
                Mauris pharetra placerat sem vel fringilla.{" "}
              </p>
            </div>
            <div class="col-lg-6 col-md-6 col-sm-12 mb-0 mb-md-4 pb-0 pb-md-2 d-flex justify-conent-center">
              <img
                src="mobile.png"
                className="img-fluid"
                alt="Responsive image"
              />
            </div>
          </div>
        </div>
        <div className="container-fluid subscribe-section col-lg-12 col-md-12 col-sm-12">
          <div className="container  d-flex align-items-center justify-content-center gap-5">
            <FaRegEnvelope size={48} />
            <h2> Subscribe to our newsletter </h2>

            {/* input field starts */}
            <div class="input-group mb-3 w-50 mx-auto">
              <input
                type="text"
                class="form-control rounded-pill me-2"
                placeholder="Enter something"
              />
              <button class="btn btn-subscribe rounded-pill" type="button">
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="main-footer">
        <div className=" container call-container d-flex justify-content-center mb-5">
          <div className="call-img">
            <img src="call-img" />
          </div>
          <div
            className="call-text d-flex flex-column justify-content-center text-center"
            style={{ height: "160px" }}
          >
            <p> Call us to make order now </p>
            <h1> 90-500-28- 999</h1>
          </div>
        </div>

        <div className=" container footer-logo mb-5 ">
          <img src="logozomoto.png" />
        </div>
        <div className="last-par d-flex justify-content-center">
          <p style={{ color: "white" }}>
            Etiam consequat sem ullamcorper, euismod metus sit amet, tristique
            <br />
            justo. Vestibulum mattis, nisi ut faucibus commodo, risus ex
            commodo.
          </p>
        </div>
      </div>
    </>
  );
}
export default HomePage;

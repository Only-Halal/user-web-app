import React from "react";
import { IoStarSharp } from "react-icons/io5";
import { FaTruck } from "react-icons/fa";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaUsers } from "react-icons/fa";
import { PiHamburger } from "react-icons/pi";
import { useNavigate } from "react-router-dom";
import { CiClock2 } from "react-icons/ci";
import { RiMotorbikeFill } from "react-icons/ri";
import Footer from "../../components/footer";

function RestaurantDetails() {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate("/restaurant-details");
  };
  return (
    <>
      <div className="container">
        <div className="restaurant-details-banner w-100">
          <img src="restaurant-banner.jpeg " className="img-fluid" />
        </div>
        <div className="restaurant-content d-flex align-items-center justify-content-between flex-column flex-md-row">
          {/* restaurant text area started */}

          <div className="restaurant-text mt-3 mb-3">
            <h1 className="fs-3 fs-md-2 fs-lg-1">McDonald's Großbeeren Str.</h1>
            <p className="fs-6 fs-md-5 ">
              4.4{" "}
              <span>
                <IoStarSharp />
              </span>
              (1,500+) (1,500+) • Burgers • American • Info
            </p>
            <p className="fs-6 fs-md-5 ">Tap for hours, info, and more</p>
            <p className="fs-6 fs-md-5 ">
              Großbeerenstr. 22, Berlin, EMEA 12107
            </p>
          </div>
          {/* restaurant text area ended  */}
          {/* restaurant content delivery btns started */}

          <div className="restaurant-content-btns">
            <button type="button" className="btn btn-warning me-2 rounded-5">
              <FaTruck className="me-2" />
              Delivery
            </button>
            <button type="button" className="btn btn-warning me-2 rounded-5">
              <FaMapMarkerAlt className="me-2" />
              Pickup
            </button>
            <button type="button" className="btn btn-warning me-0 rounded-5">
              <FaUsers className="me-2" />
              Group Order
            </button>
          </div>
        </div>
        {/* adress map section started */}
        <div className="container border border-1 rounded-5 mt-3 mb-5">
          <div className="row d-flex align-items-center justify-content-between flex-column flex-md-row">
            <div className="col-xl-8 col-lg-8 col-md-8 col-sm-8  p-0 m-0">
              <div className="map-banner">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3023.608507402832!2d-73.92867492315077!3d40.726634036718345!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25eb7db7ef65b%3A0xab9cb9e0dcf7106a!2sRestaurant%20Depot!5e0!3m2!1sen!2s!4v1748023180528!5m2!1sen!2s" // Replace with your real URL
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Google Map"
                ></iframe>
              </div>
            </div>
            <div className="col-xl-4 col-lg-4 col-md-4 col-sm-4">
              <div className="map-banner-text d-flex flex-row align-items-center  ">
                <div className="map-icons d-flex flex-column me-5 ms-5  ">
                  <FaMapMarkerAlt />
                </div>
                <div className="location-text border-bottom border-1">
                  <h3>Our Location</h3>
                  <p>Großbeerenstr. 22, Berlin, EMEA 12107</p>
                </div>
              </div>
              <div className="map-banner-text d-flex flex-row align-items-center ">
                <div className="map-icons d-flex flex-column me-5 ms-5">
                  <FaMapMarkerAlt />
                </div>
                <div className="location-text">
                  <h3>Open</h3>
                  <p> Open Until 1: 30 PM </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* card of features items items are startede */}
        <div className="featured-items mb-5">
          <div className="row">
            <div className="delivery-item-header ">
              <h1 className="fs-3 fs-md-2 fs-lg-1">Feature Items</h1>
            </div>
            <div className="col-xl-3 col-lg-3 col-md-4 col-sm-12">
              <div class="restaurant-card " onClick={handleClick}>
                <div class="image">
                  <img src="card-soap.jpeg" />
                </div>
                <div class="card-inner">
                  <div class="header">
                    <h4>Family Food Court</h4>
                    <h5>Fast Food</h5>
                  </div>
                  <div class="content ">
                    <p className="d-flex justify-content-start align-items-center ">
                      <span className="me-2">
                        <CiClock2 size={24} />
                      </span>
                      30–45min
                      <span className="mx-3">
                        <RiMotorbikeFill size={24} />
                      </span>
                      TK 49
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-lg-3 col-md-4 col-sm-12">
              <div class="restaurant-card " onClick={handleClick}>
                <div class="image">
                  <img src="card-burger.jpg" />
                </div>
                <div class="card-inner">
                  <div class="header">
                    <h4>Family Food Court</h4>
                    <h5>Fast Food</h5>
                  </div>
                  <div class="content ">
                    <p className="d-flex justify-content-start align-items-center ">
                      <span className="me-2">
                        <CiClock2 size={24} />
                      </span>
                      30–45min
                      <span className="mx-3">
                        <RiMotorbikeFill size={24} />
                      </span>
                      TK 49
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-lg-3 col-md-4 col-sm-12">
              <div class="restaurant-card " onClick={handleClick}>
                <div class="image">
                  <img src="card-fries2.jpeg" />
                </div>
                <div class="card-inner">
                  <div class="header">
                    <h4>Family Food Court</h4>
                    <h5>Fast Food</h5>
                  </div>
                  <div class="content ">
                    <p className="d-flex justify-content-start align-items-center ">
                      <span className="me-2">
                        <CiClock2 size={24} />
                      </span>
                      30–45min
                      <span className="mx-3">
                        <RiMotorbikeFill size={24} />
                      </span>
                      TK 49
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-lg-3 col-md-4 col-sm-12">
              <div class="restaurant-card " onClick={handleClick}>
                <div class="image">
                  <img src="card-soap.jpeg" />
                </div>
                <div class="card-inner">
                  <div class="header">
                    <h4>Family Food Court</h4>
                    <h5>Fast Food</h5>
                  </div>
                  <div class="content ">
                    <p className="d-flex justify-content-start align-items-center ">
                      <span className="me-2">
                        <CiClock2 size={24} />
                      </span>
                      30–45min
                      <span className="mx-3">
                        <RiMotorbikeFill size={24} />
                      </span>
                      TK 49
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* featured item ended*/}
        {/* New Arrival started */}
        <div className="featured-items mb-5">
          <div className="row">
            <div className="delivery-item-header ">
              <h1 className="fs-3 fs-md-2 fs-lg-1">New Arrival Items</h1>
            </div>
            <div className="col-xl-3 col-lg-3 col-md-4 col-sm-12">
              <div class="restaurant-card " onClick={handleClick}>
                <div class="image">
                  <img src="card-soap.jpeg" />
                </div>
                <div class="card-inner">
                  <div class="header">
                    <h4>Family Food Court</h4>
                    <h5>Fast Food</h5>
                  </div>
                  <div class="content ">
                    <p className="d-flex justify-content-start align-items-center ">
                      <span className="me-2">
                        <CiClock2 size={24} />
                      </span>
                      30–45min
                      <span className="mx-3">
                        <RiMotorbikeFill size={24} />
                      </span>
                      TK 49
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-lg-3 col-md-4 col-sm-12">
              <div class="restaurant-card " onClick={handleClick}>
                <div class="image">
                  <img src="card-burger.jpg" />
                </div>
                <div class="card-inner">
                  <div class="header">
                    <h4>Family Food Court</h4>
                    <h5>Fast Food</h5>
                  </div>
                  <div class="content ">
                    <p className="d-flex justify-content-start align-items-center ">
                      <span className="me-2">
                        <CiClock2 size={24} />
                      </span>
                      30–45min
                      <span className="mx-3">
                        <RiMotorbikeFill size={24} />
                      </span>
                      TK 49
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-lg-3 col-md-4 col-sm-12">
              <div class="restaurant-card " onClick={handleClick}>
                <div class="image">
                  <img src="card-fries2.jpeg" />
                </div>
                <div class="card-inner">
                  <div class="header">
                    <h4>Family Food Court</h4>
                    <h5>Fast Food</h5>
                  </div>
                  <div class="content ">
                    <p className="d-flex justify-content-start align-items-center ">
                      <span className="me-2">
                        <CiClock2 size={24} />
                      </span>
                      30–45min
                      <span className="mx-3">
                        <RiMotorbikeFill size={24} />
                      </span>
                      TK 49
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-lg-3 col-md-4 col-sm-12">
              <div class="restaurant-card " onClick={handleClick}>
                <div class="image">
                  <img src="card-soap.jpeg" />
                </div>
                <div class="card-inner">
                  <div class="header">
                    <h4>Family Food Court</h4>
                    <h5>Fast Food</h5>
                  </div>
                  <div class="content ">
                    <p className="d-flex justify-content-start align-items-center ">
                      <span className="me-2">
                        <CiClock2 size={24} />
                      </span>
                      30–45min
                      <span className="mx-3">
                        <RiMotorbikeFill size={24} />
                      </span>
                      TK 49
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* New Arrival ended */}
      </div>
      <div className="container">
        <Footer />
      </div>
    </>
  );
}

export default RestaurantDetails;

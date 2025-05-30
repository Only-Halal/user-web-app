import React from "react";
import { RiMotorbikeFill } from "react-icons/ri";
import { CiClock2 } from "react-icons/ci";
import { useNavigate } from "react-router-dom";

function Restaurants() {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate("/restaurant-details");
  };
  return (
    <div className="container">
      <div className="row mb-5">
        <div class="col-xl-4 col-lg-4 col-md-6 col-sm-12">
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
        <div class="col-xl-4 col-lg-4 col-md-6 col-sm-12">
          <div class="restaurant-card " onClick={handleClick}>
            <div class="image">
              <img src="card-nihari.jpeg" />
            </div>
            <div class="card-inner">
              <div class="header">
                <h4>Family Food Court</h4>
                <h5>Fast Food</h5>
              </div>
              <div class="content ">
                <p className="d-flex justify-content-start align-items-center">
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
        <div class="col-xl-4 col-lg-4 col-md-6 col-sm-12">
          <div class="restaurant-card">
            <div class="image">
              <img src="card-fries.jpg" />
            </div>
            <div class="card-inner">
              <div class="header">
                <h4>Family Food Court</h4>
                <h5>Fast Food</h5>
              </div>
              <div class="content ">
                <p className="d-flex justify-content-start align-items-center">
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

      {/* second row started */}
      <div className="row mb-5">
        <div class="col-xl-4 col-lg-4 col-md-6 col-sm-12">
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
        <div class="col-xl-4 col-lg-4 col-md-6 col-sm-12">
          <div class="restaurant-card " onClick={handleClick}>
            <div class="image">
              <img src="card-nihari.jpeg" />
            </div>
            <div class="card-inner">
              <div class="header">
                <h4>Family Food Court</h4>
                <h5>Fast Food</h5>
              </div>
              <div class="content ">
                <p className="d-flex justify-content-start align-items-center">
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
        <div class="col-xl-4 col-lg-4 col-md-6 col-sm-12">
          <div class="restaurant-card">
            <div class="image">
              <img src="card-fries.jpg" />
            </div>
            <div class="card-inner">
              <div class="header">
                <h4>Family Food Court</h4>
                <h5>Fast Food</h5>
              </div>
              <div class="content ">
                <p className="d-flex justify-content-start align-items-center">
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

      {/* third row started */}

      <div className="row mb-5">
        <div class="col-xl-4 col-lg-4 col-md-6 col-sm-12">
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
        <div class="col-xl-4 col-lg-4 col-md-6 col-sm-12">
          <div class="restaurant-card " onClick={handleClick}>
            <div class="image">
              <img src="card-nihari.jpeg" />
            </div>
            <div class="card-inner">
              <div class="header">
                <h4>Family Food Court</h4>
                <h5>Fast Food</h5>
              </div>
              <div class="content ">
                <p className="d-flex justify-content-start align-items-center">
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
        <div class="col-xl-4 col-lg-4 col-md-6 col-sm-12">
          <div class="restaurant-card">
            <div class="image">
              <img src="card-fries.jpg" />
            </div>
            <div class="card-inner">
              <div class="header">
                <h4>Family Food Court</h4>
                <h5>Fast Food</h5>
              </div>
              <div class="content ">
                <p className="d-flex justify-content-start align-items-center">
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
  );
}
export default Restaurants;

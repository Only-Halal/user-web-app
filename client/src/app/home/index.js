import { useEffect } from "react";
import React from "react";
import Navbar from "../../components/navbar2";

function HomePage() {
  return (
    <>
      <Navbar />
      <div className="container-fluid main-div">
        <div className="inner-div container">
          {/* Content here if any */}

          <div className="row">
            <div
              className="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12 d-flex align-items-center"
              style={{ color: "white" }}
            >
              <div className="banner-text">
                <h1>
                  Express
                  <span style={{ display: "block", color: "#f7b614" }}>
                    Home Delivery
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
              className="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12 d-flex align-items-center"
              style={{ color: "white" }}
            >
              <img src="/home-rider.png" className="img-fluid" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default HomePage;

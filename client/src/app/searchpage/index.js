import React from "react";
import Navbar from "../../components/navbar";

function SearchPage() {
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
                    placeholder="Search products...."
                    aria-label="Recipient's username"
                    aria-describedby="basic-addon2"
                  />
                  <div class="input-group-append">
                    <button
                      class="btn btn-outline-warning btn-lg"
                      type="button"
                    >
                      <i class="fa fa-search"></i>
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
      <div className="fire-div" style={{ backgroundColor: "#FFEEB896" }}>
        <div className="container ">
          <h2> Enjoy discounts on your first order </h2>
        </div>
        <div className="container-fluid prepare-food-img"></div>
      </div>
      {/* find in cities divs */}
      <div className="container">
        <div className="find-in-cities">
          <h2 className="py-3"> Find us in these cities and many more! </h2>
          <div className="row">
            <div className="col-lg-3 col-md-3 col-12">
              <a href="#">
                <img
                  src="/lahore.jpg"
                  alt="Logo"
                  class="img-fluid rounded-5 shadow"
                />
              </a>
            </div>
            <div className="col-lg-3 col-md-3 col-12">
              <a href="#">
                <img
                  src="/karachi.jpg"
                  alt="Logo"
                  class="img-fluid rounded-5 shadow"
                />
              </a>
            </div>
            <div className="col-lg-3 col-md-3 col-12">
              <a href="#">
                <img
                  src="/azad-kashmir.jpg"
                  alt="Logo"
                  className="img-fluid rounded-5 shadow"
                />
              </a>
            </div>
            <div className="col-lg-3 col-md-3 col-12 mb-5">
              <a href="#">
                <img
                  src="/islamabad.jpg"
                  alt="Logo"
                  className="img-fluid rounded-5 shadow"
                />
              </a>
            </div>
          </div>
        </div>
        {/* second row start */}
        <div className="find-in-cities ">
          <div className="row">
            <div className="col-lg-3 col-md-3 col-12 img-container">
              <a href="#">
                <img
                  src="/lahore.jpg"
                  alt="Logo"
                  className="img-fluid rounded-5 shadow"
                />
              </a>
            </div>
            <div className="col-lg-3 col-md-3 col-12">
              <a href="#">
                <img
                  src="/karachi.jpg"
                  alt="Logo"
                  className="img-fluid rounded-5 shadow"
                />
              </a>
            </div>
            <div className="col-lg-3 col-md-3 col-12">
              <a href="#">
                <img
                  src="/azad-kashmir.jpg"
                  alt="Logo"
                  className="img-fluid rounded-5 shadow"
                />
              </a>
            </div>
            <div className="col-lg-3 col-md-3 col-12 mb-5">
              <a href="#">
                <img
                  src="/islamabad.jpg"
                  alt="Logo"
                  className="img-fluid rounded-5 shadow"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default SearchPage;

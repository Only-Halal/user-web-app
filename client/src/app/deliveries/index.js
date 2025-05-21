import React, { Component } from "react";
import Navbar from "../../components/navbar2";
import Footer from "../../components/footer";
import "../../styles/footer.css";
import Card from "../../components/filter-btn";
import { MdWidthFull } from "react-icons/md";

function Deliveries() {
  return (
    <>
      <Navbar />
      <div className="container-fluid main-div">
        <div className="inner-div container">
          {/* <div className="eclips-div"> </div> */}

          {/* Content here if any */}

          <div className="row">
            <div
              className="col-xl-6 col-lg-6 col-md-12 col-sm-4 col-12 d-flex align-items-center"
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
      <Card />
      {/* ul li of city */}
      {/* <div class="container-fluid bg-white shadow-sm sticky-top py-2 z-3">
        <div class="row justify-content-center">
          <div class="col-auto">
            <button class="btn btn-outline-warning mx-2">Price</button>
            <button class="btn btn-outline-warning mx-2">Cousin</button>
            <button class="btn btn-outline-warning mx-2">Dine In</button>
            <button class="btn btn-outline-warning mx-2">Fries</button>
            <button class="btn btn-outline-warning mx-2">Drinks</button>
            <button class="btn btn-outline-warning mx-2">
              How to only halal
            </button>
          </div>
        </div>
      </div>
      
      */}
      {/* alternate button */}
      <div className="container">
        <ul class="delivery-lists my-5">
          <li>
            <a href="/home">Home</a>
          </li>
          <li>New York</li>
        </ul>
        <div
          className="card card-deliveries"
          style={{ width: "18rem", overflow: "hidden" }}
        >
          <img src="card-kabab.jpg" />
          <div class="card-body">
            <p class="card-text">
              Some quick example text to build on the card title and make up the
              bulk of the card's content.
            </p>
          </div>
        </div>{" "}
      </div>
      {/* <div class="card">
        <div class="Box">
          <img src="https://images.pexels.com/photos/594610/pexels-photo-594610.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500" />
        </div>
        <div class="details">
          <h2>Lorem ipsum dolor</h2>
          <p>
            consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
            labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo
            consequat. Duis aute irure dolor in reprehenderit in voluptate velit
            esse cillum dolore eu fugiat nulla pariatur.{" "}
          </p>
        </div>
      </div>
      <div class="card">
        <div class="Box">
          <img src="https://images.pexels.com/photos/3699319/pexels-photo-3699319.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500" />
        </div>
        <div class="details">
          <h2>Lorem ipsum dolor</h2>
          <p>
            consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
            labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo
            consequat. Duis aute irure dolor in reprehenderit in voluptate velit
            esse cillum dolore eu fugiat nulla pariatur.{" "}
          </p>
        </div>
      </div>
      <div class="card">
        <div class="Box">
          <img src="https://images.pexels.com/photos/598917/pexels-photo-598917.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500" />
        </div>
        <div class="details">
          <h2>Lorem ipsum dolor</h2>
          <p>
            consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
            labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo
            consequat. Duis aute irure dolor in reprehenderit in voluptate velit
            esse cillum dolore eu fugiat nulla pariatur.{" "}
          </p>
        </div>
      </div> */}
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
      ;
    </>
  );
}

export default Deliveries;

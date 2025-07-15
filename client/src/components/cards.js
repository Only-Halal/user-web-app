import React from "react";
import { PiHamburger } from "react-icons/pi";
import { CiPizza } from "react-icons/ci";
import { TbBowlSpoon } from "react-icons/tb";
import { GiMeatCleaver } from "react-icons/gi";

function Cards() {
  return (
    <div className="container card-div">
      <div className="cards-home">
        <div className="container my-5">
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
            <div className="col">
              <div
                className="card p-3 shadow-sm rounded"
                style={{ backgroundColor: "#f2efe6" }}
              >
                <div className="d-flex align-items-center">
                  <div
                    className="d-flex justify-content-center align-items-center me-3"
                    style={{
                      backgroundColor: "#F7B614",
                      borderRadius: "50%",
                      width: "100px",
                      height: "100px",
                    }}
                  >
                    <PiHamburger size={40} color="#282932" />
                  </div>

                  <div>
                    <h5 className="mb-0">React Card Title</h5>
                  </div>
                </div>
              </div>
            </div>

            <div className="col">
              <div
                className="card p-3 shadow-sm rounded"
                style={{ backgroundColor: "#f2efe6" }}
              >
                <div className="d-flex align-items-center">
                  <div
                    className="d-flex justify-content-center align-items-center me-3"
                    style={{
                      backgroundColor: "#F7B614",
                      borderRadius: "50%",
                      width: "100px",
                      height: "100px",
                    }}
                  >
                    <CiPizza size={40} color="#282932" />
                  </div>

                  <div>
                    <h5 className="mb-0">React Card Title</h5>
                  </div>
                </div>
              </div>
            </div>

            <div className="col">
              <div
                className="card p-3 shadow-sm rounded"
                style={{ backgroundColor: "#f2efe6" }}
              >
                <div className="d-flex align-items-center">
                  <div
                    className="d-flex justify-content-center align-items-center me-3"
                    style={{
                      backgroundColor: "#F7B614",
                      borderRadius: "50%",
                      width: "100px",
                      height: "100px",
                    }}
                  >
                    <TbBowlSpoon size={40} color="#282932" />
                  </div>

                  <div>
                    <h5 className="mb-0">React Card Title</h5>
                  </div>
                </div>
              </div>
            </div>

            <div className="col">
              <div
                className="card p-3 shadow-sm rounded"
                style={{ backgroundColor: "#f2efe6" }}
              >
                <div className="d-flex align-items-center">
                  <div
                    className="d-flex justify-content-center align-items-center me-3"
                    style={{
                      backgroundColor: "#F7B614",
                      borderRadius: "50%",
                      width: "100px",
                      height: "100px",
                    }}
                  >
                    <GiMeatCleaver size={40} color="#282932" />
                  </div>

                  <div>
                    <h5 className="mb-0">React Card Title</h5>
                  </div>
                </div>
              </div>
            </div>
            <div className="col">
              <div
                className="card p-3 shadow-sm rounded"
                style={{ backgroundColor: "#f2efe6" }}
              >
                <div className="d-flex align-items-center">
                  <div
                    className="d-flex justify-content-center align-items-center me-3"
                    style={{
                      backgroundColor: "#F7B614",
                      borderRadius: "50%",
                      width: "100px",
                      height: "100px",
                    }}
                  >
                    <GiMeatCleaver size={40} color="#282932" />
                  </div>

                  <div>
                    <h5 className="mb-0">React Card Title</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cards;

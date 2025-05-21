import React from "react";
import { IoPricetagsOutline } from "react-icons/io5";
import { CiPizza } from "react-icons/ci";
import { TbBowlSpoon } from "react-icons/tb";
import { GiMeatCleaver } from "react-icons/gi";
import { MdDeliveryDining } from "react-icons/md";

function Cards() {
  return (
    <div className="container filter-btns">
      <div className="cards-home">
        <div className="container my-5">
          <div className="row row-cols-2 row-cols-md-6 row-cols-lg-6 g-4">
            {/* Card 1 */}
            <div className="col">
              <div
                className="card p-2 shadow-sm rounded"
                style={{ backgroundColor: "#f2efe6" }} // Ensure rounded corners
              >
                <div className="filter-btn d-flex flex-column align-items-center justify-contentc-center text-center">
                  {/* Icon in circle */}
                  <div
                    className="d-flex justify-content-center align-items-center "
                    style={{
                      backgroundColor: "#F7B614",
                      borderRadius: "50%",
                      width: "50px",
                      height: "50px",
                    }}
                  >
                    <IoPricetagsOutline size={30} color="#282932" />
                  </div>

                  {/* Title */}
                  <div>
                    <h6 className="mb-0">Price</h6>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="col">
              <div
                className="card p-2 shadow-sm rounded"
                style={{ backgroundColor: "#f2efe6" }} // Ensure rounded corners
              >
                <div className="filter-btn d-flex flex-column align-items-center justify-contentc-center text-center">
                  {/* Icon in circle */}
                  <div
                    className="d-flex justify-content-center align-items-center "
                    style={{
                      backgroundColor: "#F7B614",
                      borderRadius: "50%",
                      width: "50px",
                      height: "50px",
                    }}
                  >
                    <CiPizza size={40} color="#282932" />
                  </div>

                  {/* Title */}
                  <div>
                    <h6 className="mb-0">Cuisine</h6>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="col">
              <div
                className="card p-2 shadow-sm rounded"
                style={{ backgroundColor: "#f2efe6" }} // Ensure rounded corners
              >
                <div className="filter-btn d-flex flex-column align-items-center justify-contentc-center text-center">
                  {/* Icon in circle */}
                  <div
                    className="d-flex justify-content-center align-items-center "
                    style={{
                      backgroundColor: "#F7B614",
                      borderRadius: "50%",
                      width: "50px",
                      height: "50px",
                    }}
                  >
                    <TbBowlSpoon size={40} color="#282932" />
                  </div>

                  {/* Title */}
                  <div>
                    <h6 className="mb-0">Dine in</h6>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4 */}
            <div className="col">
              <div
                className="card p-2 shadow-sm rounded"
                style={{ backgroundColor: "#f2efe6" }} // Ensure rounded corners
              >
                <div className="filter-btn d-flex flex-column align-items-center justify-contentc-center text-center">
                  {/* Icon in circle */}
                  <div
                    className="d-flex justify-content-center align-items-center "
                    style={{
                      backgroundColor: "#F7B614",
                      borderRadius: "50%",
                      width: "50px",
                      height: "50px",
                    }}
                  >
                    <MdDeliveryDining size={40} color="#282932" />
                  </div>

                  {/* Title */}
                  <div className="text-center">
                    <h6 className="mb-0">Restaurant Picks</h6>
                  </div>
                </div>
              </div>
            </div>
            {/* card 5 */}
            <div className="col">
              <div
                className="card p-2 shadow-sm rounded"
                style={{ backgroundColor: "#f2efe6" }} // Ensure rounded corners
              >
                <div className="filter-btn d-flex flex-column align-items-center justify-contentc-center text-center">
                  {/* Icon in circle */}
                  <div
                    className="d-flex justify-content-center align-items-center "
                    style={{
                      backgroundColor: "#F7B614",
                      borderRadius: "50%",
                      width: "50px",
                      height: "50px",
                    }}
                  >
                    <GiMeatCleaver size={40} color="#282932" />
                  </div>

                  {/* Title */}
                  <div>
                    <h6 className="mb-0">only halal</h6>
                  </div>
                </div>
              </div>
            </div>
            <div className="col">
              <div
                className="card p-2 shadow-sm rounded"
                style={{ backgroundColor: "#f2efe6" }} // Ensure rounded corners
              >
                <div className="filter-btn d-flex flex-column align-items-center justify-contentc-center text-center">
                  {/* Icon in circle */}
                  <div
                    className="d-flex justify-content-center align-items-center "
                    style={{
                      backgroundColor: "#F7B614",
                      borderRadius: "50%",
                      width: "50px",
                      height: "50px",
                    }}
                  >
                    <GiMeatCleaver size={40} color="#282932" />
                  </div>

                  {/* Title */}
                  <div>
                    <h6 className="mb-0">only halal</h6>
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

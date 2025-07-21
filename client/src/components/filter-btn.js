import React from "react";
import { IoPricetagsOutline } from "react-icons/io5";
import { CiPizza } from "react-icons/ci";
import { TbBowlSpoon } from "react-icons/tb";
import { GiMeatCleaver } from "react-icons/gi";
import { MdDeliveryDining } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const cardItems = [
  { icon: <IoPricetagsOutline size="1.5em" />, title: "Price" },
  { icon: <CiPizza size="1.7em" />, title: "Cuisine" },
  { icon: <TbBowlSpoon size="1.7em" />, title: "Dine in" },
  { icon: <MdDeliveryDining size="1.7em" />, title: "Restaurant Picks" },
  { icon: <GiMeatCleaver size="1.7em" />, title: "Only Halal" },
  { icon: <GiMeatCleaver size="1.7em" />, title: "Butcher Choice" },
];

function Cards() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("#");
  };

  return (
    <div className="container my-4">
      <div className="row row-cols-2 row-cols-md-6 g-3" onClick={handleClick}>
        {cardItems.map((item, idx) => (
          <div className="col" key={idx}>
            <div
              className="card p-3 text-center shadow-sm rounded hover-shadow"
              style={{ backgroundColor: "#f8f6f0", cursor: "pointer" }}
            >
              <div className="d-flex flex-column align-items-center gap-2">
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    backgroundColor: "#F7B614",
                    borderRadius: "50%",
                    width: "55px",
                    height: "55px",
                  }}
                >
                  {item.icon}
                </div>
                <h6 className="mb-0 text-dark">{item.title}</h6>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Cards;

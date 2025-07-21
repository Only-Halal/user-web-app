import React, { useState } from "react";
import { IoStarSharp } from "react-icons/io5";
import { FaTruck, FaMapMarkerAlt, FaUsers } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import FoodModal from "../components/modal";
import cardBurger from "../assets/cardBurger.jpg";
import cardPizza from "../assets/cardPizza.jpg";

const foodList = [
  {
    id: 1,
    name: "Burger",
    section: "Popular",
    description: "Delicious beef burger",
    price: "Rs. 499",
    image: cardBurger,
  },
  {
    id: 2,
    name: "Pizza",
    section: "Popular",
    description: "Cheesy pepperoni pizza",
    price: "Rs. 899",
    image: cardPizza,
  },
  {
    id: 3,
    name: "Zinger Deal",
    section: "Deals",
    description: "Zinger + Fries + Drink",
    price: "Rs. 699",
    image: cardBurger,
  },
  {
    id: 4,
    name: "Chicken Biryani",
    section: "Rice",
    description: "Spicy chicken biryani with raita",
    price: "Rs. 349",
    image: cardPizza,
  },
  {
    id: 5,
    name: "Masala Fries",
    section: "Fries",
    description: "Crispy masala French fries",
    price: "Rs. 199",
    image: cardBurger,
  },
  {
    id: 6,
    name: "Lava Cake",
    section: "More",
    description: "Warm chocolate lava cake",
    price: "Rs. 249",
    image: cardPizza,
  },
  {
    id: 7,
    name: "Coca-Cola",
    section: "Drinks",
    description: "Chilled soft drink",
    price: "Rs. 99",
    image: cardBurger,
  },
  {
    id: 8,
    name: "Ice Cream Cup",
    section: "Desserts",
    description: "Vanilla ice cream cup",
    price: "Rs. 149",
    image: cardPizza,
  },
  {
    id: 9,
    name: "Family Combo",
    section: "Combos",
    description: "2 Burgers + Fries + 2 Drinks",
    price: "Rs. 999",
    image: cardBurger,
  },
  {
    id: 10,
    name: "Kids Meal",
    section: "Kids Meal",
    description: "Mini burger + toy",
    price: "Rs. 399",
    image: cardPizza,
  },
];

const sections = [
  "All",
  "Popular",
  "Deals",
  "Rice",
  "Fries",
  "More",
  "Drinks",
  "Desserts",
  "Combos",
  "Kids Meal",
];

function RestaurantMenu() {
  const navigate = useNavigate();
  const [selectedFood, setSelectedFood] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeSection, setActiveSection] = useState("All");

  const handleFoodClick = (food) => {
    setSelectedFood(food);
    setShowModal(true);
  };

  const filteredFood =
    activeSection === "All"
      ? foodList
      : foodList.filter((food) => food.section === activeSection);

  return (
    <div className="container my-5">
      {/* Restaurant Info */}
      <div className="row align-items-center mb-4">
        <div className="col-md-2">
          <img
            src="/restaurant-banner.jpeg"
            className="img-fluid rounded shadow-sm"
            alt="Restaurant"
          />
        </div>
        <div className="col-md-6">
          <h3 className="fw-bold">McDonald's Großbeeren Str.</h3>
          <p className="mb-1 text-muted">
            4.4 <IoStarSharp className="text-warning" /> (1,500+) • Burgers •
            American • Info
          </p>
          <p className="text-muted">Großbeerenstr. 22, Berlin, EMEA 12107</p>
        </div>
        <div className="col-md-4 text-md-end mt-3 mt-md-0">
          <button className="btn btn-warning me-2 rounded-pill">
            <FaTruck /> Delivery
          </button>
          <button className="btn btn-outline-warning me-2 rounded-pill">
            <FaMapMarkerAlt /> Pickup
          </button>
          <button className="btn btn-outline-secondary rounded-pill">
            <FaUsers /> Group Order
          </button>
        </div>
      </div>

      {/* Google Map */}
      <div className="border rounded p-3 mb-5 bg-light">
        <div className="row">
          <div className="col-md-8">
            <iframe
              title="Google Map"
              src="https://www.google.com/maps/embed?pb=..."
              style={{ width: "100%", height: "250px", border: 0 }}
              loading="lazy"
              allowFullScreen
              className="rounded"
            />
          </div>
          <div className="col-md-4 d-flex flex-column justify-content-center">
            <h5 className="fw-semibold">Our Location</h5>
            <p>Großbeerenstr. 22, Berlin, EMEA 12107</p>
            <h6 className="fw-semibold text-success">Open Now</h6>
            <p>Until 1:30 PM</p>
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="mb-4">
        <ul className="nav nav-pills flex-wrap justify-content-start gap-2">
          {sections.map((section) => (
            <li className="nav-item" key={section}>
              <button
                className={`nav-link px-4 py-2 rounded-pill ${
                  activeSection === section
                    ? "active"
                    : "text-dark bg-light border"
                }`}
                style={{
                  transition: "0.3s",
                  fontWeight: activeSection === section ? "bold" : "normal",
                  boxShadow:
                    activeSection === section
                      ? "0 4px 12px rgba(0,0,0,0.1)"
                      : "none",
                }}
                onClick={() => setActiveSection(section)}
              >
                {section}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Section Heading */}
      <h4 className="fw-bold mb-4 border-bottom pb-2">
        {activeSection === "All" ? "All Items" : `${activeSection} Items`}
      </h4>

      {/* Food Cards */}
      <div className="row">
        {filteredFood.length === 0 ? (
          <div className="col-12 text-center text-muted">
            <p>No items available in this section.</p>
          </div>
        ) : (
          filteredFood.map((food) => (
            <div className="col-md-6 mb-4" key={food.id}>
              <div
                className="card h-100 shadow-sm border-0"
                onClick={() => handleFoodClick(food)}
                style={{ cursor: "pointer" }}
              >
                <div className="row g-0">
                  <div className="col-8">
                    <div className="card-body">
                      <h5 className="card-title fw-bold">{food.name}</h5>
                      <p className="card-text text-muted">{food.description}</p>
                      <p className="fw-bold text-success">{food.price}</p>
                    </div>
                  </div>
                  <div className="col-4">
                    <img
                      src={food.image}
                      className="img-fluid h-100 object-fit-cover rounded-end"
                      alt={food.name}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <FoodModal
        show={showModal}
        onClose={() => setShowModal(false)}
        food={selectedFood}
      />
    </div>
  );
}

export default RestaurantMenu;

import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/appContext";
import { FiLogOut } from "react-icons/fi";
import { FaChevronLeft } from "react-icons/fa";
import "../styles/header.css";

const Header = ({ name }) => {
  const navigate = useNavigate();
  const { setAuthToken, setSelectedAddress } = useContext(AppContext);

  const handleBack = () => {
    if (name === "Orders History" || name === "Support") {
      navigate("/home");
    } else {
      navigate(-1);
    }
  };

  const handleLogOut = () => {
    localStorage.clear();
    setAuthToken("");
    setSelectedAddress("");
    navigate("/auth");
  };

  return (
    <div className="header-container">
      <div className="header-left">
        <button className="back-button" onClick={handleBack}>
          <FaChevronLeft size={18} />
        </button>
        <h2 className="header-title">{name}</h2>
      </div>
      {name === "Profile" && (
        <button className="logout-button" onClick={handleLogOut}>
          <FiLogOut size={18} />
          <span>Logout</span>
        </button>
      )}
    </div>
  );
};

export default Header;

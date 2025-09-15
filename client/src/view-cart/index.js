import React from "react";
import Navbar from "../components/navbar2";
import styles from "../styles/view-cart.css";
import Footer from "../components/footer";
import { GrLocation } from "react-icons/gr";
import { FaCcVisa, FaWallet, FaApplePay } from 'react-icons/fa';
import { RiArrowDropDownLine } from 'react-icons/ri';


function ViewCart() {


  // dleivery address
  const [editdDliveryAddress, setEditdDliveryAddress] = React.useState(false)
  const [deliveryData, setDeliveryData] = React.useState({
    address: "xyz appartment",
    city: "Karachi",
    country: "Pakistan",
    floor: "R1234"
  })

  const changeAddress = (e) => {
    setDeliveryData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  }
  // Delivery options
  const [selectedOption, setSelectedOption] = React.useState(null);

  // Payment methods
  const [selectedPayment, setSelectedPayment] = React.useState('visa');
  const handleVisaChange = () => {
    alert('Change Visa card details!');
  }

  // Personal details
  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState({
    email: "xyz@gmail.com",
    firstName: "john",
    lastName: "Dow",
    phoneNumber: "1234567890"
  });

  const ChangePersonalInfo = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  }

  const handleSave = () => {
    setIsEditing(false);
  }

  //Tip options
  const [selectedTip, setSelectedTip] = React.useState("");
  const [customTip, setCustomTip] = React.useState("");

  const handleTipSelect = (value) => {
    setSelectedTip(value);
    if (value !== "custom") setCustomTip("");
  };


  return (

    <>
      <Navbar />

      <div className='page'>

        <div className="entire-page">
          <div className="page-top">
            <div className="">
              <h1 className="heading">Review and place your order</h1>
            </div>
          </div>

          <div className="page-left-right">
            <div className='page-left'>
              {/* // Delivery details */}
              <div className="delivery-details">
                <div className="delivery-details-header">
                  <h3 className="heading">Delivery address</h3>
                  <button className="delivery-details-header-btn" onClick={() => setEditdDliveryAddress(!editdDliveryAddress)}>
                    {editdDliveryAddress ? "cancel" : "Change"}
                  </button>
                </div>

                {/* {!editdDliveryAddress ? (
                  <div>
                    <p>{deliveryData.address}</p>
                    <p>{deliveryData.city}, {deliveryData.country}</p>
                    <p>Floor: {deliveryData.floor}</p>
                  </div>
                ) : (

                )} */}

                <div className="delivery-details-content">
                  <div className="delivery-details-content-address">
                    <GrLocation size={23} />
                    <div className="delivery-details-content-address-text">
                      <p>
                        xyz appartment<br />
                        Karachi, Pakistan<br />
                        Floor: R1234
                      </p>
                    </div>
                  </div>

                  <div>
                    <input type="text" className="delivery-details-content-address-input" placeholder="Note to rider e.g building, landmark" />
                  </div>
                </div>
              </div>

              {/* // Delivery Options */}

              <div className="delivery-box">
                <h3>Delivery options</h3>

                {/* Standard Option */}
                <div
                  className={`option ${selectedOption === 'standard' ? 'selected active' : ''}`}
                  onClick={() => setSelectedOption('standard')}
                >
                  <input
                    type="radio"
                    name="delivery"
                    value="standard"
                    checked={selectedOption === 'standard'}
                    readOnly
                  />
                  <div className="option-content">
                    <span className="option-label">Standard</span>
                    <span className="option-time">20 – 35 mins</span>
                  </div>
                </div>

                {/* Priority Option */}
                <div
                  className={`option ${selectedOption === 'express' ? 'selected active' : ''}`}
                  onClick={() => setSelectedOption('express')}
                >
                  <input
                    type="radio"
                    name="delivery"
                    value="priority"
                    checked={selectedOption === 'priority'}
                    readOnly
                  />
                  <div className="option-content">
                    <span className="option-label">Priority</span>
                    <span className="option-time">15 – 30 mins</span>
                  </div>
                  <div className="option-extra">+ Rs. 70.00</div>
                </div>
              </div>

              {/* // Personal details */}

              <div className="personal-details">
                <div className="personal-details-header">
                  <h3 className="heading">Personal details</h3>
                  <button className="personal-details-header-btn" onClick={isEditing ? handleSave : () => setIsEditing(true)}>
                    {isEditing ? "Save" : "Change"}
                  </button>
                </div>

                {!isEditing ? (
                  <div>
                    <p>{formData.email}</p>
                    <p>{formData.firstName} {formData.lastName}</p>
                    <p>{formData.phoneNumber}</p>
                  </div>
                ) : (
                  <div className="personal-details-content-edit">
                    <input
                      type="email"
                      name="email"
                      placeholder="email"
                      className="personal-details-content-input"
                      value={formData.email}
                      onChange={ChangePersonalInfo}
                    />
                    <input
                      type="text"
                      name="firstName"
                      placeholder="first name"
                      className="personal-details-content-input"
                      value={formData.firstName}
                      onChange={ChangePersonalInfo}
                    />
                    <input
                      type="text"
                      name="lastName"
                      placeholder="last name"
                      className="personal-details-content-input"
                      value={formData.lastName}
                      onChange={ChangePersonalInfo}
                    />
                    <input
                      type="tel"
                      name="phoneNumber"
                      placeholder="phone number"
                      className="personal-details-content-input"
                      value={formData.phoneNumber}
                      onChange={ChangePersonalInfo}
                    />
                    <button className="btn btn-warning w-100" onClick={ChangePersonalInfo}>Save</button>
                  </div>
                )}
              </div>


              {/* // Payment */}

              <div className="payment-box">
                <h3 className="heading">Select Payment Method</h3>

                {/* Visa Option */}
                <div
                  className={`payment-option ${selectedPayment === 'visa' ? 'selected active' : ''}`}
                  onClick={() => setSelectedPayment('visa')}
                >
                  <div className="option-content">
                    <FaCcVisa size={24} color="#1a1f71" style={{ marginRight: 10 }} />
                    <span className="option-label">Visa **** 1234</span>
                  </div>
                  <button className="change-btn" onClick={(e) => {
                    e.stopPropagation(); // Prevent option select
                    handleVisaChange();
                  }}>
                    Change
                  </button>
                </div>

                {/* Wallet Option */}
                <div
                  className={`payment-option ${selectedPayment === 'wallet' ? 'selected active' : ''}`}
                  onClick={() => setSelectedPayment('wallet')}
                >
                  <div className="option-content">
                    <FaWallet size={24} color="#444" style={{ marginRight: 10 }} />
                    <span className="option-label">Wallet Balance</span>
                  </div>

                  <div>
                    <p className="wallet-balance">$50.00</p>
                  </div>
                </div>

                {/* Apple Pay Option */}
                <div
                  className={`payment-option ${selectedPayment === 'apple' ? 'selected active' : ''}`}
                  onClick={() => setSelectedPayment('apple')}
                >
                  <div className="option-content">
                    <FaApplePay size={50} color="black" />
                  </div>
                </div>
              </div>

              { /* // voucher */}

              <div className="voucher-section">
                <label htmlFor="voucher" className="voucher-label">Apply Voucher</label>
                <div className="voucher-dropdown">
                  <select id="voucher" className="voucher-select">
                    <RiArrowDropDownLine />
                    <option value="">Select a voucher</option>
                    <option value="save10">SAVE10 - 10% OFF</option>
                    <option value="freeship">FREESHIP - Free Delivery</option>
                    <option value="welcome">WELCOME - 15% OFF for New Users</option>
                  </select>
                </div>
              </div>


              { /* //tip to rider */}

              <div className="tip-section">
                <label className="tip-label">Add a Tip</label>
                <div className="tip-options">
                  {["Not now", "$1", "$3", "$5", "Custom"].map((tip) => (
                    <button
                      key={tip}
                      className={`tip-button ${selectedTip === tip.toLowerCase() ? "active" : ""
                        }`}
                      onClick={() => handleTipSelect(tip.toLowerCase())}
                    >
                      {tip}
                    </button>
                  ))}
                </div>

                {selectedTip === "custom" && (
                  <input
                    type="number"
                    className="custom-tip-input"
                    placeholder="Enter custom tip amount"
                    value={customTip}
                    onChange={(e) => setCustomTip(e.target.value)}
                  />
                )}
              </div>


              {/* check box for next time */}

              <div className="next-time">
                <input type="checkbox" id="next-time" />
                <span className="checkmark"></span>
                <label htmlFor="next-time">Save this address for next time</label>
              </div>


              {/* button place order */}


              <div className="place-order-button">
                <button className="btn btn-warning w-100">Place Order</button>
              </div>



            </div>
            <div className='page-right'>
              <div className="right-header">
                <h3 className="right-heading-1">Your order from</h3>
                <p className="right-heading-2">De Pizza shop</p>
              </div>

              <div className="selected-items">
                <div className="items-container">
                  <div className="items">
                    <p>1 x Creamy Pasta</p>
                    <p>$20.02</p>
                  </div>

                  <div className="items">
                    <p>1 x Creamy Pasta</p>
                    <p>$20.02</p>
                  </div>

                  <div className="items">
                    <p>1 x Creamy Pasta</p>
                    <p>$20.02</p>
                  </div>

                  <div className="items">
                    <p>1 x Creamy Pasta</p>
                    <p>$20.02</p>
                  </div>
                </div>
              </div>

              <div className="selected-items-calculation">
                <div className="calculation-container">
                  <div className="price">
                    <p>subtotal</p>
                    <p>$20.02</p>
                  </div>

                  <div className="price">
                    <p>Tax & service fee</p>
                    <p>$5.05</p>
                  </div>

                  <div className="price">
                    <p>Delivery</p>
                    <p>$2.00</p>
                  </div>

                  <div className="price">
                    <p>Tip</p>
                    <p>$20.02</p>
                  </div>
                </div>
              </div>

              <div className="total-price-container">
                <p className="total">Total</p>
                <p className="total-price">$20.02</p>
              </div>


            </div>


          </div>
        </div>
      </div>

      <div className="mt-5">
        <Footer />
      </div>

    </>
  );
}
export default ViewCart;

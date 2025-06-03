const express = require("express");
const router = express.Router();
const authenticateToken = require("../authorization");

const {
  userData,
  userSignup,
  userLogin,
  menuItems,
  updateUser,
  itemDetail,
  addNewAddress,
  updateAddress,
  deleteAddress,
  placeOrder,
  stripePayment,
  ongoingOrder,
  getWallet,
  fetchVouchers,
  addReview,
  restaurant,
  createStripeCustomer,
  getSavedCard,
  deleteCard,
  saveCard,
  getCustomerByEmail,
  setDefaultPaymentMethod,
  getDefaultPaymentMethod,
  restaurants,
  orderList,
  resetPassword,
  stripeTaxCalculation,
  restaurantStatus,
  stripePaymentWithApple,
  resetPasswordOTP,
  sendMail,
  refreshToken,
  getCoordinatesFromAddress,
  suggestions,
  getUserData
} = require("../controller/userController");

router.post("/userSignup", userSignup);
router.post("/userLogin", userLogin);
router.post("/refreshToken", refreshToken);
router.post("/resetPasswordUser", resetPassword);
router.post("/resetPasswordOTP", resetPasswordOTP);

router.post("/getCustomerByEmail", authenticateToken, getCustomerByEmail);
router.post("/saveCard", authenticateToken, saveCard);
router.post("/createStripeCustomer", authenticateToken, createStripeCustomer);
router.post(
  "/setDefaultPaymentMethod",
  authenticateToken,
  setDefaultPaymentMethod
);
router.post(
  "/getDefaultPaymentMethod",
  authenticateToken,
  getDefaultPaymentMethod
);
router.post("/getSavedCard", authenticateToken, getSavedCard);
router.delete("/deleteCard", authenticateToken, deleteCard);

router.get("/userData/:id", authenticateToken, userData);
router.get('/getUserData/:id', getUserData);
router.get("/menus/:id", authenticateToken, menuItems);
router.put("/updateUser/:id", authenticateToken, updateUser);
router.get("/itemDetail/:id", authenticateToken, itemDetail);
router.post("/addNewAddress/:id", authenticateToken, addNewAddress);
router.put("/updateAddress/:id", authenticateToken, updateAddress);
router.delete("/deleteAddress/:id", authenticateToken, deleteAddress);
router.get("/ongoingOrder/:id", authenticateToken, ongoingOrder);
router.get("/getWallet/:id", authenticateToken, getWallet);
router.post("/addReview/:id", authenticateToken, addReview);
router.get("/getRestaurant/:id", authenticateToken, restaurant);
router.get("/restaurants", authenticateToken, restaurants);
router.get("/orderList/:id", authenticateToken, orderList);
router.post("/sendMail", authenticateToken, sendMail);

router.post("/placeOrder", authenticateToken, placeOrder);
router.post("/stripePayment", authenticateToken, stripePayment);
router.post(
  "/stripePaymentWithApple",
  authenticateToken,
  stripePaymentWithApple
);
router.get("/fetchVouchers/:id", authenticateToken, fetchVouchers);
router.post("/stripeTaxCalculation", authenticateToken, stripeTaxCalculation);

router.get("/restaurantStatus/:id", authenticateToken, restaurantStatus);

router.post("/geocode", authenticateToken, getCoordinatesFromAddress);
router.post("/suggestions", authenticateToken, suggestions);

module.exports = router;

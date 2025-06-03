const express = require("express");
const router = express.Router();
const authenticateToken = require("../authorization");

const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  getUser,
  updateProfile,
  changePassword,
  sendOTP,
  verifyToken,
  webLogin,
  logout,
} = require("../controller/authController");

router.post("/signup", signup);
router.post("/login", login);
router.post("/webLogin", webLogin);
router.post("/forgotPassword", forgotPassword);
router.post("/sendOTP", sendOTP);
router.put("/resetPassword", resetPassword);
router.post("/verifyToken", verifyToken);

router.post("/logout", authenticateToken, logout);
router.get("/getUser/:id", authenticateToken, getUser);
router.put("/updateProfile/:id", authenticateToken, updateProfile);
router.put("/changePassword/:id", authenticateToken, changePassword);

module.exports = router;

const express = require("express");
const router = express.Router();
const authenticateToken = require("../authorization");

const {
  getOrders,
  getOrder,
  updateStatus,
  statusOrders,
  amountCharger,
  newOrder,
} = require("../controller/orderController");

router.get("/orders/:id", authenticateToken, getOrders);
router.get("/order/:orderId", getOrder);
router.post("/newOrder/:id", authenticateToken, newOrder);
router.put("/updateStatus/:id", authenticateToken, updateStatus);
router.get("/statusOrder/:id", authenticateToken, statusOrders);
router.post("/amountCharger/:id", authenticateToken, amountCharger);

module.exports = router;

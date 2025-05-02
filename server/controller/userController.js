require("dotenv").config();
const pool = require("../database");
const bcrypt = require("bcrypt");
// const Stripe = require("stripe");
const axios = require("axios");
const jwt = require("jsonwebtoken");
// const jwtSecret = process.env.JWT_SECRET;0
// const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const userLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await pool.query(
      "SELECT user_id, email, username, password FROM users WHERE email = $1",
      [email]
    );
    if (user.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid password" });
    }
    const token = jwt.sign(
      {
        userId: user.rows[0].user_id,
        username: user.rows[0].username,
        email: user.rows[0].email,
      },
      jwtSecret
    );
    return res.status(200).json({
      success: true,
      message: "Login successful",
      userId: user.rows[0].user_id,
      token: token,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};
module.exports = {
  userLogin,
};

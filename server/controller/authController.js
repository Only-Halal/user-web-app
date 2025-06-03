const bcrypt = require("bcrypt");
const pool = require("../database");
const jwt = require("jsonwebtoken");
const { logErrorToS3 } = require("../services/logs");
const { transporter } = require("../services/mail");
const generateVerificationCode = require("../services/otp");
const jwtSecret = process.env.JWT_SECRET;
const logger = require("../services/logger");

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

const signup = async (req, res) => {
  const { first_name, last_name, email, password, phone } = req.body;

  logger.info("Signup attempt initiated", {
    email: email,
    firstName: first_name,
    lastName: last_name,
    hasPhone: !!phone,
  });

  if (!validateEmail(email)) {
    logger.warn("Invalid email format provided", { email: email });
    return res.status(400).json({
      success: false,
      message: "Invalid email format",
    });
  }

  try {
    logger.debug("Checking email availability", { email: email });
    const checkEmailQuery = "SELECT * FROM restaurant_user WHERE email = $1";
    const emailResult = await pool.query(checkEmailQuery, [email]);

    if (emailResult.rowCount > 0) {
      logger.warn("Email already exists during signup", { email: email });
      return res.status(409).json({
        success: false,
        message: "Email already exists, please try a different one.",
      });
    }

    logger.debug("Hashing password");
    const hashedPassword = await bcrypt.hash(password, 10);

    logger.debug("Creating new user record", {
      email: email,
      firstName: first_name,
      lastName: last_name,
    });
    const signupQuery =
      "INSERT INTO restaurant_user (first_name, last_name, email, password, phone) VALUES ($1, $2, $3, $4, $5)";
    await pool.query(signupQuery, [
      first_name,
      last_name,
      email,
      hashedPassword,
      phone,
    ]);

    logger.info("User signup successful", { email: email });
    return res.status(200).json({
      success: true,
      message: "User signed up successfully",
    });
  } catch (error) {
    if (error.constraint === "users_email_key") {
      logger.warn("Email conflict detected after initial check", {
        email: email,
      });
      return res.status(409).json({
        success: false,
        message: "Email already exists, please try a different one.",
      });
    } else {
      logger.error("Signup process failed", {
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        email: email,
      });

      console.log(error);
      logErrorToS3("signup", error, req, res);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
};

const login = async (req, res) => {
  const { email, password, app, device } = req.body;

  logger.info("Login attempt initiated", {
    email: email,
    app: app,
    device: device,
    ip: req.ip,
  });

  if (!validateEmail(email)) {
    logger.warn("Invalid email format provided", { email: email });
    return res.status(400).json({
      success: false,
      message: "Invalid email format",
    });
  }

  try {
    logger.debug("Querying database for user", { email: email });
    const user = await pool.query(
      "SELECT id, first_name, last_name, email, image, restaurant_id, password FROM restaurant_user WHERE email = $1",
      [email]
    );

    if (user.rows.length === 0) {
      logger.warn("User not found in database", { email: email });
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userId = user.rows[0].id;
    logger.debug("Checking for existing sessions", {
      userId: userId,
      app: app,
    });
    const checkSession = await pool.query(
      "SELECT * FROM login_session WHERE user_id = $1 AND app = $2",
      [userId, app]
    );

    if (checkSession.rowCount !== 0) {
      logger.warn("User already logged in on another device", {
        userId: userId,
        existingDevice: checkSession.rows[0].device,
      });
      return res.status(400).json({
        success: false,
        message: `You are already logged in on ${checkSession.rows[0].device}`,
      });
    }

    logger.debug("Validating user password", { userId: userId });
    const validPassword = await bcrypt.compare(password, user.rows[0].password);

    if (!validPassword) {
      logger.warn("Invalid password provided", { userId: userId });
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    logger.debug("Generating JWT token", { userId: userId });
    const token = jwt.sign(
      {
        userId: userId,
        res_id: user.rows[0].restaurant_id,
        username: `${user.rows[0].first_name} ${user.rows[0].last_name}`,
        email: user.rows[0].email,
      },
      jwtSecret
    );

    logger.debug("Creating login session record", {
      userId: userId,
      app: app,
      device: device,
    });
    await pool.query(
      "INSERT INTO login_session (user_id, app, device, time) VALUES ($1, $2, $3, NOW())",
      [userId, app, device]
    );

    logger.info("Login successful", {
      userId: userId,
      restaurant_id: user.rows[0].restaurant_id,
      email: user.rows[0].email,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: token,
      userId: userId,
      email: user.rows[0].email,
      restaurant_id: user.rows[0].restaurant_id,
      phone: user.rows[0].phone,
    });
  } catch (error) {
    logger.error("Login process failed", {
      error: error.message,
      stack: error.stack,
      email: email,
      app: app,
    });

    console.error(error);
    await logErrorToS3("login", error, req, res);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const webLogin = async (req, res) => {
  const { email, password } = req.body;

  logger.info("Web login attempt initiated", {
    email: email,
    ip: req.ip,
  });

  if (!validateEmail(email)) {
    logger.warn("Invalid email format provided", { email: email });
    return res
      .status(400)
      .json({ success: false, message: "Invalid email format" });
  }

  try {
    logger.debug("Querying database for user", { email: email });
    const user = await pool.query(
      "SELECT id, first_name, last_name, email, image, restaurant_id, password FROM restaurant_user WHERE email = $1",
      [email]
    );

    if (user.rows.length === 0) {
      logger.warn("User not found in database", { email: email });
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const userId = user.rows[0].id;
    logger.debug("Validating password for user", { userId: userId });
    const validPassword = await bcrypt.compare(password, user.rows[0].password);

    if (!validPassword) {
      logger.warn("Invalid password provided", { userId: userId });
      return res
        .status(401)
        .json({ success: false, message: "Invalid password" });
    }

    logger.debug("Generating JWT token", { userId: userId });
    const token = jwt.sign(
      {
        userId: userId,
        res_id: user.rows[0].restaurant_id,
        username: `${user.rows[0].first_name} ${user.rows[0].last_name}`,
        email: user.rows[0].email,
      },
      jwtSecret,
      { expiresIn: "24h" }
    );

    logger.info("Web login successful", {
      userId: userId,
      restaurant_id: user.rows[0].restaurant_id,
      email: user.rows[0].email,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: token,
      userId: userId,
      email: user.rows[0].email,
      restaurant_id: user.rows[0].restaurant_id,
      phone: user.rows[0].phone,
    });
  } catch (error) {
    logger.error("Web login process failed", {
      error: error.message,
      stack: error.stack,
      email: email,
    });

    console.error(error);
    await logErrorToS3("webLogin", error, req, res);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  logger.info("Forgot password request received", {
    email: email,
    ip: req.ip,
  });

  try {
    if (!validateEmail(email)) {
      logger.warn("Invalid email format in forgot password request", {
        email: email,
      });
      return res
        .status(400)
        .json({ success: false, message: "Invalid email format" });
    }

    logger.debug("Querying user for forgot password", { email: email });
    const user = await pool.query(
      "SELECT id FROM restaurant_user WHERE email = $1",
      [email]
    );

    if (user.rows.length === 0) {
      logger.warn("User not found during forgot password request", {
        email: email,
      });
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    } else {
      const verificationCode = generateVerificationCode();

      logger.debug("Sending verification email", {
        userId: user.rows[0].id,
        email: email,
      });

      const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Only halal - Verify your email",
        html: `<div style="background-color: #fff; padding: 20px; font-family: Arial, sans-serif; color: #333;">
              <table style="width: 100%; max-width: 600px; margin: 0 auto;  border-radius: 20px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
                <thead>
                  <tr>
                    <th style="background-color: #F8971D; padding: 20px; text-align: center; color: white;">
                      <h1>Only Halal</h1>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="padding: 20px; text-align: center;">
                      <h2 style="color: #F8971D;">Verify Your Email</h2>
                      <p style="font-size: 16px;">Hello,</p>
                      <p style="font-size: 16px;">Please use the following code to verify your email address</p>
                      <div style="margin: 20px 0; display: inline-block; padding: 10px 20px; background-color: #F8971D; color: white; font-size: 24px; font-weight: bold; border-radius: 5px;">
                        ${verificationCode}
                      </div>
                      <p style="font-size: 16px;">This code is valid for the next 15 minutes. If you did not request this code, please ignore this email.</p>
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td style="background-color: #F8971D; padding: 10px; text-align: center; color: white;">
                      <p>&copy; ${new Date().getFullYear()} Only Halal. All rights reserved.</p>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          logger.error("Error sending verification email", {
            email: email,
            error: error.message,
          });
          return res.status(500).json({
            success: false,
            message: "Failed to send email",
            error: error.message,
          });
        } else {
          logger.info("Verification email sent successfully", {
            email: email,
            response: info.response,
          });
          return res.status(200).json({
            success: true,
            message: "Email sent",
            otp: verificationCode,
            email: email,
            id: user.rows[0].id,
          });
        }
      });
    }
  } catch (error) {
    logger.error("Forgot password process failed", {
      error: error.message,
      stack: error.stack,
      email: email,
    });

    console.error("Error:", error);
    await logErrorToS3("forgotPassword", error, req, res);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const sendOTP = async (req, res) => {
  const { email } = req.body;

  logger.info("OTP request received", {
    email: email,
    ip: req.ip,
  });

  try {
    const verificationCode = generateVerificationCode();

    logger.debug("Composing OTP email", {
      email: email,
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Only Halal - Verify your email",
      html: `
        <div style="background-color: #fff; padding: 20px; font-family: Arial, sans-serif; color: #333;">
          <table style="width: 100%; max-width: 600px; margin: 0 auto;  border-radius: 20px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
            <thead>
              <tr>
                <th style="background-color: #F8971D; padding: 20px; text-align: center; color: white;">
                  <h1>Only Halal</h1>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 20px; text-align: center;">
                  <h2 style="color: #F8971D;">Verify Your Email</h2>
                  <p style="font-size: 16px;">Hello,</p>
                  <p style="font-size: 16px;">Please use the following code to verify your email address</p>
                  <div style="margin: 20px 0; display: inline-block; padding: 10px 20px; background-color: #F8971D; color: white; font-size: 24px; font-weight: bold; border-radius: 5px;">
                    ${verificationCode}
                  </div>
                  <p style="font-size: 16px;">This code is valid for the next 15 minutes. If you did not request this code, please ignore this email.</p>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td style="background-color: #F8971D; padding: 10px; text-align: center; color: white;">
                  <p>&copy; ${new Date().getFullYear()} Only Halal. All rights reserved.</p>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        logger.error("Error sending OTP email", {
          email: email,
          error: error.message,
        });

        return res.status(500).json({
          success: false,
          message: "Failed to send email",
          error: error.message,
        });
      } else {
        logger.info("OTP email sent successfully", {
          email: email,
          response: info.response,
        });

        return res.status(200).json({
          success: true,
          message: "Verification Email sent",
          otp: verificationCode,
        });
      }
    });
  } catch (error) {
    logger.error("OTP email process failed", {
      error: error.message,
      stack: error.stack,
      email: email,
    });

    console.log(error);
    await logErrorToS3("sendOTP", error, req, res);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const resetPassword = async (req, res) => {
  const { email, password } = req.body;

  logger.info("Password reset request received", {
    email: email,
    ip: req.ip,
  });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    logger.debug("Password hashed successfully", { email: email });

    const newPass = await pool.query(
      "UPDATE restaurant_user SET password = $1 WHERE email = $2",
      [hashedPassword, email]
    );

    if (newPass.rowCount === 0) {
      logger.warn("Password reset failed - email not found", { email: email });

      return res
        .status(400)
        .json({ success: false, message: "Failed to update password" });
    } else {
      logger.info("Password reset successful", { email: email });

      return res
        .status(200)
        .json({ success: true, message: "Password reset successfully" });
    }
  } catch (error) {
    logger.error("Password reset error", {
      email: email,
      error: error.message,
      stack: error.stack,
    });

    console.error(error);
    await logErrorToS3("resetPassword", error, req, res);

    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const getUser = async (req, res) => {
  const { id } = req.params;

  logger.info("User fetch request initiated", {
    userId: id,
    ip: req.ip,
  });

  try {
    const user = await pool.query(
      "SELECT * FROM restaurant_user WHERE id = $1",
      [id]
    );

    if (user.rows.length === 0) {
      logger.warn("User not found", { userId: id });

      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    } else {
      logger.info("User fetched successfully", {
        userId: id,
      });

      return res.status(200).json({
        success: true,
        user: user.rows[0],
      });
    }
  } catch (error) {
    logger.error("Error fetching user", {
      userId: id,
      error: error.message,
      stack: error.stack,
    });

    logErrorToS3("getUser", error, req, res);

    return res.status(500).json({
      success: false,
      message: "Something went wrong, Please try again",
    });
  }
};

const updateProfile = async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    phone,
    gender,
    address,
    country,
    city,
    date_of_birth,
  } = req.body;
  const { id } = req.params;

  logger.info("User profile update initiated", {
    userId: id,
    ip: req.ip,
  });

  try {
    const update = await pool.query(
      "UPDATE restaurant_user SET first_name = $1, last_name = $2, email = $3, phone = $4, gender = $5, address = $6, country = $7, city = $8, date_of_birth = $9 WHERE id = $10",
      [
        first_name,
        last_name,
        email,
        phone,
        gender,
        address,
        country,
        city,
        date_of_birth,
        id,
      ]
    );

    if (update.rowCount === 0) {
      logger.warn("Profile update failed — User not found", { userId: id });
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    logger.info("User profile updated successfully", {
      userId: id,
    });

    return res
      .status(200)
      .json({ success: true, message: "User updated successfully" });
  } catch (error) {
    logger.error("Error updating profile", {
      userId: id,
      error: error.message,
      stack: error.stack,
    });

    logErrorToS3("updateProfile", error, req, res);

    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const changePassword = async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  logger.info("Change password attempt", {
    userId: id,
    ip: req.ip,
  });

  try {
    const findPassword = await pool.query(
      "SELECT password FROM restaurant_user WHERE id = $1",
      [id]
    );

    if (findPassword.rows.length === 0) {
      logger.warn("Change password failed — User not found", { userId: id });
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const validPassword = await bcrypt.compare(
      currentPassword,
      findPassword.rows[0].password
    );

    if (!validPassword) {
      logger.warn("Invalid current password attempt", { userId: id });
      return res
        .status(401)
        .json({ success: false, message: "Invalid current password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatePassword = await pool.query(
      "UPDATE restaurant_user SET password = $1 WHERE id = $2",
      [hashedPassword, id]
    );

    if (updatePassword.rowCount === 0) {
      logger.error("Password update failed — No rows affected", { userId: id });
      return res
        .status(400)
        .json({ success: false, message: "Failed to update password" });
    }

    logger.info("Password changed successfully", { userId: id });

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    logger.error("Error changing password", {
      userId: id,
      error: error.message,
      stack: error.stack,
    });

    logErrorToS3("changePassword", error, req, res);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const verifyToken = async (req, res) => {
  const { email, token } = req.body;

  logger.info("Token verification attempt", { email, token });

  try {
    const check = await pool.query(
      "SELECT * FROM restaurant_token WHERE email = $1 AND token = $2",
      [email, token]
    );

    if (check.rowCount === 0) {
      logger.warn("Invalid token attempt", { email, token });
      return res.status(404).json({ success: false, message: "Invalid Token" });
    }

    const expiryDate = new Date(check.rows[0].expiry_date);
    const now = new Date();

    if (!expiryDate || expiryDate.getTime() < now.getTime()) {
      logger.warn("Token expired", {
        email,
        token,
        expiryDate: expiryDate.toISOString(),
      });
      return res.status(401).json({ success: false, message: "Token Expired" });
    }

    logger.info("Token successfully verified", { email });
    return res.status(200).json({ success: true, message: "Token Verified" });
  } catch (error) {
    logger.error("Error verifying token", {
      email,
      token,
      error: error.message,
      stack: error.stack,
    });
    await logErrorToS3("verifyToken", error, req, res);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const logout = async (req, res) => {
  const { id, app, device } = req.body;

  logger.info("Logout attempt", { id, app, device });

  try {
    if (!id || !app || !device) {
      logger.warn("Missing required fields for logout", { id, app, device });
      return res.status(400).json({
        success: false,
        message: "Missing required fields: id, app, or device",
      });
    }

    const deleteSession = await pool.query(
      "DELETE FROM login_session WHERE user_id = $1 AND app = $2 AND device = $3 RETURNING *",
      [id, app, device]
    );

    if (deleteSession.rowCount === 0) {
      logger.warn("Logout failed: session not found", { id, app, device });
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    logger.info("User logged out successfully", { id, app, device });
    return res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    logger.error("Error during logout", {
      id,
      app,
      device,
      error: error.message,
      stack: error.stack,
    });
    await logErrorToS3("logout", error, req, res);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  signup,
  login,
  forgotPassword,
  sendOTP,
  resetPassword,
  getUser,
  updateProfile,
  changePassword,
  verifyToken,
  webLogin,
  logout,
};

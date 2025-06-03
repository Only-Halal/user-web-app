require("dotenv").config();
const pool = require("../database");
const bcrypt = require("bcrypt");
const Stripe = require("stripe");
const jwt = require("jsonwebtoken");
const generateVerificationCode = require("../services/otp");
const { transporter } = require("../services/mail");
const logger = require("../services/logger");
const { Client } = require("@googlemaps/google-maps-services-js");

const jwtSecret = process.env.JWT_SECRET;
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

const client = new Client({});

const userData = async (req, res) => {
  const { id } = req.params;
  logger.info(`Fetching user data for user_id: ${id}`);

  try {
    const query = `
    WITH user_data AS (
        SELECT u.user_id, u.username, u.email, u.phone, u.state, u.city, u.zipcode
        FROM users u
        WHERE u.user_id = $1
    ),
    address_data AS (
        SELECT a.id, a.home, a.address, a.user_id
        FROM addresses a
        WHERE a.user_id = $1
    ),
    average_ratings AS (
        SELECT r.id AS restaurant_id, AVG(rv.rating) AS avg_rating, COUNT(rv.rating) AS review_count
        FROM reviews rv
        JOIN restaurants r ON rv.restaurant_id = r.id
        GROUP BY r.id
    ),
    orders_data AS (
        SELECT o.id, o.address, o.status, o.subtotal, o.total, o.order_date, o.order_time, o.tax, o.service_fee, o.delivery_fee
        FROM orders o
        WHERE o.user_id = $1
    ),
    order_items_data AS (
        SELECT 
            oi.order_id, 
            oi.item_id, 
            oi.quantity, 
            m.food_name, 
            m.image,
            m.category,         
            m.restaurant_id,    
            r.restaurant_name,  
            o.subtotal
        FROM item_order oi
        JOIN restaurant_menu m ON m.id = oi.item_id
        JOIN orders o ON o.id = oi.order_id
        JOIN restaurants r ON r.id = m.restaurant_id
        WHERE o.user_id = $1
    ),
    all_reviews AS (
        SELECT rv.id, rv.restaurant_id, rv.user_id, rv.rating, rv.comment, rv.review, u.username
        FROM reviews rv
        JOIN users u ON rv.user_id = u.user_id
    ),
    user_reviews AS (
        SELECT rv.id, rv.restaurant_id, rv.user_id, rv.rating, rv.comment, rv.review, u.username
        FROM reviews rv
        JOIN users u ON rv.user_id = u.user_id
        WHERE rv.user_id = $1
    )
    SELECT
      (SELECT json_agg(user_data) FROM user_data) AS user,
      (SELECT json_agg(address_data) FROM address_data) AS address,
      (SELECT json_agg(orders_data) FROM orders_data) AS orders,
      (SELECT json_agg(order_items_data) FROM order_items_data) AS order_items,
      (SELECT json_agg(all_reviews) FROM all_reviews) AS reviews,
      (SELECT json_agg(user_reviews) FROM user_reviews) AS user_reviews;
    `;

    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      logger.warn(`User not found with id: ${id}`);
      return res.status(404).json({ error: "User not found" });
    }

    logger.info(`User data fetched successfully for user_id: ${id}`);

    const user = rows[0]?.user?.[0] || null;
    const address = rows[0]?.address || [];
    const orders = rows[0]?.orders || [];
    const orderItems = rows[0]?.order_items || [];
    const reviews = rows[0]?.reviews || [];
    const user_reviews = rows[0]?.user_reviews || [];

    const itemsByOrderId = orderItems.reduce((acc, item) => {
      if (!acc[item.order_id]) acc[item.order_id] = [];
      acc[item.order_id].push({
        item_id: item.item_id,
        food_name: item.food_name,
        quantity: item.quantity,
        image: item.image,
        category: item.category,
        restaurant_id: item.restaurant_id,
        restaurant_name: item.restaurant_name,
      });
      return acc;
    }, {});

    const ordersWithItems = orders.map((order) => ({
      ...order,
      items: itemsByOrderId[order.id] || [],
    }));

    const data = {
      success: true,
      user,
      address,
      orders: ordersWithItems,
      reviews,
      user_reviews,
    };

    return res.json(data);
  } catch (err) {
    logger.error("Error fetching user data", { error: err.message });
    return res.status(500).json({ error: "Internal server error" });
  }
};

const userSignup = async (req, res) => {
  const { username, email, phone, password, state, city, zipcode } = req.body;
  logger.info(`Attempting signup for email: ${email}`);

  try {
    const checkEmailQuery = "SELECT * FROM users WHERE email = $1";
    const emailResult = await pool.query(checkEmailQuery, [email]);

    if (emailResult.rowCount > 0) {
      logger.warn(`Signup failed: Email already exists - ${email}`);
      return res.status(409).json({
        success: false,
        message: "Email already exists, please try a different one.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const signup = await pool.query(
      "INSERT INTO users (username, email, password, phone, state, city, zipcode) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING user_id",
      [username, email, hashedPassword, phone, state, city, zipcode]
    );

    if (signup.rowCount === 0) {
      logger.error(`Failed to register user: ${email}`);
      return res.status(400).json({
        success: false,
        message: "Failed to Register User",
      });
    }

    await pool.query("INSERT INTO wallet (user_id) VALUES ($1)", [
      signup.rows[0].user_id,
    ]);

    logger.info(`User signed up successfully: ${email}`);
    return res
      .status(200)
      .json({ success: true, message: "User signed up successfully" });
  } catch (error) {
    logger.error("Signup error", { error: error.message });

    if (error.constraint === "users_email_key") {
      return res.status(409).json({
        success: false,
        message: "Email already exists, please try a different one.",
      });
    } else {
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  }
};

const userLogin = async (req, res) => {
  const { email, password } = req.body;
  logger.info(`Login attempt for email: ${email}`);

  try {
    const user = await pool.query(
      "SELECT user_id, email, username, password, terminated FROM users WHERE email = $1",
      [email]
    );

    if (user.rows.length === 0) {
      logger.warn(`Login failed: User not found for email ${email}`);
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.rows[0].terminated) {
      logger.warn(`Login blocked: User terminated for email ${email}`);
      return res
        .status(400)
        .json({ success: false, message: "Sorry, you have been terminated" });
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password);

    if (!validPassword) {
      logger.warn(`Login failed: Invalid password for email ${email}`);
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

    logger.info(`Login successful for email: ${email}`);
    return res.status(200).json({
      success: true,
      message: "Login successful",
      userId: user.rows[0].user_id,
      token: token,
    });
  } catch (error) {
    logger.error("Login error", { error: error.message });
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const refreshToken = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  logger.info("Refresh token requested");

  if (!token) {
    logger.warn("Refresh token failed: No token provided");
    return res.status(401).json({ message: "Token required" });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);

    const newToken = jwt.sign(
      {
        userId: decoded.user_id,
        username: decoded.username,
        email: decoded.email,
      },
      jwtSecret,
      { expiresIn: "7d" }
    );

    logger.info("Refresh token issued successfully");
    return res.status(200).json({ success: true, token: newToken });
  } catch (err) {
    logger.warn("Refresh token failed: Invalid or expired token", {
      error: err.message,
    });
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

const menuItems = async (req, res) => {
  const { id } = req.params;
  logger.info(`Fetching menu items for restaurant_id: ${id}`);

  try {
    const response = await pool.query(
      `SELECT 
        rm.id, 
        rm.food_name, 
        rm.description, 
        rm.category, 
        rm.price, 
        rm.restaurant_id, 
        rm.image, 
        rm.available, 
        rm.main_category_id, 
        ic.category AS category_name 
      FROM 
        restaurant_menu rm 
      LEFT JOIN 
        item_category ic 
      ON 
        rm.main_category_id = ic.id 
      WHERE 
        rm.restaurant_id = $1`,
      [id]
    );

    if (response.rowCount === 0) {
      logger.warn(`No menu found for restaurant_id: ${id}`);
      return res.status(404).json({
        success: false,
        message: "No Menu found!",
      });
    } else {
      const lowestPrice = response.rows.reduce((min, item) => {
        const itemPrice = parseFloat(item.price);
        return itemPrice < min ? itemPrice : min;
      }, parseFloat(response.rows[0].price));

      logger.info(`Menu items fetched for restaurant_id: ${id}`);

      return res.status(200).json({
        success: true,
        data: {
          menus: response.rows,
          lowest_price: {
            price: lowestPrice.toFixed(2),
          },
        },
      });
    }
  } catch (error) {
    logger.error("Error fetching menu items", { error: error.message });
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  try {
    if (req.body.currentPassword) {
      const {
        username,
        phone,
        state,
        city,
        zipcode,
        currentPassword,
        newPassword,
        confirmPassword,
      } = req.body;
      const user = await pool.query(
        "SELECT user_id, email, password FROM users WHERE user_id = $1",
        [id]
      );
      const validPassword = await bcrypt.compare(
        currentPassword,
        user.rows[0].password
      );

      if (!validPassword) {
        logger.info(`User ${id} provided incorrect current password`);
        return res
          .status(401)
          .json({ success: false, message: "Current Password is incorrect" });
      } else if (newPassword !== confirmPassword) {
        logger.info(`User ${id} new password and confirm password mismatch`);
        return res.status(400).json({
          success: true,
          message: "Password doesn't match",
        });
      } else {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updateUser = await pool.query(
          "UPDATE users SET username = $1, password = $2, phone = $3, state = $4, city = $5, zipcode = $6 WHERE user_id = $7 RETURNING *",
          [username, hashedPassword, phone, state, city, zipcode, id]
        );
        if (updateUser.rowCount === 0) {
          logger.error(`Failed to update user ${id}`);
          return res.status(400).json({
            success: false,
            message: "Failed to Update",
          });
        } else {
          logger.info(`User ${id} updated profile with password change`);
          return res.status(200).json({
            success: true,
            message: "Updated successfully",
          });
        }
      }
    } else {
      const { username, phone, state, city, zipcode } = req.body;
      const updateUser = await pool.query(
        "UPDATE users SET username = $1, phone = $2, state = $3, city = $4, zipcode = $5 WHERE user_id = $6 RETURNING *",
        [username, phone, state, city, zipcode, id]
      );
      if (updateUser.rowCount === 0) {
        logger.error(`Failed to update user ${id} without password change`);
        return res.status(400).json({
          success: false,
          message: "Failed to Update",
        });
      } else {
        logger.info(`User ${id} updated profile without password change`);
        return res.status(200).json({
          success: true,
          message: "Updated successfully",
        });
      }
    }
  } catch (error) {
    logger.error(`Error in updateUser for user ${id}:`, error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const itemDetail = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      WITH item_data AS (
        SELECT 
          json_build_object(
            'id', rm.id,
            'food_name', rm.food_name,
            'restaurant_id', rm.restaurant_id,
            'description', rm.description,
            'price', rm.price,
            'image', rm.image,
            'available', rm.available
          ) AS item
        FROM 
          restaurant_menu rm
        WHERE 
          rm.id = $1
      ),
      addon_data AS (
        SELECT 
          COALESCE(json_agg(
            json_build_object(
              'id', ie.id,
              'name', ie.option,
              'price', ie.price
            )
          ) FILTER (WHERE ie.id IS NOT NULL), '[]') AS addon
        FROM 
          item_extras ie
        WHERE 
          ie.item_id = $1
      ),
      sizes_data AS (
        SELECT 
          COALESCE(json_agg(
            json_build_object(
              'id', isz.id,
              'size', isz.size,
              'price', isz.price
            )
          ) FILTER (WHERE isz.id IS NOT NULL), '[]') AS sizes
        FROM 
          item_sizes isz
        WHERE 
          isz.item_id = $1
      ),
      restaurant_data AS (
        SELECT
          json_build_object(
            'id', r.id,
            'restaurant_name', r.restaurant_name,
            'contact_details', r.contact_details,
            'location', r.location,
            'branches', r.branches,
            'cover', r.cover,
            'terminate', r.terminate,
            'status', r.status,
            'zipcode', r.zipcode,
            'city', r.city,
            'state', r.state,
            'country', r.country,
            'home_chef', r.home_chef,
            'opening_time', r.opening_time,
            'closing_time', r.closing_time,
            'preparation_time', r.preparation_time
          ) AS restaurant
        FROM 
          restaurants r
        WHERE 
          r.id = (SELECT rm.restaurant_id FROM restaurant_menu rm WHERE rm.id = $1)
      )
    SELECT
      item_data.item,
      addon_data.addon,
      sizes_data.sizes,
      restaurant_data.restaurant
    FROM 
      item_data, addon_data, sizes_data, restaurant_data;
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      logger.info(`Item not found with id ${id}`);
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    logger.info(`Fetched details for item ${id}`);
    return res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    logger.error(`Error fetching item details for ${id}:`, error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const addNewAddress = async (req, res) => {
  const { id } = req.params;
  const { address, home } = req.body;
  try {
    const addAddress = await pool.query(
      "INSERT INTO addresses (address, home, user_id) VALUES ($1, $2, $3) RETURNING *",
      [address, home, id]
    );
    if (addAddress.rowCount === 0) {
      logger.error(`Failed to add address for user ${id}`);
      return res.status(400).json({
        success: false,
        message: "Failed to add address",
      });
    } else {
      logger.info(`Added new address for user ${id}`);
      return res.status(200).json({
        success: true,
        message: "Address has been added",
        address: addAddress.rows[0],
      });
    }
  } catch (error) {
    logger.error(`Error adding address for user ${id}:`, error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const updateAddress = async (req, res) => {
  const { id } = req.params;
  const { address, home } = req.body;
  try {
    const updatedAddress = await pool.query(
      "UPDATE addresses SET address = $1, home = $2 WHERE id = $3 RETURNING *",
      [address, home, id]
    );
    if (updatedAddress.rowCount === 0) {
      logger.error(`Failed to update address ${id}`);
      return res.status(400).json({
        success: false,
        message: "Failed to update address",
      });
    } else {
      logger.info(`Updated address ${id}`);
      return res.status(200).json({
        success: true,
        message: "Address has been updated",
        address: updatedAddress.rows[0],
      });
    }
  } catch (error) {
    logger.error(`Error updating address ${id}:`, error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const deleteAddress = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM addresses WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      logger.error(`Failed to delete address ${id}`);
      return res.status(400).json({
        success: false,
        message: "Failed to delete address",
      });
    } else {
      logger.info(`Deleted address ${id}`);
      return res.status(200).json({
        success: true,
        message: "Address has been deleted",
      });
    }
  } catch (error) {
    logger.error(`Error deleting address ${id}:`, error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const ongoingOrder = async (req, res) => {
  const { id } = req.params;

  try {
    logger.info(`Fetching order with ID: ${id}`);

    const orderResponse = await pool.query(
      "SELECT * FROM orders WHERE id = $1",
      [id]
    );
    if (orderResponse.rowCount === 0) {
      logger.warn(`Order not found with ID: ${id}`);
      return res
        .status(404)
        .json({ success: false, message: "No Order found!" });
    }
    const order = orderResponse.rows[0];

    const restaurantResponse = await pool.query(
      "SELECT id, restaurant_name, location, state, city, zipcode, country, preparation_time FROM restaurants WHERE id = $1",
      [order.restaurant_id]
    );
    if (restaurantResponse.rowCount === 0) {
      logger.warn(`Restaurant not found with ID: ${order.restaurant_id}`);
      return res
        .status(404)
        .json({ success: false, message: "No Restaurant found!" });
    }
    const restaurant = restaurantResponse.rows[0];

    logger.info(`Fetching items for order ID: ${id}`);
    const itemOrderResponse = await pool.query(
      `SELECT io.id, io.item_id, io.quantity, io.size_id, io.addon_id, rm.food_name, rm.price, rm.image 
       FROM item_order io 
       JOIN restaurant_menu rm ON io.item_id = rm.id 
       WHERE io.order_id = $1`,
      [id]
    );
    const itemOrders = itemOrderResponse.rows;

    const itemOrderDetails = await Promise.all(
      itemOrders.map(async (item) => {
        let sizeDetails = { size: "", price: 0 };
        if (item.size_id) {
          const sizeResponse = await pool.query(
            "SELECT size, price FROM item_sizes WHERE id = $1",
            [item.size_id]
          );
          if (sizeResponse.rowCount !== 0) {
            sizeDetails = sizeResponse.rows[0];
          }
        }

        let extraDetails = { option: "", price: 0 };
        if (item.addon_id) {
          const extraResponse = await pool.query(
            "SELECT option, price FROM item_extras WHERE id = $1",
            [item.addon_id]
          );
          if (extraResponse.rowCount !== 0) {
            extraDetails = extraResponse.rows[0];
          }
        }

        return {
          ...item,
          size: sizeDetails,
          item_extra: extraDetails,
        };
      })
    );

    const responseData = {
      order: {
        id: order.id,
        user_id: order.user_id,
        restaurant_id: order.restaurant_id,
        total: order.total,
        payment_mode: order.payment_mode,
        status: order.status,
        subtotal: order.subtotal,
        delivery_fee: order.delivery_fee,
        order_date: order.order_date,
        service_fee: order.service_fee,
        tax: order.tax,
        discount: order.discount,
        tip: order.tip,
        address: order.address,
        order_time: order.order_time,
      },
      restaurant: {
        restaurant_name: restaurant.restaurant_name,
        location: `${restaurant.location}, ${restaurant.zipcode}, ${restaurant.city}, ${restaurant.state}, ${restaurant.country}`,
        prep_time: restaurant.preparation_time,
      },
      item_order: itemOrderDetails,
    };

    logger.info(`Order details prepared for ID: ${id}`);
    return res.status(200).json({ success: true, data: responseData });
  } catch (error) {
    logger.error("Error fetching order data:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching the order data.",
    });
  }
};

const placeOrder = async (req, res) => {
  const {
    UserId,
    Address,
    PhoneNumber,
    RestaurantId,
    Subtotal,
    ServiceFee,
    Tax,
    taxId,
    TotalAmount,
    Note,
    voucher,
    deliveryFee,
    PaymentMethod,
    order_date,
    discount,
    coupon_id,
    itemOrder,
    status,
    paymentIntentId,
    quoteId,
    tip,
  } = req.body;

  try {
    await pool.query("BEGIN");

    if (!itemOrder || !Array.isArray(itemOrder) || itemOrder.length === 0) {
      logger.warn("Invalid item order data received.");
      throw new Error("Invalid item order data.");
    }

    if (
      PaymentMethod.trim().toLowerCase() === "card" ||
      PaymentMethod.trim().toLowerCase() === "apple pay"
    ) {
      if (!paymentIntentId) {
        logger.error("Missing PaymentIntentId for card payments.");
        throw new Error("Missing PaymentIntentId for card payments.");
      }

      const paymentConfirmation = await stripe.paymentIntents.retrieve(
        paymentIntentId
      );
      logger.info(`Payment Intent Status: ${paymentConfirmation.status}`);

      if (paymentConfirmation.status !== "succeeded") {
        logger.warn("Payment not successful. Order will not be created.");
        throw new Error("Payment not successful. Order will not be created.");
      }
    }

    const newOrder = await pool.query(
      `INSERT INTO orders (
        user_id, address, subtotal, delivery_fee, total, voucher, note,
        payment_mode, phone_number, restaurant_id, service_fee, tax,
        order_date, order_time, discount, status, quote_id, tip
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), $14, $15, $16, $17
      ) RETURNING id`,
      [
        UserId,
        Address,
        Subtotal,
        deliveryFee,
        TotalAmount,
        voucher,
        Note,
        PaymentMethod,
        PhoneNumber,
        RestaurantId,
        ServiceFee,
        Tax,
        order_date,
        discount,
        status,
        quoteId,
        tip,
      ]
    );

    if (newOrder.rows.length === 0) {
      logger.error("Order creation failed.");
      throw new Error("Order creation failed.");
    }
    const orderId = newOrder.rows[0].id;
    logger.info(`New Order ID: ${orderId}`);

    for (const item of itemOrder) {
      await pool.query(
        `INSERT INTO item_order (item_id, order_id, quantity, restaurant_id, size_id, addon_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          item.item_id,
          orderId,
          item.quantity,
          RestaurantId,
          item.size_id,
          item.option_id,
        ]
      );
    }

    if (coupon_id) {
      const couponCheck = await pool.query(
        `SELECT id, type, count, use_count FROM coupon WHERE id = $1`,
        [coupon_id]
      );

      if (couponCheck.rows.length > 0) {
        const coupon = couponCheck.rows[0];
        logger.info(`Applying coupon: ${coupon_id} of type ${coupon.type}`);

        const existingCountResult = await pool.query(
          `SELECT COALESCE(MAX(use_count), 0) AS use_count FROM coupon_users WHERE coupon_id = $1 AND user_id = $2`,
          [coupon_id, UserId]
        );

        if (existingCountResult.rows[0].use_count === 0) {
          await pool.query(
            `INSERT INTO coupon_users (coupon_id, user_id, use_count, order_id)
             VALUES ($1, $2, $3, $4)`,
            [coupon_id, UserId, 1, orderId]
          );
        } else {
          await pool.query(
            `UPDATE coupon_users SET use_count = coupon_users.use_count + 1 WHERE coupon_id = $1 AND user_id = $2`,
            [coupon_id, UserId]
          );
        }

        if (coupon.type === "quantity") {
          await pool.query(
            `UPDATE coupon SET count = count - 1, use_count = use_count + 1 WHERE id = $1`,
            [coupon_id]
          );
        } else if (coupon.type === "usage") {
          await pool.query(
            `UPDATE coupon SET use_count = use_count + 1, status = CASE WHEN use_count + 1 >= count THEN false ELSE status END WHERE id = $1`,
            [coupon_id]
          );
        }
      }
    }

    if (voucher) {
      await pool.query(`DELETE FROM voucher WHERE id = $1`, [voucher]);
      logger.info(`Deleted used voucher: ${voucher}`);
    }

    let transferId = paymentIntentId;
    if (PaymentMethod.trim().toLowerCase() === "wallet") {
      const walletResult = await pool.query(
        "SELECT id, current_amount FROM wallet WHERE user_id = $1",
        [UserId]
      );

      if (walletResult.rows.length === 0) {
        logger.warn("Wallet not found for user.");
        return res
          .status(400)
          .json({ success: false, message: "Wallet not found for this user." });
      }

      const wallet = walletResult.rows[0];
      const currentAmount = parseFloat(wallet.current_amount);

      if (TotalAmount > currentAmount) {
        logger.warn("Insufficient wallet balance.");
        return res
          .status(400)
          .json({ success: false, message: "Not enough balance in wallet" });
      }

      const newWalletBalance = currentAmount - TotalAmount;
      const totalAmountInCents = Math.round(parseFloat(TotalAmount) * 100);
      const storeCreditAccount = process.env.SC_ACCOUNT;
      const platformAccountId = process.env.PLATFORM_ACCOUNT;

      const transfer = await stripe.transfers.create(
        {
          amount: totalAmountInCents,
          currency: "usd",
          destination: platformAccountId,
        },
        { stripeAccount: storeCreditAccount }
      );

      if (!transfer.id) {
        logger.error("Stripe transfer failed.");
        return res
          .status(500)
          .json({ success: false, message: "Stripe transfer failed." });
      }

      transferId = transfer.id;
      logger.info(`Stripe wallet transfer success. ID: ${transferId}`);

      await pool.query("UPDATE wallet SET current_amount = $1 WHERE id = $2", [
        newWalletBalance.toFixed(2),
        wallet.id,
      ]);

      await pool.query(
        "INSERT INTO wallet_activity (wallet_id, used_amount, date, order_id) VALUES ($1, $2, $3, $4)",
        [wallet.id, TotalAmount, order_date, orderId]
      );
    }

    const orderPayment = await pool.query(
      `INSERT INTO order_payment (payment_intent_id, user_id, restaurant_id, order_id, amount, status, payment_date, payment_method_id)
       VALUES ($1, $2, $3, $4, $5, 'paid', $6, $7) RETURNING id`,
      [
        transferId,
        UserId,
        RestaurantId,
        orderId,
        TotalAmount,
        order_date,
        PaymentMethod,
      ]
    );

    if (orderPayment.rowCount === 0) {
      logger.error("Failed to save order payment details.");
      throw new Error("Failed to save order payment details.");
    }

    if (taxId && paymentIntentId) {
      try {
        const transaction = await stripe.tax.transactions.createFromCalculation(
          {
            calculation: taxId,
            reference: paymentIntentId,
            expand: ["line_items"],
          }
        );
        logger.info(`Stripe Tax Transaction Created: ${transaction.id}`);
      } catch (err) {
        logger.error(`Stripe Tax API Error: ${err.message}`);
      }
    }

    await pool.query("COMMIT");
    logger.info("Order placed successfully");

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: newOrder.rows[0],
    });
  } catch (error) {
    await pool.query("ROLLBACK");
    logger.error("Error processing order:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

const stripePayment = async (req, res) => {
  try {
    const {
      username,
      totalAmount,
      deliveryFee,
      customerId,
      payment_method,
      tip,
    } = req.body;

    if (!username) {
      logger.warn("Missing username in Stripe payment request.");
      return res.status(400).json({ message: "User name is missing" });
    }

    logger.info(
      `Initiating Stripe Payment for user: ${username}, customer ID: ${customerId}`
    );

    const totalAmountInCents = Math.round(parseFloat(totalAmount) * 100);
    const deliveryFeeInCents = Math.round(parseFloat(deliveryFee + tip) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmountInCents,
      currency: "usd",
      customer: customerId,
      payment_method_types: ["card"],
      payment_method: payment_method,
      confirmation_method: "automatic",
      confirm: true,
      metadata: { username },
      transfer_data: {
        destination: process.env.DELIVERY_ACCOUNT,
        amount: deliveryFeeInCents,
      },
    });

    logger.info(`Stripe PaymentIntent created. ID: ${paymentIntent.id}`);

    res.status(200).json({
      success: true,
      message: "Payment intent created",
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    logger.error(`Stripe PaymentIntent creation failed: ${err.message}`);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const stripePaymentWithApple = async (req, res) => {
  try {
    const {
      username,
      totalAmount,
      deliveryFee,
      tax,
      subtotal,
      servicefee,
      customerId,
      tip,
    } = req.body;

    if (!username) {
      logger.warn("User name is missing in request body.");
      return res.status(400).json({ message: "User name is missing" });
    }

    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customerId },
      { apiVersion: "2023-10-16" }
    );

    const totalAmountInCents = Math.round(parseFloat(totalAmount) * 100);
    const deliveryFeeInCents = Math.round(parseFloat(deliveryFee + tip) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmountInCents,
      currency: "usd",
      customer: customerId,
      metadata: { username },
      transfer_data: {
        destination: process.env.DELIVERY_ACCOUNT,
        amount: deliveryFeeInCents,
      },
    });

    logger.info(
      `PaymentIntent created for user ${username}, ID: ${paymentIntent.id}`
    );

    res.status(200).json({
      success: true,
      message: "Payment intent created",
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      ephemeralKey: ephemeralKey.secret,
    });
  } catch (err) {
    logger.error(`Error creating Payment Intent: ${err.message}`, {
      stack: err.stack,
    });
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getWallet = async (req, res) => {
  const { id } = req.params;

  try {
    const query = ` 
      WITH wallet_data AS (
        SELECT w.id, ROUND(w.refund_amount, 2) AS refund_amount, 
        TO_CHAR(w.date, 'DD Mon YYYY') AS refunddate
        FROM wallet_refund w
        WHERE w.user_id = $1
      ),
      total_wallet_data AS (
        SELECT current_amount AS total_amount
        FROM wallet w
        WHERE w.user_id = $1
      ),
      wallet_activity AS (
        SELECT wa.id, ROUND(wa.used_amount, 2) AS used_amount, 
        TO_CHAR(wa.date, 'DD Mon YYYY') AS date, 
        r.restaurant_name
        FROM wallet_activity wa
        JOIN wallet w ON wa.wallet_id = w.id
        JOIN orders o ON wa.order_id = o.id
        JOIN restaurants r ON o.restaurant_id = r.id
        WHERE w.user_id = $1
      )
      SELECT
        (SELECT json_agg(wallet_data) FROM wallet_data) AS wallet,
        (SELECT json_agg(total_wallet_data) FROM total_wallet_data) AS total_wallet,
        (SELECT json_agg(wallet_activity) FROM wallet_activity) AS wallet_activity;
    `;

    const { rows } = await pool.query(query, [id]);

    if (!rows || rows.length === 0) {
      logger.warn(`Wallet data not found for user ID ${id}`);
      return res.status(404).json({ error: "User not found" });
    }

    const row = rows[0];
    const wallet = row.wallet || [];
    const totalWallet =
      row.total_wallet && row.total_wallet.length > 0
        ? row.total_wallet[0]
        : {};
    const walletActivity = row.wallet_activity || [];

    const data = {
      wallet,
      totalWallet: totalWallet.total_amount || 0,
      walletActivity,
    };

    logger.info(`Wallet data retrieved for user ID ${id}`);
    return res.json({ success: true, data });
  } catch (err) {
    logger.error(
      `Error fetching wallet data for user ID ${id}: ${err.message}`,
      {
        stack: err.stack,
      }
    );
    return res.status(500).json({ error: "Internal server error" });
  }
};

const fetchVouchers = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    logger.warn("fetchVouchers called without user ID");
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    });
  }

  try {
    const vouchersResponse = await pool.query(
      `SELECT * FROM voucher WHERE user_id = $1`,
      [id]
    );

    const couponsResponse = await pool.query(
      `
      SELECT *
      FROM coupon c
      WHERE c.expiry_date > CURRENT_DATE
        AND c.status = TRUE
        AND (
          c.type != 'usage'
          OR NOT EXISTS (
            SELECT 1
            FROM coupon_users cu
            WHERE cu.coupon_id = c.id AND cu.user_id = $1
          )
        )
      `,
      [id]
    );

    const vouchers = vouchersResponse.rows;
    const coupons = couponsResponse.rows;

    if (vouchers.length === 0 && coupons.length === 0) {
      logger.info("No vouchers or coupons found for user");
      return res.status(404).json({
        success: true,
        data: {
          vouchers: [],
          coupons: [],
        },
      });
    } else {
      logger.info(`Fetched vouchers and coupons for user`);
      return res.status(200).json({
        success: true,
        data: {
          vouchers: vouchers.length > 0 ? vouchers : [],
          coupons: coupons.length > 0 ? coupons : [],
        },
      });
    }
  } catch (error) {
    logger.error("Error fetching vouchers and coupons", {
      message: error.message,
      stack: error.stack,
    });
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error!",
    });
  }
};

const addReview = async (req, res) => {
  const { id } = req.params;
  const { rating, review, userId, restaurantId } = req.body;

  try {
    const newReview = await pool.query(
      "INSERT INTO reviews (review, rating, user_id, restaurant_id, order_id) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [review, rating, userId, restaurantId, id]
    );

    if (newReview.rowCount === 0) {
      logger.warn("Failed to insert new review");
      return res.status(404).json({
        success: false,
        message: "Failed to add review",
      });
    } else {
      const updateStatus = await pool.query(
        "UPDATE orders SET status = 6 WHERE id = $1 RETURNING status",
        [id]
      );

      if (updateStatus.rows[0].status !== 6) {
        logger.warn("Failed to update order status after review insertion");
        return res.status(404).json({
          success: false,
          message: "Failed to add review",
        });
      } else {
        logger.info("Review added and order status updated successfully");
        return res.status(200).json({
          success: true,
          message: "Thank you for providing feedback",
        });
      }
    }
  } catch (error) {
    logger.error("Error adding review", {
      message: error.message,
      stack: error.stack,
    });
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error!",
    });
  }
};

const restaurant = async (req, res) => {
  const { id } = req.params;

  try {
    const queryText = `
      WITH restaurant_data AS (
        SELECT * FROM restaurants WHERE id = $1
      ),
      reviews_data AS (
        SELECT
          reviews.id AS review_id,
          reviews.review,
          reviews.rating,
          reviews.user_id,
          reviews.comment,
          users.username
        FROM reviews
        JOIN users ON reviews.user_id = users.user_id
        WHERE reviews.restaurant_id = $1
      )
      SELECT
        (SELECT row_to_json(rd) FROM restaurant_data rd) AS restaurant,
        (SELECT json_agg(reviews_data) FROM reviews_data) AS reviews;
    `;

    const { rows } = await pool.query(queryText, [id]);

    if (rows.length === 0 || !rows[0].restaurant) {
      logger.warn(`Restaurant not found for id: ${id}`);
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }
    logger.info(`Fetched restaurant data for id: ${id}`);

    const responseData = {
      success: true,
      restaurant: {
        ...rows[0].restaurant,
        reviews: rows[0].reviews || [],
      },
    };

    return res.status(200).json(responseData);
  } catch (error) {
    logger.error("Error fetching restaurant data", {
      message: error.message,
      stack: error.stack,
    });
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error!",
    });
  }
};

const getDefaultPaymentMethod = async (req, res) => {
  const { customerId } = req.body;

  try {
    if (!customerId) {
      logger.warn("getDefaultPaymentMethod called without customerId");
      return res.status(400).json({ error: "Customer ID is required" });
    }

    logger.info("Fetching default payment method for a customer");

    const customer = await stripe.customers.retrieve(customerId);

    if (customer.invoice_settings.default_payment_method) {
      const defaultPaymentMethod = await stripe.paymentMethods.retrieve(
        customer.invoice_settings.default_payment_method
      );

      return res.json({
        success: true,
        defaultCard: {
          last4: defaultPaymentMethod.card.last4,
          brand: defaultPaymentMethod.card.brand,
          id: defaultPaymentMethod.id,
        },
      });
    } else {
      return res.json({ success: true, defaultCard: null });
    }
  } catch (error) {
    logger.error("Error fetching default payment method", {
      message: error.message,
      stack: error.stack,
    });
    res
      .status(500)
      .json({ error: "Failed to retrieve default payment method" });
  }
};

const getSavedCard = async (req, res) => {
  const { customerId } = req.body;

  try {
    if (!customerId) {
      logger.warn("getSavedCard called without customerId");
      return res.status(400).json({ error: "Customer ID is required backend" });
    }

    logger.info("Fetching saved payment cards for a customer");

    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    });

    if (paymentMethods.data.length > 0) {
      const cardlist = paymentMethods.data.map((method) => ({
        last4: method.card.last4,
        brand: method.card.brand,
        id: method.id,
      }));
      logger.info(`Returning ${cardlist.length} saved cards`);
      return res.status(200).json({ success: true, cardlist });
    } else {
      logger.info("No saved payment methods found");
      res.status(200).json({ success: true, cardlist: [] });
    }
  } catch (error) {
    logger.error("Error retrieving saved cards", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ success: false, error: "Failed to retrieve cards" });
  }
};

const createStripeCustomer = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      logger.warn("createStripeCustomer called without email or name");
      return res.status(400).json({ message: "Email and name are required." });
    }

    logger.info("Checking if customer already exists");

    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      logger.info("Customer already exists, returning existing customer ID");
      return res.status(200).json({
        success: true,
        customerId: existingCustomers.data[0].id,
        message: "Customer already exists",
      });
    } else {
      const customer = await stripe.customers.create({
        email: email,
        name: name,
      });
      logger.info("Created new Stripe customer");
      return res.status(200).json({
        customerId: customer.id,
        message: "Customer created successfully",
      });
    }
  } catch (error) {
    logger.error("Error creating customer", {
      message: error.message,
      stack: error.stack,
    });
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const saveCard = async (req, res) => {
  const {
    customerId,
    tokenId,
    email,
    phoneNumber,
    name,
    city,
    state,
    country,
    postal_code,
    line1,
    apt,
  } = req.body;

  try {
    if (!customerId) {
      logger.warn("saveCard called without customerId");
      return res.status(400).json({ error: "Customer ID is required" });
    }

    const customer = await stripe.customers.retrieve(customerId);

    if (!customer || customer.deleted) {
      logger.warn(`Customer not found or deleted for id: ${customerId}`);
      return res.status(400).json({ error: "Customer not found" });
    }

    const paymentMethod = await stripe.paymentMethods.create({
      type: "card",
      card: {
        token: tokenId,
      },
      billing_details: {
        name: name,
        email: email,
        phone: phoneNumber,
        address: {
          line1: line1,
          line2: apt,
          city: city,
          state: state,
          postal_code: postal_code,
          country: country,
        },
      },
    });

    await stripe.paymentMethods.attach(paymentMethod.id, {
      customer: customer.id,
    });

    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethod.id,
      },
    });

    await stripe.customers.update(customer.id, {
      email: email,
      phone: phoneNumber,
    });

    const card = paymentMethod.card;

    logger.info(
      `Saved card ending in ${card.last4} for customer ${customer.id}`
    );

    res.json({
      card: {
        last4: card.last4,
        type: card.brand,
      },
      customerId: customer.id,
    });
  } catch (error) {
    logger.error("Failed to save card", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: "Failed to save card" });
  }
};

const deleteCard = async (req, res) => {
  const { customerId, paymentId } = req.body;

  try {
    if (!customerId || !paymentId) {
      logger.warn("deleteCard called without required customerId or paymentId");
      return res.status(400).json({
        error: "Customer ID and Payment Method ID are required",
      });
    }

    const customer = await stripe.customers.retrieve(customerId);

    if (!customer) {
      logger.warn(`Customer not found for id: ${customerId}`);
      return res.status(404).json({ error: "Customer not found" });
    }

    const paymentMethod = await stripe.paymentMethods.retrieve(paymentId);

    if (paymentMethod.customer !== customerId) {
      logger.warn(
        `Payment method ${paymentId} does not belong to customer ${customerId}`
      );
      return res.status(403).json({
        error: "Payment method does not belong to the specified customer",
      });
    }

    await stripe.paymentMethods.detach(paymentId);

    logger.info(
      `Deleted payment method ${paymentId} for customer ${customerId}`
    );

    res.json({ message: "Card deleted successfully" });
  } catch (error) {
    logger.error("Failed to delete card", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: "Failed to delete card" });
  }
};

const getCustomerByEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      logger.warn("getCustomerByEmail called without email");
      return res.status(400).json({ error: "Email is required." });
    }

    const customers = await stripe.customers.list({ email, limit: 1 });

    if (customers.data.length === 0) {
      logger.info(`No customer found with email (hidden)`);
      return res.status(404).json({
        error: "No customer found with the provided email.",
      });
    }

    logger.info("Customer found for email (hidden)");

    res.json(customers.data[0]);
  } catch (error) {
    logger.error("Error fetching customer by email", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: "Failed to fetch customer." });
  }
};

const setDefaultPaymentMethod = async (req, res) => {
  const { customerId, paymentMethodId } = req.body;

  try {
    if (!customerId || !paymentMethodId) {
      logger.warn(
        "setDefaultPaymentMethod called without required customerId or paymentMethodId"
      );
      return res
        .status(400)
        .json({ error: "Customer ID and Payment Method ID are required" });
    }

    const customer = await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    const defaultPaymentMethod = await stripe.paymentMethods.retrieve(
      paymentMethodId
    );

    logger.info(
      `Set default payment method ${paymentMethodId} for customer ${customerId}`
    );

    res.status(200).json({
      success: true,
      message: "Default payment method set successfully",
      defaultCard: {
        last4: defaultPaymentMethod.card.last4,
        brand: defaultPaymentMethod.card.brand,
        id: defaultPaymentMethod.id,
      },
    });
  } catch (error) {
    logger.error("Error setting default payment method", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: "Failed to set default payment method" });
  }
};

const restaurants = async (req, res) => {
  try {
    const query = `
      WITH average_ratings AS (
        SELECT r.id AS restaurant_id, AVG(rv.rating) AS avg_rating, COUNT(rv.rating) AS review_count
        FROM reviews rv
        JOIN restaurants r ON rv.restaurant_id = r.id
        GROUP BY r.id
      )
      SELECT 
        r.id,
        r.restaurant_name,
        r.contact_details,
        r.location,
        r.branches,
        r.cover,
        r.terminate,
        r.status,
        r.zipcode,
        r.city,
        r.state,
        r.home_chef,
        r.opening_time,
        r.closing_time,
        r.commission_type,
        r.cuisine,
        r.created_date,
        COALESCE(m.min_price, 0) AS min_price,
        COALESCE(ar.avg_rating, 0) AS average_rating,
        COALESCE(ar.review_count, 0) AS review_count
      FROM restaurants r
      LEFT JOIN (
        SELECT restaurant_id, MIN(price) AS min_price
        FROM restaurant_menu
        WHERE available = true
        GROUP BY restaurant_id
      ) m ON r.id = m.restaurant_id
      LEFT JOIN average_ratings ar ON r.id = ar.restaurant_id
      WHERE r.status = true AND r.terminate = false AND r.commission_type IS NOT NULL;
    `;

    const { rows } = await pool.query(query);

    if (rows.length === 0) {
      logger.info("No restaurants found with current filter");
      return res.status(404).json({
        success: false,
        message: "Restaurants not found",
      });
    }

    logger.info(`Fetched ${rows.length} restaurants`);

    return res.status(200).json({
      success: true,
      restaurants: rows,
    });
  } catch (error) {
    logger.error("Error fetching restaurants", {
      message: error.message,
      stack: error.stack,
    });
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error!",
    });
  }
};

const orderList = async (req, res) => {
  const { id } = req.params;
  try {
    const orders = await pool.query(
      `SELECT o.id, o.user_id, o.status, o.order_date, o.order_time, io.restaurant_id
       FROM orders o
       JOIN item_order io ON o.id = io.order_id
       WHERE o.user_id = $1 AND o.status IN (0, 1, 2, 3, 4, 5, 6)`,
      [id]
    );

    if (orders.rowCount === 0) {
      logger.info(`No orders found for user ${id}`);
      return res.status(404).json({
        success: false,
        message: "No Orders Found for this user!",
      });
    }

    const uniqueOrders = Array.from(
      new Set(orders.rows.map((order) => order.id))
    ).map((orderId) => {
      return orders.rows.find((order) => order.id === orderId);
    });

    const ordersWithDetails = await Promise.all(
      uniqueOrders.map(async (order) => {
        const restaurantId = order.restaurant_id;

        const restaurantResult = await pool.query(
          `SELECT r.id, r.restaurant_name, r.branches, r.cuisine, r.location, r.cover
           FROM restaurants r
           WHERE r.id = $1`,
          [restaurantId]
        );
        const restaurant = restaurantResult.rows[0];

        const minPriceResult = await pool.query(
          `SELECT MIN(price) AS min_price
           FROM restaurant_menu
           WHERE restaurant_id = $1`,
          [restaurantId]
        );
        const minPrice = minPriceResult.rows[0].min_price || 0;

        const ratingResult = await pool.query(
          `SELECT AVG(rating) AS avg_rating, COUNT(rating) AS review_count
           FROM reviews
           WHERE restaurant_id = $1`,
          [restaurantId]
        );
        const avgRating = ratingResult.rows[0].avg_rating || 0;
        const reviewCount = ratingResult.rows[0].review_count || 0;

        return {
          order: {
            id: order.id,
            user_id: order.user_id,
            status: order.status,
            order_date: order.order_date,
            order_time: order.order_time,
            restaurant: {
              id: restaurant.id,
              restaurant_name: restaurant.restaurant_name,
              branches: restaurant.branches,
              min_price: parseFloat(minPrice).toFixed(2),
              cuisine: restaurant.cuisine,
              cover: restaurant.cover,
              average_rating: avgRating,
              review_count: reviewCount,
            },
          },
        };
      })
    );

    logger.info(
      `Fetched ${ordersWithDetails.length} orders with details for user ${id}`
    );

    return res.status(200).json({
      success: true,
      orders: ordersWithDetails,
    });
  } catch (error) {
    logger.error("Error fetching orders", {
      message: error.message,
      stack: error.stack,
    });
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const resetPassword = async (req, res) => {
  const { email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newPass = await pool.query(
      "UPDATE users SET password = $1 WHERE email = $2 RETURNING id",
      [hashedPassword, email]
    );

    if (newPass.rowCount === 0) {
      logger.warn(
        `Password reset attempt failed — no user with email: ${email}`
      );
      return res
        .status(404)
        .json({ success: false, message: "Failed to update password" });
    } else {
      logger.info(`Password reset successfully for user with email: ${email}`);
      return res
        .status(200)
        .json({ success: true, message: "Password reset successfully" });
    }
  } catch (error) {
    logger.error("Error resetting password", {
      message: error.message,
      stack: error.stack,
    });
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const stripeTaxCalculation = async (req, res) => {
  const { subtotal, address } = req.body;

  try {
    const addressParts = address.split(",").map((part) => part.trim());
    const stripeSubtotal = Math.round(parseFloat(subtotal) * 100);

    const calculation = await stripe.tax.calculations.create({
      currency: "usd",
      line_items: [
        {
          amount: stripeSubtotal,
          reference: "L1",
        },
      ],
      customer_details: {
        address: {
          line1: addressParts[0],
          city: addressParts.length >= 5 ? addressParts[2] : addressParts[1],
          state: addressParts.length >= 5 ? addressParts[3] : addressParts[2],
          postal_code: addressParts.length >= 5 ? addressParts[1] : "",
          country: "US",
        },
        address_source: "shipping",
      },
    });

    const calTax = calculation.tax_breakdown[0].amount / 100;

    logger.info(
      `Calculated tax: $${calTax.toFixed(2)} for subtotal: $${subtotal}`
    );

    return res
      .status(200)
      .json({ success: true, tax: calTax, taxId: calculation.id });
  } catch (error) {
    logger.error("Error during tax calculation", {
      message: error.message,
      stack: error.stack,
    });
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const restaurantStatus = async (req, res) => {
  const { id } = req.params;
  try {
    const status = await pool.query(
      "SELECT status FROM restaurants WHERE id = $1",
      [id]
    );
    if (status.rowCount === 0) {
      logger.warn(
        `Attempted to fetch status for non-existent restaurant id: ${id}`
      );
      return res
        .status(400)
        .json({ success: false, message: "Couldn't get restaurant status" });
    } else {
      logger.info(
        `Fetched status for restaurant id: ${id} - status: ${status.rows[0].status}`
      );
      return res
        .status(200)
        .json({ success: true, status: status.rows[0].status });
    }
  } catch (error) {
    logger.error("Error fetching restaurant status", {
      message: error.message,
      stack: error.stack,
    });
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching restaurant status",
    });
  }
};

const resetPasswordOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const checkUser = await pool.query(
      "SELECT email FROM users WHERE email = $1",
      [email]
    );

    if (checkUser.rowCount === 0) {
      logger.warn(
        `Password reset OTP requested for non-existent email: ${email}`
      );
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    } else {
      const verificationCode = generateVerificationCode();

      const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Only Halal - Verify your email",
        html: `
          <div style="background-color: #fff; padding: 20px; font-family: Arial, sans-serif; color: #333;">
            <table style="width: 100%; max-width: 600px; margin: 0 auto; border-radius: 20px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
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
          logger.error("Error sending reset password OTP email", {
            error: error.message,
          });
          return res.status(500).json({
            success: false,
            message: "Failed to send email",
            error: error.message,
          });
        } else {
          logger.info(`Verification email sent to ${email}: ${info.response}`);
          return res.status(200).json({
            success: true,
            message: "Verification Email sent",
            otp: verificationCode,
          });
        }
      });
    }
  } catch (error) {
    logger.error("Server error in resetPasswordOTP", {
      message: error.message,
      stack: error.stack,
    });
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const sendMail = async (req, res) => {
  const { order, email, subject, message } = req.body;

  try {
    const checkUser = await pool.query(
      "SELECT email FROM users WHERE email = $1",
      [email]
    );
    if (checkUser.rowCount === 0) {
      logger.warn(`Contact email send attempt for non-existent user: ${email}`);
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    const mailOptions = {
      to: process.env.EMAIL,
      subject: `Customer Inquiry: ${subject}`,
      html: `
      <div style="background-color: #fff; padding: 20px; font-family: Arial, sans-serif; color: #333;">
        <table style="width: 100%; max-width: 600px; margin: 0 auto; border-radius: 20px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
          <thead>
            <tr>
              <th style="background-color: #F8971D; padding: 20px; text-align: center; color: white;">
                <h1>Only Halal Support</h1>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 20px; text-align: left;">
                <p style="font-size: 16px;">Hello Support Team,</p>
                <p style="font-size: 16px;">A customer has submitted an inquiry through the <b>Contact Us</b> form.</p>
                
                <h3 style="color: #F8971D; margin-top: 20px;">Customer Details:</h3>
                <ul style="font-size: 16px;">
                  <li><b>Email:</b> ${email}</li>
                  ${order ? `<li><b>Order ID:</b> ${order}</li>` : ""}
                  <li><b>Subject:</b> ${subject}</li>
                </ul>

                <h3 style="color: #F8971D; margin-top: 20px;">Message:</h3>
                <p style="font-size: 16px; background-color: #f8f8f8; padding: 15px; border-radius: 10px;">
                  ${message}
                </p>

                <p style="font-size: 16px; margin-top: 30px;">Please review and respond to the customer at <a href="mailto:${email}" style="color: #F8971D; text-decoration: none;">${email}</a>.</p>
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
        logger.error("Error sending contact email", { error: error.message });
        return res.status(500).json({
          success: false,
          message: "Failed to send email",
          error: error.message,
        });
      } else {
        logger.info(
          `Contact email sent to support from ${email}: ${info.response}`
        );
        return res.status(200).json({
          success: true,
          message: "Contact email sent successfully!",
        });
      }
    });
  } catch (error) {
    logger.error("Server error in sendMail", {
      message: error.message,
      stack: error.stack,
    });
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getCoordinatesFromAddress = async (req, res) => {
  try {
    const { address } = req.body;

    logger.info(`[Geocode] Request received`, {
      timestamp: new Date().toISOString(),
      addressLength: address?.length || 0,
    });

    if (!address) {
      logger.warn(`[Geocode] Address missing in request`);
      return res.status(400).json({
        success: false,
        message: "Address is required",
      });
    }

    const response = await client.geocode({
      params: {
        address,
        key: GOOGLE_MAPS_API_KEY,
      },
    });

    if (response.data.results.length > 0) {
      const { lat, lng } = response.data.results[0].geometry.location;

      logger.info(`[Geocode] Coordinates found`, {
        lat,
        lng,
      });

      return res.json({
        success: true,
        coordinates: { lat, lng },
      });
    } else {
      logger.info(`[Geocode] No results for provided address`);
      return res.status(404).json({
        success: false,
        message: "No results found for the address",
      });
    }
  } catch (error) {
    logger.error(`[Geocode] Error geocoding address`, {
      error: error?.response?.data?.error_message || error.message,
      status: error?.response?.status || 500,
    });

    return res.status(500).json({
      success: false,
      message: "Error geocoding address",
    });
  }
};

const suggestions = async (req, res) => {
  const { input } = req.body;

  logger.info(`[Autocomplete] Request received`, {
    timestamp: new Date().toISOString(),
    inputLength: input?.length || 0,
  });

  if (!input?.trim()) {
    logger.warn(`[Autocomplete] Empty input received`);
    return res.status(400).json({ error: "Input is required" });
  }

  try {
    const response = await client.placeAutocomplete({
      params: {
        input,
        key: GOOGLE_MAPS_API_KEY,
        types: "geocode",
      },
      timeout: 1000,
    });

    const suggestions = response.data.predictions.map(
      (prediction) => prediction.description
    );

    logger.info(`[Autocomplete] Suggestions fetched`, {
      suggestionCount: suggestions.length,
    });

    return res.status(200).json({
      success: true,
      suggestions,
    });
  } catch (error) {
    logger.error(`[Autocomplete] Error fetching suggestions`, {
      error: error?.response?.data?.error_message || error.message,
      status: error?.response?.status || 500,
    });

    return res.status(500).json({ error: "Failed to fetch suggestions" });
  }
};

const getUserData = async (req, res) => {
  const { id } = req.params;
  logger.info(`Fetching basic user data for user_id: ${id}`);

  try {
    const query = `
      SELECT user_id, username, email, phone, state, city, zipcode
      FROM users
      WHERE user_id = $1
    `;

    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      logger.warn(`User not found with id: ${id}`);
      return res.status(404).json({ error: "User not found" });
    }

    logger.info(`Basic user data fetched successfully for user_id: ${id}`);
    return res.json({ success: true, user: rows[0] });
    
  } catch (err) {
    logger.error("Error fetching basic user data", { error: err.message });
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
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
  getUserData,
};

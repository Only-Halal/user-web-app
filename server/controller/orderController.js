const pool = require("../database");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const { logErrorToS3 } = require("../services/logs");
const logger = require("../services/logger");

const getOrders = async (req, res) => {
  const { id } = req.params;

  logger.info("Fetching orders for restaurant", { restaurant_id: id });

  try {
    const queryText = `
      WITH orders_data AS (
        SELECT id, subtotal, total, order_date, order_time, status 
        FROM orders 
        WHERE restaurant_id = $1
      ),
      item_order_data AS (
        SELECT item_order.order_id, item_order.item_id, item_order.quantity
        FROM item_order
        JOIN orders ON item_order.order_id = orders.id
        WHERE orders.restaurant_id = $1
      ),
      menu_items_data AS (
        SELECT 
          rm.id, 
          rm.food_name, 
          rm.image 
        FROM restaurant_menu rm
        WHERE rm.restaurant_id = $1
      )
      SELECT 
        (SELECT json_agg(orders_data) FROM orders_data) AS orders,
        (SELECT json_agg(item_order_data) FROM item_order_data) AS item_orders,
        (SELECT json_agg(menu_items_data) FROM menu_items_data) AS menu
    `;

    const { rows } = await pool.query(queryText, [id]);

    if (rows.length === 0 || !rows[0].orders) {
      logger.warn("No orders found for restaurant", { restaurant_id: id });
      return res.status(404).json({
        success: false,
        message: "No orders found!",
      });
    }

    const orders = rows[0].orders || [];
    const itemOrders = rows[0].item_orders || [];
    const menu = rows[0].menu || [];

    const itemsByOrderId = itemOrders.reduce((acc, item) => {
      if (!acc[item.order_id]) acc[item.order_id] = [];
      acc[item.order_id].push(item);
      return acc;
    }, {});

    const ordersWithItems = orders.map((order) => {
      const orderItems = (itemsByOrderId[order.id] || []).map((item) => {
        const matchingItem = menu.find(
          (menuItem) => menuItem.id === item.item_id
        );
        return {
          item_id: item.item_id,
          food_name: matchingItem?.food_name || null,
          quantity: item.quantity,
          image: matchingItem?.image || null,
        };
      });

      return {
        id: order.id,
        status: order.status,
        subtotal: order.subtotal,
        total: order.total,
        date: order.order_date,
        time: order.order_time,
        items: orderItems,
      };
    });

    const hasStatusZero = ordersWithItems.some((order) => order.status === 0);

    logger.info("Orders fetched successfully", {
      restaurant_id: id,
      total_orders: ordersWithItems.length,
      has_status_zero: hasStatusZero,
    });

    return res.status(200).json({
      success: true,
      orders: ordersWithItems,
      hasStatusZero,
    });
  } catch (error) {
    logger.error("Error fetching orders", {
      restaurant_id: id,
      error: error.message,
      stack: error.stack,
    });
    await logErrorToS3("getOrders", error, req, res);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get Single Order
const getOrder = async (req, res) => {
  const { orderId } = req.params;
  logger.info("Fetching order details", { orderId });

  try {
    const orderResult = await pool.query("SELECT * FROM orders WHERE id = $1", [
      orderId,
    ]);

    if (orderResult.rowCount === 0) {
      logger.warn("Order not found", { orderId });
      return res.status(404).json({
        success: false,
        message: "No Order found!",
      });
    }

    const order = orderResult.rows[0];

    const [restaurantResult, userResult, itemOrderResult] = await Promise.all([
      pool.query("SELECT * FROM restaurants WHERE id = $1", [
        order.restaurant_id,
      ]),
      pool.query("SELECT * FROM users WHERE user_id = $1", [order.user_id]),
      pool.query(
        `
        SELECT io.*, rm.food_name, rm.price AS base_price, 
               isz.size, isz.price AS size_price, 
               ie.option AS extra_option, ie.price AS extra_price
        FROM item_order io
        JOIN restaurant_menu rm ON io.item_id = rm.id
        LEFT JOIN item_sizes isz ON io.size_id = isz.id
        LEFT JOIN item_extras ie ON io.addon_id = ie.id
        WHERE io.order_id = $1
      `,
        [order.id]
      ),
    ]);

    const restaurant = restaurantResult.rows[0] || {};
    const user = userResult.rows[0] || {};

    const items = itemOrderResult.rows.map((item) => ({
      item_name: item.food_name,
      base_price: item.base_price,
      quantity: item.quantity,
      size: item.size ? { size: item.size, price: item.size_price } : null,
      addon: item.extra_option
        ? { option: item.extra_option, price: item.extra_price }
        : null,
    }));

    const responseData = {
      success: true,
      order,
      restaurant: {
        restaurant_name: restaurant.restaurant_name,
        restaurant_address: restaurant.location,
        state: restaurant.state,
        city: restaurant.city,
        zipcode: restaurant.zipcode,
        country: restaurant.country,
        phone_number: restaurant.contact_details,
      },
      user: {
        userId: user.user_id,
        username: user.username,
        address: order.address,
      },
      items,
    };

    logger.info("Order fetched successfully", { orderId });
    return res.status(200).json(responseData);
  } catch (error) {
    logger.error("Error fetching order data", {
      orderId,
      error: error.message,
      stack: error.stack,
    });
    await logErrorToS3("getOrder", error, req, res);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching the order data.",
    });
  }
};

const newOrder = async (req, res) => {
  const { id } = req.params;
  const { orderId } = req.body;

  logger.info("Fetching new order(s)", {
    restaurant_id: id,
    order_id: orderId || null,
  });

  try {
    const queryText = `
      WITH orders_data AS (
        SELECT id, subtotal, total, discount, order_date, order_time, status 
        FROM orders 
        WHERE restaurant_id = $1 ${orderId ? "AND id = $2" : ""}
      ),
      item_order_data AS (
        SELECT item_order.order_id, item_order.item_id, item_order.quantity
        FROM item_order
        JOIN orders ON item_order.order_id = orders.id
        WHERE orders.restaurant_id = $1 ${orderId ? "AND orders.id = $2" : ""}
      ),
      menu_items_data AS (
        SELECT id, food_name, image 
        FROM restaurant_menu 
        WHERE restaurant_id = $1
      )
      SELECT 
        (SELECT json_agg(orders_data) FROM orders_data) AS orders,
        (SELECT json_agg(item_order_data) FROM item_order_data) AS item_orders,
        (SELECT json_agg(menu_items_data) FROM menu_items_data) AS menu;
    `;

    const queryParams = orderId ? [id, orderId] : [id];
    const { rows } = await pool.query(queryText, queryParams);

    if (!rows.length || !rows[0].orders) {
      logger.warn("No orders found", {
        restaurant_id: id,
        order_id: orderId || null,
      });
      return res.status(404).json({
        success: false,
        message: "No orders found!",
      });
    }

    const orders = rows[0].orders || [];
    const itemOrders = rows[0].item_orders || [];
    const menu = rows[0].menu || [];

    const itemsByOrderId = itemOrders.reduce((acc, item) => {
      if (!acc[item.order_id]) acc[item.order_id] = [];
      acc[item.order_id].push(item);
      return acc;
    }, {});

    const ordersWithItems = orders.map((order) => {
      const orderItems = (itemsByOrderId[order.id] || []).map((item) => {
        const menuItem = menu.find((m) => m.id === item.item_id);
        return {
          item_id: item.item_id,
          food_name: menuItem?.food_name || null,
          quantity: item.quantity,
          image: menuItem?.image || null,
        };
      });
      return {
        id: order.id,
        status: order.status,
        subtotal: order.subtotal,
        discount: order.discount,
        total: order.total,
        date: order.order_date,
        time: order.order_time,
        items: orderItems,
      };
    });

    logger.info("Orders retrieved successfully", {
      restaurant_id: id,
      total_orders: ordersWithItems.length,
    });

    return res.status(200).json({
      success: true,
      orders: ordersWithItems,
    });
  } catch (error) {
    logger.error("Error fetching new order(s)", {
      restaurant_id: id,
      order_id: orderId || null,
      error: error.message,
      stack: error.stack,
    });
    await logErrorToS3("newOrder", error, req, res);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  logger.info("Updating order status", { order_id: id, new_status: status });

  try {
    // Basic validation
    if (!id || typeof status !== "number") {
      return res.status(400).json({
        success: false,
        message: "Missing or invalid 'id' or 'status' in request",
      });
    }

    const response = await pool.query(
      "UPDATE orders SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );

    if (response.rowCount === 0) {
      logger.warn("Order not found during update", { order_id: id });
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const updatedOrder = response.rows[0];

    logger.info("Order status updated", { order_id: id, new_status: status });

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    logger.error("Error updating order status", {
      order_id: id,
      error: error.message,
      stack: error.stack,
    });
    await logErrorToS3("updateStatus", error, req, res);
    return res.status(500).json({
      success: false,
      message: "Something went wrong, please try again",
    });
  }
};

const statusOrders = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  logger.info("Fetching orders by status", { restaurant_id: id, status });

  try {
    const parsedStatus = parseInt(status);
    if (isNaN(parsedStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing 'status' parameter.",
      });
    }

    const ordersResult = await pool.query(
      `SELECT id, total, status, order_date 
       FROM orders 
       WHERE restaurant_id = $1 AND status = $2`,
      [id, parsedStatus]
    );

    const orders = ordersResult.rows;
    if (!orders.length) {
      logger.warn("No orders found with given status", {
        restaurant_id: id,
        status: parsedStatus,
      });
      return res.status(404).json({
        success: false,
        message: "No orders found with the given status.",
      });
    }

    const orderIds = orders.map((order) => order.id);

    const itemOrderResult = await pool.query(
      `SELECT item_order.order_id, item_order.item_id, item_order.quantity 
       FROM item_order 
       JOIN orders ON item_order.order_id = orders.id 
       WHERE orders.id = ANY($1)`,
      [orderIds]
    );

    const itemOrders = itemOrderResult.rows;
    const itemIds = [...new Set(itemOrders.map((item) => item.item_id))];

    const itemsResult = await pool.query(
      `SELECT id, food_name 
       FROM restaurant_menu 
       WHERE id = ANY($1)`,
      [itemIds]
    );

    const items = itemsResult.rows;

    const ordersWithItems = orders.map((order) => {
      const relatedItems = itemOrders
        .filter((item) => item.order_id === order.id)
        .map((item) => {
          const food = items.find((i) => i.id === item.item_id);
          return {
            item_id: item.item_id,
            food_name: food?.food_name || "Unknown",
            quantity: item.quantity,
          };
        });

      return {
        id: order.id,
        status: order.status,
        total: order.total,
        date: order.order_date,
        items: relatedItems,
      };
    });

    logger.info("Fetched orders by status successfully", {
      restaurant_id: id,
      status: parsedStatus,
      order_count: ordersWithItems.length,
    });

    return res.status(200).json({
      success: true,
      orders: ordersWithItems,
    });
  } catch (error) {
    logger.error("Error fetching status orders", {
      restaurant_id: id,
      status,
      error: error.message,
      stack: error.stack,
    });
    await logErrorToS3("statusOrders", error, req, res);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

const amountCharger = async (req, res) => {
  const { id } = req.params;
  const { type, rates, userId, status } = req.body;

  logger.info("Starting amountCharger", { order_id: id, type, status, userId });

  try {
    const findOrder = await pool.query("SELECT * FROM orders WHERE id = $1", [
      id,
    ]);

    if (findOrder.rowCount === 0) {
      logger.warn("Order not found", { order_id: id });
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    }

    const order = findOrder.rows[0];

    if (status === 2) {
      logger.info("Processing order decline and refund", { order_id: id });

      const getPaymentDetails = await pool.query(
        `SELECT payment_intent_id, payment_method_id, user_id, restaurant_id, amount 
         FROM order_payment 
         WHERE order_id = $1`,
        [id]
      );

      if (getPaymentDetails.rowCount === 0) {
        logger.error("No payment details found for order", { order_id: id });
        return res.status(401).json({
          success: false,
          message: "Failed to decline order",
        });
      }

      const { payment_intent_id, payment_method_id, user_id, amount } =
        getPaymentDetails.rows[0];

      if (["Card", "Apple Pay"].includes(payment_method_id)) {
        const refund = await stripe.refunds.create({
          payment_intent: payment_intent_id,
        });

        await pool.query(
          "UPDATE order_payment SET status = $1 WHERE payment_intent_id = $2",
          ["refunded", payment_intent_id]
        );

        logger.info("Stripe refund completed", { payment_intent_id });

        return res.status(200).json({
          success: true,
          message: "Order Declined & Refund Processed",
          refund,
        });
      }

      if (payment_method_id === "Wallet") {
        logger.info("Processing wallet refund", { user_id });

        const walletQuery = await pool.query(
          "SELECT id, current_amount FROM wallet WHERE user_id = $1",
          [user_id]
        );

        if (!walletQuery.rowCount) {
          logger.error("Wallet not found", { user_id });
          throw new Error("Wallet not found for user.");
        }

        const wallet = walletQuery.rows[0];
        const currentBalance = parseFloat(wallet.current_amount);
        const refundAmount = parseFloat(amount);
        const newBalance = currentBalance + refundAmount;

        const transferBack = await stripe.transfers.create(
          {
            amount: Math.round(refundAmount * 100),
            currency: "usd",
            destination: process.env.SC_ACCOUNT,
          },
          { stripeAccount: process.env.PLATFORM_ACCOUNT }
        );

        if (!transferBack.id) {
          logger.error("Stripe wallet transfer failed", { order_id: id });
          throw new Error("Refund transfer to SC_ACCOUNT failed.");
        }

        await pool.query(
          "UPDATE wallet SET current_amount = $1 WHERE id = $2",
          [newBalance.toFixed(2), wallet.id]
        );

        await pool.query(
          "INSERT INTO wallet_refund (wallet_id, refund_amount, date, user_id) VALUES ($1, $2, CURRENT_DATE, $3)",
          [wallet.id, refundAmount, user_id]
        );

        await pool.query(
          "UPDATE order_payment SET status = $1 WHERE order_id = $2",
          ["refunded", id]
        );

        logger.info("Wallet refund processed successfully", {
          wallet_id: wallet.id,
        });

        return res.status(200).json({
          success: true,
          message: "Order Declined & Wallet Refunded",
          refund: transferBack,
        });
      }
    }

    if (status === 1) {
      logger.info("Processing earnings for order", { order_id: id });

      const ratesResult = await pool.query("SELECT * FROM oh_rates");

      const price =
        parseFloat(order.subtotal) +
        (order.discount ? parseFloat(order.discount) : 0.0);

      if (isNaN(price)) {
        logger.error("Invalid subtotal for order", { order_id: id });
        return res.status(400).json({
          success: false,
          message: "Invalid order subtotal.",
        });
      }

      let charges;
      if (type === "order") {
        charges = price * parseFloat(ratesResult.rows[0].restaurant_commission);
      } else {
        charges = price * parseFloat(rates);
      }

      if (isNaN(charges)) {
        logger.error("Charges calculation failed", { order_id: id });
        return res.status(400).json({
          success: false,
          message: "Invalid charges calculation.",
        });
      }

      const chargesAmount = parseFloat(charges);
      const restaurantEarnings = price - chargesAmount;

      await pool.query(
        `INSERT INTO earnings 
         (amount, date, time, subtotal, delivery_fee, service_fee, order_id) 
         VALUES ($1, CURRENT_DATE, CURRENT_TIME, $2, $3, $4, $5)`,
        [chargesAmount, price, order.delivery_fee, order.service_fee, id]
      );

      await pool.query(
        `INSERT INTO restaurant_earning 
         (amount, restaurant_id, date, order_id, time) 
         VALUES ($1, $2, CURRENT_DATE, $3, CURRENT_TIME)`,
        [restaurantEarnings, order.restaurant_id, id]
      );

      logger.info("Earnings processed", {
        order_id: id,
        chargesAmount,
        restaurantEarnings,
      });

      return res.status(200).json({
        success: true,
        message:
          "Charges added to earning, and amount topped-up to Restaurant balance",
      });
    }
  } catch (error) {
    logger.error("amountCharger failed", {
      order_id: id,
      error: error.message,
      stack: error.stack,
    });

    await logErrorToS3("amountCharger", error, req, res);

    return res.status(500).json({
      success: false,
      message: "An error occurred while processing the request.",
      error: error.message,
    });
  }
};

module.exports = {
  getOrders,
  getOrder,
  newOrder,
  updateStatus,
  statusOrders,
  amountCharger,
};

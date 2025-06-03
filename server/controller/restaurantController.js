const pool = require("../database");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const cron = require("node-cron");
const moment = require("moment");
const countryMapping = require("../services/country");
const { transporter } = require("../services/mail");
const logger = require("../services/logger");

const addRestaurant = async (req, res) => {
  const { file, body } = req;
  const { id } = req.params;
  const {
    restaurant_name,
    contact_details,
    location,
    opening_time,
    closing_time,
    branches,
    state,
    city,
    zipcode,
    country,
    email,
    cuisine,
    home_chef,
  } = body;
  const cover = file.originalname;

  logger.info(
    `addRestaurant called by userId=${id}, restaurant_name=${restaurant_name}, email=${email}`
  );

  try {
    const existingRestaurant = await pool.query(
      "SELECT * FROM restaurants WHERE email = $1",
      [email]
    );
    logger.info(
      `Checked existing restaurant with email: ${email}, found: ${existingRestaurant.rowCount}`
    );

    const existingUserRestaurant = await pool.query(
      "SELECT * FROM restaurants WHERE res_user_id = $1",
      [id]
    );
    logger.info(
      `Checked existing restaurant for userId=${id}, found: ${existingUserRestaurant.rowCount}`
    );

    if (existingRestaurant.rows.length > 0) {
      logger.warn(`Restaurant name/email already exists: ${email}`);
      return res
        .status(409)
        .json({ success: false, message: "Restaurant Name already exists" });
    }
    if (existingUserRestaurant.rows.length > 0) {
      logger.warn(`User ${id} tried to register more than one restaurant`);
      return res.status(409).json({
        success: false,
        message: "User cannot register more than one restaurant",
      });
    }

    const formatTimeWithTimeZone = (date) => {
      return date.toTimeString().split(" ")[0];
    };
    const openingTime = formatTimeWithTimeZone(new Date(opening_time));
    const closingTime = formatTimeWithTimeZone(new Date(closing_time));

    logger.info(
      `Formatted opening and closing times: ${openingTime} - ${closingTime}`
    );

    let newRestaurant;
    if (process.env.HOME_CHEF) {
      newRestaurant = await pool.query(
        `INSERT INTO restaurants
           (restaurant_name, contact_details, location, opening_time, closing_time, branches, cover, state, city, zipcode, email, cuisine, res_user_id, status, home_chef, country)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, false, $14, $15) RETURNING *`,
        [
          restaurant_name,
          contact_details,
          location,
          openingTime,
          closingTime,
          branches,
          cover,
          state,
          city,
          zipcode,
          email,
          cuisine,
          id,
          home_chef,
          country,
        ]
      );
      logger.info(
        `Inserted new restaurant with HOME_CHEF enabled, id: ${newRestaurant.rows[0].id}`
      );

      await pool.query(
        "UPDATE restaurant_user SET restaurant_id = $1 WHERE id = $2",
        [newRestaurant.rows[0].id, id]
      );
      logger.info(`Updated restaurant_user ${id} with new restaurant id`);

      await pool.query(
        "INSERT INTO res_wallet (restaurant_id, update_date) VALUES ($1, CURRENT_DATE)",
        [newRestaurant.rows[0].id]
      );
      logger.info(
        `Created wallet entry for restaurant id: ${newRestaurant.rows[0].id}`
      );

      return res.status(201).json({
        success: true,
        message: "Your Restaurant has been registered.",
        restaurantId: newRestaurant.rows[0].id,
      });
    } else {
      newRestaurant = await pool.query(
        `INSERT INTO restaurants
           (restaurant_name, contact_details, location, opening_time, closing_time, branches, cover, state, city, zipcode, email, cuisine, res_user_id, status, country)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, false, $14) RETURNING *`,
        [
          restaurant_name,
          contact_details,
          location,
          openingTime,
          closingTime,
          branches,
          cover,
          state,
          city,
          zipcode,
          email,
          cuisine,
          id,
          country,
        ]
      );
      logger.info(
        `Inserted new restaurant without HOME_CHEF, id: ${newRestaurant.rows[0].id}`
      );

      await pool.query(
        "UPDATE restaurant_user SET restaurant_id = $1 WHERE id = $2",
        [newRestaurant.rows[0].id, id]
      );
      logger.info(`Updated restaurant_user ${id} with new restaurant id`);

      await pool.query(
        "INSERT INTO res_wallet (restaurant_id, update_date) VALUES ($1, CURRENT_DATE)",
        [newRestaurant.rows[0].id]
      );
      logger.info(
        `Created wallet entry for restaurant id: ${newRestaurant.rows[0].id}`
      );

      return res.status(201).json({
        success: true,
        message: "Your Restaurant has been registered.",
        restaurantId: newRestaurant.rows[0].id,
      });
    }
  } catch (error) {
    logger.error(
      `Error in addRestaurant for userId=${id}, restaurant_name=${restaurant_name}: ${
        error.stack || error
      }`
    );

    if (error.constraint === "restaurants_restaurant_name_key") {
      return res.status(409).json({
        success: false,
        message: "Restaurant Name already exists, please try a different one.",
      });
    } else if (error.constraint === "restaurants_contact_details_key") {
      return res.status(409).json({
        success: false,
        message: "Contact Number already exists, please try a different one.",
      });
    } else {
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  }
};

const restaurant = async (req, res) => {
  const { id } = req.params;

  logger.info(`restaurant API called with restaurant id=${id}`);

  try {
    const queryText = `WITH restaurant_data AS (
      SELECT * FROM restaurants WHERE id = $1
    ),
    orders_data AS (
      SELECT id, subtotal, total, discount, order_date, order_time, status FROM orders WHERE restaurant_id = $1
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
        rm.description, 
        rm.category, 
        rm.price, 
        rm.restaurant_id, 
        rm.image, 
        rm.available, 
        rm.main_category_id, 
        ic.category AS category_name 
      FROM restaurant_menu rm
      LEFT JOIN item_category ic ON rm.main_category_id = ic.id
      WHERE rm.restaurant_id = $1
    ),
    tab_section_data AS (
      SELECT * FROM item_category WHERE restaurant_id = $1
    ),
    wallet_data AS (
      SELECT
        ROUND(SUM(CASE WHEN status = 0 THEN amount ELSE 0 END), 2) AS amount_status_0,
        (SELECT balance FROM res_wallet WHERE restaurant_id = $1 LIMIT 1) AS amount_status_1,
        ROUND(SUM(CASE WHEN status = 2 THEN amount ELSE 0 END), 2) AS amount_status_2
      FROM restaurant_earning
      WHERE restaurant_id = $1
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
      (SELECT json_agg(orders_data) FROM orders_data) AS orders,
      (SELECT json_agg(menu_items_data) FROM menu_items_data) AS menu,
      (SELECT json_agg(tab_section_data) FROM tab_section_data) AS section,
      (SELECT row_to_json(wallet_data) FROM wallet_data) AS wallet,
      (SELECT json_agg(item_order_data) FROM item_order_data) AS item_orders,
      (SELECT json_agg(reviews_data) FROM reviews_data) AS reviews`;

    const { rows } = await pool.query(queryText, [id]);

    if (rows.length === 0) {
      logger.warn(`No restaurant found with id=${id}`);
      return res.status(404).json({
        success: false,
        message: "No Restaurants are found!",
      });
    }

    logger.info(`Fetched data for restaurant id=${id}`);

    const restaurant = rows[0].restaurant;
    const orders = rows[0].orders || [];
    const menu = rows[0].menu || [];
    const section = rows[0].section || [];
    const wallet = rows[0].wallet || {};
    const itemOrders = rows[0].item_orders || [];
    const reviews = rows[0].reviews || [];

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
          food_name: matchingItem ? matchingItem.food_name : null,
          quantity: item.quantity,
          image: matchingItem ? matchingItem.image : null,
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

    logger.info(
      `Processed ${ordersWithItems.length} orders with items for restaurant id=${id}`
    );

    const hasStatusZero = ordersWithItems.some((order) => order.status === 0);

    const walletData = [
      { balance: wallet.amount_status_0 || 0, status: 0 },
      { balance: wallet.amount_status_1 || 0, status: 1 },
      { balance: wallet.amount_status_2 || 0, status: 2 },
    ];

    logger.info(
      `Wallet summary for restaurant id=${id}: ${JSON.stringify(walletData)}`
    );

    const responseData = {
      success: true,
      restaurant,
      orders: ordersWithItems,
      hasStatusZero,
      menu,
      section,
      wallet: walletData,
      reviews,
    };

    logger.info(`Responding with data for restaurant id=${id}`);

    return res.status(200).json(responseData);
  } catch (error) {
    logger.error(`Error fetching restaurant id=${id}: ${error.stack || error}`);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const restaurantWeb = async (req, res) => {
  const { id } = req.params;
  logger.info(`restaurantWeb API called with restaurant id=${id}`);

  try {
    const queryText = `SELECT * FROM restaurants WHERE id = $1`;

    const restaurant = await pool.query(queryText, [id]);

    if (restaurant.rows.length === 0) {
      logger.warn(`No restaurant found with id=${id}`);
      return res.status(404).json({
        success: false,
        message: "No Restaurants are found!",
      });
    } else {
      logger.info(
        `Fetched restaurant data for id=${id}: ${JSON.stringify(
          restaurant.rows[0]
        )}`
      );

      return res
        .status(200)
        .json({ success: true, restaurant: restaurant.rows[0] });
    }
  } catch (error) {
    logger.error(`Error fetching restaurant id=${id}: ${error.stack || error}`);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const restaurantUser = async (req, res) => {
  const { id } = req.params;
  logger.info(`restaurantUser API called with id=${id}`);

  try {
    const response = await pool.query(
      "SELECT email, phone FROM restaurant_user WHERE id = $1",
      [id]
    );

    if (response.rowCount === 0) {
      logger.warn(`No Restaurant User found with id=${id}`);
      return res.status(404).json({
        success: false,
        message: "No Restaurant User Found",
      });
    } else {
      logger.info(
        `Fetched restaurant user data for id=${id}: ${JSON.stringify(
          response.rows[0]
        )}`
      );
      return res.status(200).json({
        success: true,
        restaurant_user: {
          email: response.rows[0].email,
          phone: response.rows[0].phone,
        },
      });
    }
  } catch (error) {
    logger.error(
      `Error fetching restaurant user id=${id}: ${error.stack || error}`
    );
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const addMenuItem = async (req, res) => {
  const { id } = req.params;
  const { file, body } = req;

  logger.info(
    `addMenuItem called for restaurant_id=${id} with body=${JSON.stringify(
      body
    )} and file=${file?.originalname}`
  );

  const {
    food_name,
    description,
    price,
    category,
    size,
    size_price,
    addOn,
    main_category_id,
  } = body;
  const image = file?.originalname;

  let updatedPrice = parseFloat(price).toFixed(2);
  if (!price || price === "null" || price === "") {
    updatedPrice = parseFloat(size_price[0]).toFixed(2) || 0.0;
  }

  try {
    if (main_category_id !== "null") {
      const newMenuItem = await pool.query(
        "INSERT INTO restaurant_menu (food_name, description, price, category, image, restaurant_id, main_category_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
        [
          food_name,
          description,
          updatedPrice,
          category,
          image,
          id,
          parseInt(main_category_id),
        ]
      );
      const foodId = newMenuItem.rows[0].id;

      logger.info(
        `Inserted new menu item with id=${foodId} for restaurant_id=${id}`
      );

      if (size && size.length > 0) {
        for (let index = 0; index < size.length; index++) {
          const s = size[index];
          const sp = parseFloat(size_price[index]) || 0;
          await pool.query(
            "INSERT INTO item_sizes (item_id, size, price) VALUES ($1, $2, $3)",
            [foodId, s, sp]
          );
          logger.info(
            `Inserted item_size for item_id=${foodId} size=${s} price=${sp}`
          );
        }
      }

      if (addOn && Object.keys(addOn).length > 0) {
        const { addon, price } = JSON.parse(req.body.addOn);
        await pool.query(
          "INSERT INTO item_extras (item_id, option, price) VALUES ($1, $2, $3)",
          [foodId, addon, parseFloat(price) || 0]
        );
        logger.info(
          `Inserted item_extra for item_id=${foodId} option=${addon} price=${price}`
        );
      }

      return res.status(201).json({
        success: true,
        message: "New menu item added",
        menuItem: newMenuItem.rows[0],
      });
    } else {
      const newMenuItem = await pool.query(
        "INSERT INTO restaurant_menu (food_name, description, price, category, image, restaurant_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [food_name, description, updatedPrice, category, image, id]
      );

      const foodId = newMenuItem.rows[0].id;

      logger.info(
        `Inserted new menu item with id=${foodId} for restaurant_id=${id}`
      );

      if (size && size.length > 0) {
        for (let index = 0; index < size.length; index++) {
          const s = size[index];
          const sp = parseFloat(size_price[index]) || 0;
          await pool.query(
            "INSERT INTO item_sizes (item_id, size, price) VALUES ($1, $2, $3)",
            [foodId, s, sp]
          );
          logger.info(
            `Inserted item_size for item_id=${foodId} size=${s} price=${sp}`
          );
        }
      }

      if (addOn && Object.keys(addOn).length > 0) {
        const { addon, price } = JSON.parse(req.body.addOn);
        await pool.query(
          "INSERT INTO item_extras (item_id, option, price) VALUES ($1, $2, $3)",
          [foodId, addon, parseFloat(price) || 0]
        );
        logger.info(
          `Inserted item_extra for item_id=${foodId} option=${addon} price=${price}`
        );
      }

      return res.status(201).json({
        success: true,
        message: "New menu item added",
        menuItem: newMenuItem.rows[0],
      });
    }
  } catch (error) {
    logger.error(
      `Error in addMenuItem for restaurant_id=${id}: ${error.stack || error}`
    );
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const menuItems = async (req, res) => {
  const { id } = req.params;
  logger.info(`menuItems called for restaurant_id=${id}`);

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
      logger.warn(`No menu found for restaurant_id=${id}`);
      return res.status(404).json({
        success: false,
        message: "No Menu found!",
      });
    } else {
      logger.info(
        `Found ${response.rowCount} menu items for restaurant_id=${id}`
      );
      return res.status(200).json({ success: true, data: response.rows });
    }
  } catch (error) {
    logger.error(
      `Error fetching menu items for restaurant_id=${id}: ${
        error.stack || error
      }`
    );
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const singleMenuItem = async (req, res) => {
  const { id } = req.params;
  logger.info(`Fetching single menu item with id=${id}`);

  try {
    const response = await pool.query(
      "SELECT * FROM restaurant_menu WHERE id=$1",
      [id]
    );

    if (response.rowCount === 0) {
      logger.warn(`Menu item not found for id=${id}`);
      return res.status(404).json({
        success: false,
        message: "Menu Item not Found..",
      });
    }

    const getSize = await pool.query(
      "SELECT size, price FROM item_sizes WHERE item_id = $1",
      [response.rows[0].id]
    );

    const getOption = await pool.query(
      "SELECT option, price FROM item_extras WHERE item_id = $1",
      [response.rows[0].id]
    );

    logger.info(`Menu item and related sizes/options fetched for id=${id}`);
    return res.status(200).json({
      success: true,
      item: response.rows[0],
      size: getSize.rows,
      option: getOption.rowCount > 0 ? getOption.rows[0] : {},
    });
  } catch (error) {
    logger.error(
      `Error fetching menu item with id=${id}: ${error.stack || error}`
    );
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching the menu item.",
    });
  }
};

const editMenu = async (req, res) => {
  const { id } = req.params;
  logger.info(`Request to update menu item with id=${id}`);

  try {
    const {
      food_name,
      description,
      price,
      category,
      size,
      addon,
      available,
      main_category_id,
    } = req.body;

    const newItemPrice =
      size.length > 0 ? Math.min(...size.map((item) => item.price)) : price;

    const menuResult = await pool.query(
      "UPDATE restaurant_menu SET food_name = $1, description = $2, price = $3, category = $4, available = $5, main_category_id = $6 WHERE id = $7 RETURNING *",
      [
        food_name,
        description,
        newItemPrice,
        category,
        available,
        main_category_id,
        id,
      ]
    );
    const updatedMenuItem = menuResult.rows[0];

    logger.info(`Updated menu item basic details for id=${id}`);

    if (size.length > 0) {
      await Promise.all(
        size.map(async (sizeItem) => {
          await pool.query(
            "UPDATE item_sizes SET price = $1 WHERE item_id = $2 AND size = $3",
            [sizeItem.price, id, sizeItem.size]
          );
          logger.info(
            `Updated size ${sizeItem.size} price for menu item id=${id}`
          );
        })
      );
    }

    const addonQuery = `
      INSERT INTO item_extras (item_id, option, price)
      VALUES ($1, $2, $3)
      ON CONFLICT (item_id)
      DO UPDATE SET option = EXCLUDED.option, price = EXCLUDED.price
    `;

    if (addon?.addon) {
      await pool.query(addonQuery, [id, addon.addon, addon.price]);
      logger.info(`Upserted addon option for menu item id=${id}`);
    }

    logger.info(`Menu item with id=${id} updated successfully`);
    return res.json({
      success: true,
      message: "Menu Updated Successfully!",
      response: updatedMenuItem,
    });
  } catch (error) {
    logger.error(
      `Error updating menu item with id=${id}: ${error.stack || error}`
    );
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateMenuImage = async (req, res) => {
  const { id } = req.params;
  const image = req.file;

  logger.info(`Request to update menu image for item id=${id}`);

  try {
    const changeImage = await pool.query(
      "UPDATE restaurant_menu SET image = $1 WHERE id = $2 RETURNING image",
      [image.originalname, id]
    );

    if (changeImage.rowCount === 0) {
      logger.warn(`Failed to update image: menu item with id=${id} not found`);
      return res.status(200).json({
        success: false,
        message: "Failed to update Image",
      });
    } else {
      logger.info(`Image updated successfully for menu item id=${id}`);
      return res.status(200).json({
        success: true,
        message: "Image updated successfully",
        newImage: changeImage.rows[0].image,
      });
    }
  } catch (error) {
    logger.error(
      `Error updating image for menu item id=${id}: ${error.stack || error}`
    );
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const deleteMenu = async (req, res) => {
  const itemId = req.params.id;

  logger.info(`Request received to delete menu item with id=${itemId}`);

  try {
    await pool.query("DELETE FROM item_sizes WHERE item_id = $1", [itemId]);
    await pool.query("DELETE FROM item_extras WHERE item_id = $1", [itemId]);
    const result = await pool.query(
      "DELETE FROM restaurant_menu WHERE id = $1",
      [itemId]
    );

    if (result.rowCount > 0) {
      logger.info(`Menu item with id=${itemId} deleted successfully.`);
      res.status(200).json({ message: "Menu deleted successfully!" });
    } else {
      logger.warn(`Menu item with id=${itemId} not found.`);
      res.status(404).json({ message: "Menu not found!" });
    }
  } catch (error) {
    logger.error(
      `Error deleting menu item with id=${itemId}: ${error.stack || error}`
    );
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const editRestaurant = async (req, res) => {
  const {
    restaurant_name,
    contact_details,
    email,
    location,
    branches,
    opening_time,
    closing_time,
    state,
    city,
    zipcode,
  } = req.body;
  const { id } = req.params;

  logger.info(`Received request to update restaurant with id=${id}`);

  try {
    const updateRestaurant = await pool.query(
      `UPDATE restaurants
       SET restaurant_name = $1,
           email = $2,
           contact_details = $3,
           location = $4,
           branches = $5,
           opening_time = $6,
           closing_time = $7,
           state = $8,
           city = $9,
           zipcode = $10,
           country = $11
       WHERE id = $12
       RETURNING *`,
      [
        restaurant_name,
        email,
        parseFloat(contact_details),
        location,
        branches,
        opening_time,
        closing_time,
        state,
        city,
        zipcode,
        "United States",
        id,
      ]
    );

    if (updateRestaurant.rowCount === 0) {
      logger.warn(`Restaurant with id=${id} not found for update`);
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    logger.info(`Restaurant with id=${id} updated successfully`);
    logger.debug("Saved Opening Time: ", updateRestaurant.rows[0].opening_time);
    logger.debug("Saved Closing Time: ", updateRestaurant.rows[0].closing_time);

    return res.status(200).json({
      success: true,
      message: "Restaurant updated successfully",
      restaurant: updateRestaurant.rows[0],
    });
  } catch (error) {
    logger.error(
      `Error updating restaurant with id=${id}: ${error.stack || error}`
    );
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const updateCover = async (req, res) => {
  const { id } = req.params;
  const cover = req.file;

  logger.info(`Request to update cover image for restaurant id=${id}`);

  try {
    const changeCover = await pool.query(
      "UPDATE restaurants SET cover = $1 WHERE id = $2 RETURNING cover",
      [cover.originalname, id]
    );

    if (changeCover.rowCount === 0) {
      logger.warn(
        `Failed to update cover image for restaurant id=${id} - restaurant not found`
      );
      return res.status(400).json({
        success: false,
        message: "Failed to update image",
      });
    } else {
      logger.info(
        `Cover image updated successfully for restaurant id=${id}: ${cover.originalname}`
      );
      return res.status(200).json({
        success: true,
        message: "Image updated successfully",
        image: cover.originalname,
      });
    }
  } catch (error) {
    logger.error(
      `Error updating cover image for restaurant id=${id}: ${
        error.stack || error
      }`
    );
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const dashboard = async (req, res) => {
  const { id } = req.params;
  try {
    const getMenus = await pool.query(
      "SELECT * FROM restaurant_menu WHERE restaurant_id = $1",
      [id]
    );
    const getEarning = await pool.query(
      "SELECT balance FROM res_wallet WHERE restaurant_id = $1",
      [id]
    );
    const getOrders = await pool.query(
      "SELECT * FROM orders WHERE restaurant_id = $1",
      [id]
    );
    return res.status(200).json({
      menus: getMenus.rowCount,
      earning: getEarning.rows[0].balance,
      orders: getOrders.rowCount,
    });
  } catch (error) {
    console.log(error);
  }
};

const earnings = async (req, res) => {
  const { id } = req.params;
  logger.info(`Fetching earnings and balance for restaurant id=${id}`);

  try {
    const result = await pool.query(
      `
      SELECT 
        re.date, 
        re.amount, 
        re.time, 
        rw.balance 
      FROM 
        restaurant_earning re
      LEFT JOIN 
        res_wallet rw 
      ON 
        re.restaurant_id = rw.restaurant_id
      WHERE 
        re.restaurant_id = $1
      `,
      [id]
    );

    logger.info(`Earnings rows fetched: ${result.rowCount}`);

    const earnings = result.rows.map((row) => ({
      date: row.date,
      amount: row.amount,
      time: row.time,
      balance: row.balance,
    }));

    const totalBalance =
      earnings.length > 0 ? parseFloat(earnings[0].balance) : 0;

    const response = {
      earnings,
      total: {
        balance: totalBalance,
      },
    };

    logger.info(
      `Earnings and balance fetched successfully for restaurant id=${id}`
    );

    return res.status(200).json(response);
  } catch (error) {
    logger.error(
      `Error retrieving earnings for restaurant id=${id}: ${
        error.stack || error
      }`
    );
    return res.status(500).json({ error: "Internal server error" });
  }
};

const toggleStatus = async (req, res) => {
  const { isOnline } = req.body;
  const { id } = req.params;

  logger.info(
    `Toggle status request for restaurant id=${id}, isOnline=${isOnline}`
  );

  try {
    const toggle = await pool.query(
      "UPDATE restaurants SET status = $1 WHERE id = $2 AND commission_type IS NOT NULL RETURNING *",
      [isOnline, id]
    );

    if (toggle.rowCount !== 0) {
      const statusMessage = `Restaurant has been ${
        isOnline === true ? "Opened" : "Closed"
      }`;
      logger.info(
        `Status toggled successfully for restaurant id=${id}. Status: ${statusMessage}`
      );

      return res.status(200).json({
        success: true,
        message: statusMessage,
        restaurant: toggle.rows[0],
      });
    } else {
      logger.warn(
        `Toggle failed for restaurant id=${id}. Commission type is not set.`
      );
      return res.status(404).json({
        success: false,
        message: "Rates are not fixed yet, Can't go Online",
      });
    }
  } catch (error) {
    logger.error(
      `Error toggling status for restaurant id=${id}: ${error.stack || error}`
    );
    return res.status(500).json({
      success: false,
      message: "An error occurred while toggling the status.",
    });
  }
};

const checkStatus = async (req, res) => {
  const { id } = req.params;
  logger.info(`Checking status for restaurant id=${id}`);

  try {
    const statusQuery = await pool.query(
      "SELECT status FROM restaurants WHERE id = $1",
      [id]
    );

    if (statusQuery.rowCount !== 0) {
      const status = statusQuery.rows[0].status;
      logger.info(`Restaurant id=${id} status=${status}`);

      return res.status(200).json({
        success: true,
        status: status,
      });
    } else {
      logger.warn(`Restaurant not found with id=${id}`);
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }
  } catch (error) {
    logger.error(
      `Error checking status for restaurant id=${id}: ${error.stack || error}`
    );
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const resWallet = async (req, res) => {
  const { id } = req.params;
  logger.info(`Fetching wallet balances for restaurant id=${id}`);
  try {
    const earnings = await pool.query(
      `SELECT amount, status 
       FROM restaurant_earning 
       WHERE restaurant_id = $1 AND status IN (0, 2)`,
      [id]
    );

    const wallet = await pool.query(
      `SELECT balance 
       FROM res_wallet 
       WHERE restaurant_id = $1`,
      [id]
    );

    if (wallet.rowCount === 0) {
      logger.warn(`Wallet not found for restaurant id=${id}`);
      return res.status(404).json({
        success: false,
        message: "Wallet not found",
      });
    }

    let balanceStatus0 = 0;
    let balanceStatus2 = 0;

    earnings.rows.forEach((row) => {
      const amount = parseFloat(row.amount);
      if (row.status === 0) {
        balanceStatus0 += amount;
      } else if (row.status === 2) {
        balanceStatus2 += amount;
      }
    });

    const availableBalance = parseFloat(wallet.rows[0].balance);

    const responseData = {
      success: true,
      data: [
        { balance: balanceStatus0.toFixed(2), status: 0 },
        { balance: availableBalance.toFixed(2), status: 1 },
        { balance: balanceStatus2.toFixed(2), status: 2 },
      ],
    };

    logger.info(`Wallet balances fetched successfully for restaurant id=${id}`);
    return res.status(200).json(responseData);
  } catch (error) {
    logger.error(
      `Error fetching wallet for restaurant id=${id}: ${error.stack || error}`
    );
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const validateStripe = async (req, res) => {
  const { accountId } = req.body;
  const { id } = req.params;

  logger.info(`Validating Stripe account=${accountId} for restaurant id=${id}`);

  try {
    if (!accountId) {
      logger.warn(
        `Missing Stripe account ID in request for restaurant id=${id}`
      );
      return res.status(400).json({
        valid: false,
        error: "Please provide a valid Stripe account ID.",
      });
    }

    const account = await stripe.accounts.retrieve(accountId);

    if (account) {
      await pool.query("BEGIN");

      const result = await pool.query(
        "SELECT 1 FROM account_ids WHERE restaurant_id = $1",
        [id]
      );

      if (result.rowCount > 0) {
        await pool.query(
          "UPDATE account_ids SET account_id = $1 WHERE restaurant_id = $2",
          [accountId, id]
        );
        logger.info(`Updated Stripe account for restaurant id=${id}`);
      } else {
        await pool.query(
          "INSERT INTO account_ids (account_id, restaurant_id) VALUES ($1, $2)",
          [accountId, id]
        );
        logger.info(`Inserted new Stripe account for restaurant id=${id}`);
      }

      await pool.query("COMMIT");

      return res.status(200).json({ valid: true, account });
    } else {
      logger.warn(`Stripe account not found: ${accountId}`);
      return res
        .status(404)
        .json({ valid: false, error: "Stripe account not found." });
    }
  } catch (error) {
    await pool.query("ROLLBACK");
    logger.error(
      `Error validating Stripe account for restaurant id=${id}: ${
        error.stack || error
      }`
    );
    return res.status(400).json({
      valid: false,
      error:
        "Error validating Stripe account. Please provide a valid Stripe ID.",
    });
  }
};

const addCategory = async (req, res) => {
  const { category } = req.body;
  const { id } = req.params;

  logger.info(`Adding new category "${category}" for restaurant id=${id}`);

  try {
    const newCategory = await pool.query(
      "INSERT INTO item_category (category, restaurant_id) VALUES ($1, $2) RETURNING *",
      [category, id]
    );

    if (newCategory.rowCount === 0) {
      logger.warn(`Failed to insert category for restaurant id=${id}`);
      return res.status(400).json({
        success: false,
        message: "Failed to add new Tab Section",
      });
    } else {
      logger.info(`Category "${category}" added for restaurant id=${id}`);
      return res.status(200).json({
        success: true,
        message: "New Tab Section Added",
        category: newCategory.rows[0],
      });
    }
  } catch (error) {
    logger.error(
      `Error adding category for restaurant id=${id}: ${error.stack || error}`
    );
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { category } = req.body;

  logger.info(`Updating category id=${id} with new value="${category}"`);

  try {
    const changeCategory = await pool.query(
      "UPDATE item_category SET category = $1 WHERE id = $2 RETURNING *",
      [category, id]
    );

    if (changeCategory.rowCount === 0) {
      logger.warn(`Failed to update category id=${id}`);
      return res.status(400).json({
        success: false,
        message: "Failed to update new Tab Section",
      });
    } else {
      logger.info(`Category updated successfully for id=${id}`);
      return res.status(200).json({
        success: true,
        message: "Tab Section Updated",
        category: changeCategory.rows[0].category,
      });
    }
  } catch (error) {
    logger.error(`Error updating category id=${id}: ${error.stack || error}`);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const deleteCategory = async (req, res) => {
  const { id } = req.params;

  logger.info(`Deleting category id=${id}`);

  try {
    await pool.query(
      "UPDATE restaurant_menu SET main_category_id = NULL WHERE main_category_id = $1",
      [id]
    );

    const deleteSection = await pool.query(
      "DELETE FROM item_category WHERE id = $1 RETURNING *",
      [id]
    );

    if (deleteSection.rowCount === 0) {
      logger.warn(`Failed to delete category id=${id}`);
      return res.status(400).json({
        success: false,
        message: "Failed to delete Tab Section",
      });
    } else {
      logger.info(`Category deleted successfully for id=${id}`);
      return res.status(200).json({
        success: true,
        message: "Tab Section Deleted",
      });
    }
  } catch (error) {
    logger.error(`Error deleting category id=${id}: ${error.stack || error}`);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const resWithdraw = async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;

  logger.info(
    `Processing withdrawal request for restaurant_id=${id}, amount=${amount}`
  );

  try {
    const withdrawalRequest = await pool.query(
      "INSERT INTO restaurant_withdrawal (restaurant_id, withdrawal_amount, withdrawal_date) VALUES ($1, $2, NOW()) RETURNING id",
      [id, amount]
    );

    if (withdrawalRequest.rowCount === 0) {
      logger.warn(
        `Failed to insert withdrawal request for restaurant_id=${id}`
      );
      return res.status(400).json({
        success: false,
        message: "Failed to process withdrawal request",
      });
    } else {
      const wallet = await pool.query(
        "UPDATE res_wallet SET balance = balance - $1, update_date = CURRENT_DATE WHERE restaurant_id = $2 RETURNING balance",
        [amount, id]
      );

      logger.info(
        `Withdrawal processed for restaurant_id=${id}, new balance=${wallet.rows[0].balance}`
      );
      return res.status(200).json({
        success: true,
        message: "Withdrawal request processed successfully",
        balance: wallet.rows[0].balance,
      });
    }
  } catch (error) {
    logger.error(
      `Error processing withdrawal for restaurant_id=${id}: ${
        error.stack || error
      }`
    );
    await logErrorToS3("resWithdraw", error, req, res);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const fetchPayment = async (req, res) => {
  const { res_id } = req.params;
  logger.info(`Fetching payment history for restaurant_id=${res_id}`);

  try {
    const result = await pool.query(
      `SELECT id, withdrawal_amount, withdrawal_date, status, payout_id
       FROM restaurant_withdrawal 
       WHERE restaurant_id = $1 
       ORDER BY withdrawal_date DESC`,
      [res_id]
    );

    logger.info(
      `Fetched ${result.rowCount} payment records for restaurant_id=${res_id}`
    );
    res.json({ data: result.rows });
  } catch (error) {
    logger.error(
      `Error fetching payment history for restaurant_id=${res_id}: ${
        error.stack || error
      }`
    );
    await logErrorToS3("fetchPayment", error, req, res);
    res.status(500).json({ error: "Failed to fetch payment history" });
  }
};

const addComment = async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;

  logger.info(`Attempting to add comment to review id=${id}`);

  try {
    const newComment = await pool.query(
      "UPDATE reviews SET comment = $1 WHERE id = $2 RETURNING *",
      [comment, id]
    );

    if (newComment.rowCount === 0) {
      logger.warn(`No review found with id=${id} to add comment`);
      return res.status(400).json({
        success: false,
        message: "Failed to add comment",
      });
    } else {
      logger.info(`Comment added successfully to review id=${id}`);
      return res.status(200).json({
        success: true,
        message: "Comment added Successfully",
        review: newComment.rows[0],
      });
    }
  } catch (error) {
    logger.error(
      `Error adding comment to review id=${id}: ${error.stack || error}`
    );
    await logErrorToS3("addComment", error, req, res);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const checkStripeAccount = async (req, res) => {
  const { id } = req.params;

  logger.info(`Checking Stripe account for restaurant_id=${id}`);

  try {
    const accountCheck = await pool.query(
      "SELECT account_id FROM account_ids WHERE restaurant_id = $1",
      [id]
    );

    if (accountCheck.rowCount === 0) {
      logger.warn(`No Stripe account found in DB for restaurant_id=${id}`);
      return res.status(404).json({
        success: false,
        message: "No connected account found.",
      });
    }

    const stripeAccountId = accountCheck.rows[0].account_id;

    logger.info(
      `Retrieving Stripe account details for account_id=${stripeAccountId.slice(
        -6
      )}`
    );

    const account = await stripe.accounts.retrieve(stripeAccountId);

    if (!account) {
      logger.warn(
        `Stripe account not found for account_id=${stripeAccountId.slice(-6)}`
      );
      return res.status(404).json({
        success: false,
        message: "No connected account found.",
      });
    }

    logger.info(`Stripe account details retrieved for restaurant_id=${id}`);
    return res.status(200).json({
      success: true,
      message: "Connected account details retrieved successfully.",
      data: {
        accountId: account.id,
        email: account.email || "",
        taxId: account.company?.tax_id || "",
        accountHolderName:
          account.external_accounts?.data[0]?.account_holder_name || "",
        business: account.business_profile?.name || "",
        routingNumber: account.external_accounts?.data[0]?.routing_number || "",
        accountNumber: account.external_accounts?.data[0]?.last4 || "",
        phone: account.company?.phone || "",
        address: account.company?.address?.line1 || "",
        city: account.company?.address?.city || "",
        state: account.company?.address?.state || "",
        zipCode: account.company?.address?.postal_code || "",
        supportPhone: account.business_profile?.support_phone || "",
        privacyPolicy: account.business_profile?.url || "",
        payoutStatementDescriptor:
          account.settings?.payouts?.statement_descriptor || "",
        industry: "Food Industry",
        website: account.business_profile?.url || "",
      },
    });
  } catch (error) {
    logger.error(
      `Error checking Stripe account for restaurant_id=${id}: ${
        error.stack || error
      }`
    );
    await logErrorToS3("checkStripeAccount", error, req, res);
    return res.status(500).json({ error: error.message });
  }
};

const createStripeAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, account_number, routing_number, ssn } =
      req.body;

    logger.info("Received request to create Stripe account", {
      restaurantId: id,
    });

    const data = await pool.query(
      `SELECT 
        r.email, 
        r.location, 
        r.state, 
        r.city, 
        r.zipcode, 
        r.country, 
        ru.phone, 
        ru.date_of_birth
      FROM restaurants r
      LEFT JOIN restaurant_user ru ON r.id = ru.restaurant_id
      WHERE r.id = $1`,
      [id]
    );

    const restaurant = data.rows[0];

    if (!restaurant) {
      logger.warn("Restaurant not found", { restaurantId: id });
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }

    const countryCode = countryMapping[restaurant.country];
    if (!countryCode) {
      logger.error("Invalid country", { country: restaurant.country });
      return res.status(400).json({
        error: `Invalid country: ${restaurant.country}. Please use a valid country name.`,
      });
    }

    const dob = new Date(restaurant.date_of_birth);
    const formattedDob = {
      day: dob.getUTCDate(),
      month: dob.getUTCMonth() + 1,
      year: dob.getUTCFullYear(),
    };

    logger.info("Creating Stripe account", { restaurant, countryCode });

    const account = await stripe.accounts.create({
      type: "custom",
      country: countryCode,
      email: restaurant.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: "individual",
      individual: {
        first_name,
        last_name,
        email: restaurant.email,
        dob: formattedDob,
        phone: `${restaurant.phone}`,
        address: {
          line1: restaurant.location,
          city: restaurant.city,
          state: restaurant.state,
          postal_code: restaurant.zipcode,
          country: countryCode,
        },
        id_number: ssn,
      },
      business_profile: {
        product_description: "P2P Money Transfers",
        mcc: "7299",
        support_email: restaurant.email,
      },
      external_account: {
        object: "bank_account",
        country: countryCode,
        currency: "usd",
        account_holder_name: `${first_name} ${last_name}`,
        account_number,
        routing_number,
      },
    });

    logger.info("Stripe account created", { accountId: account.id });

    await stripe.accounts.update(account.id, {
      tos_acceptance: {
        date: Math.floor(Date.now() / 1000),
        ip:
          req.headers["x-forwarded-for"] ||
          req.socket.remoteAddress ||
          "127.0.0.1",
      },
    });

    const storeId = await pool.query(
      "INSERT INTO account_ids (restaurant_id, account_id, created_date) VALUES ($1, $2, CURRENT_DATE) RETURNING id",
      [id, account.id]
    );

    if (storeId.rowCount === 0) {
      logger.error("Failed to store account", { accountId: account.id });
      return res.status(400).json({
        success: false,
        message: "Failed to store account",
      });
    } else {
      logger.info("Account stored successfully", { accountId: account.id });
      return res.json({
        success: true,
        message: "Account successfully added for withdrawals",
      });
    }
  } catch (error) {
    logger.error("Error creating Stripe account", {
      error: error.message,
      stack: error.stack,
    });
    await logErrorToS3("createStripeAccount", error, req, res);
    return res.status(500).json({ error: error.message });
  }
};

const editStripeAccount = async (req, res) => {
  const { accountId } = req.params;
  const { accountHolderName, routingNumber, accountNumber } = req.body;

  logger.info("Received request to edit Stripe account", { accountId });

  try {
    const externalAccounts = await stripe.accounts.listExternalAccounts(
      accountId,
      {
        object: "bank_account",
        limit: 1,
      }
    );

    if (!externalAccounts.data.length) {
      logger.warn("No bank account found for this Stripe account", {
        accountId,
      });
      return res
        .status(404)
        .json({ message: "No bank account found for this account." });
    }

    const externalAccountId = externalAccounts.data[0].id;

    const updatedBankAccount = await stripe.accounts.updateExternalAccount(
      accountId,
      externalAccountId,
      {
        account_holder_name: accountHolderName,
        routing_number: routingNumber,
        account_number: accountNumber,
      }
    );

    logger.info("Bank account updated", { accountId, externalAccountId });

    res.status(200).json({
      message: "Bank details updated successfully",
      updatedBankAccount,
    });
  } catch (error) {
    logger.error("Error updating bank details", {
      error: error.message,
      stack: error.stack,
    });
    await logErrorToS3("editStripeAccount", error, req, res);
    res.status(500).json({ error: error.message });
  }
};

const sendReport = async (req, res) => {
  const { email, issue, description } = req.body;

  logger.info("Received bug report", { email, issue });

  if (!issue || !description) {
    logger.warn("Missing issue or description", { email });
    return res.status(400).json({
      success: false,
      message: "Issue and description are required",
    });
  }

  try {
    const mailOptions = {
      to: process.env.EMAIL,
      subject: `BUG REPORT: ${issue}`,
      html: `
        <div style="background-color: #f4f4f4; padding: 40px; font-family: 'Poppins', sans-serif; color: #333;">
              <table style="width: 100%; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                <thead>
                  <tr>
                    <th style="background: #F8971D; padding: 20px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
                      <h1 style="margin: 0; font-size: 24px; font-family: 'Poppins', sans-serif;">🐞 Bug Report</h1>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="padding: 20px;">
                      <h2 style="color: #F8971D; font-size: 20px; font-family: 'Poppins', sans-serif;">Issue: ${issue}</h2>
                      <p style="font-size: 16px; margin-top: 10px; font-weight: 600; font-family: 'Lato', sans-serif;">Description:</p>
                      <p style="font-size: 16px; margin: 0; color: #666; font-family: 'Lato', sans-serif;">${description}</p>
                      <p style="font-size: 14px; margin-top: 10px; color: #777; font-family: 'Roboto', sans-serif;">Reported by: <strong>${email}</strong></p>
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td style="background: #F8971D; padding: 15px; text-align: center; color: white; border-radius: 0 0 10px 10px;">
                      <p style="margin: 0; font-size: 14px; font-family: 'Poppins', sans-serif;">&copy; ${new Date().getFullYear()} Only Halal. All rights reserved.</p>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        logger.error("Error sending report email", { error: error.message });
        return res.status(500).json({
          success: false,
          message: "Failed to send report email",
          error: error.message,
        });
      } else {
        logger.info("Report email sent", { response: info.response });
        return res.status(200).json({
          success: true,
          message: "Report email sent successfully",
        });
      }
    });
  } catch (error) {
    logger.error("Unexpected error while sending report", {
      error: error.message,
      stack: error.stack,
    });
    await logErrorToS3("sendReport", error, req, res);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while sending the report email",
      error: error.message,
    });
  }
};

const sendNotification = async (req, res) => {
  const { email } = req.body;

  logger.info("Send notification request received", {
    hasEmail: !!email,
  });

  if (!email) {
    logger.warn("Missing email in sendNotification request");
    return res.status(400).json({
      success: false,
      message: "Restaurant email is required",
    });
  }

  try {
    logger.debug("Preparing email notification", { email: email });

    const mailOptions = {
      to: email,
      from: process.env.EMAIL,
      subject: `You have a new chat message`,
      html: `
            <div style="background-color: #f4f4f4; padding: 40px; font-family: 'Poppins', sans-serif; color: #333;">
              <table style="width: 100%; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                <thead>
                  <tr>
                    <th style="background: #F8971D; padding: 20px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
                      <h1 style="margin: 0; font-size: 24px;">📩 New Message Alert</h1>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="padding: 30px; text-align: center;">
                      <p style="font-size: 16px; margin: 0; color: #666;">
                        You have received a new chat message from a customer.
                      </p>
                      <a href="${
                        "http://localhost:3001/chat" ||
                        "http://localhost:3000/chat" ||
                        "https://restaurant.only-halal.com/chat"
                      }" 
                         style="display: inline-block; margin-top: 30px; padding: 12px 24px; 
                         background-color: #F8971D; color: white; text-decoration: none; 
                         border-radius: 5px; font-weight: bold;">
                        View Chat Messages
                      </a>
                      <p style="font-size: 14px; margin-top: 30px; color: #999;">
                        This is an automated notification. Please do not reply to this email.
                      </p>
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td style="background: #F8971D; padding: 15px; text-align: center; color: white; border-radius: 0 0 10px 10px;">
                      <p style="margin: 0; font-size: 14px; font-family: 'Poppins', sans-serif;">&copy; ${new Date().getFullYear()} Only Halal. All rights reserved.</p>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        logger.error("Failed to send report email", {
          message: error.message,
        });
        return res.status(500).json({
          success: false,
          message: "Failed to send report email",
          error: error.message,
        });
      } else {
        logger.info("Report email sent successfully", {
          response: info.response,
          to: email,
        });
        return res.status(200).json({
          success: true,
          message: "Report email sent successfully",
        });
      }
    });
  } catch (error) {
    logger.error("Unexpected error in sendNotification", {
      message: error.message,
    });
    await logErrorToS3("sendNotification", error, req, res);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

cron.schedule("0 0 * * *", async () => {
  logger.info("[Cron] Starting Stripe withdrawal process", {
    timestamp: new Date().toISOString(),
  });

  try {
    const balance = await stripe.balance.retrieve();
    let availableBalance = balance.available[0]?.amount / 100 || 0;

    logger.info("[Cron] Stripe available balance", {
      availableBalance,
      timestamp: new Date().toISOString(),
    });

    if (availableBalance <= 0) {
      logger.info(
        "[Cron] No available balance in Stripe to process withdrawals",
        {
          timestamp: new Date().toISOString(),
        }
      );
      return;
    }

    const { rows: feesRows } = await pool.query(`
      SELECT COALESCE(SUM(service_fee + tax), 0) AS total_deduction
      FROM orders
      WHERE (status = 5 OR status = 6)
      AND collected = false
      AND order_date <= NOW() - INTERVAL '3 days';
    `);

    const totalDeduction = parseFloat(feesRows[0].total_deduction) || 0;

    logger.info("[Cron] Total service fee and tax deduction", {
      totalDeduction,
      timestamp: new Date().toISOString(),
    });

    if (totalDeduction > availableBalance) {
      logger.warn("[Cron] Not enough balance to cover fees and taxes", {
        availableBalance,
        totalDeduction,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    availableBalance -= totalDeduction;

    if (availableBalance > 0) {
      try {
        const transfer = await stripe.transfers.create({
          amount: Math.round(availableBalance * 100),
          currency: "usd",
          destination: process.env.RESTAURANT_ACCOUNT,
        });

        logger.info("[Cron] Transferred balance to RESTAURANT_ACCOUNT", {
          amount: availableBalance,
          transferId: transfer.id,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        logger.error("[Cron] Error transferring to RESTAURANT_ACCOUNT", {
          message: error.message,
          timestamp: new Date().toISOString(),
        });
        return;
      }
    }

    const pendingWithdrawals = await pool.query(`
      SELECT id, restaurant_id, withdrawal_amount, withdrawal_date
      FROM restaurant_withdrawal
      WHERE status = 0
      ORDER BY withdrawal_date ASC;
    `);

    if (pendingWithdrawals.rows.length === 0) {
      logger.info("[Cron] No pending withdrawals to process", {
        timestamp: new Date().toISOString(),
      });
      return;
    }

    for (const withdrawal of pendingWithdrawals.rows) {
      const { id, restaurant_id, withdrawal_amount, withdrawal_date } =
        withdrawal;
      const withdrawalAge = moment().diff(moment(withdrawal_date), "days");

      if (availableBalance >= withdrawal_amount) {
        try {
          const restaurantStripeAccount = await pool.query(
            "SELECT account_id FROM account_ids WHERE restaurant_id = $1",
            [restaurant_id]
          );

          const account_id = restaurantStripeAccount.rows[0]?.account_id;
          if (!account_id) {
            logger.warn("[Cron] No Stripe account linked for restaurant", {
              restaurant_id,
              timestamp: new Date().toISOString(),
            });
            continue;
          }

          const transfer = await stripe.transfers.create(
            {
              amount: withdrawal_amount * 100,
              currency: "usd",
              destination: process.env.PLATFORM_ACCOUNT,
            },
            {
              stripeAccount: process.env.RESTAURANT_ACCOUNT,
            }
          );

          const transferToRestaurant = await stripe.transfers.create({
            amount: withdrawal_amount * 100,
            currency: "usd",
            destination: account_id,
          });

          await pool.query(
            "UPDATE restaurant_withdrawal SET status = 1, payout_id = $1 WHERE id = $2",
            [transferToRestaurant.id, id]
          );

          availableBalance -= withdrawal_amount;

          logger.info("[Cron] Processed withdrawal", {
            restaurant_id,
            withdrawal_amount,
            transferId: transferToRestaurant.id,
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          logger.error("[Cron] Failed to process withdrawal", {
            restaurant_id,
            message: error.message,
            timestamp: new Date().toISOString(),
          });
        }
      } else if (withdrawalAge >= 3) {
        logger.info(
          "[Cron] Reserved remaining balance for delayed withdrawal",
          {
            restaurant_id,
            availableBalance,
            timestamp: new Date().toISOString(),
          }
        );
        break;
      }
    }

    await pool.query(`
      UPDATE orders
      SET collected = true
      WHERE (status = 5 OR status = 6)
      AND collected = false
      AND order_date <= NOW() - INTERVAL '3 days';
    `);

    logger.info("[Cron] Marked eligible orders as collected", {
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("[Cron] General error in withdrawal job", {
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

cron.schedule("0 0 * * *", async () => {
  logger.info(`[Cron] Daily wallet update job started`, {
    timestamp: new Date().toISOString(),
  });

  try {
    const restaurantIdsResult = await pool.query("SELECT id FROM restaurants");
    const restaurantIds = restaurantIdsResult.rows.map((row) => row.id);

    if (restaurantIds.length === 0) {
      logger.info(`[Cron] No restaurants found to process`, {
        timestamp: new Date().toISOString(),
      });
      return;
    }

    restaurantIds.forEach(async (restaurantId) => {
      try {
        const oneDayAgo = moment().subtract(1, "day").toISOString();

        const changeStatus = await pool.query(
          "UPDATE restaurant_earning SET status = 1 WHERE status = 0 AND date < $1 AND restaurant_id = $2 RETURNING amount",
          [oneDayAgo, restaurantId]
        );

        const totalUpdatedAmount = changeStatus.rows.reduce((acc, row) => {
          return acc + parseFloat(row.amount);
        }, 0);

        if (totalUpdatedAmount > 0) {
          const updateWallet = await pool.query(
            "UPDATE res_wallet SET balance = balance + $1 WHERE restaurant_id = $2 RETURNING balance",
            [totalUpdatedAmount, restaurantId]
          );

          logger.info(`[Cron] Wallet updated for restaurant`, {
            restaurantId,
            addedAmount: totalUpdatedAmount.toFixed(2),
            newBalance: updateWallet.rows[0]?.balance,
            timestamp: new Date().toISOString(),
          });
        } else {
          logger.info(`[Cron] No earnings to update for restaurant`, {
            restaurantId,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {
        logger.error(`[Cron] Error processing restaurant earnings`, {
          restaurantId,
          message: error.message,
          timestamp: new Date().toISOString(),
        });
      }
    });
  } catch (error) {
    logger.error(`[Cron] Error fetching restaurants for wallet update`, {
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// async function createTestCharge() {
//   try {
//     const charge = await stripe.charges.create({
//       amount: 50000, // $50.00 USD
//       currency: "usd",
//       source: "tok_bypassPending", // This test token bypasses pending state
//       description: "Simulated instant charge",
//     });
//     console.log("Charge successful:", charge);
//   } catch (error) {
//     console.error("Error creating charge:", error);
//   }
// }

// createTestCharge();

// async function balanceCheck() {
//   const balance = await stripe.balance.retrieve();
//   console.log("Stripe balance:", balance);
// }
// balanceCheck();

module.exports = {
  addRestaurant,
  restaurant,
  restaurantWeb,
  restaurantUser,
  addMenuItem,
  menuItems,
  singleMenuItem,
  editMenu,
  updateMenuImage,
  deleteMenu,
  editRestaurant,
  updateCover,
  dashboard,
  earnings,
  toggleStatus,
  checkStatus,
  resWallet,
  validateStripe,
  addCategory,
  updateCategory,
  deleteCategory,
  resWithdraw,
  fetchPayment,
  addComment,
  checkStripeAccount,
  createStripeAccount,
  editStripeAccount,
  sendNotification,
  sendReport,
};

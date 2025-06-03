require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const socketIo = require("socket.io");
const pool = require("./database");
const http = require("http");

const restaurantRoute = require("./routes/restaurantRoute");
const orderRoute = require("./routes/orderRoute");
const authRoute = require("./routes/authRoute");
const userRoute = require("./routes/userRoute");

const app = express();
const port = process.env.PORT;
const server = http.createServer(app);

app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

app.use("/", restaurantRoute);
app.use("/", orderRoute);
app.use("/", authRoute);
app.use("/", userRoute);

app.get("/test", (req, res) => {
  res.send("Nginx is working and this is the /test endpoint");
});

app.get("/fetchRates", async (req, res) => {
  try {
    const rates = await pool.query("SELECT * FROM oh_rates");
    if (rates.rowCount === 0) {
      return res.status(400).json({
        success: false,
        message: "No rates found!",
      });
    } else {
      return res.status(200).json({
        success: true,
        rates: rates.rows[0],
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve Rates!",
    });
  }
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

const io = new socketIo.Server(server, {
  path: "/socket.io",
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("newOrder", (data) => {
    console.log("Received new order:", data);
    io.emit("orderReceive", data);
  });

  socket.on("adminNoti", (data) => {
    console.log(data);
    io.emit("showNoti", data);
  });

  socket.on("orderUpdate", (data) => {
    console.log(data);

    io.emit("orderNoti", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// cron.schedule("* * * * *", async () => {
//   try {
//     const result = await pool.query(
//       `UPDATE restaurants
//        SET status = FALSE
//        WHERE (
//          (closing_time > opening_time AND CURRENT_TIME >= closing_time)
//          OR (closing_time < opening_time AND (CURRENT_TIME >= closing_time AND CURRENT_TIME < opening_time))
//        ) AND status = TRUE
//        RETURNING id, status;`
//     );

//     if (result.rows.length > 0) {
//       const resIds = result.rows.map((row) => row.id);
//       const status = result.rows[0]?.status;

//       console.log(
//         `Closed ${result.rowCount} restaurants based on their closing times.`
//       );

//       io.emit("updateRestaurantStatus", { status, resIds });
//     } else {
//       console.log("No restaurants to update at this time.");
//     }
//   } catch (error) {
//     console.error("Error updating restaurant statuses:", error);
//   }
// });

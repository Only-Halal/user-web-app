const express = require("express");
const router = express.Router();
const multer = require("multer");
const authenticateToken = require("../authorization");
const { S3Client } = require("@aws-sdk/client-s3");
const multerS3 = require("multer-s3");

const {
  addRestaurant,
  restaurant,
  restaurantUser,
  restaurantWeb,
  addMenuItem,
  menuItems,
  singleMenuItem,
  editMenu,
  updateMenuImage,
  deleteMenu,
  editRestaurant,
  dashboard,
  updateCover,
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
  sendReport,
  sendNotification,
} = require("../controller/restaurantController");

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads");
//   },
//   filename: function (req, file, cb) {
//     cb(
//       null,
//       `${file.fieldname}-` +
//         Date.now() +
//         "." +
//         file.originalname.split(".").pop()
//     );
//   },
// });

// const upload = multer({ storage: storage });

const s3 = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "onlyhalalbucket",
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, `only_halal/${file.originalname}`);
    },
  }),
});

router.use("/uploads", express.static("uploads"));

router.post(
  "/addRestaurant/:id",
  authenticateToken,
  upload.single("cover"),
  addRestaurant
);
router.get("/restaurant/:id", authenticateToken, restaurant);
router.get("/restaurantUser/:id", authenticateToken, restaurantUser);
router.get("/restaurantWeb/:id", restaurantWeb);
router.post(
  "/addMenuItem/:id",
  authenticateToken,
  upload.single("image"),
  addMenuItem
);
router.get("/menuItems/:id", authenticateToken, menuItems);
router.get("/getItem/:id", authenticateToken, singleMenuItem);
router.put("/editItem/:id", authenticateToken, editMenu);
router.post(
  "/updateMenuImage/:id",
  authenticateToken,
  upload.single("image"),
  updateMenuImage
);
router.delete("/deleteMenu/:id", authenticateToken, deleteMenu);
router.put("/editRestaurant/:id", authenticateToken, editRestaurant);
router.put(
  "/updateCover/:id",
  authenticateToken,
  upload.single("cover"),
  updateCover
);
router.get("/dashboard/:id", authenticateToken, dashboard);
router.get("/earnings/:id", authenticateToken, earnings);
router.get("/checkStatus/:id", authenticateToken, checkStatus);
router.put("/toggleStatus/:id", authenticateToken, toggleStatus);
router.get("/resWallet/:id", authenticateToken, resWallet);
router.post("/validateStripe/:id", authenticateToken, validateStripe);
router.post("/addCategory/:id", authenticateToken, addCategory);
router.put("/updateCategory/:id", authenticateToken, updateCategory);
router.delete("/deleteCategory/:id", authenticateToken, deleteCategory);
router.post("/resWithdraw/:id", authenticateToken, resWithdraw);
router.get("/fetchPayment/:res_id", authenticateToken, fetchPayment);
router.put("/comment/:id", authenticateToken, addComment);
router.get("/checkStripeAccount/:id", authenticateToken, checkStripeAccount);
router.post("/createStripeAccount/:id", authenticateToken, createStripeAccount);
router.put("/editStripeAccount/:id", authenticateToken, editStripeAccount);

router.post("/sendReport", authenticateToken, sendReport);
router.post("/sendNotification", authenticateToken, sendNotification);

module.exports = router;

// const express = require("express");
// const router = express.Router();
// const multer = require("multer");
// const authenticateToken = require("../authorization");

// const {
//   addRestaurant,
//   restaurant,
//   restaurantUser,
//   restaurantWeb,
//   addMenuItem,
//   menuItems,
//   singleMenuItem,
//   editMenu,
//   updateMenuImage,
//   deleteMenu,
//   editRestaurant,
//   dashboard,
//   updateCover,
//   earnings,
//   toggleStatus,
//   checkStatus,
//   resWallet,
//   validateStripe,
//   addCategory,
//   updateCategory,
//   deleteCategory,
//   resWithdraw,
//   fetchPayment,
//   addComment,
//   checkStripeAccount,
//   createStripeAccount,
//   editStripeAccount,
// } = require("../controller/restaurantController");

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads");
//   },
//   filename: function (req, file, cb) {
//     cb(
//       null,
//       `${file.fieldname}-` +
//         Date.now() +
//         "." +
//         file.originalname.split(".").pop()
//     );
//   },
// });

// const upload = multer({ storage: storage });

// router.use("/uploads", express.static("uploads"));

// router.post(
//   "/addRestaurant/:id",

//   upload.single("cover"),
//   addRestaurant
// );
// router.get("/restaurant/:id", restaurant);
// router.get("/restaurantUser/:id", restaurantUser);
// router.get("/restaurantWeb/:id", restaurantWeb);
// router.post(
//   "/addMenuItem/:id",

//   upload.single("image"),
//   addMenuItem
// );
// router.get("/menuItems/:id", menuItems);
// router.get("/getItem/:id", singleMenuItem);
// router.put("/editItem/:id", editMenu);
// router.post(
//   "/updateMenuImage/:id",

//   upload.single("image"),
//   updateMenuImage
// );
// router.delete("/deleteMenu/:id", deleteMenu);
// router.put("/editRestaurant/:id", editRestaurant);
// router.put(
//   "/updateCover/:id",

//   upload.single("cover"),
//   updateCover
// );
// router.get("/dashboard/:id", dashboard);
// router.get("/earnings/:id", earnings);
// router.get("/checkStatus/:id", checkStatus);
// router.put("/toggleStatus/:id", toggleStatus);
// router.get("/resWallet/:id", resWallet);
// router.post("/validateStripe/:id", validateStripe);
// router.post("/addCategory/:id", addCategory);
// router.put("/updateCategory/:id", updateCategory);
// router.delete("/deleteCategory/:id", deleteCategory);
// router.post("/resWithdraw/:id", resWithdraw);
// router.get("/fetchPayment/:res_id", fetchPayment);
// router.put("/comment/:id", addComment);
// router.get("/checkStripeAccount/:id", checkStripeAccount);
// router.post("/createStripeAccount/:id", createStripeAccount);
// router.put("/editStripeAccount/:id", editStripeAccount);

// module.exports = router;

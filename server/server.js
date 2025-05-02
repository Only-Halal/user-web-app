const express = require("express");
const app = express();
const PORT = 5000;
// add database
const pool = require("./database");

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

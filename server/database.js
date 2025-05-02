const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  // password: "saadkhan2211",
  // password: "arham",
  password: "pg",
  host: "localhost",
  port: "5432",
  database: "aws",
  // database: "only_halal",
  // database: "postgres",
});

module.exports = pool;

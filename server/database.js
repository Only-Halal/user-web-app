const { Pool } = require("pg");

// const pool = new Pool({
//   user: "postgres",
//   password: "faizan..12",
//   // password: "arham",
//   host: "database-1.cpies4agy8vq.us-east-1.rds.amazonaws.com",
//   port: "5432",
//   database: "only_halal",
//   ssl: {
//     rejectUnauthorized: false,
//   },
// });

// module.exports = pool;

const pool = new Pool({
  user: "postgres",
  // password: "saadkhan2211",
  // password: "arham",
  password: "pagal2hain2",
  host: "localhost",
  port: "5432",
  database: "aws",
  // database: "only_halal",
  // database: "postgres",
});

module.exports = pool;

const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config({path: './configs/.env'});

const pool = mysql.createPool({
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool.promise();

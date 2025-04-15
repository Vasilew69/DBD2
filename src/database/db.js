const mysql = require('mysql2/promise');
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

pool.getConnection()
  .then(conn => {
    console.log('Connected to MySQL database');
    conn.release();
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });

module.exports = pool;
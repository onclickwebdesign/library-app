const mysql = require('mysql');
const util = require('util');
require('dotenv').config();

const pool = mysql.createPool({
    connectionLimit: 1000,
    host: process.env.DB_CONN_HOST,
    user: process.env.DB_CONN_USER,
    password: process.env.DB_CONN_PW,
    database: process.env.DB_CONN_DBNAME,
    multipleStatements: true
});

// Check for connection errors:
pool.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database Error: Connection was closed.');
        } else if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database Error: Database has too many connections.');
        } else if (err.code === 'ECONNREFUSED') {
            console.error('Database Error: Connection was refused.');
        }
    }

    if (connection) connection.release();

    return;
});

// so we can use async/await when running db queries
pool.query = util.promisify(pool.query);

module.exports = pool;
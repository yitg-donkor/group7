const mysql = require("mysql2/promise");

async function testConnection() {
  const dbConfig = {
    host: "localhost",
    user: "root",
    password: "2045",
    database: "supermarket_db",
    port: 3300,
  };

  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log("Successfully connected to the database!");
    await connection.end();
  } catch (error) {
    console.error("Error connecting to the database:");
    console.error(error);
  }
}

testConnection();

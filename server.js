const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Database configuration // change this to your MySQL configuration for you group 7 db
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "2045", // Change this to your MySQL password
  database: "supermarket_db",
  port: 3300, // Standard MySQL port
};

// Database connection pool
const pool = mysql.createPool(dbConfig);

// Helper function to execute queries
async function executeQuery(query, params = []) {
  try {
    const [results] = await pool.execute(query, params);
    return results;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}

// ==================== SUPPLIER ROUTES ====================
app.get("/api/suppliers", async (req, res) => {
  try {
    const suppliers = await executeQuery(
      "SELECT * FROM supplier ORDER BY lastName, firstName"
    );
    res.json(suppliers);
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    res.status(500).json({ error: "Failed to fetch suppliers" });
  }
});

app.post("/api/suppliers", async (req, res) => {
  try {
    const { firstName, middleName, lastName, phoneNumber, address, email } =
      req.body;
    const result = await executeQuery(
      "INSERT INTO supplier (firstName, middleName, lastName, phoneNumber, address, email) VALUES (?, ?, ?, ?, ?, ?)",
      [firstName, middleName, lastName, phoneNumber, address, email]
    );
    res.status(201).json({
      supplierID: result.insertId,
      message: "Supplier created successfully",
    });
  } catch (error) {
    console.error("Error creating supplier:", error);
    res.status(500).json({ error: "Failed to create supplier" });
  }
});

app.put("/api/suppliers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, middleName, lastName, phoneNumber, address, email } =
      req.body;
    await executeQuery(
      "UPDATE SUPPLIER SET firstName = ?, middleName = ?, lastName = ?, phoneNumber = ?, address = ?, email = ? WHERE supplierID = ?",
      [firstName, middleName, lastName, phoneNumber, address, email, id]
    );
    res.json({ message: "Supplier updated successfully" });
  } catch (error) {
    console.error("Error updating supplier:", error);
    res.status(500).json({ error: "Failed to update supplier" });
  }
});

app.delete("/api/suppliers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await executeQuery("DELETE FROM SUPPLIER WHERE supplierID = ?", [id]);
    res.json({ message: "Supplier deleted successfully" });
  } catch (error) {
    console.error("Error deleting supplier:", error);
    res.status(500).json({ error: "Failed to delete supplier" });
  }
});

// ==================== STORE ROUTES ====================
app.get("/api/stores", async (req, res) => {
  try {
    const stores = await executeQuery("SELECT * FROM STORE ORDER BY storeName");
    res.json(stores);
  } catch (error) {
    console.error("Error fetching stores:", error);
    res.status(500).json({ error: "Failed to fetch stores" });
  }
});

app.post("/api/stores", async (req, res) => {
  try {
    const { storeName, location, storeNumber } = req.body;
    const result = await executeQuery(
      "INSERT INTO STORE (storeName, location, storeNumber) VALUES (?, ?, ?)",
      [storeName, location, storeNumber]
    );
    res.status(201).json({
      storeID: result.insertId,
      message: "Store created successfully",
    });
  } catch (error) {
    console.error("Error creating store:", error);
    res.status(500).json({ error: "Failed to create store" });
  }
});

app.delete("/api/stores/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await executeQuery("DELETE FROM STORE WHERE storeID = ?", [id]);
    res.json({ message: "Store deleted successfully" });
  } catch (error) {
    console.error("Error deleting store:", error);
    res.status(500).json({ error: "Failed to delete store" });
  }
});

// ==================== PRODUCT ROUTES ====================
app.get("/api/products", async (req, res) => {
  try {
    const products = await executeQuery(`
      SELECT p.*, s.storeName, sup.firstName as supplierFirstName, sup.lastName as supplierLastName
      FROM PRODUCT p
      LEFT JOIN STORE s ON p.storeID = s.storeID
      LEFT JOIN SUPPLIER sup ON p.supplierID = sup.supplierID
      ORDER BY p.productName
    `);
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    const { productName, cost, description, quality, storeID, supplierID } =
      req.body;
    const result = await executeQuery(
      "INSERT INTO PRODUCT (productName, cost, description, quality, storeID, supplierID) VALUES (?, ?, ?, ?, ?, ?)",
      [productName, cost, description, quality, storeID, supplierID]
    );
    res.status(201).json({
      productID: result.insertId,
      message: "Product created successfully",
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
});

app.put("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { productName, cost, description, quality, storeID, supplierID } =
      req.body;
    await executeQuery(
      "UPDATE PRODUCT SET productName = ?, cost = ?, description = ?, quality = ?, storeID = ?, supplierID = ? WHERE productID = ?",
      [productName, cost, description, quality, storeID, supplierID, id]
    );
    res.json({ message: "Product updated successfully" });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await executeQuery("DELETE FROM PRODUCT WHERE productID = ?", [id]);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// ==================== EMPLOYEE ROUTES ====================
app.get("/api/employees", async (req, res) => {
  try {
    const employees = await executeQuery(`
      SELECT e.*, s.storeName, p.name as positionName
      FROM EMPLOYEE e
      LEFT JOIN STORE s ON e.storeID = s.storeID
      LEFT JOIN POSITION p ON e.positionID = p.positionID
      ORDER BY e.lastName, e.firstName
    `);
    res.json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ error: "Failed to fetch employees" });
  }
});

app.post("/api/employees", async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      phonenumber,
      email,
      storeID,
      gender,
      address,
      positionID,
      dob,
      salary,
    } = req.body;
    const result = await executeQuery(
      "INSERT INTO EMPLOYEE (firstName, middleName, lastName, phonenumber, email, storeID, gender, address, positionID, dob, salary) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        firstName,
        middleName,
        lastName,
        phonenumber,
        email,
        storeID,
        gender,
        address,
        positionID,
        dob,
        salary,
      ]
    );
    res.status(201).json({
      employeeID: result.insertId,
      message: "Employee created successfully",
    });
  } catch (error) {
    console.error("Error creating employee:", error);
    res.status(500).json({ error: "Failed to create employee" });
  }
});

app.delete("/api/employees/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await executeQuery("DELETE FROM EMPLOYEE WHERE employeeID = ?", [id]);
    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({ error: "Failed to delete employee" });
  }
});

// ==================== POSITION ROUTES ====================
app.get("/api/positions", async (req, res) => {
  try {
    const positions = await executeQuery(
      "SELECT * FROM POSITION ORDER BY name"
    );
    res.json(positions);
  } catch (error) {
    console.error("Error fetching positions:", error);
    res.status(500).json({ error: "Failed to fetch positions" });
  }
});

app.post("/api/positions", async (req, res) => {
  try {
    const { name, description, duty } = req.body;
    const result = await executeQuery(
      "INSERT INTO POSITION (name, description, duty) VALUES (?, ?, ?)",
      [name, description, duty]
    );
    res.status(201).json({
      positionID: result.insertId,
      message: "Position created successfully",
    });
  } catch (error) {
    console.error("Error creating position:", error);
    res.status(500).json({ error: "Failed to create position" });
  }
});

// ==================== CUSTOMER ROUTES ====================
app.get("/api/customers", async (req, res) => {
  try {
    const customers = await executeQuery(
      "SELECT * FROM CUSTOMER ORDER BY lastName, firstName"
    );
    res.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

app.post("/api/customers", async (req, res) => {
  try {
    const { firstName, middleName, lastName, phonenumber, email, address } =
      req.body;
    const result = await executeQuery(
      "INSERT INTO CUSTOMER (firstName, middleName, lastName, phonenumber, email, address) VALUES (?, ?, ?, ?, ?, ?)",
      [firstName, middleName, lastName, phonenumber, email, address]
    );
    res.status(201).json({
      customerID: result.insertId,
      message: "Customer created successfully",
    });
  } catch (error) {
    console.error("Error creating customer:", error);
    res.status(500).json({ error: "Failed to create customer" });
  }
});

app.delete("/api/customers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await executeQuery("DELETE FROM CUSTOMER WHERE customerID = ?", [id]);
    res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({ error: "Failed to delete customer" });
  }
});

// ==================== ORDER ROUTES ====================
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await executeQuery(`
      SELECT o.*, p.productName
      FROM \`ORDER\` o
      LEFT JOIN PRODUCT p ON o.productID = p.productID
      ORDER BY o.orderDate DESC
    `);
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

app.post("/api/orders", async (req, res) => {
  try {
    const { orderDate, productName, amount, productID } = req.body;
    const result = await executeQuery(
      "INSERT INTO `ORDER` (orderDate, productName, amount, productID) VALUES (?, ?, ?, ?)",
      [orderDate, productName, amount, productID]
    );
    res.status(201).json({
      orderID: result.insertId,
      message: "Order created successfully",
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

app.delete("/api/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await executeQuery("DELETE FROM `ORDER` WHERE orderID = ?", [id]);
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ error: "Failed to delete order" });
  }
});

// ==================== SALES ROUTES ====================
app.get("/api/sales", async (req, res) => {
  try {
    const sales = await executeQuery(`
      SELECT s.*, i.totalAmount, i.customerName
      FROM SALE s
      LEFT JOIN INVOICE i ON s.invoiceNumber = i.invoiceID
      ORDER BY s.date DESC
    `);
    res.json(sales);
  } catch (error) {
    console.error("Error fetching sales:", error);
    res.status(500).json({ error: "Failed to fetch sales" });
  }
});

// ==================== PAYMENT ROUTES ====================
app.get("/api/payments", async (req, res) => {
  try {
    const payments = await executeQuery(`
      SELECT p.*, pm.cash, pm.momo, pm.bank
      FROM PAYMENT p
      LEFT JOIN PAYMENTMETHOD pm ON p.paymentMethodID = pm.paymentMethodID
      ORDER BY p.paymentDate DESC
    `);
    res.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

// ==================== ATTENDANCE ROUTES ====================
app.get("/api/attendance", async (req, res) => {
  try {
    const attendance = await executeQuery(`
      SELECT a.*, e.firstName, e.lastName
      FROM ATTENDANCE a
      LEFT JOIN EMPLOYEE e ON a.attendanceID = e.employeeID
      ORDER BY a.date DESC
    `);
    res.json(attendance);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ error: "Failed to fetch attendance" });
  }
});

// ==================== DASHBOARD ANALYTICS ROUTES ====================
app.get("/api/dashboard/stats", async (req, res) => {
  try {
    const [suppliers] = await executeQuery(
      "SELECT COUNT(*) as count FROM SUPPLIER"
    );
    const [stores] = await executeQuery("SELECT COUNT(*) as count FROM STORE");
    const [products] = await executeQuery(
      "SELECT COUNT(*) as count FROM PRODUCT"
    );
    const [employees] = await executeQuery(
      "SELECT COUNT(*) as count FROM EMPLOYEE"
    );
    const [customers] = await executeQuery(
      "SELECT COUNT(*) as count FROM CUSTOMER"
    );
    const [orders] = await executeQuery(
      "SELECT COUNT(*) as count FROM `ORDER`"
    );

    // Handle potential null values for revenue calculation
    const revenueResult = await executeQuery(
      "SELECT COALESCE(SUM(totalAmount), 0) as total FROM INVOICE"
    );
    const totalRevenue = revenueResult[0]?.total || 0;

    const [recentSales] = await executeQuery(
      "SELECT COUNT(*) as count FROM SALE WHERE date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)"
    );

    res.json({
      suppliers: suppliers.count || 0,
      stores: stores.count || 0,
      products: products.count || 0,
      employees: employees.count || 0,
      customers: customers.count || 0,
      orders: orders.count || 0,
      totalRevenue: parseFloat(totalRevenue) || 0,
      recentSales: recentSales.count || 0,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

// ==================== SERVE DASHBOARD ====================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(
    `🚀 Supermarket backend server running on http://localhost:${PORT}`
  );
  console.log(`📊 Admin dashboard available at http://localhost:${PORT}`);
  console.log(
    `🔧 Make sure MySQL is running on port 3306 with database 'supermarket_db'`
  );
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await pool.end();
  process.exit(0);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

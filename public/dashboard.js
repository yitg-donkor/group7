// Global state to store data
let currentData = {
  suppliers: [],
  stores: [],
  products: [],
  employees: [],
  customers: [],
  orders: [],
  sales: [],
  payments: [],
  positions: [],
};

// API base URL
const API_BASE = window.location.origin;

// Initialize dashboard
document.addEventListener("DOMContentLoaded", function () {
  loadDashboardStats();
  loadAllData();
});

// Tab management
function showTab(tabName) {
  // Hide all tab contents
  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.classList.remove("active");
  });

  // Remove active class from all buttons
  document.querySelectorAll(".tab-button").forEach((btn) => {
    btn.classList.remove("active");
  });

  // Show selected tab and activate button
  document.getElementById(tabName).classList.add("active");
  event.target.classList.add("active");

  // Load data for specific tab
  loadTabData(tabName);
}

// Load dashboard statistics
async function loadDashboardStats() {
  try {
    const response = await fetch(`${API_BASE}/api/dashboard/stats`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const stats = await response.json();

    document.getElementById("totalSuppliers").textContent =
      stats.suppliers || 0;
    document.getElementById("totalStores").textContent = stats.stores || 0;
    document.getElementById("totalProducts").textContent = stats.products || 0;
    document.getElementById("totalEmployees").textContent =
      stats.employees || 0;
    document.getElementById("totalCustomers").textContent =
      stats.customers || 0;
    document.getElementById("totalOrders").textContent = stats.orders || 0;
    document.getElementById("totalRevenue").textContent = (
      stats.totalRevenue || 0
    ).toFixed(2);
    document.getElementById("recentSales").textContent = stats.recentSales || 0;
  } catch (error) {
    console.error("Error loading dashboard stats:", error);
    showMessage(
      "Failed to load dashboard statistics. Make sure the server is running.",
      "error"
    );
  }
}

// Load all data
async function loadAllData() {
  await Promise.all([
    loadSuppliers(),
    loadStores(),
    loadProducts(),
    loadEmployees(),
    loadCustomers(),
    loadOrders(),
    loadSales(),
    loadPayments(),
    loadPositions(),
  ]);
}

// Load data for specific tab
function loadTabData(tabName) {
  switch (tabName) {
    case "suppliers":
      loadSuppliers();
      break;
    case "stores":
      loadStores();
      break;
    case "products":
      loadProducts();
      populateProductForm();
      break;
    case "employees":
      loadEmployees();
      populateEmployeeForm();
      break;
    case "customers":
      loadCustomers();
      break;
    case "orders":
      loadOrders();
      populateOrderForm();
      break;
    case "sales":
      loadSales();
      break;
    case "payments":
      loadPayments();
      break;
  }
}

// API call helper
async function apiCall(endpoint, method = "GET", data = null) {
  try {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };
    if (data) {
      options.body = JSON.stringify(data);
    }
    const response = await fetch(`${API_BASE}/api/${endpoint}`, options);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error(`API call failed: ${endpoint}`, error);
    throw error;
  }
}

// ==================== SUPPLIERS ====================
async function loadSuppliers() {
  try {
    currentData.suppliers = await apiCall("suppliers");
    renderSuppliersTable();
  } catch (error) {
    document.getElementById("suppliersTableBody").innerHTML = `
      <tr>
        <td colspan="6" class="error-message">Failed to load suppliers</td>
      </tr>
    `;
  }
}

function renderSuppliersTable() {
  const tbody = document.getElementById("suppliersTableBody");
  if (currentData.suppliers.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">No suppliers found</td>
      </tr>
    `;
    return;
  }
  tbody.innerHTML = currentData.suppliers
    .map(
      (supplier) => `
    <tr>
      <td>${supplier.supplierID}</td>
      <td>
        ${supplier.firstName} ${supplier.middleName || ""} ${supplier.lastName}
      </td>
      <td>${supplier.phoneNumber}</td>
      <td>${supplier.email}</td>
      <td>${supplier.address}</td>
      <td>
        <button
          class="btn btn-danger"
          onclick="deleteSupplier('${supplier.supplierID}')"
        >
          Delete
        </button>
      </td>
    </tr>
    `
    )
    .join("");
}

async function addSupplier(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);

  try {
    await apiCall("suppliers", "POST", data);
    showMessage("Supplier added successfully!", "success");
    event.target.reset();
    toggleForm("supplierForm");
    loadSuppliers();
    loadDashboardStats();
  } catch (error) {
    showMessage("Failed to add supplier", "error");
  }
}

async function deleteSupplier(id) {
  if (!confirm("Are you sure you want to delete this supplier?")) return;

  try {
    await apiCall(`suppliers/${id}`, "DELETE");
    showMessage("Supplier deleted successfully!", "success");
    loadSuppliers();
    loadDashboardStats();
  } catch (error) {
    showMessage("Failed to delete supplier", "error");
  }
}

// ==================== STORES ====================
async function loadStores() {
  try {
    currentData.stores = await apiCall("stores");
    renderStoresTable();
  } catch (error) {
    document.getElementById("storesTableBody").innerHTML = `
      <tr>
        <td colspan="5" class="error-message">Failed to load stores</td>
      </tr>
    `;
  }
}

function renderStoresTable() {
  const tbody = document.getElementById("storesTableBody");
  if (currentData.stores.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">No stores found</td>
      </tr>
    `;
    return;
  }
  tbody.innerHTML = currentData.stores
    .map(
      (store) => `
    <tr>
      <td>${store.storeID}</td>
      <td>${store.storeName}</td>
      <td>${store.storeNumber}</td>
      <td>${store.location}</td>
      <td>
        <button class="btn btn-danger" onclick="deleteStore('${store.storeID}')">
          Delete
        </button>
      </td>
    </tr>
    `
    )
    .join("");
}

async function addStore(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);

  try {
    await apiCall("stores", "POST", data);
    showMessage("Store added successfully!", "success");
    event.target.reset();
    toggleForm("storeForm");
    loadStores();
    loadDashboardStats();
  } catch (error) {
    showMessage("Failed to add store", "error");
  }
}

async function deleteStore(id) {
  if (!confirm("Are you sure you want to delete this store?")) return;

  try {
    await apiCall(`stores/${id}`, "DELETE");
    showMessage("Store deleted successfully!", "success");
    loadStores();
    loadDashboardStats();
  } catch (error) {
    showMessage("Failed to delete store", "error");
  }
}

// ==================== PRODUCTS ====================
async function loadProducts() {
  try {
    currentData.products = await apiCall("products");
    renderProductsTable();
  } catch (error) {
    document.getElementById("productsTableBody").innerHTML = `
      <tr>
        <td colspan="7" class="error-message">Failed to load products</td>
      </tr>
    `;
  }
}

function renderProductsTable() {
  const tbody = document.getElementById("productsTableBody");
  if (currentData.products.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="empty-state">No products found</td>
      </tr>
    `;
    return;
  }
  tbody.innerHTML = currentData.products
    .map(
      (product) => `
    <tr>
      <td>${product.productID}</td>
      <td>${product.productName}</td>
      <td>GHS ${parseFloat(product.cost).toFixed(2)}</td>
      <td>${product.quality}</td>
      <td>${product.storeName || "N/A"}</td>
      <td>${product.supplierFirstName || "N/A"} ${
        product.supplierLastName || ""
      }</td>
      <td>
        <button
          class="btn btn-danger"
          onclick="deleteProduct('${product.productID}')"
        >
          Delete
        </button>
      </td>
    </tr>
    `
    )
    .join("");
}

function populateProductForm() {
  const storeSelect = document.getElementById("productStoreSelect");
  const supplierSelect = document.getElementById("productSupplierSelect");

  if (storeSelect) {
    storeSelect.innerHTML =
      '<option value="">Select Store</option>' +
      currentData.stores
        .map(
          (store) =>
            `<option value="${store.storeID}">${store.storeName}</option>`
        )
        .join("");
  }

  if (supplierSelect) {
    supplierSelect.innerHTML =
      '<option value="">Select Supplier</option>' +
      currentData.suppliers
        .map(
          (supplier) =>
            `<option value="${supplier.supplierID}">${supplier.firstName} ${supplier.lastName}</option>`
        )
        .join("");
  }
}

async function addProduct(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);

  try {
    await apiCall("products", "POST", data);
    showMessage("Product added successfully!", "success");
    event.target.reset();
    toggleForm("productForm");
    loadProducts();
    loadDashboardStats();
  } catch (error) {
    showMessage("Failed to add product", "error");
  }
}

async function deleteProduct(id) {
  if (!confirm("Are you sure you want to delete this product?")) return;

  try {
    await apiCall(`products/${id}`, "DELETE");
    showMessage("Product deleted successfully!", "success");
    loadProducts();
    loadDashboardStats();
  } catch (error) {
    showMessage("Failed to delete product", "error");
  }
}

// ==================== EMPLOYEES ====================
async function loadEmployees() {
  try {
    currentData.employees = await apiCall("employees");
    renderEmployeesTable();
  } catch (error) {
    document.getElementById("employeesTableBody").innerHTML = `
      <tr>
        <td colspan="8" class="error-message">Failed to load employees</td>
      </tr>
    `;
  }
}

function renderEmployeesTable() {
  const tbody = document.getElementById("employeesTableBody");
  if (currentData.employees.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="empty-state">No employees found</td>
      </tr>
    `;
    return;
  }
  tbody.innerHTML = currentData.employees
    .map(
      (employee) => `
    <tr>
      <td>${employee.employeeID}</td>
      <td>
        ${employee.firstName} ${employee.middleName || ""} ${employee.lastName}
      </td>
      <td>${employee.phonenumber}</td>
      <td>${employee.email}</td>
      <td>${employee.positionName || "N/A"}</td>
      <td>${employee.storeName || "N/A"}</td>
      <td>GHS ${parseFloat(employee.salary || 0).toFixed(2)}</td>
      <td>
        <button
          class="btn btn-danger"
          onclick="deleteEmployee('${employee.employeeID}')"
        >
          Delete
        </button>
      </td>
    </tr>
    `
    )
    .join("");
}

function populateEmployeeForm() {
  const storeSelect = document.getElementById("employeeStoreSelect");
  const positionSelect = document.getElementById("employeePositionSelect");

  if (storeSelect) {
    storeSelect.innerHTML =
      '<option value="">Select Store</option>' +
      currentData.stores
        .map(
          (store) =>
            `<option value="${store.storeID}">${store.storeName}</option>`
        )
        .join("");
  }

  if (positionSelect) {
    positionSelect.innerHTML =
      '<option value="">Select Position</option>' +
      currentData.positions
        .map(
          (position) =>
            `<option value="${position.positionID}">${position.name}</option>`
        )
        .join("");
  }
}

async function addEmployee(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);

  try {
    await apiCall("employees", "POST", data);
    showMessage("Employee added successfully!", "success");
    event.target.reset();
    toggleForm("employeeForm");
    loadEmployees();
    loadDashboardStats();
  } catch (error) {
    showMessage("Failed to add employee", "error");
  }
}

async function deleteEmployee(id) {
  if (!confirm("Are you sure you want to delete this employee?")) return;

  try {
    await apiCall(`employees/${id}`, "DELETE");
    showMessage("Employee deleted successfully!", "success");
    loadEmployees();
    loadDashboardStats();
  } catch (error) {
    showMessage("Failed to delete employee", "error");
  }
}

// ==================== POSITIONS ====================
async function loadPositions() {
  try {
    currentData.positions = await apiCall("positions");
  } catch (error) {
    console.error("Failed to load positions:", error);
    currentData.positions = [];
  }
}

// ==================== CUSTOMERS ====================
async function loadCustomers() {
  try {
    currentData.customers = await apiCall("customers");
    renderCustomersTable();
  } catch (error) {
    document.getElementById("customersTableBody").innerHTML = `
      <tr>
        <td colspan="6" class="error-message">Failed to load customers</td>
      </tr>
    `;
  }
}

function renderCustomersTable() {
  const tbody = document.getElementById("customersTableBody");
  if (currentData.customers.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">No customers found</td>
      </tr>
    `;
    return;
  }
  tbody.innerHTML = currentData.customers
    .map(
      (customer) => `
    <tr>
      <td>${customer.customerID}</td>
      <td>
        ${customer.firstName} ${customer.middleName || ""} ${customer.lastName}
      </td>
      <td>${customer.phonenumber}</td>
      <td>${customer.email}</td>
      <td>${customer.address}</td>
      <td>
        <button
          class="btn btn-danger"
          onclick="deleteCustomer('${customer.customerID}')"
        >
          Delete
        </button>
      </td>
    </tr>
    `
    )
    .join("");
}

async function addCustomer(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);

  try {
    await apiCall("customers", "POST", data);
    showMessage("Customer added successfully!", "success");
    event.target.reset();
    toggleForm("customerForm");
    loadCustomers();
    loadDashboardStats();
  } catch (error) {
    showMessage("Failed to add customer", "error");
  }
}

async function deleteCustomer(id) {
  if (!confirm("Are you sure you want to delete this customer?")) return;

  try {
    await apiCall(`customers/${id}`, "DELETE");
    showMessage("Customer deleted successfully!", "success");
    loadCustomers();
    loadDashboardStats();
  } catch (error) {
    showMessage("Failed to delete customer", "error");
  }
}

// ==================== ORDERS ====================
async function loadOrders() {
  try {
    currentData.orders = await apiCall("orders");
    renderOrdersTable();
  } catch (error) {
    document.getElementById("ordersTableBody").innerHTML = `
      <tr>
        <td colspan="5" class="error-message">Failed to load orders</td>
      </tr>
    `;
  }
}

function renderOrdersTable() {
  const tbody = document.getElementById("ordersTableBody");
  if (currentData.orders.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">No orders found</td>
      </tr>
    `;
    return;
  }
  tbody.innerHTML = currentData.orders
    .map(
      (order) => `
    <tr>
      <td>${order.orderID}</td>
      <td>${new Date(order.orderDate).toLocaleDateString()}</td>
      <td>${order.productName}</td>
      <td>GHS ${parseFloat(order.amount || 0).toFixed(2)}</td>
      <td>
        <button class="btn btn-danger" onclick="deleteOrder('${
          order.orderID
        }')">
          Delete
        </button>
      </td>
    </tr>
    `
    )
    .join("");
}

function populateOrderForm() {
  const productSelect = document.getElementById("orderProductSelect");

  if (productSelect) {
    productSelect.innerHTML =
      '<option value="">Select Product</option>' +
      currentData.products
        .map(
          (product) =>
            `<option value="${product.productID}">${product.productName}</option>`
        )
        .join("");
  }
}

async function addOrder(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);

  try {
    await apiCall("orders", "POST", data);
    showMessage("Order added successfully!", "success");
    event.target.reset();
    toggleForm("orderForm");
    loadOrders();
    loadDashboardStats();
  } catch (error) {
    showMessage("Failed to add order", "error");
  }
}

async function deleteOrder(id) {
  if (!confirm("Are you sure you want to delete this order?")) return;

  try {
    await apiCall(`orders/${id}`, "DELETE");
    showMessage("Order deleted successfully!", "success");
    loadOrders();
    loadDashboardStats();
  } catch (error) {
    showMessage("Failed to delete order", "error");
  }
}

// ==================== SALES ====================
async function loadSales() {
  try {
    currentData.sales = await apiCall("sales");
    renderSalesTable();
  } catch (error) {
    document.getElementById("salesTableBody").innerHTML = `
      <tr>
        <td colspan="6" class="error-message">Failed to load sales</td>
      </tr>
    `;
  }
}

function renderSalesTable() {
  const tbody = document.getElementById("salesTableBody");
  if (currentData.sales.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">No sales found</td>
      </tr>
    `;
    return;
  }
  tbody.innerHTML = currentData.sales
    .map(
      (sale) => `
    <tr>
      <td>${sale.saleID}</td>
      <td>${new Date(sale.date).toLocaleDateString()}</td>
      <td>${sale.time || "N/A"}</td>
      <td>${sale.invoiceNumber || "N/A"}</td>
      <td>GHS ${parseFloat(sale.totalAmount || 0).toFixed(2)}</td>
      <td>${sale.customerName || "N/A"}</td>
    </tr>
    `
    )
    .join("");
}

// ==================== PAYMENTS ====================
async function loadPayments() {
  try {
    currentData.payments = await apiCall("payments");
    renderPaymentsTable();
  } catch (error) {
    document.getElementById("paymentsTableBody").innerHTML = `
      <tr>
        <td colspan="8" class="error-message">Failed to load payments</td>
      </tr>
    `;
  }
}

function renderPaymentsTable() {
  const tbody = document.getElementById("paymentsTableBody");
  if (currentData.payments.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="empty-state">No payments found</td>
      </tr>
    `;
    return;
  }
  tbody.innerHTML = currentData.payments
    .map(
      (payment) => `
    <tr>
      <td>${payment.paymentID}</td>
      <td>${new Date(payment.paymentDate).toLocaleDateString()}</td>
      <td>GHS ${parseFloat(payment.amount || 0).toFixed(2)}</td>
      <td>${payment.time || "N/A"}</td>
      <td>${payment.method || "N/A"}</td>
      <td>${payment.cash ? "Yes" : "No"}</td>
      <td>${payment.momo ? "Yes" : "No"}</td>
      <td>${payment.bank ? "Yes" : "No"}</td>
    </tr>
    `
    )
    .join("");
}

// ==================== FORM MANAGEMENT ====================
function toggleForm(formId) {
  const form = document.getElementById(formId);
  if (form) {
    form.classList.toggle("show");

    if (form.classList.contains("show")) {
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
}

// ==================== MESSAGE SYSTEM ====================
function showMessage(message, type) {
  // Remove existing messages
  const existingMessages = document.querySelectorAll(
    ".success-message, .error-message"
  );
  existingMessages.forEach((msg) => msg.remove());

  // Create new message
  const messageDiv = document.createElement("div");
  messageDiv.className =
    type === "success" ? "success-message" : "error-message";
  messageDiv.textContent = message;

  // Insert at top of container
  const container = document.querySelector(".container");
  if (container) {
    container.insertBefore(messageDiv, container.firstChild);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 5000);
  }
}

// ==================== AUTO-REFRESH ====================
// Auto-refresh dashboard stats every 30 seconds
setInterval(loadDashboardStats, 30000);

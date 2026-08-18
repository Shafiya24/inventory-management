
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import "./App.css";

const API = "http://localhost:8080/api";

function App() {
  const [loggedIn, setLoggedIn] = useState(
    localStorage.getItem("inventoryLoggedIn") === "true"
  );

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("inventoryUser");
    return saved ? JSON.parse(saved) : null;
  });

  const [loginForm, setLoginForm] = useState({
    username: "",
    password: ""
  });

  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [page, setPage] = useState("dashboard");

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [stock, setStock] = useState([]);
  const [lowStock, setLowStock] = useState([]);

  const [search, setSearch] = useState("");

  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [showSaleForm, setShowSaleForm] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);

  const emptyProduct = {
    name: "",
    description: "",
    sku: "",
    price: "",
    quantity: "",
    category: { id: 2 }
  };

  const [productForm, setProductForm] = useState(emptyProduct);

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: ""
  });

  const [supplierForm, setSupplierForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });

  const [purchaseForm, setPurchaseForm] = useState({
    productId: "",
    supplierId: "",
    quantity: "",
    totalPrice: ""
  });

  const [saleForm, setSaleForm] = useState({
    productId: "",
    quantity: "",
    totalPrice: ""
  });

  // =========================
  // LOGIN
  // =========================

  const login = async (e) => {
    e.preventDefault();

    setLoginError("");
    setLoginLoading(true);

    try {
      const response = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(loginForm)
      });

      if (!response.ok) {
        setLoginError("Invalid username or password");
        setLoginLoading(false);
        return;
      }

      const data = await response.json();

      setUser(data);
      setLoggedIn(true);

      localStorage.setItem("inventoryLoggedIn", "true");
      localStorage.setItem("inventoryUser", JSON.stringify(data));

      setLoginForm({
        username: "",
        password: ""
      });

      setLoginLoading(false);

    } catch (error) {
      console.error(error);
      setLoginError("Cannot connect to Spring Boot server");
      setLoginLoading(false);
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const logout = async () => {
    try {
      await fetch(`${API}/auth/logout`, {
        method: "POST",
        credentials: "include"
      });
    } catch (error) {
      console.error(error);
    }

    localStorage.removeItem("inventoryLoggedIn");
    localStorage.removeItem("inventoryUser");

    setLoggedIn(false);
    setUser(null);
    setPage("dashboard");
  };

  // =========================
  // API REQUEST
  // =========================

  const apiRequest = async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    });

    if (response.status === 401 || response.status === 403) {
      if (response.status === 401) {
        localStorage.removeItem("inventoryLoggedIn");
        localStorage.removeItem("inventoryUser");

        setLoggedIn(false);
        setUser(null);
      }

      throw new Error("AUTH_ERROR");
    }

    return response;
  };

  // =========================
  // ARRAY HELPER
  // =========================

  const convertToArray = (data) => {
    if (Array.isArray(data)) {
      return data;
    }

    if (data && Array.isArray(data.content)) {
      return data.content;
    }

    return [];
  };

  // =========================
  // LOAD DATA
  // =========================

  const loadAllData = async () => {
    try {
      const [
        productsRes,
        categoriesRes,
        suppliersRes,
        purchasesRes,
        salesRes,
        stockRes,
        lowStockRes
      ] = await Promise.all([
        apiRequest(`${API}/products`),
        apiRequest(`${API}/categories`),
        apiRequest(`${API}/suppliers`),
        apiRequest(`${API}/purchases`),
        apiRequest(`${API}/sales`),
        apiRequest(`${API}/stock`),
        apiRequest(`${API}/products/low-stock?quantity=5`)
      ]);

      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      const suppliersData = await suppliersRes.json();
      const purchasesData = await purchasesRes.json();
      const salesData = await salesRes.json();
      const stockData = await stockRes.json();
      const lowStockData = await lowStockRes.json();

      setProducts(convertToArray(productsData));
      setCategories(convertToArray(categoriesData));
      setSuppliers(convertToArray(suppliersData));
      setPurchases(convertToArray(purchasesData));
      setSales(convertToArray(salesData));
      setStock(convertToArray(stockData));
      setLowStock(convertToArray(lowStockData));

    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  useEffect(() => {
    if (loggedIn) {
      loadAllData();
    }
  }, [loggedIn]);

  // =========================
  // PRODUCT
  // =========================

  const saveProduct = async (e) => {
    e.preventDefault();

    try {
      const response = await apiRequest(`${API}/products`, {
        method: "POST",
        body: JSON.stringify({
          ...productForm,
          price: Number(productForm.price),
          quantity: Number(productForm.quantity)
        })
      });

      if (!response.ok) {
        alert("Could not add product");
        return;
      }

      alert("Product added successfully");

      setProductForm(emptyProduct);
      setShowProductForm(false);

      await loadAllData();

    } catch (error) {
      console.error(error);
    }
  };

  const updateProduct = async (e) => {
    e.preventDefault();

    try {
      const response = await apiRequest(
        `${API}/products/${editingProduct.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            name: editingProduct.name,
            description: editingProduct.description,
            sku: editingProduct.sku,
            price: Number(editingProduct.price),
            quantity: Number(editingProduct.quantity),
            category: {
              id: editingProduct.category?.id || 2
            }
          })
        }
      );

      if (!response.ok) {
        alert("Could not update product");
        return;
      }

      alert("Product updated successfully");

      setEditingProduct(null);

      await loadAllData();

    } catch (error) {
      console.error(error);
    }
  };

  const deleteProduct = async (id) => {
    if (user?.role !== "ADMIN") {
      alert("Only Admin can delete products");
      return;
    }

    if (!window.confirm("Delete this product?")) {
      return;
    }

    try {
      const response = await apiRequest(
        `${API}/products/${id}`,
        {
          method: "DELETE"
        }
      );

      if (response.ok) {
        alert("Product deleted");
        await loadAllData();
      } else {
        alert("Could not delete product");
      }

    } catch (error) {
      console.error(error);
    }
  };

  // =========================
  // CATEGORY
  // =========================

  const saveCategory = async (e) => {
  e.preventDefault();

  try {
    const response = await apiRequest(`${API}/categories`, {
      method: "POST",
      body: JSON.stringify({
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim()
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Category error:", errorText);
      alert(`Could not add category: ${errorText}`);
      return;
    }

    const createdCategory = await response.json();

    console.log("Category created:", createdCategory);

    // Immediately add the new category to the screen
    setCategories((current) => [
      ...current,
      createdCategory
    ]);

    setCategoryForm({
      name: "",
      description: ""
    });

    setShowCategoryForm(false);

    alert("Category added successfully!");

  } catch (error) {
    console.error("Category save error:", error);
    alert("Cannot connect to Spring Boot server.");
  }
};

  const deleteCategory = async (id) => {
    if (user?.role !== "ADMIN") {
      alert("Only Admin can delete categories");
      return;
    }

    if (!window.confirm("Delete this category?")) {
      return;
    }

    try {
      const response = await apiRequest(
        `${API}/categories/${id}`,
        {
          method: "DELETE"
        }
      );

      if (response.ok) {
        alert("Category deleted");
        await loadAllData();
      } else {
        alert("Could not delete category");
      }

    } catch (error) {
      console.error(error);
    }
  };

  // =========================
  // SUPPLIER
  // =========================

  const saveSupplier = async (e) => {
    e.preventDefault();

    try {
      const response = await apiRequest(`${API}/suppliers`, {
        method: "POST",
        body: JSON.stringify(supplierForm)
      });

      if (!response.ok) {
        alert("Could not add supplier");
        return;
      }

      alert("Supplier added successfully");

      setSupplierForm({
        name: "",
        email: "",
        phone: "",
        address: ""
      });

      setShowSupplierForm(false);

      await loadAllData();

    } catch (error) {
      console.error(error);
    }
  };

  const deleteSupplier = async (id) => {
    if (user?.role !== "ADMIN") {
      alert("Only Admin can delete suppliers");
      return;
    }

    if (!window.confirm("Delete this supplier?")) {
      return;
    }

    try {
      const response = await apiRequest(
        `${API}/suppliers/${id}`,
        {
          method: "DELETE"
        }
      );

      if (response.ok) {
        alert("Supplier deleted");
        await loadAllData();
      } else {
        alert("Could not delete supplier");
      }

    } catch (error) {
      console.error(error);
    }
  };

  // =========================
  // PURCHASE
  // =========================

  const savePurchase = async (e) => {
    e.preventDefault();

    try {
      const response = await apiRequest(`${API}/purchases`, {
        method: "POST",
        body: JSON.stringify({
          product: {
            id: Number(purchaseForm.productId)
          },
          supplier: {
            id: Number(purchaseForm.supplierId)
          },
          quantity: Number(purchaseForm.quantity),
          totalPrice: Number(purchaseForm.totalPrice)
        })
      });

      if (!response.ok) {
        alert("Could not create purchase");
        return;
      }

      alert("Purchase created successfully");

      setPurchaseForm({
        productId: "",
        supplierId: "",
        quantity: "",
        totalPrice: ""
      });

      setShowPurchaseForm(false);

      await loadAllData();

    } catch (error) {
      console.error(error);
    }
  };

  // =========================
  // SALE
  // =========================

  const saveSale = async (e) => {
    e.preventDefault();

    try {
      const response = await apiRequest(`${API}/sales`, {
        method: "POST",
        body: JSON.stringify({
          product: {
            id: Number(saleForm.productId)
          },
          quantity: Number(saleForm.quantity),
          totalPrice: Number(saleForm.totalPrice)
        })
      });

      if (!response.ok) {
        alert("Could not create sale");
        return;
      }

      alert("Sale created successfully");

      setSaleForm({
        productId: "",
        quantity: "",
        totalPrice: ""
      });

      setShowSaleForm(false);

      await loadAllData();

    } catch (error) {
      console.error(error);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  // =========================
  // DASHBOARD CALCULATIONS
  // =========================

  const totalSalesAmount = sales.reduce(
    (total, sale) => total + Number(sale.totalPrice || 0),
    0
  );

  const totalPurchaseAmount = purchases.reduce(
    (total, purchase) => total + Number(purchase.totalPrice || 0),
    0
  );

  const totalStockQuantity = products.reduce(
    (total, product) => total + Number(product.quantity || 0),
    0
  );

  const totalStockValue = products.reduce(
    (total, product) =>
      total +
      Number(product.price || 0) * Number(product.quantity || 0),
    0
  );

  const chartData = products.slice(0, 10).map((product) => {
    const productSales = sales
      .filter((sale) => sale.product?.id === product.id)
      .reduce(
        (total, sale) => total + Number(sale.quantity || 0),
        0
      );

    const productPurchases = purchases
      .filter((purchase) => purchase.product?.id === product.id)
      .reduce(
        (total, purchase) => total + Number(purchase.quantity || 0),
        0
      );

    return {
      name:
        product.name?.length > 14
          ? `${product.name.substring(0, 14)}...`
          : product.name || "Product",
      sales: productSales,
      purchases: productPurchases
    };
  });

  // =========================
  // LOGIN PAGE
  // =========================

  if (!loggedIn) {
    return (
      <div className="login-page">

        <div className="login-card">

          <div className="login-logo">
            📦
          </div>

          <h1>Inventory Management</h1>

          <p className="login-subtitle">
            Sign in to manage your inventory
          </p>

          <form onSubmit={login}>

            <label>Username</label>

            <input
              type="text"
              placeholder="Enter username"
              value={loginForm.username}
              required
              onChange={(e) =>
                setLoginForm({
                  ...loginForm,
                  username: e.target.value
                })
              }
            />

            <label>Password</label>

            <input
              type="password"
              placeholder="Enter password"
              value={loginForm.password}
              required
              onChange={(e) =>
                setLoginForm({
                  ...loginForm,
                  password: e.target.value
                })
              }
            />

            {loginError && (
              <div className="login-error">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="login-btn"
              disabled={loginLoading}
            >
              {loginLoading ? "Signing in..." : "Login"}
            </button>

          </form>

        </div>

      </div>
    );
  }

  // =========================
  // MAIN APPLICATION
  // =========================

  return (
    <div className="app">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <h1>📦 Inventory</h1>

        <div className="user-box">
          <div>👤 {user?.username}</div>
          <small>
            Role: {user?.role}
          </small>
        </div>

        <nav>

          <button
            className={page === "dashboard" ? "active-menu" : ""}
            onClick={() => setPage("dashboard")}
          >
            🏠 Dashboard
          </button>

          <button
            className={page === "products" ? "active-menu" : ""}
            onClick={() => setPage("products")}
          >
            📦 Products
          </button>

          <button
            className={page === "categories" ? "active-menu" : ""}
            onClick={() => setPage("categories")}
          >
            📁 Categories
          </button>

          <button
            className={page === "suppliers" ? "active-menu" : ""}
            onClick={() => setPage("suppliers")}
          >
            🏢 Suppliers
          </button>

          <button
            className={page === "purchases" ? "active-menu" : ""}
            onClick={() => setPage("purchases")}
          >
            🛒 Purchases
          </button>

          <button
            className={page === "sales" ? "active-menu" : ""}
            onClick={() => setPage("sales")}
          >
            💰 Sales
          </button>

          <button
            className={page === "stock" ? "active-menu" : ""}
            onClick={() => setPage("stock")}
          >
            📊 Stock
          </button>

        </nav>

        <button
          className="logout-btn"
          onClick={logout}
        >
          🚪 Logout
        </button>

      </aside>

      {/* MAIN */}

      <main className="main">

        {/* DASHBOARD */}

        {page === "dashboard" && (
          <>
            <header>
              <div>
                <h2>Inventory Dashboard</h2>
                <p>Welcome, {user?.username}</p>
              </div>

              <button
                className="refresh"
                onClick={loadAllData}
              >
                ↻ Refresh
              </button>
            </header>

            {/* SUMMARY CARDS */}
            <section className="cards">
              <div className="card">
                <span>📦</span>
                <div>
                  <p>Total Products</p>
                  <h3>{products.length}</h3>
                </div>
              </div>

              <div className="card">
                <span>📁</span>
                <div>
                  <p>Categories</p>
                  <h3>{categories.length}</h3>
                </div>
              </div>

              <div className="card">
                <span>🏢</span>
                <div>
                  <p>Suppliers</p>
                  <h3>{suppliers.length}</h3>
                </div>
              </div>

              <div className="card">
                <span>🛒</span>
                <div>
                  <p>Purchase Orders</p>
                  <h3>{purchases.length}</h3>
                </div>
              </div>

              <div className="card">
                <span>💰</span>
                <div>
                  <p>Sales Orders</p>
                  <h3>{sales.length}</h3>
                </div>
              </div>

              <div className="card">
                <span>⚠️</span>
                <div>
                  <p>Low Stock</p>
                  <h3>{lowStock.length}</h3>
                </div>
              </div>

              <div className="card">
                <span>📊</span>
                <div>
                  <p>Stock Quantity</p>
                  <h3>{totalStockQuantity}</h3>
                </div>
              </div>

              <div className="card">
                <span>💎</span>
                <div>
                  <p>Stock Value</p>
                  <h3>₹{totalStockValue.toLocaleString()}</h3>
                </div>
              </div>
            </section>

            {/* FINANCIAL SUMMARY */}
            <section className="cards">
              <div className="card">
                <span>💵</span>
                <div>
                  <p>Total Sales Value</p>
                  <h3>₹{totalSalesAmount.toLocaleString()}</h3>
                </div>
              </div>

              <div className="card">
                <span>🧾</span>
                <div>
                  <p>Total Purchase Value</p>
                  <h3>₹{totalPurchaseAmount.toLocaleString()}</h3>
                </div>
              </div>

              
            </section>

            {/* SALES VS PURCHASES CHART */}
            <section className="panel">
              <h3>Sales vs Purchases</h3>

              {chartData.length === 0 ? (
                <p>No product transaction data available yet.</p>
              ) : (
                <div style={{ width: "100%", height: 450 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{
                        top: 20,
                        right: 20,
                        left: 10,
                        bottom: 60
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        interval={0}
                        tick={{ fontSize: 12 }}
                        height={70}
                      />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend 
                      verticalAlign="bottom"
                      height={40}
                       />
                      <Bar
                        dataKey="sales"
                        name="Sold Quantity"
                        fill="#2563eb"
                        radius={[5, 5, 0, 0]}
                      />
                      <Bar
                        dataKey="purchases"
                        name="Purchased Quantity"
                        fill="#16a34a"
                        radius={[5, 5, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>

            {/* PRODUCTS */}
            <section className="panel">
              <h3>Products</h3>

              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>SKU</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="5">No products available</td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product.id}>
                        <td>{product.name}</td>
                        <td>{product.sku}</td>
                        <td>₹{Number(product.price || 0).toLocaleString()}</td>
                        <td>{product.quantity}</td>
                        <td>
                          {Number(product.quantity || 0) <= 5 ? (
                            <span className="low-stock">
                              ⚠ Low Stock
                            </span>
                          ) : (
                            <span className="success">
                              ✓ In Stock
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </section>

            {/* LOW STOCK */}
            <section className="panel">
              <h3>Low Stock Products</h3>

              {lowStock.length === 0 ? (
                <p className="success">
                  ✓ No low-stock products
                </p>
              ) : (
                lowStock.map((product) => (
                  <div
                    className="low-stock"
                    key={product.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "12px 0"
                    }}
                  >
                    <strong>{product.name}</strong>
                    <span>{product.quantity} left</span>
                  </div>
                ))
              )}
            </section>

            {/* RECENT SALES */}
            <section className="panel">
              <h3>Recent Sales</h3>

              {sales.length === 0 ? (
                <p>No sales recorded yet.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.slice(-5).reverse().map((sale) => (
                      <tr key={sale.id}>
                        <td>{sale.id}</td>
                        <td>{sale.product?.name || "-"}</td>
                        <td>{sale.quantity}</td>
                        <td>
                          ₹{Number(sale.totalPrice || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          </>
        )}

        {/* PRODUCTS */}

        {page === "products" && (
          <>
            <header>

              <div>
                <h2>Products</h2>
                <p>Manage your inventory products</p>
              </div>

              <button
                className="refresh"
                onClick={() => {
                  setProductForm(emptyProduct);
                  setShowProductForm(true);
                }}
              >
                + Add Product
              </button>

            </header>

            <section className="panel">

              <input
                className="search"
                placeholder="Search products..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

              <table>

                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>SKU</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredProducts.map((product) => (
                    <tr key={product.id}>

                      <td>{product.id}</td>
                      <td>{product.name}</td>
                      <td>{product.sku}</td>
                      <td>₹{product.price}</td>
                      <td>{product.quantity}</td>

                      <td>

                        <button
                          className="edit-btn"
                          onClick={() =>
                            setEditingProduct({
                              ...product
                            })
                          }
                        >
                          Edit
                        </button>

                        {user?.role === "ADMIN" && (
                          <button
                            className="delete-btn"
                            onClick={() =>
                              deleteProduct(product.id)
                            }
                          >
                            Delete
                          </button>
                        )}

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </section>

            {/* ADD PRODUCT MODAL */}

            {showProductForm && (
              <div className="modal">

                <div className="modal-content">

                  <h2>Add Product</h2>

                  <form onSubmit={saveProduct}>

                    <input
                      placeholder="Product name"
                      required
                      value={productForm.name}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          name: e.target.value
                        })
                      }
                    />

                    <input
                      placeholder="Description"
                      value={productForm.description}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          description: e.target.value
                        })
                      }
                    />

                    <input
                      placeholder="SKU"
                      required
                      value={productForm.sku}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          sku: e.target.value
                        })
                      }
                    />

                    <input
                      type="number"
                      placeholder="Price"
                      required
                      value={productForm.price}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          price: e.target.value
                        })
                      }
                    />

                    <input
                      type="number"
                      placeholder="Quantity"
                      required
                      value={productForm.quantity}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          quantity: e.target.value
                        })
                      }
                    />

                    <div className="form-buttons">

                      <button
                        type="submit"
                        className="save-btn"
                      >
                        Save Product
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setShowProductForm(false)
                        }
                      >
                        Cancel
                      </button>

                    </div>

                  </form>

                </div>

              </div>
            )}

            {/* EDIT PRODUCT MODAL */}

            {editingProduct && (
              <div className="modal">

                <div className="modal-content">

                  <h2>Edit Product</h2>

                  <form onSubmit={updateProduct}>

                    <input
                      value={editingProduct.name}
                      required
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          name: e.target.value
                        })
                      }
                    />

                    <input
                      value={
                        editingProduct.description || ""
                      }
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          description: e.target.value
                        })
                      }
                    />

                    <input
                      value={editingProduct.sku}
                      required
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          sku: e.target.value
                        })
                      }
                    />

                    <input
                      type="number"
                      value={editingProduct.price}
                      required
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          price: e.target.value
                        })
                      }
                    />

                    <input
                      type="number"
                      value={editingProduct.quantity}
                      required
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          quantity: e.target.value
                        })
                      }
                    />

                    <div className="form-buttons">

                      <button
                        type="submit"
                        className="save-btn"
                      >
                        Update Product
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setEditingProduct(null)
                        }
                      >
                        Cancel
                      </button>

                    </div>

                  </form>

                </div>

              </div>
            )}

          </>
        )}

        {/* CATEGORIES */}

        {page === "categories" && (
          <>
            <header>

              <div>
                <h2>Categories</h2>
                <p>Manage product categories</p>
              </div>

              <button
                className="refresh"
                onClick={() =>
                  setShowCategoryForm(true)
                }
              >
                + Add Category
              </button>

            </header>

            <section className="panel">

              <table>

                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>

                  {categories.map((category) => (
                    <tr key={category.id}>

                      <td>{category.id}</td>
                      <td>{category.name}</td>
                      <td>{category.description}</td>

                      <td>

                        {user?.role === "ADMIN" && (
                          <button
                            className="delete-btn"
                            onClick={() =>
                              deleteCategory(category.id)
                            }
                          >
                            Delete
                          </button>
                        )}

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </section>

            {showCategoryForm && (
              <div className="modal">

                <div className="modal-content">

                  <h2>Add Category</h2>

                  <form onSubmit={saveCategory}>

                    <input
                      placeholder="Category name"
                      required
                      value={categoryForm.name}
                      onChange={(e) =>
                        setCategoryForm({
                          ...categoryForm,
                          name: e.target.value
                        })
                      }
                    />

                    <input
                      placeholder="Description"
                      value={categoryForm.description}
                      onChange={(e) =>
                        setCategoryForm({
                          ...categoryForm,
                          description: e.target.value
                        })
                      }
                    />

                    <div className="form-buttons">

                      <button
                        type="submit"
                        className="save-btn"
                      >
                        Save Category
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setShowCategoryForm(false)
                        }
                      >
                        Cancel
                      </button>

                    </div>

                  </form>

                </div>

              </div>
            )}

          </>
        )}

        {/* SUPPLIERS */}

        {page === "suppliers" && (
          <>
            <header>

              <div>
                <h2>Suppliers</h2>
                <p>Manage your suppliers</p>
              </div>

              <button
                className="refresh"
                onClick={() =>
                  setShowSupplierForm(true)
                }
              >
                + Add Supplier
              </button>

            </header>

            <section className="panel">

              <table>

                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>

                  {suppliers.map((supplier) => (
                    <tr key={supplier.id}>

                      <td>{supplier.id}</td>
                      <td>{supplier.name}</td>
                      <td>{supplier.email}</td>
                      <td>{supplier.phone}</td>
                      <td>{supplier.address}</td>

                      <td>

                        {user?.role === "ADMIN" && (
                          <button
                            className="delete-btn"
                            onClick={() =>
                              deleteSupplier(supplier.id)
                            }
                          >
                            Delete
                          </button>
                        )}

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </section>

            {showSupplierForm && (
              <div className="modal">

                <div className="modal-content">

                  <h2>Add Supplier</h2>

                  <form onSubmit={saveSupplier}>

                    <input
                      placeholder="Supplier name"
                      required
                      value={supplierForm.name}
                      onChange={(e) =>
                        setSupplierForm({
                          ...supplierForm,
                          name: e.target.value
                        })
                      }
                    />

                    <input
                      type="email"
                      placeholder="Email"
                      value={supplierForm.email}
                      onChange={(e) =>
                        setSupplierForm({
                          ...supplierForm,
                          email: e.target.value
                        })
                      }
                    />

                    <input
                      placeholder="Phone"
                      value={supplierForm.phone}
                      onChange={(e) =>
                        setSupplierForm({
                          ...supplierForm,
                          phone: e.target.value
                        })
                      }
                    />

                    <input
                      placeholder="Address"
                      value={supplierForm.address}
                      onChange={(e) =>
                        setSupplierForm({
                          ...supplierForm,
                          address: e.target.value
                        })
                      }
                    />

                    <div className="form-buttons">

                      <button
                        type="submit"
                        className="save-btn"
                      >
                        Save Supplier
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setShowSupplierForm(false)
                        }
                      >
                        Cancel
                      </button>

                    </div>

                  </form>

                </div>

              </div>
            )}

          </>
        )}

        {/* PURCHASES */}

        {page === "purchases" && (
          <>
            <header>

              <div>
                <h2>Purchases</h2>
                <p>Record purchases from suppliers</p>
              </div>

              <button
                className="refresh"
                onClick={() =>
                  setShowPurchaseForm(true)
                }
              >
                + New Purchase
              </button>

            </header>

            <section className="panel">

              <table>

                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Product</th>
                    <th>Supplier</th>
                    <th>Quantity</th>
                    <th>Total Price</th>
                  </tr>
                </thead>

                <tbody>

                  {purchases.map((purchase) => (
                    <tr key={purchase.id}>

                      <td>{purchase.id}</td>

                      <td>
                        {purchase.product?.name || "-"}
                      </td>

                      <td>
                        {purchase.supplier?.name || "-"}
                      </td>

                      <td>{purchase.quantity}</td>

                      <td>
                        ₹{purchase.totalPrice}
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </section>

            {showPurchaseForm && (
              <div className="modal">

                <div className="modal-content">

                  <h2>New Purchase</h2>

                  <form onSubmit={savePurchase}>

                    <select
                      required
                      value={purchaseForm.productId}
                      onChange={(e) =>
                        setPurchaseForm({
                          ...purchaseForm,
                          productId: e.target.value
                        })
                      }
                    >

                      <option value="">
                        Select Product
                      </option>

                      {products.map((product) => (
                        <option
                          key={product.id}
                          value={product.id}
                        >
                          {product.name}
                        </option>
                      ))}

                    </select>

                    <select
                      required
                      value={purchaseForm.supplierId}
                      onChange={(e) =>
                        setPurchaseForm({
                          ...purchaseForm,
                          supplierId: e.target.value
                        })
                      }
                    >

                      <option value="">
                        Select Supplier
                      </option>

                      {suppliers.map((supplier) => (
                        <option
                          key={supplier.id}
                          value={supplier.id}
                        >
                          {supplier.name}
                        </option>
                      ))}

                    </select>

                    <input
                      type="number"
                      placeholder="Quantity"
                      required
                      value={purchaseForm.quantity}
                      onChange={(e) =>
                        setPurchaseForm({
                          ...purchaseForm,
                          quantity: e.target.value
                        })
                      }
                    />

                    <input
                      type="number"
                      placeholder="Total Price"
                      required
                      value={purchaseForm.totalPrice}
                      onChange={(e) =>
                        setPurchaseForm({
                          ...purchaseForm,
                          totalPrice: e.target.value
                        })
                      }
                    />

                    <div className="form-buttons">

                      <button
                        type="submit"
                        className="save-btn"
                      >
                        Save Purchase
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setShowPurchaseForm(false)
                        }
                      >
                        Cancel
                      </button>

                    </div>

                  </form>

                </div>

              </div>
            )}

          </>
        )}

        {/* SALES */}

        {page === "sales" && (
          <>
            <header>

              <div>
                <h2>Sales</h2>
                <p>Record product sales</p>
              </div>

              <button
                className="refresh"
                onClick={() =>
                  setShowSaleForm(true)
                }
              >
                + New Sale
              </button>

            </header>

            <section className="panel">

              <table>

                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Total Price</th>
                  </tr>
                </thead>

                <tbody>

                  {sales.map((sale) => (
                    <tr key={sale.id}>

                      <td>{sale.id}</td>

                      <td>
                        {sale.product?.name || "-"}
                      </td>

                      <td>{sale.quantity}</td>

                      <td>
                        ₹{sale.totalPrice}
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </section>

            {showSaleForm && (
              <div className="modal">

                <div className="modal-content">

                  <h2>New Sale</h2>

                  <form onSubmit={saveSale}>

                    <select
                      required
                      value={saleForm.productId}
                      onChange={(e) =>
                        setSaleForm({
                          ...saleForm,
                          productId: e.target.value
                        })
                      }
                    >

                      <option value="">
                        Select Product
                      </option>

                      {products.map((product) => (
                        <option
                          key={product.id}
                          value={product.id}
                        >
                          {product.name}
                        </option>
                      ))}

                    </select>

                    <input
                      type="number"
                      placeholder="Quantity"
                      required
                      value={saleForm.quantity}
                      onChange={(e) =>
                        setSaleForm({
                          ...saleForm,
                          quantity: e.target.value
                        })
                      }
                    />

                    <input
                      type="number"
                      placeholder="Total Price"
                      required
                      value={saleForm.totalPrice}
                      onChange={(e) =>
                        setSaleForm({
                          ...saleForm,
                          totalPrice: e.target.value
                        })
                      }
                    />

                    <div className="form-buttons">

                      <button
                        type="submit"
                        className="save-btn"
                      >
                        Save Sale
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setShowSaleForm(false)
                        }
                      >
                        Cancel
                      </button>

                    </div>

                  </form>

                </div>

              </div>
            )}

          </>
        )}

        {/* STOCK */}

        {page === "stock" && (
          <>
            <header>

              <div>
                <h2>Stock</h2>
                <p>View current inventory stock</p>
              </div>

              <button
                className="refresh"
                onClick={loadAllData}
              >
                ↻ Refresh
              </button>

            </header>

            <section className="panel">

              <table>

                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Updated</th>
                  </tr>
                </thead>

                <tbody>

                  {stock.map((item) => (
                    <tr key={item.id}>

                      <td>{item.id}</td>

                      <td>
                        {item.product?.name || "-"}
                      </td>

                      <td>{item.quantity}</td>

                      <td>
                        {item.updatedAt
                          ? new Date(
                              item.updatedAt
                            ).toLocaleString()
                          : "-"}
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </section>
          </>
        )}

      </main>

    </div>
  );
}

export default App;
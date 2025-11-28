// src/App.jsx
import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import ProductsPage from "./pages/ProductsPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Checkout from "./pages/Checkout.jsx";
import OrderSuccess from "./pages/OrderSuccess.jsx";
import BuyerDashboard from "./pages/BuyerDashboard";
import SellerDashboard from "./pages/SellerDashboard";
import SellerRegistration from "./pages/SellerRegistration";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import ShippingPolicy from "./pages/ShippingPolicy";

import "./styles.css";

const API_BASE = "http://localhost:5000/api";

/* -----------------------------
   MainApp — your full front page
-------------------------------- */
function MainApp() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // UI state
  const [currentView, setCurrentView] = useState("home"); // "home" | "categories" | "products" | "product-detail" | "wishlist" | "cart"
  const [userRole, setUserRole] = useState("buyer");

  // Catalog state
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [searchTerm, setSearchTerm] = useState("");

  // Cart / wishlist
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  // Tracking
  const [trackingNumber, setTrackingNumber] = useState("");

  // Reviews (kept as-is, optional)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProductForReview, setSelectedProductForReview] = useState(null);

  // sample categories (for landing grid)
  const sampleCategories = [
    { id: 1, name: "Traditional Clothing", description: "Sarees, Kurtas, Sherwanis" },
    { id: 2, name: "Handicrafts", description: "Artisanal Creations" },
    { id: 3, name: "Spices & Food Items", description: "Authentic Indian Taste" },
    { id: 4, name: "Jewelry & Accessories", description: "Traditional Designs" },
    { id: 5, name: "Home & Living", description: "Decor & Furniture" },
  ];

  // load persisted cart/wishlist
  useEffect(() => {
    setCategories(sampleCategories);
    const savedCart = localStorage.getItem("indiaPostCart");
    const savedWishlist = localStorage.getItem("indiaPostWishlist");
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
  }, []);

  /* -----------------------------
     Catalog helpers
  -------------------------------- */
  const fetchProductsByCategory = async (categoryName) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/products`);
      const all = Array.isArray(res.data) ? res.data : [];
      const filtered = all
        .filter((p) => p.category === categoryName)
        .map((p) => ({ ...p, inWishlist: wishlist.some((w) => w._id === p._id) }));
      setProducts(filtered);
    } catch {
      // fallback sample data for quick demo
      const sample = {
        "Traditional Clothing": [
          {
            _id: "1",
            name: "Banarasi Silk Saree",
            description: "Pure silk saree with traditional zari work from Varanasi, Uttar Pradesh",
            price: 8999,
            category: "Traditional Clothing",
            image:
              "https://prithacrafts.com/wp-content/uploads/2020/12/NTS3737-Pure_Silk_Lined_Banarasi_Saree_Red-111_1000x.jpg",
            seller: "Varanasi Weavers",
            region: "Uttar Pradesh",
          },
          {
            _id: "2",
            name: "Kanjivaram Silk Saree",
            description: "Traditional Kanjivaram silk from Tamil Nadu with temple border",
            price: 12999,
            category: "Traditional Clothing",
            image:
              "https://tse3.mm.bing.net/th/id/OIP.C_EC6ZNxzxKdg0I7sV5rngHaJ4?cb=12&rs=1&pid=ImgDetMain&o=7&rm=3",
            seller: "Kanchipuram Artisans",
            region: "Tamil Nadu",
          },
        ],
      };
      const filtered = (sample[categoryName] || []).map((p) => ({
        ...p,
        inWishlist: wishlist.some((w) => w._id === p._id),
      }));
      setProducts(filtered);
    } finally {
      setSelectedCategory(categoryName);
      setCurrentView("products");
      setLoading(false);
    }
  };

  /* -----------------------------
     Common handlers
  -------------------------------- */
  const handleExploreProducts = () => setCurrentView("categories");
  const handleCategoryClick = (cat) => fetchProductsByCategory(cat.name);
  const handleSearch = (e) => setSearchTerm(e.target.value);
  const handleBackToHome = () => {
    setCurrentView("home");
    setProducts([]);
    setSelectedCategory("");
    setSearchTerm("");
  };
  const handleBackToCategories = () => {
    setCurrentView("categories");
    setSelectedCategory("");
    setSearchTerm("");
  };

  const handleRoleChange = (e) => {
    const chosen = e.target.value;
    setUserRole(chosen);
    if (chosen === "seller") {
      // steer sellers to correct place
      if (user?.role === "seller") {
        if (user.isSellerVerified) navigate("/seller-dashboard");
        else navigate("/seller-registration");
      } else {
        navigate("/register"); // must register as seller first
      }
    }
  };

  // STRICT: 2 letters + 9 digits + 2 letters (13 total)
  const handleTrackPackage = () => {
    const re = /^[A-Za-z]{2}\d{9}[A-Za-z]{2}$/;
    if (!re.test(trackingNumber)) {
      alert("Enter a tracking number like AB123456789XY (2 letters + 9 digits + 2 letters).");
      return;
    }
    alert(`Tracking ${trackingNumber} — In transit with India Post`);
  };

  // Add to cart / wishlist — redirect to login when unauthenticated (per requirement)
  const handleAddToCart = (product) => {
    if (!user) {
      navigate("/login");
      return;
    }
    const newCart = [...cart, { ...product, cartId: Date.now() }];
    setCart(newCart);
    localStorage.setItem("indiaPostCart", JSON.stringify(newCart));
    alert(`Added ${product.name} to cart`);
  };

  const handleAddToWishlist = (product) => {
    if (!user) {
      navigate("/login");
      return;
    }
    const isIn = wishlist.some((w) => w._id === product._id);
    if (isIn) {
      const nw = wishlist.filter((w) => w._id !== product._id);
      setWishlist(nw);
      localStorage.setItem("indiaPostWishlist", JSON.stringify(nw));
      setProducts((ps) => ps.map((p) => (p._id === product._id ? { ...p, inWishlist: false } : p)));
    } else {
      const nw = [...wishlist, { ...product, wishlistId: Date.now() }];
      setWishlist(nw);
      localStorage.setItem("indiaPostWishlist", JSON.stringify(nw));
      setProducts((ps) => ps.map((p) => (p._id === product._id ? { ...p, inWishlist: true } : p)));
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    if (!user) {
      navigate("/login");
      return;
    }
    // ensure cart persists and go to /checkout
    localStorage.setItem("indiaPostCart", JSON.stringify(cart));
    navigate("/checkout");
  };

  const filteredAndSortedProducts = products
    .filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "price") return a.price - b.price;
      if (sortBy === "seller") return (a.seller || "").localeCompare(b.seller || "");
      return a.name.localeCompare(b.name);
    });

  const getCartCount = () => cart.length;
  const getWishlistCount = () => wishlist.length;

  /* -----------------------------
     FULL STYLED VIEWS
  -------------------------------- */

  // HOME
  if (currentView === "home") {
    return (
      <div className="home-container">
        <header className="indian-header">
          <div className="header-content">
            <div className="logo-container">
              <div className="logo-fallback">
                <div className="logo-placeholder">
                  <span className="logo-text">🇮🇳</span>
                  <span className="logo-text">India Post</span>
                </div>
              </div>
              <div className="title-container">
                <h1>India Post</h1>
                <p className="tagline">A Bridge for Indian Diaspora to Access Things Indian</p>
              </div>
            </div>

            <div className="header-actions">
              {user ? (
                <>
                  <div className="role-selector">
                    <select value={userRole} onChange={handleRoleChange} className="role-dropdown">
                      <option value="buyer">👤 Buyer</option>
                      <option value="seller">🏪 Seller</option>
                    </select>
                  </div>
                  <button className="wishlist-btn" onClick={() => setCurrentView("wishlist")}>
                    ❤️ Wishlist ({getWishlistCount()})
                  </button>
                  <button className="cart-btn" onClick={() => setCurrentView("cart")}>
                    🛒 Cart ({getCartCount()})
                  </button>
                  <button className="auth-btn" onClick={logout}>🚪 Logout</button>
                  <span className="user-greeting">Hello, {user.name}</span>
                </>
              ) : (
                <>
                  <button className="auth-btn" onClick={() => navigate("/login")}>🔐 Login</button>
                  <button className="auth-btn" onClick={() => navigate("/register")}>📝 Register</button>
                </>
              )}
            </div>
          </div>
        </header>

        <section className="hero-section">
          <div className="hero-background">
            <div className="hero-content">
              <h1>Building a Community of Indian Diaspora</h1>
              <p>Connecting PIOs with local sellers, MSMEs & Artisans for authentic Indian products</p>

              {/* NON-CLICKABLE four pills */}
              <div className="features-grid">
                <div className="feature-item" style={{ pointerEvents: "none" }}>Traditional & Ethnic Products</div>
                <div className="feature-item" style={{ pointerEvents: "none" }}>Handicrafts & Artisanal Goods</div>
                <div className="feature-item" style={{ pointerEvents: "none" }}>Delivered via India Post</div>
                <div className="feature-item" style={{ pointerEvents: "none" }}>Global Access to Indian Heritage</div>
              </div>

              <button className="cta-button" onClick={handleExploreProducts}>
                <strong>Explore Products</strong>
              </button>
            </div>
          </div>
        </section>

        {/* Tracking */}
        <section className="tracking-section">
          <div className="tracking-container">
            <h3>Track Your India Post Delivery</h3>
            <div className="tracking-input">
              <input
                type="text"
                placeholder="Enter tracking number (e.g., AB123456789XY)"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                maxLength={13}
              />
              <button onClick={handleTrackPackage}>Track Package</button>
            </div>
            <p className="tracking-format">Format: 2 letters + 9 numbers + 2 letters</p>
          </div>
        </section>

        {/* Testimonials */}
        <section className="testimonials-section">
          <h3>What Our Diaspora Community Says</h3>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <p>"Finally found authentic spices from my hometown! The quality is amazing."</p>
              <div className="testimonial-author">
                <strong>- Priya Sharma</strong>
                <span>London, UK</span>
              </div>
            </div>
            <div className="testimonial-card">
              <p>"The handicrafts remind me of my childhood in India. Truly authentic!"</p>
              <div className="testimonial-author">
                <strong>- Raj Patel</strong>
                <span>New York, USA</span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="india-post-footer">
          <div className="footer-content">
            <div className="footer-section">
              <div className="footer-logo">
                <span className="footer-logo-icon">🇮🇳</span>
                <h3>India Post</h3>
              </div>
              <p className="footer-tagline">Connecting the Indian Diaspora with Authentic Heritage</p>
              <div className="social-links">
                <span className="social-link" style={{ pointerEvents: "none" }}>📘</span>
                <span className="social-link" style={{ pointerEvents: "none" }}>🐦</span>
                <span className="social-link" style={{ pointerEvents: "none" }}>📷</span>
                <span className="social-link" style={{ pointerEvents: "none" }}>💼</span>
              </div>
            </div>

            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul className="footer-links">
                <li><a href="#" onClick={handleBackToHome}>Home</a></li>
                <li><a href="#" onClick={() => setCurrentView("categories")}>Shop</a></li>
                <li><a href="#" onClick={() => (user ? navigate("/seller-registration") : navigate("/register"))}>Sell with Us</a></li>
                <li><a href="#" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Track Order</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Categories</h4>
              <ul className="footer-links">
                <li><a href="#" onClick={() => fetchProductsByCategory("Traditional Clothing")}>Traditional Clothing</a></li>
                <li><a href="#" onClick={() => fetchProductsByCategory("Handicrafts")}>Handicrafts</a></li>
                <li><a href="#" onClick={() => fetchProductsByCategory("Spices & Food Items")}>Spices & Food</a></li>
                <li><a href="#" onClick={() => fetchProductsByCategory("Jewelry & Accessories")}>Jewelry</a></li>
                <li><a href="#" onClick={() => fetchProductsByCategory("Home & Living")}>Home & Living</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Contact & Support</h4>
              <div className="contact-info">
                <p>📞 +91-1800-266-6868</p>
                <p>✉️ support@indiapostdiaspora.com</p>
                <p>🕒 Mon-Sat: 9AM-6PM IST</p>
                <p>🌐 24/7 Online Support</p>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-bottom-content">
              <p>© 2024 India Post Diaspora Connect. All rights reserved.</p>
              <div className="footer-legal">
                <a href="/privacy-policy">Privacy Policy</a>
                <a href="/terms-of-service">Terms of Service</a>
                <a href="/shipping-policy">Shipping Policy</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // CATEGORIES
  if (currentView === "categories") {
    return (
      <div className="home-container">
        <header className="indian-header">
          <div className="header-content">
            <div className="logo-container">
              <div className="logo-fallback">
                <div className="logo-placeholder" onClick={handleBackToHome} style={{ cursor: "pointer" }}>
                  <span className="logo-text">🇮🇳</span>
                  <span className="logo-text">India Post</span>
                </div>
              </div>
              <div className="title-container">
                <h1>India Post</h1>
                <p className="tagline">A Bridge for Indian Diaspora to Access Things Indian</p>
              </div>
            </div>

            <div className="header-actions">
              {user ? (
                <>
                  <div className="role-selector">
                    <select value={userRole} onChange={handleRoleChange} className="role-dropdown">
                      <option value="buyer">👤 Buyer</option>
                      <option value="seller">🏪 Seller</option>
                    </select>
                  </div>
                  <button className="wishlist-btn" onClick={() => setCurrentView("wishlist")}>
                    ❤️ Wishlist ({getWishlistCount()})
                  </button>
                  <button className="cart-btn" onClick={() => setCurrentView("cart")}>
                    🛒 Cart ({getCartCount()})
                  </button>
                  <button className="auth-btn" onClick={logout}>🚪 Logout</button>
                  <span className="user-greeting">Hello, {user.name}</span>
                </>
              ) : (
                <>
                  <button className="auth-btn" onClick={() => navigate("/login")}>🔐 Login</button>
                  <button className="auth-btn" onClick={() => navigate("/register")}>📝 Register</button>
                </>
              )}
            </div>
          </div>
        </header>

        <section className="categories-section">
          <div className="categories-header">
            <button className="back-button" onClick={handleBackToHome}>← Back to Home</button>
            <h1>Shop by Category</h1>
          </div>

          <div className="search-container">
            <input
              type="text"
              placeholder="Search products across all categories..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-bar"
            />
          </div>

          <div className="categories-grid-simple">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="category-card-simple"
                onClick={() => handleCategoryClick(cat)}
              >
                <h2>{cat.name}</h2>
                <p>{cat.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  // PRODUCTS
  if (currentView === "products") {
    return (
      <div className="home-container">
        <header className="indian-header">
          <div className="header-content">
            <div className="logo-container">
              <div className="logo-fallback">
                <div className="logo-placeholder" onClick={handleBackToHome} style={{ cursor: "pointer" }}>
                  <span className="logo-text">🇮🇳</span>
                  <span className="logo-text">India Post</span>
                </div>
              </div>
              <div className="title-container">
                <h1>{selectedCategory}</h1>
                <p className="tagline">Authentic Indian Products</p>
              </div>
            </div>

            <div className="header-actions">
              {user ? (
                <>
                  <div className="role-selector">
                    <select value={userRole} onChange={handleRoleChange} className="role-dropdown">
                      <option value="buyer">👤 Buyer</option>
                      <option value="seller">🏪 Seller</option>
                    </select>
                  </div>
                  <button className="wishlist-btn" onClick={() => setCurrentView("wishlist")}>
                    ❤️ Wishlist ({getWishlistCount()})
                  </button>
                  <button className="cart-btn" onClick={() => setCurrentView("cart")}>
                    🛒 Cart ({getCartCount()})
                  </button>
                  <button className="auth-btn" onClick={logout}>🚪 Logout</button>
                  <span className="user-greeting">Hello, {user.name}</span>
                </>
              ) : (
                <>
                  <button className="auth-btn" onClick={() => navigate("/login")}>🔐 Login</button>
                  <button className="auth-btn" onClick={() => navigate("/register")}>📝 Register</button>
                </>
              )}
            </div>
          </div>
        </header>

        <section className="products-section">
          <div className="products-header">
            <button className="back-button" onClick={handleBackToCategories}>← Back to Categories</button>
            <h3>Products in {selectedCategory}</h3>

            <div className="sort-container">
              <label>Sort by:</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="seller">Seller</option>
              </select>
            </div>
          </div>

          <div className="search-container">
            <input
              type="text"
              placeholder={`Search in ${selectedCategory}...`}
              value={searchTerm}
              onChange={handleSearch}
              className="search-bar"
            />
          </div>

          {loading ? (
            <div className="loading">Loading products...</div>
          ) : (
            <div className="products-grid">
              {filteredAndSortedProducts.map((product) => (
                <div
                  key={product._id}
                  className="product-card"
                  onClick={() => {
                    setSelectedProduct(product);
                    setCurrentView("product-detail");
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <div className="product-image">
                    <img src={product.image} alt={product.name} loading="lazy" />
                    <button
                      className={`wishlist-heart ${product.inWishlist ? "active" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToWishlist(product);
                      }}
                    >
                      {product.inWishlist ? "❤️" : "🤍"}
                    </button>
                  </div>
                  <div className="product-info">
                    <h4>{product.name}</h4>
                    <p className="product-description">{product.description}</p>
                    <p className="product-seller">By: {product.seller}</p>
                    <p className="product-price">₹{product.price}</p>
                    <div className="product-actions">
                      <button
                        className="add-to-cart-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    );
  }

  // PRODUCT DETAIL
  if (currentView === "product-detail" && selectedProduct) {
    return (
      <div className="home-container">
        <header className="indian-header">
          <div className="header-content">
            <div className="logo-container">
              <div className="logo-fallback">
                <div className="logo-placeholder" onClick={handleBackToHome} style={{ cursor: "pointer" }}>
                  <span className="logo-text">🇮🇳</span>
                  <span className="logo-text">India Post</span>
                </div>
              </div>
              <div className="title-container">
                <h1>Product Details</h1>
                <p className="tagline">Authentic Indian Heritage</p>
              </div>
            </div>

            <div className="header-actions">
              {user ? (
                <>
                  <div className="role-selector">
                    <select value={userRole} onChange={handleRoleChange} className="role-dropdown">
                      <option value="buyer">👤 Buyer</option>
                      <option value="seller">🏪 Seller</option>
                    </select>
                  </div>
                  <button className="wishlist-btn" onClick={() => setCurrentView("wishlist")}>
                    ❤️ Wishlist ({getWishlistCount()})
                  </button>
                  <button className="cart-btn" onClick={() => setCurrentView("cart")}>
                    🛒 Cart ({getCartCount()})
                  </button>
                  <button className="auth-btn" onClick={logout}>🚪 Logout</button>
                  <span className="user-greeting">Hello, {user.name}</span>
                </>
              ) : (
                <>
                  <button className="auth-btn" onClick={() => navigate("/login")}>🔐 Login</button>
                  <button className="auth-btn" onClick={() => navigate("/register")}>📝 Register</button>
                </>
              )}
            </div>
          </div>
        </header>

        <section className="product-detail-section">
          <div className="product-detail-header">
            <button className="back-button" onClick={() => setCurrentView("products")}>
              ← Back to Products
            </button>
          </div>

          <div className="product-detail-container">
            <div className="product-detail-image">
              <img src={selectedProduct.image} alt={selectedProduct.name} />
            </div>
            <div className="product-detail-info">
              <h1>{selectedProduct.name}</h1>
              <p className="product-detail-description">{selectedProduct.description}</p>
              <div className="product-detail-meta">
                <p className="product-detail-seller"><strong>By:</strong> {selectedProduct.seller}</p>
                <p className="product-detail-region"><strong>Region:</strong> {selectedProduct.region}</p>
                <p className="product-detail-category"><strong>Category:</strong> {selectedProduct.category}</p>
              </div>
              <div className="product-detail-price">₹{selectedProduct.price}</div>
              <div className="product-detail-actions">
                <button
                  className="add-to-cart-btn"
                  onClick={() => {
                    handleAddToCart(selectedProduct);
                    setCurrentView("products");
                  }}
                >
                  Add to Cart
                </button>
                <button
                  className={`wishlist-detail-btn ${selectedProduct.inWishlist ? "active" : ""}`}
                  onClick={() => handleAddToWishlist(selectedProduct)}
                >
                  {selectedProduct.inWishlist ? "❤️ Remove from Wishlist" : "🤍 Add to Wishlist"}
                </button>
              </div>

              {/* (Optional) Reviews trigger kept; route to login if needed */}
              <div className="reviews-section">
                <h3>Reviews ({selectedProduct.reviews?.length || 0})</h3>
                {selectedProduct.averageRating > 0 && (
                  <div className="average-rating">
                    Average Rating: {selectedProduct.averageRating.toFixed(1)} ⭐
                  </div>
                )}
                <button
                  className="add-review-btn"
                  onClick={() => {
                    if (!user) { navigate("/login"); return; }
                    setSelectedProductForReview(selectedProduct);
                    setShowReviewModal(true);
                  }}
                >
                  ✍️ Add Review
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Review modal */}
        {showReviewModal && selectedProductForReview && (
          <div className="modal-overlay">
            <div className="review-modal">
              <div className="modal-header">
                <h2>Add Review for {selectedProductForReview.name}</h2>
                <button className="close-btn" onClick={() => setShowReviewModal(false)}>×</button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("Demo: review submitted");
                  setShowReviewModal(false);
                  setReviewForm({ rating: 5, comment: "" });
                }}
              >
                <div className="rating-input">
                  <label>Rating:</label>
                  <select
                    value={reviewForm.rating}
                    onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}
                  >
                    <option value={5}>5 ⭐</option>
                    <option value={4}>4 ⭐</option>
                    <option value={3}>3 ⭐</option>
                    <option value={2}>2 ⭐</option>
                    <option value={1}>1 ⭐</option>
                  </select>
                </div>
                <textarea
                  placeholder="Write your review..."
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  required
                  rows="4"
                />
                <button type="submit" className="submit-review-btn">Submit Review</button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // WISHLIST
  if (currentView === "wishlist") {
    return (
      <div className="home-container">
        <header className="indian-header">
          <div className="header-content">
            <div className="logo-container">
              <div className="logo-fallback">
                <div className="logo-placeholder" onClick={handleBackToHome} style={{ cursor: "pointer" }}>
                  <span className="logo-text">🇮🇳</span>
                  <span className="logo-text">India Post</span>
                </div>
              </div>
              <div className="title-container">
                <h1>My Wishlist</h1>
                <p className="tagline">Your Favorite Indian Products</p>
              </div>
            </div>

            <div className="header-actions">
              {user ? (
                <>
                  <div className="role-selector">
                    <select value={userRole} onChange={handleRoleChange} className="role-dropdown">
                      <option value="buyer">👤 Buyer</option>
                      <option value="seller">🏪 Seller</option>
                    </select>
                  </div>
                  <button className="cart-btn" onClick={() => setCurrentView("cart")}>🛒 Cart ({getCartCount()})</button>
                  <button className="auth-btn" onClick={logout}>🚪 Logout</button>
                  <span className="user-greeting">Hello, {user.name}</span>
                </>
              ) : (
                <>
                  <button className="auth-btn" onClick={() => navigate("/login")}>🔐 Login</button>
                  <button className="auth-btn" onClick={() => navigate("/register")}>📝 Register</button>
                </>
              )}
            </div>
          </div>
        </header>

        <section className="wishlist-section">
          {wishlist.length === 0 ? (
            <div className="empty-wishlist">
              <h3>Your wishlist is empty</h3>
              <p>Add products to your wishlist to save them for later!</p>
              <button className="cta-button" onClick={handleBackToHome}>Start Shopping</button>
            </div>
          ) : (
            <div className="wishlist-items">
              {wishlist.map((item) => (
                <div key={item.wishlistId || item._id} className="wishlist-item">
                  <img src={item.image} alt={item.name} />
                  <div className="wishlist-item-info">
                    <h4>{item.name}</h4>
                    <p>{item.seller}</p>
                    <p className="wishlist-item-price">₹{item.price}</p>
                  </div>
                  <div className="wishlist-item-actions">
                    <button className="add-to-cart-btn" onClick={() => handleAddToCart(item)}>Add to Cart</button>
                    <button className="remove-btn" onClick={() => handleAddToWishlist(item)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    );
  }

  // CART
  if (currentView === "cart") {
    return (
      <div className="home-container">
        <header className="indian-header">
          <div className="header-content">
            <div className="logo-container">
              <div className="logo-fallback">
                <div className="logo-placeholder" onClick={handleBackToHome} style={{ cursor: "pointer" }}>
                  <span className="logo-text">🇮🇳</span>
                  <span className="logo-text">India Post</span>
                </div>
              </div>
              <div className="title-container">
                <h1>Shopping Cart</h1>
                <p className="tagline">Your Indian Heritage Collection</p>
              </div>
            </div>

            <div className="header-actions">
              {user ? (
                <>
                  <div className="role-selector">
                    <select value={userRole} onChange={handleRoleChange} className="role-dropdown">
                      <option value="buyer">👤 Buyer</option>
                      <option value="seller">🏪 Seller</option>
                    </select>
                  </div>
                  <button className="wishlist-btn" onClick={() => setCurrentView("wishlist")}>❤️ Wishlist ({getWishlistCount()})</button>
                  <button className="auth-btn" onClick={logout}>🚪 Logout</button>
                  <span className="user-greeting">Hello, {user.name}</span>
                </>
              ) : (
                <>
                  <button className="auth-btn" onClick={() => navigate("/login")}>🔐 Login</button>
                  <button className="auth-btn" onClick={() => navigate("/register")}>📝 Register</button>
                </>
              )}
              <button className="back-button" onClick={handleBackToHome}>Continue Shopping</button>
            </div>
          </div>
        </header>

        <section className="cart-section">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <h3>Your cart is empty</h3>
              <p>Discover authentic Indian products and add them to your cart!</p>
              <button className="cta-button" onClick={handleBackToHome}>Start Shopping</button>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cart.map((item) => (
                  <div key={item.cartId} className="cart-item">
                    <img src={item.image} alt={item.name} />
                    <div className="cart-item-info">
                      <h4>{item.name}</h4>
                      <p>{item.seller}</p>
                      <p className="cart-item-price">₹{item.price}</p>
                    </div>
                    <button
                      className="remove-btn"
                      onClick={() => {
                        const newCart = cart.filter((x) => x.cartId !== item.cartId);
                        setCart(newCart);
                        localStorage.setItem("indiaPostCart", JSON.stringify(newCart));
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <div className="cart-summary">
                <h3>Order Summary</h3>
                <p>Total Items: {cart.length}</p>
                <p>Total Amount: ₹{cart.reduce((s, i) => s + (i.price || 0), 0)}</p>
                <button className="checkout-btn" onClick={handleCheckout}>
                  Proceed to Checkout
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    );
  }

  // Fallback
  return (
    <div className="home-container">
      <div className="loading">Loading...</div>
    </div>
  );
}

/* -----------------------------
   Routes only (Provider/Router are in main.jsx)
-------------------------------- */
export default function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* seller onboarding details page */}
        <Route path="/seller-registration" element={<SellerRegistration />} />

        {/* optional standalone listing page */}
        <Route path="/products" element={<ProductsPage />} />

        {/* legal pages */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/shipping-policy" element={<ShippingPolicy />} />

        {/* protected */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-success"
          element={
            <ProtectedRoute>
              <OrderSuccess />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buyer-dashboard"
          element={
            <ProtectedRoute requiredRole="buyer">
              <BuyerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller-dashboard"
          element={
            <ProtectedRoute requiredRole="seller" requireSellerVerified>
              <SellerDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

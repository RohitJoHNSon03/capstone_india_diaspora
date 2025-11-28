import React from "react";
import { useNavigate } from "react-router-dom";
import ProductRecommendations from "../components/ProductRecommendations";
import "../styles/pages.css";

const Home = () => {
  const navigate = useNavigate();
  const [trackingNumber, setTrackingNumber] = React.useState('');

  const handleTrackPackage = (e) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      alert(`Tracking package: ${trackingNumber}`);
      // You can implement actual tracking logic here
    }
  };

  const handleExploreProducts = () => {
    navigate("/products");
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Building a Community of Indian Diaspora</h1>
          <p className="hero-subtitle">
            Connecting PIDs with local sellers, MSMEs & Artisans for authentic Indian products
          </p>
          
          {/* Features Grid */}
          <div className="features-grid">
            <div className="feature-item">
              <span className="feature-icon">🎨</span>
              <h3>Traditional & Ethnic Products</h3>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🛍️</span>
              <h3>Handicrafts & Artisanal Goods</h3>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📮</span>
              <h3>Delivered via India Post</h3>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🌍</span>
              <h3>Global Access to Indian Heritage</h3>
            </div>
          </div>

          <button className="cta-button" onClick={handleExploreProducts}>
            Explore Products
          </button>
        </div>
      </section>

      {/* Divider */}
      <div className="section-divider">
        <div className="divider-line"></div>
      </div>

      {/* Non-Clickable Icons Section */}
      <section className="icons-section">
        <div className="container">
          <h2>Popular Categories</h2>
          <p className="section-subtitle">Explore our wide range of authentic Indian products</p>
          
          <div className="home-icons">
            <div className="icon">
              <div className="icon-image">📚</div>
              <span>Books</span>
              <p className="icon-description">Indian literature & educational materials</p>
            </div>
            <div className="icon">
              <div className="icon-image">📷</div>
              <span>Electronics</span>
              <p className="icon-description">Indian brands & accessories</p>
            </div>
            <div className="icon">
              <div className="icon-image">🧳</div>
              <span>Travel</span>
              <p className="icon-description">Luggage & travel essentials</p>
            </div>
            <div className="icon">
              <div className="icon-image">🐦</div>
              <span>Pets</span>
              <p className="icon-description">Pet care & accessories</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tracking Section */}
      <section className="tracking-section">
        <div className="container">
          <h2>Track Your India Post Delivery</h2>
          <p className="tracking-subtitle">Enter your tracking number to check delivery status</p>
          
          <form onSubmit={handleTrackPackage} className="tracking-form">
            <div className="tracking-input-group">
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
                className="tracking-input"
              />
              <button type="submit" className="tracking-button">
                Track Package
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Product Recommendations Sections */}
      <section className="recommendations-section">
        <div className="container">
          <ProductRecommendations
            allProducts={[]}
            recommendationType="trending"
            title="Featured Indian Products"
            subtitle="Popular items among our diaspora community"
            maxRecommendations={4}
          />
        </div>
      </section>

      <section className="recommendations-section">
        <div className="container">
          <ProductRecommendations
            allProducts={[]}
            recommendationType="regional"
            title="Taste of Home"
            subtitle="Authentic products from different Indian states"
            maxRecommendations={4}
          />
        </div>
      </section>

      <section className="recommendations-section">
        <div className="container">
          <ProductRecommendations
            allProducts={[]}
            recommendationType="fastShipping"
            title="Fast India Post Delivery"
            subtitle="Products with optimized shipping for international delivery"
            maxRecommendations={4}
          />
        </div>
      </section>

      {/* Login CTA Section */}
      <section className="login-cta-section">
        <div className="container">
          <h2>Join Our Community</h2>
          <p>Connect with agencies from <strong>public</strong> and <strong>private</strong> sectors.</p>
          <p>Browse products, add to cart, and get deliveries through <strong>India Post</strong>.</p>
          <button className="login-btn" onClick={() => navigate("/login")}>
            Login to Continue
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
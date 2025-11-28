import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProductRecommendations = ({ 
  currentProduct, 
  allProducts, 
  onProductClick, 
  onAddToCart,
  userPreferences = null,
  maxRecommendations = 4,
  // New props for homepage
  recommendationType = 'featured',
  title = null,
  subtitle = null
}) => {
  const [viewedProducts, setViewedProducts] = useState([]);
  const navigate = useNavigate();

  // Check if this is homepage (no currentProduct)
  const isHomePage = !currentProduct;

  // Track viewed products in session storage
  useEffect(() => {
    const stored = sessionStorage.getItem('viewedProducts');
    if (stored) {
      setViewedProducts(JSON.parse(stored));
    }
  }, []);

  // Homepage recommendation logic
  const getHomePageRecommendations = useMemo(() => {
    if (!allProducts.length) return [];
    
    let filteredProducts = [];

    switch (recommendationType) {
      case 'trending':
        // Products with high ratings or many purchases
        filteredProducts = allProducts
          .filter(product => product.rating >= 4 || product.popular)
          .sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      
      case 'regional':
        // Products with origin states
        filteredProducts = allProducts
          .filter(product => product.originState)
          .sort(() => 0.5 - Math.random()); // Randomize for variety
        break;
      
      case 'fastShipping':
        // India Post optimized products
        filteredProducts = allProducts
          .filter(product => product.indiaPostOptimized)
          .sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      
      case 'featured':
      default:
        // Featured or high-rated products
        filteredProducts = allProducts
          .filter(product => product.featured || product.rating >= 4)
          .sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    // If not enough products, add random ones
    if (filteredProducts.length < maxRecommendations) {
      const usedIds = new Set(filteredProducts.map(p => p._id));
      const availableProducts = allProducts.filter(p => !usedIds.has(p._id));
      const randomProducts = availableProducts
        .sort(() => 0.5 - Math.random())
        .slice(0, maxRecommendations - filteredProducts.length);
      
      return [...filteredProducts, ...randomProducts].slice(0, maxRecommendations);
    }
    
    return filteredProducts.slice(0, maxRecommendations);
  }, [allProducts, maxRecommendations, recommendationType]);

  // Product detail page recommendation logic
  const getProductDetailRecommendations = useMemo(() => {
    if (!currentProduct || !allProducts.length) return [];

    let recommendations = [];

    // Strategy 1: Same category products (primary)
    const sameCategoryProducts = allProducts.filter(product => 
      product.category === currentProduct.category && 
      product._id !== currentProduct._id
    );

    // Strategy 2: Similar price range (±20%)
    const similarPriceProducts = allProducts.filter(product => {
      if (product._id === currentProduct._id) return false;
      const priceDiff = Math.abs(product.price - currentProduct.price);
      const priceThreshold = currentProduct.price * 0.2;
      return priceDiff <= priceThreshold;
    });

    // Strategy 3: Recently viewed products (excluding current)
    const recentViews = allProducts.filter(product =>
      viewedProducts.includes(product._id) && 
      product._id !== currentProduct._id
    );

    // Strategy 4: Same seller products
    const sameSellerProducts = allProducts.filter(product =>
      product.seller === currentProduct.seller &&
      product._id !== currentProduct._id
    );

    // Strategy 5: User preference based (if available)
    const preferenceBasedProducts = userPreferences ? 
      allProducts.filter(product => 
        userPreferences.preferredCategories?.includes(product.category) ||
        (userPreferences.preferredPriceRange?.min <= product.price && 
         product.price <= userPreferences.preferredPriceRange?.max)
      ) : [];

    // Combine strategies with priority
    const combinedRecommendations = [
      ...sameCategoryProducts.map(p => ({ product: p, score: 4 })), // High priority
      ...similarPriceProducts.map(p => ({ product: p, score: 3 })),
      ...recentViews.map(p => ({ product: p, score: 3 })),
      ...sameSellerProducts.map(p => ({ product: p, score: 2 })),
      ...preferenceBasedProducts.map(p => ({ product: p, score: 5 })) // Highest if available
    ];

    // Remove duplicates and sort by score
    const uniqueProducts = combinedRecommendations.reduce((acc, item) => {
      if (!acc.find(i => i.product._id === item.product._id)) {
        acc.push(item);
      }
      return acc;
    }, []);

    // Sort by score and get top recommendations
    recommendations = uniqueProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, maxRecommendations * 2)
      .map(item => item.product);

    // Fallback: If not enough recommendations, add random products
    if (recommendations.length < maxRecommendations) {
      const usedIds = new Set(recommendations.map(p => p._id));
      usedIds.add(currentProduct._id);
      
      const availableProducts = allProducts.filter(p => !usedIds.has(p._id));
      const randomProducts = availableProducts
        .sort(() => 0.5 - Math.random())
        .slice(0, maxRecommendations - recommendations.length);
      
      recommendations = [...recommendations, ...randomProducts];
    }

    return recommendations.slice(0, maxRecommendations);
  }, [currentProduct, allProducts, userPreferences, viewedProducts, maxRecommendations]);

  // Handle product click for guest users
  const handleProductClick = (product) => {
    if (onProductClick) {
      onProductClick(product);
    } else {
      // Default behavior for guest users - navigate to login
      navigate('/login', { 
        state: { 
          message: 'Please login to view product details and make purchases' 
        } 
      });
    }
  };

  // Handle add to cart for guest users
  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      // Default behavior for guest users - navigate to login
      navigate('/login', { 
        state: { 
          message: 'Please login to add items to your cart' 
        } 
      });
    }
  };

  // Get the appropriate recommendations
  const recommendations = isHomePage 
    ? getHomePageRecommendations 
    : getProductDetailRecommendations;

  // Default titles based on context
  const defaultTitle = isHomePage 
    ? getDefaultHomeTitle(recommendationType)
    : "You Might Also Like";

  const displayTitle = title || defaultTitle;

  if (recommendations.length === 0) return null;

  return (
    <div className="recommendations-section">
      <div className="recommendations-header">
        <h3>{displayTitle}</h3>
        <span className="recommendations-count">{recommendations.length} products</span>
      </div>
      
      {subtitle && <p className="recommendations-subtitle">{subtitle}</p>}
      
      <div className="recommendations-grid">
        {recommendations.map(product => (
          <div 
            key={product._id} 
            className="recommendation-card"
            onClick={() => handleProductClick(product)}
          >
            <div className="product-image-container">
              <img 
                src={product.image} 
                alt={product.name}
                className="product-image"
                onError={(e) => {
                  e.target.src = '/images/placeholder-product.png';
                }}
              />
              {product.discount > 0 && (
                <span className="discount-badge">-{product.discount}%</span>
              )}
              {product.indiaPostOptimized && isHomePage && (
                <span className="shipping-badge">🚚 Fast Delivery</span>
              )}
              {product.originState && isHomePage && (
                <span className="origin-badge">{product.originState}</span>
              )}
            </div>
            
            <div className="recommendation-info">
              <h5 className="product-name" title={product.name}>
                {product.name.length > 50 ? `${product.name.substring(0, 50)}...` : product.name}
              </h5>
              <p className="recommendation-seller">{product.seller}</p>
              
              {product.originState && isHomePage && (
                <p className="product-origin">From {product.originState}</p>
              )}
              
              <div className="price-section">
                {product.originalPrice && product.originalPrice > product.price ? (
                  <>
                    <span className="current-price">₹{product.price}</span>
                    <span className="original-price">₹{product.originalPrice}</span>
                    <span className="discount-text">
                      Save ₹{product.originalPrice - product.price}
                    </span>
                  </>
                ) : (
                  <span className="current-price">₹{product.price}</span>
                )}
              </div>
              
              {product.rating && (
                <div className="rating-section">
                  <span className="stars">{"★".repeat(Math.floor(product.rating))}</span>
                  <span className="rating-value">({product.rating})</span>
                </div>
              )}
              
              <button 
                className="quick-add-btn"
                onClick={(e) => handleAddToCart(product, e)}
              >
                <span>+</span> Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper function for default homepage titles
const getDefaultHomeTitle = (recommendationType) => {
  switch (recommendationType) {
    case 'trending':
      return 'Trending Products';
    case 'regional':
      return 'Taste of Home';
    case 'fastShipping':
      return 'Fast India Post Delivery';
    case 'featured':
    default:
      return 'Featured Indian Products';
  }
};

// Helper function to get user preferences
export const getUserPreferences = (user) => {
  if (!user) return null;
  
  return {
    preferredCategories: user.preferredCategories || [],
    preferredPriceRange: user.preferredPriceRange || { min: 0, max: 10000 },
    recentlyViewed: user.recentlyViewed || []
  };
};

export default ProductRecommendations;
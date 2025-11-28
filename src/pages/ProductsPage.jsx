// src/pages/ProductsPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    // Load cart from localStorage
    const savedCart = localStorage.getItem('indiaPostCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/products");
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleAddToCart = (product) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Check if product is already in cart
    const isInCart = cart.some(item => item._id === product._id);
    
    if (isInCart) {
      alert(`${product.name} is already in your cart!`);
      return;
    }

    // Add to cart
    const newCart = [...cart, { ...product, cartId: Date.now(), quantity: 1 }];
    setCart(newCart);
    localStorage.setItem('indiaPostCart', JSON.stringify(newCart));
    
    alert(`Added ${product.name} to cart!\nPrice: ₹${product.price}`);
  };

  const handleAddToWishlist = (product) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Load existing wishlist
    const savedWishlist = localStorage.getItem('indiaPostWishlist');
    const wishlist = savedWishlist ? JSON.parse(savedWishlist) : [];
    
    // Check if product is already in wishlist
    const isInWishlist = wishlist.some(item => item._id === product._id);
    
    if (isInWishlist) {
      alert(`${product.name} is already in your wishlist!`);
      return;
    }

    // Add to wishlist
    const newWishlist = [...wishlist, { ...product, wishlistId: Date.now() }];
    localStorage.setItem('indiaPostWishlist', JSON.stringify(newWishlist));
    
    alert(`Added ${product.name} to wishlist!`);
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-64">
        <div className="text-lg">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Products</h1>
          <p className="text-gray-600">Discover authentic Indian products from trusted sellers</p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No products available at the moment.</div>
            <p className="text-gray-400 mt-2">Please check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200"
              >
                {product.image && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-green-600">₹{product.price}</span>
                    {product.organization && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {product.organization}
                      </span>
                    )}
                  </div>
                  
                  {product.category && (
                    <div className="text-xs text-gray-500 mb-3">
                      Category: <span className="font-medium">{product.category}</span>
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 font-medium text-sm"
                    >
                      Add to Cart
                    </button>
                    
                    <button 
                      onClick={() => handleAddToWishlist(product)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-3 rounded-lg transition-colors duration-200"
                      title="Add to Wishlist"
                    >
                      ♡
                    </button>
                  </div>
                  
                  {!user && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Login required to purchase
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
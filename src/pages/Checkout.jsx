import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Checkout.css';

const Checkout = () => {
  const [currentStep, setCurrentStep] = useState(1); // 1: Information, 2: Payment, 3: Confirmation
  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    }
  });
  const [shippingMethod, setShippingMethod] = useState('India Post Standard');
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: ''
  });
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  
  const navigate = useNavigate();

  useEffect(() => {
    const savedCart = localStorage.getItem('indiaPostCart');
    const items = savedCart ? JSON.parse(savedCart) : [];
    setCartItems(items);
    
    if (items.length === 0) {
      navigate('/');
    }
  }, [navigate]);

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
  };

  const calculateShippingCost = () => {
    switch (shippingMethod) {
      case 'India Post Express': return 99;
      case 'India Post Registered': return 49;
      default: return 0;
    }
  };

  const calculateTax = () => {
    return calculateTotal() * 0.18;
  };

  const calculateFinalTotal = () => {
    return calculateTotal() + calculateShippingCost() + calculateTax();
  };

  const validateInformationStep = () => {
    const errors = {};
    
    if (!customer.name.trim()) errors.name = 'Full name is required';
    if (!customer.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(customer.email)) errors.email = 'Email is invalid';
    if (!customer.phone.trim()) errors.phone = 'Phone number is required';
    else if (!/^[6-9]\d{9}$/.test(customer.phone.replace(/\D/g, ''))) errors.phone = 'Enter a valid Indian phone number';
    if (!customer.address.street.trim()) errors.street = 'Street address is required';
    if (!customer.address.city.trim()) errors.city = 'City is required';
    if (!customer.address.state.trim()) errors.state = 'State is required';
    if (!customer.address.zipCode.trim()) errors.zipCode = 'ZIP code is required';
    else if (!/^\d{6}$/.test(customer.address.zipCode)) errors.zipCode = 'ZIP code must be 6 digits';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePaymentStep = () => {
    const errors = {};
    
    if (paymentMethod === 'credit-card') {
      if (!paymentDetails.cardNumber.trim()) errors.cardNumber = 'Card number is required';
      else if (!/^\d{16}$/.test(paymentDetails.cardNumber.replace(/\s/g, ''))) errors.cardNumber = 'Enter a valid 16-digit card number';
      if (!paymentDetails.expiryDate.trim()) errors.expiryDate = 'Expiry date is required';
      else if (!/^\d{2}\/\d{2}$/.test(paymentDetails.expiryDate)) errors.expiryDate = 'Use MM/YY format';
      if (!paymentDetails.cvv.trim()) errors.cvv = 'CVV is required';
      else if (!/^\d{3,4}$/.test(paymentDetails.cvv)) errors.cvv = 'Enter a valid CVV';
      if (!paymentDetails.nameOnCard.trim()) errors.nameOnCard = 'Name on card is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateInformationStep()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validatePaymentStep()) {
      setCurrentStep(3);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmitOrder = async () => {
    setLoading(true);

    try {
      const orderData = {
        customer,
        items: cartItems.map(item => ({
          product: item._id,
          quantity: item.quantity || 1,
          price: item.price,
          name: item.name
        })),
        shippingMethod,
        paymentMethod,
        shippingCost: calculateShippingCost(),
        taxAmount: calculateTax(),
        notes,
        totalAmount: calculateFinalTotal(),
        orderDate: new Date().toISOString(),
        status: 'confirmed'
      };

      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const order = await response.json();
        localStorage.removeItem('indiaPostCart');
        navigate('/order-success', { state: { order } });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to place order');
      }
    } catch (error) {
      console.error('Order error:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomer(prev => ({
      ...prev,
      [name]: value
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setCustomer(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value
      }
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails(prev => ({
      ...prev,
      [name]: value
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setCustomer(prev => ({
      ...prev,
      phone: value
    }));
    if (formErrors.phone) {
      setFormErrors(prev => ({ ...prev, phone: '' }));
    }
  };

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '').slice(0, 16);
    // Add spaces every 4 digits
    value = value.replace(/(\d{4})/g, '$1 ').trim();
    setPaymentDetails(prev => ({
      ...prev,
      cardNumber: value
    }));
    if (formErrors.cardNumber) {
      setFormErrors(prev => ({ ...prev, cardNumber: '' }));
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="empty-cart">
            <div className="empty-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Please add some products to your cart before checkout.</p>
            <button onClick={() => navigate('/')} className="btn-primary">
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="checkout-form-section">
            <form className="checkout-form">
              {/* Customer Information Card */}
              <div className="form-card">
                <h2 className="section-title">
                  <span className="icon">👤</span>
                  Customer Information
                </h2>
                
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={customer.name}
                    onChange={handleInputChange}
                    required
                    className={formErrors.name ? 'error' : ''}
                  />
                  {formErrors.name && <span className="error-message">{formErrors.name}</span>}
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="your@email.com"
                      value={customer.email}
                      onChange={handleInputChange}
                      required
                      className={formErrors.email ? 'error' : ''}
                    />
                    {formErrors.email && <span className="error-message">{formErrors.email}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number *</label>
                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      placeholder="9876543210"
                      value={customer.phone}
                      onChange={handlePhoneChange}
                      required
                      className={formErrors.phone ? 'error' : ''}
                    />
                    {formErrors.phone && <span className="error-message">{formErrors.phone}</span>}
                  </div>
                </div>
              </div>

              {/* Shipping Address Card */}
              <div className="form-card">
                <h2 className="section-title">
                  <span className="icon">📍</span>
                  Shipping Address
                </h2>
                
                <div className="form-group">
                  <label htmlFor="street">Street Address *</label>
                  <textarea
                    id="street"
                    name="street"
                    placeholder="Enter your complete street address, building, floor, etc."
                    value={customer.address.street}
                    onChange={handleAddressChange}
                    required
                    rows="3"
                    className={formErrors.street ? 'error' : ''}
                  />
                  {formErrors.street && <span className="error-message">{formErrors.street}</span>}
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">City *</label>
                    <input
                      id="city"
                      type="text"
                      name="city"
                      placeholder="City"
                      value={customer.address.city}
                      onChange={handleAddressChange}
                      required
                      className={formErrors.city ? 'error' : ''}
                    />
                    {formErrors.city && <span className="error-message">{formErrors.city}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="state">State *</label>
                    <input
                      id="state"
                      type="text"
                      name="state"
                      placeholder="State"
                      value={customer.address.state}
                      onChange={handleAddressChange}
                      required
                      className={formErrors.state ? 'error' : ''}
                    />
                    {formErrors.state && <span className="error-message">{formErrors.state}</span>}
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="zipCode">ZIP Code *</label>
                    <input
                      id="zipCode"
                      type="text"
                      name="zipCode"
                      placeholder="600001"
                      value={customer.address.zipCode}
                      onChange={handleAddressChange}
                      required
                      maxLength="6"
                      className={formErrors.zipCode ? 'error' : ''}
                    />
                    {formErrors.zipCode && <span className="error-message">{formErrors.zipCode}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="country">Country</label>
                    <input
                      id="country"
                      type="text"
                      name="country"
                      value={customer.address.country}
                      onChange={handleAddressChange}
                      disabled
                      className="disabled-input"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Method Card */}
              <div className="form-card">
                <h2 className="section-title">
                  <span className="icon">🚚</span>
                  Shipping Method
                </h2>
                <div className="shipping-options">
                  <label className={`shipping-option ${shippingMethod === 'India Post Standard' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="shipping"
                      value="India Post Standard"
                      checked={shippingMethod === 'India Post Standard'}
                      onChange={(e) => setShippingMethod(e.target.value)}
                    />
                    <div className="option-content">
                      <span className="option-title">India Post Standard</span>
                      <span className="option-duration">5-7 business days</span>
                      <span className="option-price">Free</span>
                    </div>
                  </label>
                  
                  <label className={`shipping-option ${shippingMethod === 'India Post Express' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="shipping"
                      value="India Post Express"
                      checked={shippingMethod === 'India Post Express'}
                      onChange={(e) => setShippingMethod(e.target.value)}
                    />
                    <div className="option-content">
                      <span className="option-title">India Post Express</span>
                      <span className="option-duration">2-3 business days</span>
                      <span className="option-price">₹99</span>
                    </div>
                  </label>
                  
                  <label className={`shipping-option ${shippingMethod === 'India Post Registered' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="shipping"
                      value="India Post Registered"
                      checked={shippingMethod === 'India Post Registered'}
                      onChange={(e) => setShippingMethod(e.target.value)}
                    />
                    <div className="option-content">
                      <span className="option-title">India Post Registered</span>
                      <span className="option-duration">4-6 business days</span>
                      <span className="option-price">₹49</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Additional Notes Card */}
              <div className="form-card">
                <h2 className="section-title">
                  <span className="icon">📝</span>
                  Additional Notes (Optional)
                </h2>
                <div className="form-group">
                  <textarea
                    placeholder="Any special instructions for your order, delivery preferences, or notes for the seller..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="3"
                    className="notes-textarea"
                  />
                </div>
              </div>
            </form>
          </div>
        );

      case 2:
        return (
          <div className="checkout-form-section">
            <div className="form-card">
              <h2 className="section-title">
                <span className="icon">💳</span>
                Payment Method
              </h2>
              
              <div className="payment-options">
                <label className={`payment-option ${paymentMethod === 'credit-card' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="credit-card"
                    checked={paymentMethod === 'credit-card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="option-content">
                    <span className="option-title">Credit/Debit Card</span>
                    <span className="option-icon">💳</span>
                  </div>
                </label>
                
                <label className={`payment-option ${paymentMethod === 'upi' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="option-content">
                    <span className="option-title">UPI</span>
                    <span className="option-icon">📱</span>
                  </div>
                </label>
                
                <label className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="option-content">
                    <span className="option-title">Cash on Delivery</span>
                    <span className="option-icon">💰</span>
                  </div>
                </label>
              </div>

              {paymentMethod === 'credit-card' && (
                <div className="payment-details">
                  <div className="form-group">
                    <label htmlFor="cardNumber">Card Number *</label>
                    <input
                      id="cardNumber"
                      type="text"
                      name="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={paymentDetails.cardNumber}
                      onChange={handleCardNumberChange}
                      required
                      className={formErrors.cardNumber ? 'error' : ''}
                    />
                    {formErrors.cardNumber && <span className="error-message">{formErrors.cardNumber}</span>}
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="expiryDate">Expiry Date *</label>
                      <input
                        id="expiryDate"
                        type="text"
                        name="expiryDate"
                        placeholder="MM/YY"
                        value={paymentDetails.expiryDate}
                        onChange={handlePaymentChange}
                        required
                        className={formErrors.expiryDate ? 'error' : ''}
                      />
                      {formErrors.expiryDate && <span className="error-message">{formErrors.expiryDate}</span>}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="cvv">CVV *</label>
                      <input
                        id="cvv"
                        type="text"
                        name="cvv"
                        placeholder="123"
                        value={paymentDetails.cvv}
                        onChange={handlePaymentChange}
                        required
                        className={formErrors.cvv ? 'error' : ''}
                      />
                      {formErrors.cvv && <span className="error-message">{formErrors.cvv}</span>}
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="nameOnCard">Name on Card *</label>
                    <input
                      id="nameOnCard"
                      type="text"
                      name="nameOnCard"
                      placeholder="John Doe"
                      value={paymentDetails.nameOnCard}
                      onChange={handlePaymentChange}
                      required
                      className={formErrors.nameOnCard ? 'error' : ''}
                    />
                    {formErrors.nameOnCard && <span className="error-message">{formErrors.nameOnCard}</span>}
                  </div>
                </div>
              )}

              {paymentMethod === 'upi' && (
                <div className="payment-details">
                  <div className="form-group">
                    <label htmlFor="upiId">UPI ID *</label>
                    <input
                      id="upiId"
                      type="text"
                      name="upiId"
                      placeholder="yourname@upi"
                      onChange={handlePaymentChange}
                      required
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'cod' && (
                <div className="payment-details">
                  <div className="cod-notice">
                    <p>💰 Pay when your order is delivered</p>
                    <p>Cash on Delivery is available for all orders</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="checkout-form-section">
            <div className="form-card">
              <h2 className="section-title">
                <span className="icon">✅</span>
                Order Confirmation
              </h2>
              
              <div className="confirmation-details">
                <div className="confirmation-section">
                  <h3>Shipping Address</h3>
                  <p>{customer.name}</p>
                  <p>{customer.address.street}</p>
                  <p>{customer.address.city}, {customer.address.state} - {customer.address.zipCode}</p>
                  <p>{customer.address.country}</p>
                  <p>📞 {customer.phone}</p>
                </div>
                
                <div className="confirmation-section">
                  <h3>Shipping Method</h3>
                  <p>{shippingMethod}</p>
                </div>
                
                <div className="confirmation-section">
                  <h3>Payment Method</h3>
                  <p>
                    {paymentMethod === 'credit-card' ? 'Credit/Debit Card' :
                     paymentMethod === 'upi' ? 'UPI' : 'Cash on Delivery'}
                  </p>
                </div>
                
                {notes && (
                  <div className="confirmation-section">
                    <h3>Additional Notes</h3>
                    <p>{notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="checkout-page">
      <div className="container">
        <div className="checkout-header">
          <h1>Secure Checkout</h1>
          <div className="checkout-steps">
            <div 
              className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep === 1 ? 'current' : ''}`}
              onClick={() => currentStep > 1 && setCurrentStep(1)}
            >
              <span className="step-number">1</span>
              <span className="step-label">Information</span>
            </div>
            <div 
              className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep === 2 ? 'current' : ''}`}
              onClick={() => currentStep > 2 && setCurrentStep(2)}
            >
              <span className="step-number">2</span>
              <span className="step-label">Payment</span>
            </div>
            <div 
              className={`step ${currentStep >= 3 ? 'active' : ''} ${currentStep === 3 ? 'current' : ''}`}
            >
              <span className="step-number">3</span>
              <span className="step-label">Confirmation</span>
            </div>
          </div>
        </div>
        
        <div className="checkout-content">
          {renderStepContent()}

          {/* Right Column - Order Summary */}
          <div className="order-summary-section">
            <div className="order-summary-card">
              <h2 className="summary-title">Order Summary</h2>
              
              <div className="order-items">
                {cartItems.map((item, index) => (
                  <div key={index} className="order-item">
                    <div className="item-image">
                      <img src={item.image || '/api/placeholder/60/60'} alt={item.name} />
                      <span className="item-quantity">{item.quantity || 1}</span>
                    </div>
                    <div className="item-details">
                      <h4 className="item-name">{item.name}</h4>
                      <p className="item-seller">{item.seller}</p>
                      <p className="item-price">₹{item.price * (item.quantity || 1)}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="order-totals">
                <div className="total-line">
                  <span>Subtotal</span>
                  <span>₹{calculateTotal()}</span>
                </div>
                <div className="total-line">
                  <span>Shipping</span>
                  <span>
                    {calculateShippingCost() === 0 ? 'Free' : `₹${calculateShippingCost()}`}
                  </span>
                </div>
                <div className="total-line">
                  <span>Tax (18%)</span>
                  <span>₹{calculateTax().toFixed(2)}</span>
                </div>
                <div className="total-line final-total">
                  <span>Total Amount</span>
                  <span>₹{calculateFinalTotal().toFixed(2)}</span>
                </div>
              </div>
              
              {currentStep === 3 ? (
                <button 
                  type="button"
                  disabled={loading} 
                  className="place-order-btn"
                  onClick={handleSubmitOrder}
                >
                  {loading ? (
                    <>
                      <div className="spinner"></div>
                      Placing Order...
                    </>
                  ) : (
                    `Confirm Order - ₹${calculateFinalTotal().toFixed(2)}`
                  )}
                </button>
              ) : (
                <div className="step-actions">
                  {currentStep > 1 && (
                    <button 
                      type="button"
                      className="btn-secondary"
                      onClick={handlePreviousStep}
                    >
                      ← Previous
                    </button>
                  )}
                  <button 
                    type="button"
                    className="btn-primary"
                    onClick={handleNextStep}
                  >
                    {currentStep === 2 ? 'Continue to Confirmation' : 'Continue to Payment'} →
                  </button>
                </div>
              )}
              
              <div className="security-notice">
                <span className="lock-icon">🔒</span>
                <span>Your information is secure and encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
import React, { useState } from 'react';

const CheckoutForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    trackingNumber: '' // Added tracking number field
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTrackingNumberChange = (e) => {
    const value = e.target.value.toUpperCase();
    // Validate format: 2 letters + 9 numbers + 2 letters
    const regex = /^[A-Z]{0,2}\d{0,9}[A-Z]{0,2}$/;
    
    if (regex.test(value) && value.length <= 13) {
      setFormData(prev => ({
        ...prev,
        trackingNumber: value
      }));
      
      // Clear tracking number error if valid
      if (errors.trackingNumber) {
        setErrors(prev => ({ ...prev, trackingNumber: '' }));
      }
    } else if (value === '') {
      // Allow empty value
      setFormData(prev => ({
        ...prev,
        trackingNumber: value
      }));
    }
    // If not valid and not empty, don't update the value
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    
    // Validate tracking number format if provided
    if (formData.trackingNumber && formData.trackingNumber.length > 0) {
      const trackingRegex = /^[A-Z]{2}\d{9}[A-Z]{2}$/;
      if (!trackingRegex.test(formData.trackingNumber)) {
        newErrors.trackingNumber = 'Tracking number must be exactly 2 letters + 9 numbers + 2 letters (e.g., AB123456789XY)';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <h3>Shipping Information</h3>
      
      <div className="form-group">
        <label>Full Name *</label>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          className={errors.name ? 'error' : ''}
          required
        />
        {errors.name && <span className="field-error">{errors.name}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? 'error' : ''}
            required
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>
        <div className="form-group">
          <label>Phone *</label>
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            className={errors.phone ? 'error' : ''}
            required
          />
          {errors.phone && <span className="field-error">{errors.phone}</span>}
        </div>
      </div>

      <div className="form-group">
        <label>Full Address *</label>
        <textarea
          name="address"
          placeholder="Full Street Address"
          value={formData.address}
          onChange={handleChange}
          className={errors.address ? 'error' : ''}
          required
          rows="3"
        />
        {errors.address && <span className="field-error">{errors.address}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>City *</label>
          <input
            type="text"
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
            className={errors.city ? 'error' : ''}
            required
          />
          {errors.city && <span className="field-error">{errors.city}</span>}
        </div>
        <div className="form-group">
          <label>State *</label>
          <input
            type="text"
            name="state"
            placeholder="State"
            value={formData.state}
            onChange={handleChange}
            className={errors.state ? 'error' : ''}
            required
          />
          {errors.state && <span className="field-error">{errors.state}</span>}
        </div>
        <div className="form-group">
          <label>ZIP Code *</label>
          <input
            type="text"
            name="zipCode"
            placeholder="ZIP Code"
            value={formData.zipCode}
            onChange={handleChange}
            className={errors.zipCode ? 'error' : ''}
            required
            maxLength="6"
          />
          {errors.zipCode && <span className="field-error">{errors.zipCode}</span>}
        </div>
      </div>

      {/* Tracking Number Section */}
      <div className="form-group">
        <label>India Post Tracking Number (Optional)</label>
        <input
          type="text"
          name="trackingNumber"
          placeholder="AB123456789XY"
          value={formData.trackingNumber}
          onChange={handleTrackingNumberChange}
          className={errors.trackingNumber ? 'error' : ''}
          maxLength={13}
          pattern="[A-Za-z]{2}\d{9}[A-Za-z]{2}"
        />
        {errors.trackingNumber && <span className="field-error">{errors.trackingNumber}</span>}
        <p className="input-help">
          Format: 2 letters + 9 numbers + 2 letters (e.g., AB123456789XY)
        </p>
      </div>

      <button type="submit" disabled={loading} className="submit-btn">
        {loading ? 'Processing...' : 'Continue to Payment'}
      </button>
    </form>
  );
};

export default CheckoutForm;
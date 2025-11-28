import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import "../styles/Auth.css";

const SellerRegistration = () => {
  const [sellerData, setSellerData] = useState({
    businessName: '',
    businessType: '',
    taxId: '',
    establishmentDate: '',
    businessLicense: null,
    businessAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    },
    annualTurnover: '',
    website: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  
  const { user, registerSeller } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get user data from registration if available
  const userData = location.state;

  useEffect(() => {
    if (!user && !userData) {
      navigate('/register');
    }
  }, [user, userData, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setSellerData(prev => ({
        ...prev,
        businessAddress: {
          ...prev.businessAddress,
          [addressField]: value
        }
      }));
    } else {
      setSellerData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setSellerData(prev => ({
      ...prev,
      businessLicense: selectedFile
    }));
    
    if (selectedFile) {
      setErrors(prev => ({ ...prev, businessLicense: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!sellerData.businessName.trim()) newErrors.businessName = 'Business name is required';
    if (!sellerData.businessType) newErrors.businessType = 'Business type is required';
    if (!sellerData.taxId.trim()) newErrors.taxId = 'Tax ID/GST number is required';
    if (!sellerData.establishmentDate) newErrors.establishmentDate = 'Establishment date is required';
    if (!sellerData.businessAddress.street.trim()) newErrors.street = 'Street address is required';
    if (!sellerData.businessAddress.city.trim()) newErrors.city = 'City is required';
    if (!sellerData.businessAddress.state.trim()) newErrors.state = 'State is required';
    if (!sellerData.businessAddress.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    if (!sellerData.businessLicense) newErrors.businessLicense = 'Business license document is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Combine user data with seller data
      const completeSellerData = {
        ...userData, // Basic user info from registration
        ...sellerData // Business details from this form
      };

      // Submit both user data and seller data to backend
      const result = await registerSeller(completeSellerData);
      
      if (result.success) {
        // Navigate to seller dashboard after successful registration
        navigate('/seller-dashboard');
      } else {
        setErrors({ submit: result.error || 'Registration failed. Please try again.' });
        setLoading(false);
      }
      
    } catch (error) {
      setErrors({ submit: 'Registration failed. Please try again.' });
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card seller-registration">
        <h2>Complete Seller Registration</h2>
        <p className="subtitle">Please provide your business details to complete registration</p>
        
        {userData && (
          <div className="user-info-banner">
            <p>Completing registration for: <strong>{userData.firstName} {userData.lastName}</strong> ({userData.email})</p>
          </div>
        )}
        
        {errors.submit && <div className="error-message">{errors.submit}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Business Name *</label>
            <input
              type="text"
              name="businessName"
              value={sellerData.businessName}
              onChange={handleChange}
              className={errors.businessName ? 'error' : ''}
              placeholder="Enter your business name"
            />
            {errors.businessName && <span className="field-error">{errors.businessName}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Business Type *</label>
              <select
                name="businessType"
                value={sellerData.businessType}
                onChange={handleChange}
                className={errors.businessType ? 'error' : ''}
              >
                <option value="">Select Business Type</option>
                <option value="individual">Individual/Sole Proprietor</option>
                <option value="partnership">Partnership Firm</option>
                <option value="private-limited">Private Limited Company</option>
                <option value="llp">Limited Liability Partnership (LLP)</option>
                <option value="huf">Hindu Undivided Family (HUF)</option>
              </select>
              {errors.businessType && <span className="field-error">{errors.businessType}</span>}
            </div>

            <div className="form-group">
              <label>Establishment Date *</label>
              <input
                type="date"
                name="establishmentDate"
                value={sellerData.establishmentDate}
                onChange={handleChange}
                className={errors.establishmentDate ? 'error' : ''}
              />
              {errors.establishmentDate && <span className="field-error">{errors.establishmentDate}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Tax ID / GST Number *</label>
            <input
              type="text"
              name="taxId"
              value={sellerData.taxId}
              onChange={handleChange}
              className={errors.taxId ? 'error' : ''}
              placeholder="GSTIN Number"
            />
            {errors.taxId && <span className="field-error">{errors.taxId}</span>}
          </div>

          <div className="address-section">
            <h4>Business Address</h4>
            
            <div className="form-group">
              <label>Street Address *</label>
              <textarea
                name="address.street"
                value={sellerData.businessAddress.street}
                onChange={handleChange}
                className={errors.street ? 'error' : ''}
                placeholder="Enter complete street address"
                rows="2"
              />
              {errors.street && <span className="field-error">{errors.street}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  name="address.city"
                  value={sellerData.businessAddress.city}
                  onChange={handleChange}
                  className={errors.city ? 'error' : ''}
                  placeholder="City"
                />
                {errors.city && <span className="field-error">{errors.city}</span>}
              </div>

              <div className="form-group">
                <label>State *</label>
                <input
                  type="text"
                  name="address.state"
                  value={sellerData.businessAddress.state}
                  onChange={handleChange}
                  className={errors.state ? 'error' : ''}
                  placeholder="State"
                />
                {errors.state && <span className="field-error">{errors.state}</span>}
              </div>

              <div className="form-group">
                <label>ZIP Code *</label>
                <input
                  type="text"
                  name="address.zipCode"
                  value={sellerData.businessAddress.zipCode}
                  onChange={handleChange}
                  className={errors.zipCode ? 'error' : ''}
                  placeholder="ZIP Code"
                  maxLength="6"
                />
                {errors.zipCode && <span className="field-error">{errors.zipCode}</span>}
              </div>
            </div>

            <div className="form-group">
              <label>Country</label>
              <input
                type="text"
                name="address.country"
                value={sellerData.businessAddress.country}
                onChange={handleChange}
                placeholder="Country"
                disabled
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Annual Turnover (₹)</label>
              <input
                type="number"
                name="annualTurnover"
                value={sellerData.annualTurnover}
                onChange={handleChange}
                placeholder="Annual turnover in INR"
              />
            </div>

            <div className="form-group">
              <label>Website (Optional)</label>
              <input
                type="url"
                name="website"
                value={sellerData.website}
                onChange={handleChange}
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Business License Document *</label>
            <input
              type="file"
              onChange={handleFileUpload}
              className={errors.businessLicense ? 'error' : ''}
              accept=".pdf,.jpg,.jpeg,.png"
            />
            {errors.businessLicense && <span className="field-error">{errors.businessLicense}</span>}
            <p className="file-info">Upload PDF, JPG, or PNG files (Max 5MB)</p>
            {file && (
              <p className="file-selected">Selected: {file.name}</p>
            )}
          </div>

          <div className="form-group">
            <label>Business Description</label>
            <textarea
              name="description"
              value={sellerData.description}
              onChange={handleChange}
              placeholder="Describe your business, products, and what makes them unique..."
              rows="4"
            />
          </div>

          <button type="submit" disabled={loading} className="auth-btn">
            {loading ? 'Completing Registration...' : 'Complete Seller Registration'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellerRegistration;
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  if (!order) {
    return (
      <div className="order-success">
        <div className="container">
          <div className="error-card">
            <h1>Order Not Found</h1>
            <p>Unable to retrieve order details.</p>
            <button onClick={() => navigate('/')}>Continue Shopping</button>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="order-success">
      <div className="container">
        <div className="success-card">
          <div className="success-icon">✅</div>
          <h1>Order Placed Successfully!</h1>
          <p className="success-message">
            Thank you for your purchase, {order.customer.name}. Your order has been confirmed and will be shipped soon.
          </p>
          
          <div className="order-details">
            <div className="detail-row">
              <strong>Order ID:</strong>
              <span>{order.orderId}</span>
            </div>
            <div className="detail-row">
              <strong>Order Date:</strong>
              <span>{formatDate(order.orderDate)}</span>
            </div>
            <div className="detail-row">
              <strong>Estimated Delivery:</strong>
              <span>{formatDate(order.estimatedDelivery)}</span>
            </div>
            <div className="detail-row">
              <strong>Total Amount:</strong>
              <span className="amount">₹{order.totalAmount}</span>
            </div>
            <div className="detail-row">
              <strong>Shipping Method:</strong>
              <span>{order.shippingMethod}</span>
            </div>
            <div className="detail-row">
              <strong>Status:</strong>
              <span className="status">{order.status}</span>
            </div>
          </div>
          
          <div className="shipping-address">
            <h3>Shipping Address</h3>
            <p>{order.customer.name}</p>
            <p>{order.customer.address.street}</p>
            <p>{order.customer.address.city}, {order.customer.address.state} - {order.customer.address.zipCode}</p>
            <p>{order.customer.address.country}</p>
            <p>📞 {order.customer.phone}</p>
          </div>
          
          <div className="success-actions">
            <button 
              className="btn-primary"
              onClick={() => navigate('/orders')}
            >
              View All Orders
            </button>
            <button 
              className="btn-secondary"
              onClick={() => navigate('/')}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
import React from 'react';
import "../styles/Policy.css";

const ShippingPolicy = () => {
  return (
    <div className="policy-page">
      <div className="container">
        <div className="policy-header">
          <h1>Shipping Policy</h1>
          <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
        
        <div className="policy-content">
          <section>
            <h2>1. Shipping Methods</h2>
            <p>We offer the following shipping methods:</p>
            <ul>
              <li><strong>India Post Standard:</strong> 5-7 business days (Free)</li>
              <li><strong>India Post Express:</strong> 2-3 business days (₹99)</li>
              <li><strong>India Post Registered:</strong> 4-6 business days (₹49)</li>
            </ul>
          </section>

          <section>
            <h2>2. Shipping Areas</h2>
            <p>We currently ship to all major cities and towns across India. Some remote locations may have extended delivery times.</p>
          </section>

          <section>
            <h2>3. Order Processing</h2>
            <p>Orders are processed within 1-2 business days. You will receive a confirmation email once your order has been shipped.</p>
          </section>

          <section>
            <h2>4. Tracking Your Order</h2>
            <p>Once your order is shipped, you will receive a tracking number via email. You can track your package using our tracking system.</p>
          </section>

          <section>
            <h2>5. Shipping Costs</h2>
            <p>Shipping costs are calculated based on the shipping method selected and the delivery location.</p>
          </section>

          <section>
            <h2>6. Delivery Issues</h2>
            <p>If you experience any issues with delivery, please contact our customer support within 7 days of the expected delivery date.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicy;
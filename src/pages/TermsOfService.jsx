import React from 'react';
import "../styles/Policy.css";

const TermsOfService = () => {
  return (
    <div className="policy-page">
      <div className="container">
        <div className="policy-header">
          <h1>Terms of Service</h1>
          <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
        
        <div className="policy-content">
          <section>
            <h2>1. Acceptance of Terms</h2>
            <p>By accessing and using this marketplace, you accept and agree to be bound by the terms and provision of this agreement.</p>
          </section>

          <section>
            <h2>2. Use License</h2>
            <p>Permission is granted to temporarily use the marketplace for personal, non-commercial transitory viewing only.</p>
          </section>

          <section>
            <h2>3. User Account</h2>
            <p>You are responsible for maintaining the confidentiality of your account and password.</p>
          </section>

          <section>
            <h2>4. Products and Services</h2>
            <p>All products and services are subject to availability and we reserve the right to discontinue any products or services.</p>
          </section>

          <section>
            <h2>5. Returns and Refunds</h2>
            <p>Please refer to our Return Policy for detailed information about returns and refunds.</p>
          </section>

          <section>
            <h2>6. Governing Law</h2>
            <p>These terms shall be governed by and construed in accordance with the laws of India.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
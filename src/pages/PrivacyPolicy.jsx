import React from 'react';
import "../styles/Policy.css";

const PrivacyPolicy = () => {
  return (
    <div className="policy-page">
      <div className="container">
        <div className="policy-header">
          <h1>Privacy Policy</h1>
          <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
        
        <div className="policy-content">
          <section>
            <h2>1. Information We Collect</h2>
            <p>We collect information you provide directly to us, including:</p>
            <ul>
              <li>Personal identification information (Name, email address, phone number, etc.)</li>
              <li>Account credentials</li>
              <li>Payment information</li>
              <li>Communication preferences</li>
            </ul>
          </section>

          <section>
            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send you technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Monitor and analyze trends and usage</li>
            </ul>
          </section>

          <section>
            <h2>3. Information Sharing</h2>
            <p>We do not sell, trade, or rent your personal identification information to others.</p>
          </section>

          <section>
            <h2>4. Data Security</h2>
            <p>We implement appropriate security measures to protect your personal information.</p>
          </section>

          <section>
            <h2>5. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal information.</p>
          </section>

          <section>
            <h2>6. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at privacy@marketplace.com</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
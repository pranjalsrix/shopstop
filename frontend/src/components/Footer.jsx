
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/footer.css';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand-column">
          <Link to="/" className="footer-brand">
            ShopStop<span>.</span>
          </Link>

          <p className="footer-description">
            Good finds. Great feeling. Discover everyday favorites
            and little things that make life better.
          </p>

          <Link to="/shop" className="footer-shop-link">
            Explore the collection <span aria-hidden="true">↗</span>
          </Link>
        </div>

        <div className="footer-link-column">
          <h3>Explore</h3>
          <Link to="/">Home</Link>
          <Link to="/shop">All products</Link>
          <Link to="/cart">Your bag</Link>
        </div>

        <div className="footer-link-column">
          <h3>ShopStop</h3>
          <Link to="/about">Our story</Link>
          <Link to="/profile">My account</Link>
          <Link to="/login">Sign in</Link>
        </div>

        <div className="footer-link-column">
          <h3>Information</h3>
          <Link to="/return">Return policy</Link>
          <Link to="/disclaimer">Disclaimer</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} ShopStop. All rights reserved.</span>
        <span className="footer-bottom-note">
          MADE FOR THE JOY OF DISCOVERY.
        </span>
        <Link to="/shop">Keep discovering ↗</Link>
      </div>
    </footer>
  );
};

export default Footer;

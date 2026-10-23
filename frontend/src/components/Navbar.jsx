
import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useSelector } from 'react-redux';
import '../styles/navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const cartCount = cartItems.reduce(
    (total, item) => total + Number(item.qty || 0),
    0
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const query = search.trim();

    if (query) {
      navigate(`/shop?search=${encodeURIComponent(query)}`);
    } else {
      navigate('/shop');
    }
  };

  return (
    <header className="site-header">
      <div className="announcement-bar">
        <span>GOOD FINDS. GREAT FEELING.</span>
        <Link to="/shop">Discover something new ↗</Link>
      </div>

      <nav className="navbar">
        <Link to="/" className="navbar-brand" aria-label="ShopStop home">
          <img
            src="/ShopNestLogo.png"
            alt=""
            className="navbar-logo"
          />
          <span className="brand-wordmark">
            ShopStop<span className="brand-period">.</span>
          </span>
        </Link>

        <form className="navbar-search" onSubmit={handleSearch} role="search">
          <span className="search-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="10.8" cy="10.8" r="6.8" />
              <path d="m16 16 4.2 4.2" />
            </svg>
          </span>

          <input
            type="search"
            placeholder="Search for something good..."
            aria-label="Search products"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <button type="submit" className="search-submit">
            Search
          </button>
        </form>

        <div className="navbar-actions">
          <Link to="/shop" className="nav-action nav-shop">
            Explore
          </Link>

          <Link to="/cart" className="nav-cart" aria-label={`Shopping cart, ${cartCount} items`}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 4h2l2.2 10.1a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 8H6" />
              <circle cx="10" cy="20" r="1" />
              <circle cx="18" cy="20" r="1" />
            </svg>
            <span className="cart-label">Bag</span>
            <span className="cart-count">{cartCount}</span>
          </Link>

          {user ? (
            <div className="navbar-account">
              <Link to="/profile" className="nav-account-link">
                <span className="account-avatar">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
                <span className="account-name">{user.name || 'Account'}</span>
              </Link>
              <Link to="/my-orders" className="nav-account-link">
                My Orders
              </Link>

              {user.role === 'admin' && (
                <Link to="/admin" className="nav-admin-link">
                  Admin
                </Link>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="btn-logout"
              >
                Log out
              </button>
            </div>
          ) : (
            <Link to="/login" className="nav-login">
              Sign in <span aria-hidden="true">↗</span>
            </Link>
          )}
        </div>
      </nav>

      <div className="navbar-bottom">
        <span className="navbar-bottom-label">YOUR NEXT FAVORITE FIND</span>
        <div className="navbar-bottom-links">
          <Link to="/">Home</Link>
          <Link to="/shop">All products</Link>
          <Link to="/about">Our story</Link>
        </div>
        <Link to="/cart" className="mobile-cart-link">
          Bag ({cartCount})
        </Link>
      </div>
    </header>
  );
};

export default Navbar;

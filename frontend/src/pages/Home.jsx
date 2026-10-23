
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import '../styles/product.css';

const categories = [
  { number: '01', name: 'Discover everything', description: 'Explore the collection', to: '/shop' },
  { number: '02', name: 'Find your favorites', description: 'Browse our latest finds', to: '/shop' },
  { number: '03', name: 'Shop your way', description: 'Quality worth discovering', to: '/shop' },
];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');

        if (!res.ok) {
          throw new Error('Unable to load products right now.');
        }

        const data = await res.json();
        setProducts(Array.isArray(data) ? data.slice(0, 4) : []);
      } catch (err) {
        console.error('Failed to fetch featured products:', err);
        setError('We couldn’t load our products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="home-container">
      <section className="hero-banner">
        <div className="hero-content">
          <span className="hero-eyebrow">
            YOUR NEXT FAVORITE THING STARTS HERE
          </span>

          <h1>
            Good finds.
            <br />
            <span>Great feeling.</span>
          </h1>

          <p className="hero-description">
            Discover products you'll love, everyday essentials you'll use,
            and little things that make life better.
          </p>

          <div className="hero-actions">
            <Link to="/shop" className="hero-cta">
              Explore the collection <span aria-hidden="true">↗</span>
            </Link>
            <Link to="/about" className="hero-secondary-link">
              Get to know us
            </Link>
          </div>

          <div className="hero-note">
            <span className="hero-note-dot" />
            A little something for everyone.
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-image-frame">
            <img
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=85"
              alt="A thoughtfully arranged modern retail store"
              className="hero-image"
            />
          </div>

          <div className="hero-floating-card">
            <span className="floating-card-icon">✳</span>
            <div>
              <strong>Worth discovering</strong>
              <span>Find your next favorite</span>
            </div>
          </div>

          <div className="hero-image-caption">
            <span>THE SHOPSTOP EDIT</span>
            <span>01 / DISCOVER</span>
          </div>
        </div>

        <span className="hero-decoration" aria-hidden="true">S.</span>
      </section>

      <section className="home-categories">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">A WORLD OF GOOD FINDS</span>
            <h2>Made for your kind of shopping.</h2>
          </div>

          <Link to="/shop" className="text-link">
            Explore everything <span aria-hidden="true">↗</span>
          </Link>
        </div>

        <div className="category-grid">
          {categories.map((category) => (
            <Link
              to={category.to}
              className="category-tile"
              key={category.number}
            >
              <span className="category-number">{category.number}</span>
              <div className="category-tile-bottom">
                <div>
                  <h3>{category.name}</h3>
                  <p>{category.description}</p>
                </div>
                <span className="category-arrow" aria-hidden="true">↗</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="featured-section">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">HANDPICKED FOR YOU</span>
            <h2>Worth a closer look.</h2>
            <p className="section-description">
              A few favorites to get your discovery started.
            </p>
          </div>

          <Link to="/shop" className="text-link">
            View all products <span aria-hidden="true">↗</span>
          </Link>
        </div>

        {loading ? (
          <div className="product-grid">
            {[1, 2, 3, 4].map((item) => (
              <div className="product-skeleton" key={item}>
                <div className="skeleton-image" />
                <div className="skeleton-line" />
                <div className="skeleton-line skeleton-line-short" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="home-message">
            <p>{error}</p>
            <button
              type="button"
              className="hero-cta"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="home-message">
            <p>New finds are on their way. Check back soon!</p>
            <Link to="/shop" className="hero-cta">Visit the shop</Link>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        <div className="featured-bottom">
          <span>GOOD THINGS ARE JUST AROUND THE CORNER.</span>
          <Link to="/shop">Keep exploring ↗</Link>
        </div>
      </section>

      <section className="home-bottom-banner">
        <div>
          <span className="section-eyebrow">YOUR DISCOVERY STARTS HERE</span>
          <h2>Come for a look.<br />Stay for the finds.</h2>
          <p>There's always something new to discover at ShopStop.</p>
        </div>
        <Link to="/shop" className="banner-cta">
          Start exploring <span aria-hidden="true">↗</span>
        </Link>
      </section>
    </div>
  );
};

export default Home;

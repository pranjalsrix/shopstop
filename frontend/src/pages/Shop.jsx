
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import '../styles/product.css';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get('search') || '';

  useEffect(() => {
    let active = true;

    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products', {
          cache: 'no-store',
        });

        if (!res.ok) {
          throw new Error('Unable to load products.');
        }

        const data = await res.json();

        if (active) {
          setProducts(Array.isArray(data) ? data : []);
          setError('');
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);

        if (active) {
          setError('We couldn’t load the products. Please try again.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    const pollId = window.setInterval(fetchProducts, 5000);

    return () => {
      active = false;
      window.clearInterval(pollId);
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return products;

    return products.filter((product) =>
      (product.name || '').toLowerCase().includes(query)
    );
  }, [products, search]);

  const updateSearch = (value) => {
    if (value.trim()) {
      setSearchParams({ search: value });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="shop-page">
      <section className="shop-intro">
        <div className="shop-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>Shop</span>
        </div>

        <div className="shop-intro-content">
          <div>
            <span className="section-eyebrow">THE SHOPSTOP COLLECTION</span>
            <h1>Find your next favorite.</h1>
            <p>
              Browse the collection, discover something unexpected,
              and find the things that fit your life.
            </p>
          </div>

          <div className="shop-intro-mark" aria-hidden="true">
            S<span>.</span>
          </div>
        </div>
      </section>

      <section className="shop-catalog">
        <div className="shop-toolbar">
          <div className="shop-results">
            <h2>All products</h2>
            {!loading && !error && (
              <span className="shop-results-count">
                {filteredProducts.length}{' '}
                {filteredProducts.length === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>

          <label className="shop-search">
            <span className="shop-search-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="10.8" cy="10.8" r="6.8" />
                <path d="m16 16 4.2 4.2" />
              </svg>
            </span>

            <input
              type="search"
              placeholder="Find a product..."
              value={search}
              onChange={(event) => updateSearch(event.target.value)}
              aria-label="Filter products by name"
            />

            {search && (
              <button
                type="button"
                className="shop-search-clear"
                onClick={() => updateSearch('')}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </label>
        </div>

        {search && (
          <div className="shop-search-status">
            Showing results for <strong>“{search}”</strong>
            <button type="button" onClick={() => updateSearch('')}>
              Clear search
            </button>
          </div>
        )}

        {loading ? (
          <div className="product-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div className="product-skeleton" key={item}>
                <div className="skeleton-image" />
                <div className="skeleton-line" />
                <div className="skeleton-line skeleton-line-short" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="shop-empty-state">
            <span className="shop-empty-icon">!</span>
            <h3>Something went wrong</h3>
            <p>{error}</p>
            <button
              type="button"
              className="shop-retry-button"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="product-grid shop-product-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="shop-empty-state">
            <span className="shop-empty-icon" aria-hidden="true">⌕</span>
            <h3>No finds this time.</h3>
            <p>
              We couldn't find any products matching “{search}”.
              Try another search.
            </p>
            <button
              type="button"
              className="shop-retry-button"
              onClick={() => updateSearch('')}
            >
              View all products
            </button>
          </div>
        )}

        {!loading && !error && filteredProducts.length > 0 && (
          <div className="shop-bottom-note">
            <span>GOOD FINDS TAKE TIME. TAKE YOURS.</span>
            <span>{filteredProducts.length} products to explore</span>
          </div>
        )}
      </section>
    </div>
  );
};

export default Shop;

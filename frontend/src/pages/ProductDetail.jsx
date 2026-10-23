import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  addToCart,
  updateCartStock,
} from '../redux/cartSlice';
import '../styles/product.css';

const POLL_INTERVAL_MS = 5000;

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState(false);
  const [now, setNow] = useState(Date.now());

  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.cartItems);

  useEffect(() => {
    let active = true;

    const fetchProduct = async (showLoading = false) => {
      if (showLoading && active) {
        setLoading(true);
        setError('');
      }

      try {
        const res = await fetch(`/api/products/${id}`, {
          cache: 'no-store',
        });

        if (!res.ok) {
          throw new Error(
            res.status === 404
              ? 'This product could not be found.'
              : 'We couldn’t load this product. Please try again.'
          );
        }

        const data = await res.json();

        if (!data || !data._id) {
          throw new Error('This product could not be found.');
        }

        if (active) {
          setProduct(data);
          setError('');
        }
      } catch (err) {
        if (active) {
          console.error('Product fetch failed:', err);
          setError(
            err.message || 'Something went wrong while loading the product.'
          );
        }
      } finally {
        if (active && showLoading) {
          setLoading(false);
        }
      }
    };

    setProduct(null);
    setQuantity(1);
    setAddedMessage(false);
    setLoading(true);
    setError('');

    fetchProduct(true);

    const pollId = window.setInterval(() => {
      fetchProduct(false);
    }, POLL_INTERVAL_MS);

    return () => {
      active = false;
      window.clearInterval(pollId);
    };
  }, [id]);

  useEffect(() => {
    const clockId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(clockId);
  }, []);

  useEffect(() => {
    if (product && product.stock != null) {
      dispatch(
        updateCartStock({
          productId: product._id,
          stock: product.stock,
        })
      );
    }
  }, [product, dispatch]);

  const existingCartItem = cartItems.find(
    (item) => item.productId === product?._id
  );

  const stock = Math.max(0, Math.floor(Number(product?.stock) || 0));
  const alreadyInCart = Number(existingCartItem?.qty) || 0;
  const remainingStock = Math.max(0, stock - alreadyInCart);
  const inStock = stock > 0;
  const maxSelectable = Math.max(1, remainingStock);

  const isDemoProduct = product?.isDemoProduct === true;
  const restockDeadline = product?.restockAt
    ? new Date(product.restockAt).getTime()
    : null;

  const secondsRemaining =
    restockDeadline && Number.isFinite(restockDeadline)
      ? Math.max(0, Math.ceil((restockDeadline - now) / 1000))
      : null;

  const formatCountdown = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(
      remainingSeconds
    ).padStart(2, '0')}`;
  };

  const handleAddToCart = () => {
    if (
      !product ||
      !inStock ||
      remainingStock <= 0 ||
      quantity > remainingStock
    ) {
      return;
    }

    dispatch(
      addToCart({
        productId: product._id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        stock,
        qty: quantity,
      })
    );

    setAddedMessage(true);
  };

  const formatPrice = (price) =>
    `₹${Number(price || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  if (loading) {
    return (
      <main className="detail-state-page">
        <div className="detail-loading-card">
          <div className="detail-loader" />
          <h2>Finding something you’ll love</h2>
          <p>Loading product details…</p>
        </div>
      </main>
    );
  }

  if (error && !product) {
    return (
      <main className="detail-state-page">
        <div className="detail-message-card">
          <span className="detail-state-icon">✦</span>
          <p className="detail-eyebrow">A LITTLE DETOUR</p>
          <h1>Product not found</h1>
          <p>{error}</p>
          <Link to="/shop" className="btn">
            Explore the shop <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </main>
    );
  }

  if (!product) return null;

  return (
    <main className="product-detail-page">
      <nav className="detail-breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/shop">Shop</Link>
        {product.category && (
          <>
            <span>/</span>
            <span>{product.category}</span>
          </>
        )}
        <span>/</span>
        <span className="detail-breadcrumb-current">{product.name}</span>
      </nav>

      <section className="product-detail">
        <div className="detail-image-container">
          <div className="detail-image-badge">SHOPSTOP PICK</div>
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="detail-image"
            />
          ) : (
            <div className="detail-image-placeholder">
              <span>✦</span>
              <p>Image coming soon</p>
            </div>
          )}
        </div>

        <div className="detail-info">
          <p className="detail-eyebrow">
            {product.category || 'DISCOVER SOMETHING NEW'}
          </p>

          <h1 className="detail-title">{product.name}</h1>

          <div className="detail-price-row">
            <p className="detail-price">{formatPrice(product.price)}</p>
            <span className="detail-price-note">
              Inclusive of listed price
            </span>
          </div>

          <div className="detail-divider" />

          <div className="detail-description">
            <h2>Product details</h2>
            <p>
              {product.description ||
                'A great addition to your collection. Add it to your cart to get started.'}
            </p>
          </div>

          <div
            className={`detail-stock ${inStock ? 'is-in-stock' : 'is-out-of-stock'
              }`}
          >
            <span className="detail-stock-dot" />
            <span>
              {!inStock
                ? 'Currently out of stock'
                : remainingStock > 0
                  ? `${remainingStock} available to add${alreadyInCart > 0
                    ? ` · ${alreadyInCart} already in cart`
                    : ''
                  }`
                  : `Stock limit reached · ${alreadyInCart} in cart`}
            </span>
          </div>

          {!inStock && isDemoProduct && (
            <div className="detail-restock-countdown" role="status">
              {secondsRemaining !== null && secondsRemaining > 0 ? (
                <>
                  <span className="detail-restock-label">Expected restock</span>
                  <strong>{formatCountdown(secondsRemaining)}</strong>
                  <span className="detail-restock-hint">
                    This demo item is scheduled to restock.
                  </span>
                </>
              ) : (
                <span className="detail-restock-hint">
                  Checking for restock availability…
                </span>
              )}
            </div>
          )}

          {inStock && remainingStock > 0 && (
            <div className="detail-purchase-row">
              <div className="detail-quantity-picker">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  −
                </button>

                <span aria-live="polite">{quantity}</span>

                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) => Math.min(maxSelectable, q + 1))
                  }
                  disabled={quantity >= maxSelectable}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <span className="detail-quantity-hint">
                {remainingStock} available
              </span>
            </div>
          )}

          <div className="detail-add-action">
            <button
              type="button"
              onClick={handleAddToCart}
              className="detail-add-button"
              disabled={
                !inStock ||
                remainingStock <= 0 ||
                quantity > remainingStock
              }
            >
              <span>
                {!inStock
                  ? 'Out of stock'
                  : remainingStock <= 0
                    ? 'Stock limit reached'
                    : 'Add to cart'}
              </span>
              {inStock && remainingStock > 0 && (
                <span aria-hidden="true">↗</span>
              )}
            </button>

            {addedMessage && (
              <span className="detail-added-message" role="status">
                <span aria-hidden="true">✓</span> Added to bag
              </span>
            )}
          </div>

          <div className="detail-trust-row">
            <div className="detail-trust-item">
              <span className="detail-trust-icon">✓</span>
              <span>Easy ordering</span>
            </div>
            <div className="detail-trust-item">
              <span className="detail-trust-icon">♡</span>
              <span>Picked for you</span>
            </div>
          </div>

          <Link to="/shop" className="detail-back-link">
            <span aria-hidden="true">←</span> Back to all products
          </Link>
        </div>
      </section>

      <section className="detail-bottom-note">
        <span className="detail-note-symbol">✳</span>
        <div>
          <h2>Good finds. Better everyday.</h2>
          <p>Explore more from ShopStop and find your next favourite.</p>
        </div>
        <Link to="/shop" className="detail-note-link">
          Keep exploring <span aria-hidden="true">↗</span>
        </Link>
      </section>
    </main>
  );
};

export default ProductDetail;
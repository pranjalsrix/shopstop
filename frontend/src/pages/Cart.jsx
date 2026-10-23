
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/cart.css';
import { removeFromCart, setCartQuantity } from '../redux/cartSlice';


const Cart = () => {
  const cartItems = useSelector((state) => state.cart.cartItems);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRemove = (id) => {
    dispatch(removeFromCart(id));
  };

  const handleUpdateQty = (item, qty) => {
    dispatch(
      setCartQuantity({
        productId: item.productId,
        qty,
      })
    );
  };

  const formatPrice = (price) =>
    `₹${Number(price || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const totalQuantity = cartItems.reduce(
    (total, item) => total + Number(item.qty || 0),
    0
  );

  const totalPrice = cartItems.reduce(
    (total, item) =>
      total + Number(item.price || 0) * Number(item.qty || 0),
    0
  );

  return (
    <main className="cart-page">
      <div className="cart-page-header">
        <div>
          <p className="cart-eyebrow">YOUR SHOPPING BAG</p>
          <h1>Your cart<span>.</span></h1>
          <p className="cart-page-subtitle">
            Your great finds are just a few steps away.
          </p>
        </div>

        <Link to="/shop" className="cart-continue-link">
          <span aria-hidden="true">←</span> Continue shopping
        </Link>
      </div>

      {cartItems.length === 0 ? (
        <section className="cart-empty">
          <div className="cart-empty-icon" aria-hidden="true">
            <svg viewBox="0 0 64 64" fill="none">
              <path
                d="M12 22h40l-4 32H16l-4-32Z"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <path
                d="M23 24v-7a9 9 0 0 1 18 0v7"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M26 36h12"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <p className="cart-eyebrow">NOTHING HERE YET</p>
          <h2>Your cart is taking a little break.</h2>
          <p className="cart-empty-description">
            Find something you love and it’ll show up here, ready for checkout.
          </p>

          <Link to="/shop" className="cart-primary-button">
            Explore the shop <span aria-hidden="true">↗</span>
          </Link>
        </section>
      ) : (
        <>
          <div className="cart-content-heading">
            <h2>Your items</h2>
            <span>
              {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'}
            </span>
          </div>

          <div className="cart-layout">
            <section className="cart-items" aria-label="Items in your cart">
              {cartItems.map((item) => (
                <article key={item.productId} className="cart-item">
                  <Link
                    to={`/product/${item.productId}`}
                    className="cart-item-image-wrap"
                    aria-label={`View ${item.name}`}
                  >
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="cart-item-image"
                      />
                    ) : (
                      <div className="cart-item-image-placeholder">✦</div>
                    )}
                  </Link>

                  <div className="cart-item-details">
                    <div className="cart-item-main">
                      <div>
                        <p className="cart-item-label">SHOPSTOP FIND</p>
                        <h3>
                          <Link to={`/product/${item.productId}`}>
                            {item.name}
                          </Link>
                        </h3>
                      </div>

                      <p className="cart-item-price">
                        {formatPrice(item.price)}
                      </p>
                    </div>

                    <p className="cart-item-unit-price">
                      {formatPrice(item.price)} <span>per item</span>
                    </p>

                    <div className="cart-item-actions">
                      <div className="cart-quantity-control">
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateQty(item, Number(item.qty) - 1)
                          }
                          disabled={Number(item.qty) <= 1}
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          −
                        </button>

                        <span aria-live="polite">{item.qty}</span>

                        <button
                          onClick={() => handleUpdateQty(item, Number(item.qty) + 1)}
                          disabled={item.stock != null && Number(item.qty) >= Number(item.stock)}
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        className="cart-remove-button"
                        onClick={() => handleRemove(item.productId)}
                      >
                        <span aria-hidden="true">×</span> Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            <aside className="cart-summary">
              <p className="cart-eyebrow">THE TOTAL</p>
              <h2>Order summary</h2>

              <div className="cart-summary-line">
                <span>Subtotal ({totalQuantity} items)</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>

              <div className="cart-summary-line">
                <span>Shipping</span>
                <span className="cart-shipping-note">Calculated at checkout</span>
              </div>

              <div className="cart-summary-divider" />

              <div className="cart-summary-total">
                <span>Estimated total</span>
                <strong>{formatPrice(totalPrice)}</strong>
              </div>

              <p className="cart-tax-note">
                Final charges, including any applicable shipping fees or taxes,
                are shown during checkout.
              </p>

              <button
                type="button"
                className="cart-checkout-button"
                onClick={() => navigate('/checkout')}
              >
                Proceed to checkout <span aria-hidden="true">↗</span>
              </button>

              <div className="cart-secure-note">
                <span aria-hidden="true">✓</span>
                <span>Review your order before placing it.</span>
              </div>

              <Link to="/shop" className="cart-summary-continue">
                Keep exploring
              </Link>
            </aside>
          </div>
        </>
      )}
    </main>
  );
};

export default Cart;

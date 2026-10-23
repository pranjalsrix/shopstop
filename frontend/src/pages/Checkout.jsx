
import React, { useState, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { clearCart } from '../redux/cartSlice';
import '../styles/checkout.css';

const Checkout = () => {
  const { user } = useContext(AuthContext);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: '',
    street: '',
    city: '',
    postalCode: '',
    country: '',
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const totalQuantity = cartItems.reduce(
    (total, item) => total + Number(item.qty || 0),
    0
  );

  const totalPrice = cartItems.reduce(
    (total, item) =>
      total + Number(item.price || 0) * Number(item.qty || 0),
    0
  );

  const formatPrice = (price) =>
    `₹${Number(price || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const updateAddress = (field, value) => {
    setAddress((current) => ({ ...current, [field]: value }));
  };

  const saveOrder = async (paymentId) => {
    const saveOrderRes = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({
        items: cartItems,
        totalAmount: totalPrice,
        address,
        paymentId,
      }),
    });

    const result = await saveOrderRes.json().catch(() => ({}));

    if (!saveOrderRes.ok) {
      throw new Error(result.message || 'Payment succeeded, but saving your order failed. Please contact support before trying to pay again.');
    }

    dispatch(clearCart());
    navigate('/ordersuccess');
  };

  const handlePayment = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!cartItems.length) {
      setPaymentError('Your cart is empty. Add a product before checkout.');
      return;
    }

    setPaymentError('');
    setIsProcessing(true);

    try {
      if (!window.Razorpay) {
        throw new Error(
          'The payment window could not load. Please refresh the page and try again.'
        );
      }

      const orderRes = await fetch('/api/payment/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalPrice }),
      });

      const orderData = await orderRes.json().catch(() => ({}));

      if (!orderRes.ok) {
        throw new Error(
          orderData.message ||
          'Payment could not be initialized. Please check the backend payment configuration.'
        );
      }

      if (!orderData.id || !orderData.amount || !orderData.currency) {
        throw new Error('The payment server returned an invalid order. Please try again.');
      }

      if (!orderData.key && !process.env.REACT_APP_RAZORPAY_KEY_ID) {
        throw new Error(
          'The Razorpay public test key is not configured in the frontend.'
        );
      }

      const options = {
        key: orderData.key || process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ShopStop',
        description: 'ShopStop order payment',
        order_id: orderData.id,

        prefill: {
          name: address.fullName,
          email: user?.email || '',
        },

        theme: { color: '#e86f35' },

        modal: {
          ondismiss: () => setIsProcessing(false),
        },

        handler: async (response) => {
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(response),
            });

            const verifyData = await verifyRes.json().catch(() => ({}));

            if (!verifyRes.ok) {
              throw new Error(
                verifyData.message || 'Payment verification failed.'
              );
            }

            await saveOrder(response.razorpay_payment_id);
          } catch (error) {
            console.error('Payment/order error:', error);
            setPaymentError(
              error.message ||
              'We could not finish processing your order. Please check your order status before attempting another payment.'
            );
            setIsProcessing(false);
          }
        },
      };

      const paymentWindow = new window.Razorpay(options);

      paymentWindow.on('payment.failed', (response) => {
        setPaymentError(
          response.error?.description ||
          'Payment failed. Please check the details and try again.'
        );
        setIsProcessing(false);
      });

      paymentWindow.open();
    } catch (error) {
      console.error('Checkout error:', error);
      setPaymentError(error.message || 'Something went wrong. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!user) {
      navigate('/login');
      return;
    }

    handlePayment();
  };

  if (!cartItems.length) {
    return (
      <main className="checkout-page">
        <section className="checkout-empty">
          <div className="checkout-empty-icon">✦</div>
          <p className="checkout-eyebrow">READY WHEN YOU ARE</p>
          <h1>Your cart is empty.</h1>
          <p>Choose something you love before heading to checkout.</p>
          <Link to="/shop" className="checkout-primary-button">
            Explore the shop <span aria-hidden="true">↗</span>
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <header className="checkout-header">
        <div>
          <p className="checkout-eyebrow">ALMOST YOURS</p>
          <h1>Checkout<span>.</span></h1>
          <p>Confirm your delivery details and review your order.</p>
        </div>

        <Link to="/cart" className="checkout-back-link">
          <span aria-hidden="true">←</span> Back to cart
        </Link>
      </header>

      <div className="checkout-progress">
        <div className="checkout-progress-step is-complete">
          <span>✓</span> Shopping bag
        </div>
        <div className="checkout-progress-line" />
        <div className="checkout-progress-step is-current">
          <span>2</span> Checkout
        </div>
        <div className="checkout-progress-line" />
        <div className="checkout-progress-step">
          <span>3</span> Confirmation
        </div>
      </div>

      <form onSubmit={handleSubmit} className="checkout-content">
        <section className="shipping-form">
          <div className="checkout-section-heading">
            <span className="checkout-section-number">01</span>
            <div>
              <h2>Delivery details</h2>
              <p>Where should we send your order?</p>
            </div>
          </div>

          <div className="checkout-fields">
            <label className="checkout-field checkout-field-full">
              <span>Full name</span>
              <input
                type="text"
                autoComplete="name"
                placeholder="Enter your full name"
                required
                value={address.fullName}
                onChange={(e) => updateAddress('fullName', e.target.value)}
              />
            </label>

            <label className="checkout-field checkout-field-full">
              <span>Street address</span>
              <input
                type="text"
                autoComplete="street-address"
                placeholder="House number and street"
                required
                value={address.street}
                onChange={(e) => updateAddress('street', e.target.value)}
              />
            </label>

            <label className="checkout-field">
              <span>City</span>
              <input
                type="text"
                autoComplete="address-level2"
                placeholder="Your city"
                required
                value={address.city}
                onChange={(e) => updateAddress('city', e.target.value)}
              />
            </label>

            <label className="checkout-field">
              <span>Postal code</span>
              <input
                type="text"
                autoComplete="postal-code"
                placeholder="Postal code"
                required
                value={address.postalCode}
                onChange={(e) => updateAddress('postalCode', e.target.value)}
              />
            </label>

            <label className="checkout-field checkout-field-full">
              <span>Country</span>
              <input
                type="text"
                autoComplete="country-name"
                placeholder="Country"
                required
                value={address.country}
                onChange={(e) => updateAddress('country', e.target.value)}
              />
            </label>
          </div>

          <div className="checkout-payment-info">
            <span className="checkout-payment-icon">↗</span>
            <div>
              <h3>Secure online payment</h3>
              <p>
                Your payment options will appear in the payment window when
                your payment service is configured.
              </p>
            </div>
          </div>

          {paymentError && (
            <div className="checkout-error" role="alert">
              <strong>We couldn't complete checkout</strong>
              <p>{paymentError}</p>
            </div>
          )}

          <button
            type="submit"
            className="checkout-submit-button"
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing…' : 'Continue to payment'}
            {!isProcessing && <span aria-hidden="true">↗</span>}
          </button>

          <p className="checkout-disclaimer">
            Your order is created after payment verification succeeds.
          </p>
        </section>

        <aside className="checkout-order-summary">
          <div className="checkout-summary-title">
            <div>
              <p className="checkout-eyebrow">THE GOOD STUFF</p>
              <h2>Order summary</h2>
            </div>
            <span>{totalQuantity} items</span>
          </div>

          <div className="checkout-order-items">
            {cartItems.map((item) => (
              <div className="checkout-order-item" key={item.productId}>
                <div className="checkout-order-image">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} />
                  ) : (
                    <span>✦</span>
                  )}
                  <span className="checkout-item-quantity">{item.qty}</span>
                </div>

                <div className="checkout-order-item-info">
                  <h3>{item.name}</h3>
                  <p>Qty: {item.qty}</p>
                </div>

                <strong>
                  {formatPrice(Number(item.price || 0) * Number(item.qty || 0))}
                </strong>
              </div>
            ))}
          </div>

          <div className="checkout-summary-divider" />

          <div className="checkout-total-line">
            <span>Subtotal</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>

          <div className="checkout-total-line">
            <span>Shipping</span>
            <span className="checkout-shipping-value">Calculated at checkout</span>
          </div>

          <div className="checkout-summary-divider" />

          <div className="checkout-grand-total">
            <div>
              <span>Order total</span>
              <p>Final charges confirmed before payment.</p>
            </div>
            <strong>{formatPrice(totalPrice)}</strong>
          </div>

          <Link to="/cart" className="checkout-edit-cart">
            Edit your bag <span aria-hidden="true">↗</span>
          </Link>
        </aside>
      </form>
    </main>
  );
};

export default Checkout;

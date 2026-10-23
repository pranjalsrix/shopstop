
import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/my-orders.css';

const formatPrice = (amount) =>
    `₹${Number(amount || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

const MyOrders = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user?.token) {
            navigate('/login');
            return;
        }

        const controller = new AbortController();

        const fetchOrders = async () => {
            setLoading(true);
            setError('');

            try {
                const response = await fetch('/api/orders/myorders', {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                    signal: controller.signal,
                });

                const data = await response.json();

                if (response.status === 401) {
                    logout();
                    navigate('/login');
                    return;
                }

                if (!response.ok) {
                    throw new Error(data.message || 'Unable to load your orders.');
                }

                setOrders(Array.isArray(data) ? data : []);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setError(err.message || 'Something went wrong.');
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchOrders();

        return () => controller.abort();
    }, [user, navigate, logout]);

    if (!user) return null;

    return (
        <main className="orders-page">
            <div className="orders-heading">
                <div>
                    <p className="orders-eyebrow">YOUR SHOPSTOP ACCOUNT</p>
                    <h1>My orders<span>.</span></h1>
                    <p className="orders-subtitle">
                        Your purchases, all in one place.
                    </p>
                </div>

                <Link to="/shop" className="orders-shop-link">
                    Continue shopping ↗
                </Link>
            </div>

            {loading ? (
                <div className="orders-message">Loading your orders...</div>
            ) : error ? (
                <div className="orders-message orders-error">
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>
                        Try again
                    </button>
                </div>
            ) : orders.length === 0 ? (
                <section className="orders-empty">
                    <div className="orders-empty-icon">♡</div>
                    <h2>No orders yet</h2>
                    <p>Your next favorite find is waiting to be discovered.</p>
                    <Link to="/shop" className="orders-primary-button">
                        Explore the shop
                    </Link>
                </section>
            ) : (
                <div className="orders-list">
                    {orders.map((order) => (
                        <article className="order-card" key={order._id}>
                            <div className="order-card-top">
                                <div>
                                    <span className="order-label">ORDER PLACED</span>
                                    <p>
                                        {order.createdAt
                                            ? new Date(order.createdAt).toLocaleDateString(
                                                'en-IN',
                                                {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                }
                                            )
                                            : 'Date unavailable'}
                                    </p>
                                </div>

                                <div>
                                    <span className="order-label">TOTAL</span>
                                    <p className="order-total">
                                        {formatPrice(order.totalAmount)}
                                    </p>
                                </div>

                                <span
                                    className={`order-status status-${String(
                                        order.status || 'Pending'
                                    ).toLowerCase()}`}
                                >
                                    {order.status || 'Pending'}
                                </span>
                            </div>

                            <div className="order-id">
                                Order ID: {order._id}
                            </div>

                            <div className="order-items">
                                {order.items?.map((item, index) => (
                                    <div
                                        className="order-item"
                                        key={`${item.productId}-${index}`}
                                    >
                                        <div>
                                            <span className="order-item-name">
                                                {item.name || item.productName || 'ShopStop product'}
                                            </span>
                                            <span className="order-item-qty">
                                                Qty: {item.qty}
                                            </span>
                                        </div>
                                        <strong>
                                            {formatPrice(Number(item.price) * Number(item.qty))}
                                        </strong>
                                    </div>
                                ))}
                            </div>

                            {order.address && (
                                <div className="order-delivery">
                                    <span>DELIVERING TO</span>
                                    <p>
                                        {order.address.fullName} · {order.address.street},{' '}
                                        {order.address.city}, {order.address.postalCode},{' '}
                                        {order.address.country}
                                    </p>
                                </div>
                            )}
                        </article>
                    ))}
                </div>
            )}
        </main>
    );
};

export default MyOrders;

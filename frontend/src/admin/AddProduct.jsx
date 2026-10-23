import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const POLL_INTERVAL_MS = 5000;

const AdminProducts = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [now, setNow] = useState(Date.now());

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
        console.error('Failed to fetch admin products:', err);

        if (active) {
          setError('Could not refresh products. Please try again.');
        }
      }
    };

    fetchProducts();

    const pollId = window.setInterval(fetchProducts, POLL_INTERVAL_MS);

    return () => {
      active = false;
      window.clearInterval(pollId);
    };
  }, []);

  useEffect(() => {
    const clockId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(clockId);
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        window.alert(data.message || 'Could not delete product.');
        return;
      }

      // Remove it immediately; polling will reconcile the list afterward.
      setProducts((current) => current.filter((p) => p._id !== id));
      window.alert(data.message || 'Product action completed.');
    } catch (err) {
      console.error('Delete product failed:', err);
      window.alert('Could not contact the server. Please try again.');
    }
  };

  const formatCountdown = (deadline) => {
    const deadlineMs = new Date(deadline).getTime();

    if (!Number.isFinite(deadlineMs)) return null;

    const seconds = Math.max(0, Math.ceil((deadlineMs - now) / 1000));
    const minutesPart = Math.floor(seconds / 60);
    const secondsPart = seconds % 60;

    return {
      seconds,
      text: `${String(minutesPart).padStart(2, '0')}:${String(
        secondsPart
      ).padStart(2, '0')}`,
    };
  };

  return (
    <div style={containerStyle}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <h2 style={{ color: '#f97316' }}>Manage Products</h2>
        <Link to="/admin/add-product" className="btn">
          + Add Product
        </Link>
      </div>

      <p style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>
        Inventory refreshes automatically while this page is open.
      </p>

      {error && (
        <p role="alert" style={{ color: '#fca5a5' }}>
          {error}
        </p>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr style={rowStyle}>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>NAME</th>
              <th style={thStyle}>PRICE</th>
              <th style={thStyle}>CATEGORY</th>
              <th style={thStyle}>STOCK</th>
              <th style={thStyle}>RESTOCK STATUS</th>
              <th style={thStyle}>ACTIONS</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => {
              const stock = Math.max(
                0,
                Math.floor(Number(product.stock) || 0)
              );

              const countdown =
                product.isDemoProduct && stock === 0 && product.restockAt
                  ? formatCountdown(product.restockAt)
                  : null;

              const restoreCountdown =
                product.isDemoHidden && product.restoreAt
                  ? formatCountdown(product.restoreAt)
                  : null;

              let status = '—';

              if (product.isDemoHidden) {
                status = restoreCountdown
                  ? restoreCountdown.seconds > 0
                    ? `Returning in ${restoreCountdown.text}`
                    : 'Return deadline passed'
                  : 'Temporarily hidden';
              } else if (stock > 0) {
                status = 'In stock';
              } else if (!product.isDemoProduct) {
                status = 'Out of stock';
              } else if (countdown && countdown.seconds > 0) {
                status = `Restocks in ${countdown.text}`;
              } else {
                status = 'Checking for restock';
              }

              return (
                <tr key={product._id} style={rowStyle}>
                  <td style={tdStyle}>
                    {product._id.substring(0, 8)}...
                  </td>
                  <td style={tdStyle}>{product.name}</td>
                  <td style={tdStyle}>
                    ₹{Number(product.price || 0).toFixed(2)}
                  </td>
                  <td style={tdStyle}>{product.category}</td>
                  <td style={tdStyle}>{stock}</td>
                  <td
                    style={{
                      ...tdStyle,
                      color: stock > 0 ? '#86efac' : '#fdba74',
                      minWidth: '170px',
                    }}
                  >
                    {status}
                  </td>
                  <td style={tdStyle}>
                    <Link
                      to={`/admin/edit-product/${product._id}`}
                      style={editBtn}
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(product._id)}
                      style={deleteBtn}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}

            {products.length === 0 && !error && (
              <tr>
                <td style={tdStyle} colSpan={7}>
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const containerStyle = {
  maxWidth: '1200px',
  margin: '40px auto',
  padding: '30px',
  background: '#18181b',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.05)',
  color: '#fafafa',
};

const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const rowStyle = { borderBottom: '1px solid rgba(255,255,255,0.1)' };
const thStyle = {
  padding: '15px',
  textAlign: 'left',
  color: '#a1a1aa',
  fontSize: '0.9rem',
};
const tdStyle = { padding: '15px', textAlign: 'left' };
const editBtn = {
  display: 'inline-block',
  background: '#3b82f6',
  color: '#fff',
  padding: '6px 12px',
  borderRadius: '4px',
  marginRight: '10px',
  textDecoration: 'none',
};
const deleteBtn = {
  background: '#ef4444',
  color: '#fff',
  padding: '6px 12px',
  borderRadius: '4px',
  border: 'none',
  cursor: 'pointer',
};

export default AdminProducts;
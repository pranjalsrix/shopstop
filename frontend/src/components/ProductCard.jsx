import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/product.css';

const ProductCard = ({ product }) => {
  const stock = Math.max(0, Math.floor(Number(product.stock) || 0));
  const inStock = stock > 0;

  return (
    <article className="product-card">
      <Link
        to={`/product/${product._id}`}
        className="product-image-wrap"
        aria-label={`View ${product.name}`}
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          className="product-image"
          loading="lazy"
        />
      </Link>

      <div className="product-info">
        <h3>{product.name}</h3>

        <p className="price">
          ₹{Number(product.price).toLocaleString('en-IN')}
        </p>

        <p
          className={`product-stock-status ${inStock ? 'is-in-stock' : 'is-out-of-stock'
            }`}
          role="status"
        >
          {inStock ? `${stock} in stock` : 'Currently out of stock'}
        </p>

        <Link to={`/product/${product._id}`} className="btn">
          View details <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </article>
  );
};

export default ProductCard;
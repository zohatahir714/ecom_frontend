import React from 'react';

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/400x300/1f2937/9ca3af?text=Pizza';

const ProductCard = ({ product, onAddToCart }) => {
  const imageUrl = product?.image || product?.imageUrl || PLACEHOLDER_IMAGE;

  return (
    <div className="product-card">
      <div className="product-card-image-wrap">
        <img
          src={imageUrl}
          alt={product?.name || 'Product'}
          className="product-card-image"
          loading="lazy"
          onError={(e) => {
            e.target.src = PLACEHOLDER_IMAGE;
          }}
        />
      </div>
      <div className="product-card-body">
        <h4 className="product-card-title">{product?.name}</h4>
        {product?.description && (
          <p className="product-card-description">{product.description}</p>
        )}
        <p className="price">${(product?.price ?? 0).toFixed(2)}</p>
        {onAddToCart && (
          <button type="button" className="btn-primary product-card-btn" onClick={() => onAddToCart(product)}>
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;

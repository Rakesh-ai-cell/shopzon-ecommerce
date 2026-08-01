import React, { useState, useEffect } from 'react';

export default function ProductDetail({ productId, user, onClose, onAddToCart }) {
  const [product, setProduct] = useState(null);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [quantity, setQuantity] = useState(1); 
  const [loading, setLoading] = useState(true);
  const [reviewMessage, setReviewMessage] = useState('');

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  const fetchProductDetails = () => {
    fetch(`http://127.0.0.1:5000/api/products/${productId}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(err => console.error("Error connecting to single product API:", err));
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    fetch(`http://127.0.0.1:5000/api/products/${productId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user.username, comment, rating })
    })
    .then(res => res.json())
    .then(() => {
      setComment('');
      setReviewMessage('Review submitted successfully!');
      fetchProductDetails(); 
      setTimeout(() => setReviewMessage(''), 3000);
    })
    .catch(err => console.error("Failed to post comment:", err));
  };

  const renderStars = (count) => {
    const totalStars = Math.round(count || 5);
    return (
      <span style={{ color: '#ffa41c', fontSize: '14px', letterSpacing: '1px' }}>
        {'★'.repeat(totalStars)}{'☆'.repeat(5 - totalStars)}
      </span>
    );
  };

  if (loading) return <div style={{ color: '#111', padding: '30px', textAlign: 'center' }}>Loading asset specifications...</div>;
  if (!product) return <div style={{ color: '#111', padding: '30px', textAlign: 'center' }}>Product specifications not found.</div>;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2500, padding: '20px' }}>
      <div style={{ background: '#fff', width: '100%', maxWidth: '850px', maxHeight: '90vh', borderRadius: '8px', overflowY: 'auto', display: 'flex', flexDirection: 'column', color: '#111', fontFamily: 'Arial, sans-serif' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 25px', borderBottom: '1px solid #ddd', background: '#f8f9fa', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Product Overview Sheet</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', fontWeight: 'bold', color: '#555' }}>✕</button>
        </div>

        <div style={{ display: 'flex', gap: '35px', padding: '25px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa', borderRadius: '6px', padding: '15px', border: '1px solid #eee' }}>
            <img src={product.image_url} alt="" style={{ maxWidth: '100%', maxHeight: '280px', objectFit: 'contain' }} />
          </div>

          <div style={{ flex: 1.2, minWidth: '300px' }}>
            <span style={{ display: 'inline-block', fontSize: '11px', background: '#e7e7e7', padding: '4px 10px', borderRadius: '3px', fontWeight: 'bold', color: '#555', textTransform: 'uppercase', marginBottom: '10px' }}>
              {product.category}
            </span>
            <h2 style={{ fontSize: '22px', fontWeight: '500', margin: '0 0 10px 0', lineHeight: '1.3' }}>{product.title}</h2>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
              {renderStars(product.rating_rate)}
              <span style={{ fontSize: '13px', color: '#007185', fontWeight: '500' }}>
                {product.rating_rate || '4.5'} ({product.rating_count || 0} customer reviews)
              </span>
            </div>

            <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#111', marginBottom: '15px' }}>${product.price}</div>
            <p style={{ lineHeight: '1.5', color: '#333', fontSize: '14px', marginBottom: '22px' }}>{product.description || 'No extended summary logged for this specific items portfolio register entry point.'}</p>

            <div style={{ background: '#f7f9fa', border: '1px solid #e7e7e7', padding: '15px', borderRadius: '6px', marginBottom: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Quantity:</span>
                <select 
                  value={quantity} 
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10)))}
                  style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #ccd1d1', background: '#fff', fontSize: '14px', cursor: 'pointer' }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>

              <button 
                onClick={() => { onAddToCart(product, quantity); onClose(); }} 
                style={{ width: '100%', padding: '12px', background: '#ffd814', border: '1px solid #fcd200', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', color: '#111' }}
              >
                Add Items to Basket Matrix
              </button>
            </div>
          </div>
        </div>

        <div style={{ padding: '0 25px 25px 25px', borderTop: '1px solid #eee', marginTop: '10px' }}>
          <h4 style={{ fontSize: '16px', borderBottom: '1px solid #ddd', paddingBottom: '8px', margin: '20px 0 15px 0', fontWeight: 'bold' }}>
            Customer Reviews Thread
          </h4>
          
          <form onSubmit={handleReviewSubmit} style={{ marginBottom: '25px', background: '#f7f9fa', padding: '15px', borderRadius: '6px', border: '1px solid #eee' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>Write a Customer Review</label>
            
            <div style={{ display: 'flex', gap: '15px', marginBottom: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '13px' }}>Select Rating:</span>
              <select value={rating} onChange={(e) => setRating(Number(e.target.value))} style={{ padding: '5px 10px', borderRadius: '4px', border: '1px solid #ccc' }}>
                <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
                <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
                <option value="3">⭐⭐⭐ (3 Stars)</option>
                <option value="2">⭐⭐ (2 Stars)</option>
                <option value="1">⭐ (1 Star)</option>
              </select>
            </div>

            <textarea rows="3" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Type your experience regarding product delivery or material properties here..." required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box', marginBottom: '12px', fontSize: '13px', resize: 'vertical' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <button type="submit" style={{ padding: '7px 20px', background: '#e7e9ec', border: '1px solid #adb1b8', borderRadius: '3px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
                Submit Review Log
              </button>
              {reviewMessage && <span style={{ color: '#2e7d32', fontSize: '13px', fontWeight: 'bold' }}>{reviewMessage}</span>}
            </div>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {product.reviews && product.reviews.map((rev, i) => (
              <div key={i} style={{ borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '5px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', color: '#111' }}>{rev.username}</span>
                  {renderStars(rev.rating)}
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#333', lineHeight: '1.4' }}>{rev.comment}</p>
              </div>
            ))}
            {(!product.reviews || product.reviews.length === 0) && (
              <div style={{ color: '#767676', fontSize: '13px', textAlign: 'center', padding: '15px', background: '#fafafa', borderRadius: '4px' }}>
                No custom review feedbacks recorded for this ledger node yet.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

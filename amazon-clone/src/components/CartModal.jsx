import React, { useState } from 'react';

export default function CartModal({ cart, removeFromCart, updateQuantity, clearCart, closeModal, user }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reliable image fallback if product image fails to load
  const defaultImage = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500";

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = defaultImage;
  };

  // Financial calculations
  const subtotal = cart.reduce((sum, item) => sum + (Number(item.price || 0) * (item.qty || item.quantity || 1)), 0);
  const shippingFee = cart.length > 0 ? 9.99 : 0.00;
  const taxFee = subtotal * 0.13; // 13% tax
  const totalAmount = subtotal + shippingFee + taxFee;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("Your basket is empty!");
      return;
    }

    setIsSubmitting(true);

    // Format cart payload cleanly to ensure MySQL Foreign Key & schema alignment
    const formattedItems = cart.map(item => ({
      id: Number(item.id || item.product_id || 1),
      qty: Number(item.qty || item.quantity || 1),
      price: Number(item.price || 0)
    }));

    const payload = {
      username: user?.username || user?.email || 'Guest User',
      total_charge: parseFloat(totalAmount.toFixed(2)),
      items: formattedItems
    };

    try {
      const response = await fetch('https://shopzon-ecommerce.onrender.com/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        alert(`🎉 Purchase Successful!\nOrder Reference: #${data.order_id}\nTotal Billed: $${totalAmount.toFixed(2)}`);
        clearCart();
        closeModal();
      } else {
        alert(`Checkout Failed: ${data.error || 'Check backend server logs'}`);
      }
    } catch (err) {
      alert('Network error connecting to backend server. Please verify your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={closeModal}>
      <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={styles.header}>
          <h2 style={{ margin: 0, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🛒 Review Your Basket Pipeline
          </h2>
          <button style={styles.closeBtn} onClick={closeModal}>✕</button>
        </div>

        {/* Cart Items List */}
        <div style={styles.itemsContainer}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>
              Your shopping cart is currently empty.
            </div>
          ) : (
            cart.map((item) => {
              const itemTitle = item.title || item.name || "ShopZon Item";
              const itemImg = item.image_url || item.image || defaultImage;
              const itemQty = item.qty || item.quantity || 1;
              const itemPrice = Number(item.price || 0);

              return (
                <div key={item.id} style={styles.itemRow}>
                  <div style={styles.imgWrapper}>
                    <img 
                      src={itemImg} 
                      alt={itemTitle} 
                      onError={handleImageError} 
                      style={styles.img} 
                    />
                  </div>
                  
                  <div style={styles.itemDetails}>
                    <div style={styles.itemTitle}>{itemTitle}</div>
                    <div style={styles.itemPrice}>${itemPrice.toFixed(2)}</div>
                    
                    <div style={styles.qtyRow}>
                      <label style={{ fontSize: '12px', color: '#aaa' }}>Qty:</label>
                      <button 
                        style={styles.qtyBtn} 
                        onClick={() => updateQuantity(item.id, itemQty - 1)}
                        disabled={itemQty <= 1}
                      >
                        -
                      </button>
                      <span style={{ fontWeight: 'bold', padding: '0 8px' }}>{itemQty}</span>
                      <button 
                        style={styles.qtyBtn} 
                        onClick={() => updateQuantity(item.id, itemQty + 1)}
                      >
                        +
                      </button>
                      
                      <button 
                        style={styles.removeBtn} 
                        onClick={() => removeFromCart(item.id)}
                      >
                        Remove item
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Charge Specifications Section */}
        {cart.length > 0 && (
          <div style={styles.summarySection}>
            <h4 style={{ margin: '0 0 12px 0', textAlign: 'center', color: '#aaa', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Order Charge Specifications
            </h4>
            
            <div style={styles.specRow}>
              <span>Basket Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div style={styles.specRow}>
              <span>Estimated Delivery Fee:</span>
              <span>${shippingFee.toFixed(2)}</span>
            </div>
            <div style={styles.specRow}>
              <span>Regional Estimated Tax (13%):</span>
              <span>${taxFee.toFixed(2)}</span>
            </div>

            <div style={styles.totalRow}>
              <span>Total Bill Balance:</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>

            <button 
              style={{ ...styles.checkoutBtn, opacity: isSubmitting ? 0.7 : 1 }} 
              onClick={handleCheckout}
              disabled={isSubmitting}
            >
              {isSubmitting ? '🔄 Saving to Database Engine Logs...' : '🚀 Place Secure Purchase Order'}
            </button>
            <p style={{ textAlign: 'center', fontSize: '11px', color: '#666', marginTop: '8px', marginBottom: 0 }}>
              Submitting registers real data node inputs down to backend relational tables.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    justifyContent: 'flex-end',
    zIndex: 9999,
    fontFamily: 'Arial, sans-serif'
  },
  modalCard: {
    background: '#18181c',
    width: '100%',
    maxWidth: '500px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    color: '#fff',
    boxShadow: '-5px 0 25px rgba(0,0,0,0.5)',
    padding: '24px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '16px',
    borderBottom: '1px solid #333'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#aaa',
    fontSize: '22px',
    cursor: 'pointer'
  },
  itemsContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 0'
  },
  itemRow: {
    display: 'flex',
    gap: '16px',
    background: '#222228',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '12px',
    border: '1px solid #2d2d35'
  },
  imgWrapper: {
    width: '70px',
    height: '70px',
    background: '#fff',
    borderRadius: '6px',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  img: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain'
  },
  itemDetails: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  itemTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#3498db',
    lineHeight: '1.3'
  },
  itemPrice: {
    fontSize: '15px',
    fontWeight: 'bold',
    color: '#fff',
    margin: '4px 0'
  },
  qtyRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  qtyBtn: {
    background: '#33333d',
    color: '#fff',
    border: '1px solid #444',
    borderRadius: '4px',
    width: '24px',
    height: '24px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    color: '#ff4d4d',
    fontSize: '12px',
    cursor: 'pointer',
    marginLeft: 'auto'
  },
  summarySection: {
    borderTop: '1px solid #333',
    paddingTop: '16px',
    background: '#121215',
    borderRadius: '8px',
    padding: '16px',
    marginTop: 'auto'
  },
  specRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: '#aaa',
    marginBottom: '8px'
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#ff9900',
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #2a2a30'
  },
  checkoutBtn: {
    width: '100%',
    background: '#ffd814',
    color: '#000',
    border: 'none',
    borderRadius: '25px',
    padding: '14px',
    fontWeight: 'bold',
    fontSize: '15px',
    cursor: 'pointer',
    marginTop: '16px',
    transition: 'background 0.2s'
  }
};
import React, { useState } from 'react';

export default function CartModal({ cartItems, user, onUpdateQty, onClearCart, onClose }) {
  const [orderProcessing, setOrderProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Calculate prices dynamically
  const subtotalPrice = cartItems.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);
  const deliveryFee = subtotalPrice > 100 || subtotalPrice === 0 ? 0.00 : 9.99;
  const estimatedTax = subtotalPrice * 0.13; // standard local regional engineering tax index calculation
  const totalOrderPrice = subtotalPrice + deliveryFee + estimatedTax;

  // UPDATED: Dispatches data directly to your Flask server and writes to MySQL
  const handleFinalCheckoutSubmit = () => {
    if (cartItems.length === 0) return;
    setOrderProcessing(true);

    // 1. Pack up the cart data to match your MySQL table structures exactly
    const orderData = {
      username: user.username,
      items: cartItems.map(i => ({ id: i.id, qty: i.quantity, price: i.price })),
      total_charge: totalOrderPrice.toFixed(2)
    };

    // 2. Fire the network transmission down the pipeline to Flask
    fetch('http://127.0.0.1:5000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    })
    .then(res => {
      if (!res.ok) throw new Error("Network database pipeline submission failure");
      return res.json();
    })
    .then(data => {
      setOrderProcessing(false);
      // Reads the real AUTO_INCREMENT ID generated out of your MySQL engine row!
      setSuccessMessage(`🎉 Order #${data.order_id} saved to live database successfully!`);
      
      setTimeout(() => {
        onClearCart(); // Clear local shopping state values
        onClose();     // Close overlay frame
      }, 3000);
    })
    .catch(err => {
      console.error("Checkout submission failed:", err);
      setOrderProcessing(false);
      alert("Error processing order checkout pipeline. Check backend server status.");
    });
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'flex-end', zIndex: 3000 }}>
      {/* Background overlay click-off fallback handler block */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onClick={onClose} />
      
      {/* Right Sidebar Drawer Framework Box */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '480px', background: '#ffffff', height: '100vh', boxShadow: '-5px 0 25px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', color: '#111', fontFamily: 'Arial, sans-serif' }}>
        
        {/* Drawer Top Row Title Header */}
        <div style={{ padding: '20px 25px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8f9fa' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>🛒 Review Your Basket Pipeline</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', fontWeight: 'bold', color: '#555' }}>✕</button>
        </div>

        {/* Core items scroll area panel content stack */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 25px' }}>
          {successMessage ? (
            <div style={{ textAlign: 'center', padding: '40px 10px', background: '#d4edda', color: '#155724', borderRadius: '6px', border: '1px solid #c3e6cb', marginTop: '20px' }}>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: 'bold' }}>{successMessage}</p>
              <p style={{ fontSize: '12px', color: '#155724', marginTop: '8px' }}>Your items register profile has cleared. Preparing tracking metrics entry points...</p>
            </div>
          ) : cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 10px', color: '#767676' }}>
              <span style={{ fontSize: '50px' }}>🛒</span>
              <h4 style={{ margin: '15px 0 5px 0', color: '#111' }}>Your Shopping Basket Matrix is completely empty</h4>
              <p style={{ fontSize: '13px', margin: 0 }}>Browse departments to populate interactive logistics orders entries.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {cartItems.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: '15px', borderBottom: '1px solid #eee', paddingBottom: '15px', alignItems: 'center' }}>
                  <div style={{ width: '70px', height: '70px', background: '#f9f9f9', border: '1px solid #e7e7e7', borderRadius: '4px', padding: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <img src={item.image_url} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <h5 style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#007185', fontWeight: '500', lineHeight: '1.3', height: '34px', overflow: 'hidden' }}>{item.title}</h5>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>${parseFloat(item.price).toFixed(2)}</div>
                    
                    {/* QUANTITY CONTROL BAR IN CHECOUT CARD */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button 
                        onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                        style={{ padding: '2px 8px', background: '#e7e9ec', border: '1px solid #adb1b8', borderRadius: '3px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                      >
                        -
                      </button>
                      <span style={{ fontSize: '13px', fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                        style={{ padding: '2px 8px', background: '#e7e9ec', border: '1px solid #adb1b8', borderRadius: '3px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                      >
                        +
                      </button>
                      <button 
                        onClick={() => onUpdateQty(item.id, 0)}
                        style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#b12704', cursor: 'pointer', fontSize: '11px', textDecoration: 'underline' }}
                      >
                        Remove item
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BOTTOM CHARGE METRICS & BUY BUTTON SLIDE CONTROL PANEL */}
        {cartItems.length > 0 && !successMessage && (
          <div style={{ padding: '20px 25px', borderTop: '1px solid #ddd', background: '#f8f9fa', boxShadow: '0 -4px 12px rgba(0,0,0,0.05)' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold', borderBottom: '1px solid #e7e7e7', paddingBottom: '8px' }}>Order Charge Specifications</h4>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#555', marginBottom: '6px' }}>
              <span>Basket Subtotal:</span>
              <span>${subtotalPrice.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#555', marginBottom: '6px' }}>
              <span>Estimated Delivery Fee:</span>
              <span>{deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#555', marginBottom: '12px' }}>
              <span>Regional Estimated Tax (13%):</span>
              <span>${estimatedTax.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold', color: '#b12704', marginBottom: '20px', borderTop: '1px solid #e7e7e7', paddingTop: '10px' }}>
              <span>Total Bill Balance:</span>
              <span>${totalOrderPrice.toFixed(2)}</span>
            </div>

            {/* LIVE STEP INTERACTION TRANSACTION EXECUTION TRIGGER */}
            <button
              onClick={handleFinalCheckoutSubmit}
              disabled={orderProcessing}
              style={{
                width: '100%',
                padding: '13px',
                background: orderProcessing ? '#e7e9ec' : '#ffd814',
                border: orderProcessing ? '1px solid #ccc' : '1px solid #fcd200',
                borderRadius: '20px',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: orderProcessing ? 'not-allowed' : 'pointer',
                color: '#111',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
              }}
            >
              {orderProcessing ? '🔄 Saving to Database Engine Logs...' : '🚀 Place Secure Purchase Order'}
            </button>
            
            <p style={{ margin: '10px 0 0 0', fontSize: '11px', color: '#767676', textAlign: 'center' }}>
              Submitting registers real data node inputs down to backend relational tables.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

import React from 'react';

export default function Cart({ cart, setView, updateQuantity, removeFromCart, user, clearCart }) {
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (!user) {
      alert("⚠️ You must sign in first to checkout your items!");
      setView('auth');
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    // Ship the transaction package to our brand new Flask endpoint
    fetch('http://127.0.0.1:5000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        cart: cart,
        total_amount: totalAmount
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.message) {
        alert("🎉 Checkout successful! Transaction posted securely into your MySQL tables.");
        clearCart(); // Wipe the React cart local state array clean
        setView('orders'); // Jump directly over to your new history records view
      } else {
        alert("❌ Order Failed: " + data.error);
      }
    })
    .catch(err => alert("Connection error submitting transaction: " + err));
  };

  return (
    <div style={{ padding: '20px', display: 'flex', gap: '20px', fontFamily: 'Arial', alignItems: 'flex-start' }}>
      <div style={{ flex: 3, background: 'white', padding: '20px', borderRadius: '4px' }}>
        <h2 style={{ borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>Shopping Cart</h2>
        
        {cart.length === 0 ? (
          <p>Your ShopZon cart is currently empty.</p>
        ) : (
          cart.map((item) => (
            <div key={item.id} style={styles.cartItem}>
              <img src={item.image} alt={item.title} style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
              <div style={{ flex: 1, paddingLeft: '20px' }}>
                <h4 style={{ margin: '0 0 10px 0' }}>{item.title}</h4>
                <button onClick={() => removeFromCart(item.id)} style={styles.deleteLink}>Delete from cart</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                  <button onClick={() => updateQuantity(item.id, -1)} style={styles.qtyBtn}>-</button>
                  <span>Qty: {item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} style={styles.qtyBtn}>+</button>
                </div>
              </div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>${(item.price * item.quantity).toFixed(2)}</div>
            </div>
          ))
        )}
      </div>

      <div style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '4px' }}>
        <h3 style={{ margin: '0 0 15px 0' }}>Subtotal ({cart.reduce((sum, i) => sum + i.quantity, 0)} items):</h3>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#B12704', marginBottom: '20px' }}>${totalAmount.toFixed(2)}</div>
        <button onClick={handleCheckout} style={styles.checkoutBtn}>
          Proceed to Buy
        </button>
      </div>
    </div>
  );
}

const styles = {
  cartItem: { display: 'flex', alignItems: 'center', borderBottom: '1px solid #ddd', padding: '15px 0' },
  deleteLink: { background: 'none', border: 'none', color: '#007185', cursor: 'pointer', padding: 0, fontSize: '12px' },
  qtyBtn: { background: '#e7e9ec', border: '1px solid #adb1b8', padding: '2px 8px', cursor: 'pointer', borderRadius: '3px' },
  checkoutBtn: { background: '#ffd814', border: '1px solid #fcd200', borderRadius: '8px', padding: '10px', width: '100%', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }
};
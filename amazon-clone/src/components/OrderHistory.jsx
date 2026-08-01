import React, { useState, useEffect } from 'react';

export default function OrderHistory({ user, setView }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Fetch this specific user's grouped order details from Flask
    fetch(`http://127.0.0.1:5000/api/orders/${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading order receipts:", err);
        setLoading(false);
      });
  }, [user]);

  if (!user) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Arial' }}>
        <h3>Please Sign In to view your account order history.</h3>
        <button onClick={() => setView('auth')} style={styles.button}>Go to Sign In</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={() => setView('shop')} style={styles.backButton}>← Back to Store</button>
      <h2 style={{ marginBottom: '20px', color: '#111' }}>Your Verified Orders</h2>

      {loading ? (
        <p>Retrieving purchase receipts...</p>
      ) : orders.length === 0 ? (
        <p style={{ color: '#555' }}>You haven't placed any orders yet!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          {orders.map((order) => (
            <div key={order.order_id} style={styles.orderCard}>
              <div style={styles.orderHeader}>
                <div>
                  <span style={styles.label}>ORDER PLACED</span>
                  <div style={styles.value}>{order.date}</div>
                </div>
                <div>
                  <span style={styles.label}>TOTAL AMOUNT</span>
                  <div style={styles.value, { fontWeight: 'bold', color: '#B12704' }}>${order.total_amount.toFixed(2)}</div>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <span style={styles.label}>ORDER ID #</span>
                  <div style={styles.value}>{order.order_id}</div>
                </div>
              </div>

              <div style={styles.orderBody}>
                {order.items.map((item, index) => (
                  <div key={index} style={styles.itemRow}>
                    <img src={item.image} alt={item.title} style={styles.itemImage} />
                    <div style={styles.itemInfo}>
                      <h4 style={styles.itemTitle}>{item.title}</h4>
                      <p style={styles.itemMeta}>Quantity: <strong style={{color: 'black'}}>{item.quantity}</strong> | Purchased Price: <strong>${item.price.toFixed(2)}</strong></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  backButton: { background: '#e7e9ec', border: '1px solid #adb1b8', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px' },
  orderCard: { background: 'white', border: '1px solid #d5d9d9', borderRadius: '8px', overflow: 'hidden' },
  orderHeader: { display: 'flex', gap: '40px', background: '#f0f2f2', padding: '15px 20px', borderBottom: '1px solid #d5d9d9', fontSize: '12px', color: '#565959' },
  label: { fontSize: '11px', textTransform: 'uppercase' },
  value: { fontSize: '13px', marginTop: '2px', color: '#111' },
  orderBody: { padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' },
  itemRow: { display: 'flex', gap: '20px', alignItems: 'center', borderBottom: '1px solid #f0f2f2', paddingBottom: '15px' },
  itemImage: { width: '70px', height: '70px', objectFit: 'contain' },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: '15px', color: '#007185', margin: '0 0 5px 0', fontWeight: 'normal' },
  itemMeta: { fontSize: '13px', color: '#565959', margin: 0 },
  button: { background: '#ffd814', border: '1px solid #fcd200', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }
};
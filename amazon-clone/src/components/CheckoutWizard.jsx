import React, { useState } from 'react';

export default function CheckoutWizard({ cartItems, clearCart, setView }) {
  const [step, setStep] = useState(1); // Steps: 1 = Shipping, 2 = Payment, 3 = Confirmation
  
  // Shipping details state
  const [shipping, setShipping] = useState({ name: '', address: '', city: '', zip: '' });
  // Payment card details state
  const [payment, setPayment] = useState({ cardNumber: '', expiry: '', cvv: '' });

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price || 0), 0);
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    setStep(2); // Progress to payment page layout
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    
    // Simple frontend credit card input structure validation check
    if (payment.cardNumber.replace(/\s/g, '').length !== 16) {
      alert("⚠️ Invalid Card Number. Must contain exactly 16 numerical digits.");
      return;
    }
    if (payment.cvv.length !== 3) {
      alert("⚠️ Invalid CVV safety sequence. Must contain exactly 3 digits.");
      return;
    }

    // Hit your backend order registration route here
    fetch('http://127.0.0.1:5000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: 1, // Mock authenticated session target
        total_amount: calculateTotal(),
        status: 'Processed'
      })
    })
    .then(res => res.json())
    .then(() => {
      setStep(3); // Progress to final transaction receipt state
      clearCart(); // Flush item tracking array cleanly
    })
    .catch(err => console.error("Error committing checkout order:", err));
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', maxWidth: '650px', margin: '0 auto' }}>
      
      {/* VISUAL STEP PROGRESS BAR WIZARD TRACKER */}
      <div style={styles.wizardHeaderRow}>
        <div style={{...styles.stepIndicator, color: step >= 1 ? '#e77600' : '#565959', fontWeight: step === 1 ? 'bold' : 'normal'}}>1. Shipping Address</div>
        <div style={styles.arrowLine}>➔</div>
        <div style={{...styles.stepIndicator, color: step >= 2 ? '#e77600' : '#565959', fontWeight: step === 2 ? 'bold' : 'normal'}}>2. Payment Details</div>
        <div style={styles.arrowLine}>➔</div>
        <div style={{...styles.stepIndicator, color: step === 3 ? '#e77600' : '#565959', fontWeight: step === 3 ? 'bold' : 'normal'}}>3. Order Receipt</div>
      </div>

      {/* PHASE 1: SHIPPING INPUT DETAILS FORM */}
      {step === 1 && (
        <div style={styles.checkoutBox}>
          <h3>Enter Your Delivery Shipping Address</h3>
          <form onSubmit={handleShippingSubmit} style={styles.checkoutForm}>
            <input type="text" placeholder="Full Name" value={shipping.name} onChange={e => setShipping({...shipping, name: e.target.value})} style={styles.inputField} required />
            <input type="text" placeholder="Street Address" value={shipping.address} onChange={e => setShipping({...shipping, address: e.target.value})} style={styles.inputField} required />
            <div style={{display: 'flex', gap: '10px'}}>
              <input type="text" placeholder="City" value={shipping.city} onChange={e => setShipping({...shipping, city: e.target.value})} style={styles.inputField} required />
              <input type="text" placeholder="Postal ZIP Code" value={shipping.zip} onChange={e => setShipping({...shipping, zip: e.target.value})} style={styles.inputField} required />
            </div>
            <button type="submit" style={styles.primaryYellowBtn}>Continue to Secure Payment Menu</button>
          </form>
        </div>
      )}

      {/* PHASE 2: MOCK PAYMENT CREDENTIALS SECURE CHECK */}
      {step === 2 && (
        <div style={styles.checkoutBox}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
            <h3>Select Payment Method</h3>
            <strong style={{color: '#b12704', fontSize: '15px'}}>Order Total: ${calculateTotal().toFixed(2)}</strong>
          </div>
          <p style={{fontSize: '13px', color: '#565959', margin: '-5px 0 15px 0'}}>🔒 Simulated sandbox secure end-to-end encryption environment.</p>
          
          <form onSubmit={handlePaymentSubmit} style={styles.checkoutForm}>
            <div style={styles.mockCardGraphic}>
              <div style={{fontSize: '11px', textTransform: 'uppercase', trackingSpace: '1px'}}>ShopZon Wallet Choice</div>
              <div style={{fontSize: '18px', margin: '15px 0 5px 0', fontFamily: 'monospace'}}>{payment.cardNumber || '•••• •••• •••• ••••'}</div>
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '12px'}}>
                <span>{shipping.name || 'CARDHOLDER NAME'}</span>
                <span>{payment.expiry || 'MM/YY'}</span>
              </div>
            </div>

            <input type="text" placeholder="16-Digit Credit Card Number" maxLength="16" value={payment.cardNumber} onChange={e => setPayment({...payment, cardNumber: e.target.value.replace(/\D/g, '')})} style={styles.inputField} required />
            <div style={{display: 'flex', gap: '10px'}}>
              <input type="text" placeholder="Expiry Date (MM/YY)" maxLength="5" value={payment.expiry} onChange={e => setPayment({...payment, expiry: e.target.value})} style={styles.inputField} required />
              <input type="password" placeholder="3-Digit CVV Security Code" maxLength="3" value={payment.cvv} onChange={e => setPayment({...payment, cvv: e.target.value.replace(/\D/g, '')})} style={styles.inputField} required />
            </div>
            
            <div style={{display: 'flex', gap: '10px', marginTop: '5px'}}>
              <button type="button" onClick={() => setStep(1)} style={styles.secondaryGreyBtn}>← Go Back</button>
              <button type="submit" style={styles.primaryYellowBtn}>Authorize & Place Order Record</button>
            </div>
          </form>
        </div>
      )}

      {/* PHASE 3: FINAL TRANSACTION SUCCESS RECEIPT OVERVIEW */}
      {step === 3 && (
        <div style={{...styles.checkoutBox, textAlign: 'center', padding: '35px 20px'}}>
          <h1 style={{color: '#007600', margin: '0 0 10px 0'}}>🎉 Order Placed Successfully!</h1>
          <p style={{fontSize: '15px', color: '#222', fontWeight: 'bold'}}>Thank you for your purchase, {shipping.name}!</p>
          <p style={{fontSize: '13px', color: '#565959', maxWidth: '450px', margin: '0 auto 25px auto'}}>
            Your transaction was processed successfully. Delivery parameters are dispatching items to <strong>{shipping.address}, {shipping.city}</strong> under dynamic logistics transit mapping tracking.
          </p>
          <div style={styles.receiptSummaryBlock}>
            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '5px'}}><span>Payment Method:</span> <span>Credit Card ending in ...{payment.cardNumber.slice(-4)}</span></div>
            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold', paddingTop: '5px', borderTop: '1px solid #ddd'}}><span>Total Cleared:</span> <span style={{color: '#b12704'}}>${calculateTotal().toFixed(2)}</span></div>
          </div>
          <button onClick={() => setView('shop')} style={styles.primaryYellowBtn}>Return to Home Marketplace Catalog</button>
        </div>
      )}

    </div>
  );
}

const styles = {
  wizardHeaderRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fcfcfc', border: '1px solid #ddd', padding: '12px 20px', borderRadius: '6px', marginBottom: '25px' },
  stepIndicator: { fontSize: '13px', color: '#565959' },
  arrowLine: { color: '#ccc', fontSize: '12px' },
  checkoutBox: { background: 'white', border: '1px solid #d5d9d9', padding: '25px', borderRadius: '8px', boxSizing: 'border-box' },
  checkoutForm: { display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' },
  inputField: { padding: '10px', border: '1px solid #a6a9a9', borderRadius: '4px', fontSize: '14px', flex: 1, outline: 'none' },
  mockCardGraphic: { background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', color: 'white', padding: '20px', borderRadius: '8px', marginBottom: '5px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
  primaryYellowBtn: { background: '#ffd814', border: '1px solid #fcd200', padding: '12px', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', transition: 'background 0.1s', width: '100%', outline: 'none' },
  secondaryGreyBtn: { background: '#e7e9ec', border: '1px solid #adb1b8', padding: '12px', borderRadius: '25px', cursor: 'pointer', fontSize: '14px', width: '120px', outline: 'none' },
  receiptSummaryBlock: { background: '#f6f8f8', border: '1px solid #d5d9d9', padding: '15px', borderRadius: '6px', margin: '0 auto 25px auto', maxWidth: '400px', textAlign: 'left' }
};
import React, { useState } from 'react';

export default function ForgotPasswordModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('https://shopzon-ecommerce.onrender.com/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage('OTP sent successfully to your Gmail!');
        setStep(2);
      } else {
        setError(data.error || 'Failed to send OTP.');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('https://shopzon-ecommerce.onrender.com/api/auth/verify-otp-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, new_password: newPassword }),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage('Password updated successfully! Closing...');
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(data.error || 'Invalid or expired OTP.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <h3>Reset Password via Gmail OTP</h3>
        
        {message && <p style={{ color: 'green', fontSize: '14px' }}>{message}</p>}
        {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}

        {step === 1 ? (
          <form onSubmit={handleSendOtp}>
            <p style={{ fontSize: '13px', color: '#666' }}>Enter your Gmail address to receive a 6-digit code.</p>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
            <button type="submit" disabled={loading} style={buttonStyle}>
              {loading ? 'Sending OTP...' : 'Send OTP Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyAndReset}>
            <p style={{ fontSize: '13px', color: '#666' }}>Enter the 6-digit code sent to <b>{email}</b> and your new password.</p>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              style={inputStyle}
            />
            <button type="submit" disabled={loading} style={buttonStyle}>
              {loading ? 'Verifying...' : 'Reset Password'}
            </button>
          </form>
        )}

        <button onClick={onClose} style={closeButtonStyle}>Cancel</button>
      </div>
    </div>
  );
}

const modalOverlayStyle = {
  position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
  backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
};
const modalContentStyle = {
  backgroundColor: '#fff', padding: '30px', borderRadius: '8px', width: '350px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
};
const inputStyle = {
  width: '100%', padding: '10px', margin: '10px 0', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box'
};
const buttonStyle = {
  width: '100%', padding: '10px', backgroundColor: '#f1c40f', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px'
};
const closeButtonStyle = {
  width: '100%', padding: '8px', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px'
};
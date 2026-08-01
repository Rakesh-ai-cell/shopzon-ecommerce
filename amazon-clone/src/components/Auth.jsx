import React, { useState } from 'react';

export default function Auth({ setUser }) {
  const [isLogin, setIsLogin] = useState(true); // Toggles between Login and Signup modes
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ text: '', isError: false });

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage({ text: '', isError: false });

    // Align endpoints with our updated Flask app backend routing matrix
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    // Build payload parameters matching database requirements
    const payload = isLogin 
      ? { username: username, password: password } // Can accept username or email
      : { username: username, email: email, password: password };

   fetch(`https://shopzon-ecommerce.onrender.com${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Server pipeline connection error');
      return data;
    })
    .then((data) => {
      if (isLogin) {
        // Logged in successfully! Set the user state to trigger the role-based routing in App.jsx
        setMessage({ text: 'Login authorized successfully!', isError: false });
        setUser(data.user); 
      } else {
        // Registered successfully! Automatically switch them to login mode
        setMessage({ text: 'Account created successfully! Please sign in now.', isError: false });
        setIsLogin(true);
        setEmail('');
        setPassword('');
      }
    })
    .catch((err) => {
      setMessage({ text: err.message, isError: true });
    });
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh', background: '#eaeded', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ background: '#131921', width: '100%', maxWidth: '400px', padding: '30px', borderRadius: '8px', color: '#fff', border: '1px solid #232f3e', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
        
        <h2 style={{ color: '#ffd814', marginTop: 0, marginBottom: '20px', textAlign: 'center', fontSize: '24px' }}>
          {isLogin ? 'Sign-In to ShopZon' : 'Create Account'}
        </h2>

        {message.text && (
          <div style={{ background: message.isError ? '#c62828' : '#2e7d32', color: '#fff', padding: '12px', borderRadius: '4px', marginBottom: '20px', fontSize: '13px', fontWeight: 'bold' }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#ccc' }}>
              Account Username {isLogin && 'or Email'}
            </label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#1a222d', color: 'white', boxSizing: 'border-box' }} />
          </div>

          {!isLogin && (
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#ccc' }}>Email Address Link</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#1a222d', color: 'white', boxSizing: 'border-box' }} />
            </div>
          )}

          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#ccc' }}>Security Password Key</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#1a222d', color: 'white', boxSizing: 'border-box' }} />
          </div>

          <button type="submit" style={{ width: '100%', padding: '12px', background: '#ffd814', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', color: '#111', fontSize: '14px', transition: 'background 0.1s' }} onMouseEnter={(e) => e.target.style.background = '#f7ca00'} onMouseLeave={(e) => e.target.style.background = '#ffd814'}>
            {isLogin ? 'Secure Sign-In' : 'Create ShopZon Account'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', borderTop: '1px solid #232f3e', paddingTop: '15px' }}>
          <span style={{ color: '#aaa' }}>
            {isLogin ? 'New to our logistics portal? ' : 'Already processing tracking items? '}
          </span>
          <button type="button" onClick={() => { setIsLogin(!isLogin); setMessage({ text: '', isError: false }); }} style={{ background: 'none', border: 'none', color: '#ffd814', cursor: 'pointer', fontWeight: 'bold', padding: 0, textDecoration: 'underline' }}>
            {isLogin ? 'Create your account registry profile here' : 'Sign In instead'}
          </button>
        </div>

      </div>
    </div>
  );
}
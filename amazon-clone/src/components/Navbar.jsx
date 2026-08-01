
import React from 'react';

export default function Navbar({ cartCount, setView, searchTerm, setSearchTerm, user, setUser, adminEmail }) {
  return (
    <nav style={styles.navbar}>
      <div onClick={() => { setView('shop'); setSearchTerm(''); }} style={styles.logo}>
        ShopZon
      </div>
      
      <div style={styles.searchContainer}>
        <input 
          type="text" 
          placeholder="Search items in database..." 
          style={styles.searchInput}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setView('shop');
          }}
        />
        <button style={styles.searchButton}>🔍</button>
      </div>

      <div style={styles.linksContainer}>
        <div style={styles.userGreeting}>
          <span style={styles.helloText}>Hello, {user ? user.username : 'Guest'}</span>
          {user ? (
            <div style={{ display: 'flex', gap: '10px' }}>
              <span onClick={() => setView('orders')} style={styles.authLink}>Orders</span>
              <span onClick={() => { setUser(null); setView('shop'); }} style={styles.signOutLink}>Sign Out</span>
            </div>
          ) : (
            <span onClick={() => setView('auth')} style={styles.authLink}>Sign In</span>
          )}
        </div>

        {/* 🛡️ Show Admin Panel option ONLY if user matches adminEmail criteria */}
        {user && user.email === adminEmail && (
          <button onClick={() => setView('admin')} style={styles.adminButton}>
            Admin Panel
          </button>
        )}

        <div onClick={() => setView('cart')} style={styles.cartContainer}>
          <span style={styles.cartIcon}>🛒</span>
          <span style={styles.cartCount}>{cartCount}</span>
        </div>
      </div>
    </nav>
  );
}

const styles = {
  navbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#131921', padding: '10px 20px', color: 'white', fontFamily: 'Arial' },
  logo: { fontSize: '22px', fontWeight: 'bold', color: '#febd69', cursor: 'pointer' },
  searchContainer: { display: 'flex', flex: 1, margin: '0 20px', maxWidth: '600px' },
  searchInput: { flex: 1, padding: '8px 12px', border: 'none', borderRadius: '4px 0 0 4px', outline: 'none', color: 'black' },
  searchButton: { background: '#febd69', border: 'none', padding: '0 15px', borderRadius: '0 4px 4px 0', cursor: 'pointer' },
  linksContainer: { display: 'flex', alignItems: 'center', gap: '25px' },
  userGreeting: { display: 'flex', flexDirection: 'column', fontSize: '12px' },
  helloText: { color: '#ccc' },
  authLink: { fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', color: 'white' },
  signOutLink: { fontSize: '14px', fontWeight: 'normal', cursor: 'pointer', color: '#ff9900' },
  adminButton: { background: 'none', border: 'none', color: '#df4747', cursor: 'pointer', fontSize: '15px', fontWeight: 'bold', textDecoration: 'underline' },
  cartContainer: { display: 'flex', alignItems: 'center', cursor: 'pointer', position: 'relative' },
  cartIcon: { fontSize: '24px' },
  cartCount: { position: 'absolute', top: '-8px', right: '-10px', background: '#f08804', color: 'black', borderRadius: '50%', padding: '2px 6px', fontSize: '12px', fontWeight: 'bold' }
};
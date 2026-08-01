import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import AdminDashboard from './components/AdminDashboard';
import StorefrontHome from './components/StorefrontHome';
import CartModal from './components/CartModal';

export default function App() {
  const [user, setUser] = useState(null); 
  
  // PERSISTENT CART STATE
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('shopzon_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  const [adminViewMode, setAdminViewMode] = useState('ADMIN_PANEL');
  const [isCartOpen, setIsCartOpen] = useState(false);

  // UPDATED: Starts at zero and pulls real numbers from MySQL
  const [salesMetrics, setSalesMetrics] = useState({
    totalSalesCount: 0,
    totalEarnings: 0.00
  });

  // NEW: Function to ask Flask for the latest order summary numbers
  const fetchLiveDatabaseMetrics = () => {
fetch('https://shopzon-ecommerce.onrender.com/api/admin/metrics', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      .then(res => res.json())
      .then(data => {
        if (data.totalSalesCount !== undefined) {
          setSalesMetrics(data);
        }
      })
      .catch(err => console.error("Error drawing live revenue analytics:", err));
  };

  // NEW: Automatically grab fresh metrics when an Admin logs in or toggles views
  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchLiveDatabaseMetrics();
    }
  }, [user, adminViewMode]);

  useEffect(() => {
    localStorage.setItem('shopzon_cart', JSON.stringify(cart));
  }, [cart]);

  const handleAddToCart = (product, incomingQuantity = 1) => {
    setCart((prevCart) => {
      const existingCartItem = prevCart.find((item) => item.id === product.id);
      
      if (existingCartItem) {
        return prevCart.map((item) =>
          item.id === product.id 
            ? { ...item, quantity: item.quantity + incomingQuantity } 
            : item
        );
      }
      return [...prevCart, { ...product, quantity: incomingQuantity }];
    });
    
    alert(`Success: Added ${incomingQuantity} unit(s) of this product to your cart!`);
  };

  const handleUpdateCartQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      setCart(prev => prev.filter(item => item.id !== productId));
    } else {
      setCart(prev => prev.map(item => item.id === productId ? { ...item, quantity: newQty } : item));
    }
  };

  const handleClearCart = () => {
    setCart([]);
    localStorage.removeItem('shopzon_cart');
    // Immediately fetch fresh values so the dashboard cards update right after a purchase!
    fetchLiveDatabaseMetrics();
  };

  const totalItemsInCart = cart.reduce((accumulator, item) => accumulator + item.quantity, 0);

  const handleLogoutSequence = () => {
    setUser(null);
    setCart([]); 
    localStorage.removeItem('shopzon_cart');
    setAdminViewMode('ADMIN_PANEL'); 
    setIsCartOpen(false);
  };

  if (!user) {
    return <Auth setUser={setUser} />;
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', background: '#eaeded', minHeight: '100vh' }}>
      
      {/* Navigation Header */}
      <nav style={{ background: '#131921', color: 'white', padding: '12px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 1000 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffd814', letterSpacing: '0.5px' }}>ShopZon Portal</span>
          <span style={{ fontSize: '11px', padding: '4px 10px', background: user.role === 'ADMIN' ? '#c62828' : '#232f3e', borderRadius: '3px', fontWeight: 'bold', textTransform: 'uppercase' }}>
            {user.role === 'ADMIN' ? `ADMIN MODE: ${adminViewMode.replace('_', ' ')}` : 'CLIENT LINK PROFILE'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
          {user.role === 'ADMIN' && (
            <div style={{ display: 'flex', gap: '15px', background: '#232f3e', padding: '5px 12px', borderRadius: '4px', border: '1px solid #3a4b5e' }}>
              <button 
                onClick={() => setAdminViewMode('ADMIN_PANEL')}
                style={{ 
                  background: adminViewMode === 'ADMIN_PANEL' ? '#ffd814' : 'transparent',
                  color: adminViewMode === 'ADMIN_PANEL' ? '#111' : '#fff',
                  border: 'none', padding: '6px 12px', borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px'
                }}
              >
                📊 Management Panel
              </button>
              <button 
                onClick={() => setAdminViewMode('MARKETPLACE')}
                style={{ 
                  background: adminViewMode === 'MARKETPLACE' ? '#ffd814' : 'transparent',
                  color: adminViewMode === 'MARKETPLACE' ? '#111' : '#fff',
                  border: 'none', padding: '6px 12px', borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px'
                }}
              >
                🛒 Go To Storefront
              </button>
            </div>
          )}

          <span style={{ fontSize: '14px', color: '#f3f3f3' }}>
            Welcome, <strong>{user.username}</strong>
          </span>
          
          {(user.role !== 'ADMIN' || adminViewMode === 'MARKETPLACE') && (
            <div 
              onClick={() => setIsCartOpen(true)}
              style={{ display: 'flex', alignItems: 'center', background: '#232f3e', padding: '6px 16px', borderRadius: '20px', fontSize: '14px', border: '1px solid #ffd814', fontWeight: '500', cursor: 'pointer' }}
            >
              🛒 Basket: <span style={{ color: '#ffd814', fontWeight: 'bold', marginLeft: '6px', marginRight: '6px', fontSize: '15px' }}>{totalItemsInCart}</span> Units
            </div>
          )}

          <button onClick={handleLogoutSequence} style={{ background: '#ffd814', border: '1px solid #a88734', padding: '6px 15px', borderRadius: '3px', fontWeight: '500', cursor: 'pointer', color: '#111', fontSize: '13px' }}>
            Secure Sign-Out
          </button>
        </div>
      </nav>

      {/* CORE ROUTING SWITCH: Passing live data tracking props into AdminDashboard */}
      {user.role === 'ADMIN' ? (
        adminViewMode === 'ADMIN_PANEL' ? (
          <AdminDashboard metrics={salesMetrics} />
        ) : (
          <div>
            <div style={{ background: '#fff3cd', color: '#856404', padding: '12px 30px', borderBottom: '1px solid #ffeeba', fontSize: '14px', fontWeight: '500', textAlign: 'center' }}>
              ⚠️ You are viewing the live marketplace using your **Administrator Credential Matrix**. Actions here execute live.
            </div>
            <StorefrontHome user={user} onAddToCart={handleAddToCart} />
          </div>
        )
      ) : (
        <StorefrontHome user={user} onAddToCart={handleAddToCart} />
      )}

      {isCartOpen && (
        <CartModal 
          cartItems={cart} 
          user={user}
          onUpdateQty={handleUpdateCartQuantity}
          onClearCart={handleClearCart}
          onClose={() => setIsCartOpen(false)} 
        />
      )}

    </div>
  );
}

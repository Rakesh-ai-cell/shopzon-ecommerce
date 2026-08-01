import React, { useState, useEffect } from 'react';
import ProductDetail from './ProductDetail';

export default function StorefrontHome({ user, onAddToCart }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [activeProductId, setActiveProductId] = useState(null);
  
  // Query tracker tracking live string searches
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch product categories on mount
  useEffect(() => {
    fetch('https://shopzon-ecommerce.onrender.com/api/categories')
      .then(res => res.json())
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error linking category manifest rows:", err));
  }, []);

  // Fetch products based on selected category filter
  useEffect(() => {
    setLoading(true);
    const queryParam = selectedCategory === 'All' ? '' : `?category=${encodeURIComponent(selectedCategory)}`;
    
    fetch(`https://shopzon-ecommerce.onrender.com/api/products${queryParam}`)
      .then(res => res.json())
      .then(data => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error drawing market listings:", err);
        setLoading(false);
      });
  }, [selectedCategory]);

  // LIVE FILTER COMPUTATION LOGIC LOOP
  const filteredProducts = products.filter((product) => {
    const titleMatch = product.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const descriptionMatch = product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return titleMatch || descriptionMatch;
  });

  return (
    <div style={{ background: '#eaeded', minHeight: '100vh', fontFamily: 'Arial, sans-serif', display: 'flex', flexDirection: 'column' }}>
      
      {/* INTEGRATED SEARCH BAR CONTAINER */}
      <div style={{ background: '#232f3e', padding: '10px 30px', display: 'flex', justifyContent: 'center', borderBottom: '1px solid #131921' }}>
        <div style={{ display: 'flex', width: '100%', maxWidth: '700px', borderRadius: '4px', overflow: 'hidden' }}>
          <span style={{ background: '#f3f3f3', color: '#555', padding: '10px 15px', fontSize: '13px', display: 'flex', alignItems: 'center', borderRight: '1px solid #ccc', fontWeight: 'bold' }}>
            Search Items
          </span>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type here to instantly search descriptions or matching product names live..."
            style={{ flex: 1, padding: '10px 15px', border: 'none', outline: 'none', fontSize: '14px' }}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              style={{ background: '#fff', border: 'none', padding: '0 12px', cursor: 'pointer', color: '#888', fontSize: '14px' }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* SIDEBAR FILTER NAVIGATION */}
        <aside style={{ width: '260px', background: '#ffffff', padding: '25px', borderRight: '1px solid #ddd', minHeight: '100vh' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 15px 0', color: '#111', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
            Filter Departments
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li 
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }} 
              style={{ padding: '10px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', marginBottom: '5px', fontWeight: selectedCategory === 'All' ? 'bold' : 'normal', background: selectedCategory === 'All' ? '#f0f2f2' : 'transparent', color: selectedCategory === 'All' ? '#007185' : '#111' }}
            >
              All Departments
            </li>
            {categories.map((cat, idx) => (
              <li 
                key={idx} 
                onClick={() => { setSelectedCategory(cat); setSearchQuery(''); }} 
                style={{ padding: '10px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', marginBottom: '5px', fontWeight: selectedCategory === cat ? 'bold' : 'normal', background: selectedCategory === cat ? '#f0f2f2' : 'transparent', color: selectedCategory === cat ? '#007185' : '#111', textTransform: 'capitalize' }}
              >
                {cat}
              </li>
            ))}
          </ul>
        </aside>

        {/* CORE GRID VIEWPORT FEED */}
        <main style={{ flex: 1, padding: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '500', color: '#111' }}>
              Results for <span style={{ color: '#c45500', textTransform: 'capitalize' }}>"{selectedCategory}"</span>
              {searchQuery && <span style={{ fontSize: '16px', color: '#555', fontWeight: 'normal' }}> matching query "{searchQuery}"</span>}
            </h2>
            <span style={{ fontSize: '14px', color: '#565959' }}>Showing {filteredProducts.length} items</span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px', fontSize: '18px', color: '#565959' }}>Syncing operational inventory channels...</div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', background: '#fff', border: '1px solid #ddd', borderRadius: '4px', color: '#555' }}>
              <h3>🔍 No matching catalog items found</h3>
              <p style={{ fontSize: '14px', color: '#777' }}>Try updating your query or testing a separate category filter branch.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '25px' }}>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} setActiveProductId={setActiveProductId} />
              ))}
            </div>
          )}
        </main>
      </div>

      {activeProductId && (
        <ProductDetail 
          productId={activeProductId} 
          user={user} 
          onClose={() => setActiveProductId(null)} 
          onAddToCart={onAddToCart} 
        />
      )}

    </div>
  );
}

function ProductCard({ product, onAddToCart, setActiveProductId }) {
  const [localQty, setLocalQty] = useState(1);

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e7e7e7', borderRadius: '4px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
      <div 
        style={{ cursor: 'pointer', marginBottom: '12px' }} 
        onClick={() => setActiveProductId(product.id)}
        title="Click to view full description and review details"
      >
        <div style={{ height: '200px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px', background: '#fafafa', borderRadius: '4px' }}>
          <img src={product.image_url} alt={product.title} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
        </div>
        <span style={{ display: 'inline-block', fontSize: '11px', background: '#f0f2f2', color: '#565959', padding: '3px 8px', borderRadius: '2px', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 'bold' }}>
          {product.category}
        </span>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '500', color: '#007185', lineHeight: '1.4', height: '38px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {product.title}
        </h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ color: '#ffa41c', fontSize: '13px' }}>
            {'★'.repeat(Math.round(product.rating_rate || 5))}
          </span>
          <span style={{ fontSize: '12px', color: '#565959' }}>({product.rating_count || 12})</span>
        </div>
      </div>

      <div>
        <div style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '12px', color: '#111' }}>${product.price}</div>
        
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#555', fontWeight: 'bold' }}>Qty:</span>
          <select 
            value={localQty} 
            onChange={(e) => setLocalQty(Math.max(1, parseInt(e.target.value, 10)))}
            style={{ flex: 1, padding: '5px', borderRadius: '4px', border: '1px solid #ccc', background: '#fff', fontSize: '13px', cursor: 'pointer' }}
          >
            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        <button 
          onClick={() => { onAddToCart(product, localQty); setLocalQty(1); }} 
          style={{ width: '100%', padding: '9px', background: '#ffd814', border: '1px solid #fcd200', borderRadius: '20px', cursor: 'pointer', fontWeight: '500', fontSize: '13px', color: '#111' }}
        >
          Add to Basket
        </button>
      </div>
    </div>
  );
}
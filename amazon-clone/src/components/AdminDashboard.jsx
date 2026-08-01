import React, { useState, useEffect } from 'react';

export default function AdminDashboard({ metrics }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["Electronics", "Home & Kitchen", "Books", "Fashion"]);
  
  // Extract live metrics values passed down from App.jsx parent context
  const livePipelineOrdersCount = metrics?.totalSalesCount || 0;
  const liveTotalMoneyEarned = metrics?.totalEarnings || 0.00;

  // Core Product Inputs State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');

  // Future Category Toggle Controls
  const [isCreatingCustomCategory, setIsCreatingCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  
  // System Feedback State
  const [feedback, setFeedback] = useState({ text: '', isError: false });

  // Sync up system telemetry data logs on load
  useEffect(() => {
    fetchLiveCatalog();
    fetchLiveCategories();
  }, []);

  const fetchLiveCatalog = () => {
   fetch('https://shopzon-ecommerce.onrender.com/api/products')
      .then(res => res.json())
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error reading catalog logs:", err));
  };

  const fetchLiveCategories = () => {
   fetch('https://shopzon-ecommerce.onrender.com/api/categories')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
          setCategory(data[0]);
        }
      })
      .catch(err => console.error("Error reading categories database matrix:", err));
  };

  // Handle addition of a brand new product
  const handleProductSubmission = (e) => {
    e.preventDefault();
    setFeedback({ text: '', isError: false });

    // Determine finalized string sequence for category placement
    const targetCategory = isCreatingCustomCategory ? customCategoryName.trim() : category;

    if (!title || !price || !targetCategory) {
      setFeedback({ text: 'Please complete all required data input entry points.', isError: true });
      return;
    }

    const payload = {
      title,
      category: targetCategory,
      price: parseFloat(price).toFixed(2),
      image_url: imageUrl || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500',
      description
    };

    fetch('https://shopzon-ecommerce.onrender.com/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(res => res.json().then(data => ({ status: res.status, data })))
    .then(({ status, data }) => {
      if (status >= 400) {
        setFeedback({ text: data.error || 'Server pipeline insertion fault', isError: true });
      } else {
        setFeedback({ text: 'Product committed to store catalog array effectively!', isError: false });
        
        // Clear input form fields fields
        setTitle('');
        setPrice('');
        setImageUrl('');
        setDescription('');
        setCustomCategoryName('');
        setIsCreatingCustomCategory(false);
        
        // Refresh grid lists instantly
        fetchLiveCatalog();
        fetchLiveCategories();
      }
    })
    .catch(() => setFeedback({ text: 'Cloud pipeline terminal unreachable error', isError: true }));
  };

  // Handle secure deletion of selected item record 
  const handleItemDeletion = (id) => {
    if (!window.confirm("Are you sure you want to delete this product from the database?")) return;

   fetch(`https://shopzon-ecommerce.onrender.com/api/products/${id}`, {
      method: 'DELETE'
    })
    .then(res => res.json())
    .then(data => {
      setFeedback({ text: data.message || 'Row dropped successfully', isError: false });
      fetchLiveCatalog(); // Refresh data table list view instantly
    })
    .catch(() => setFeedback({ text: 'Pipeline response error', isError: true }));
  };

  return (
    <div style={{ background: '#0f1111', minHeight: '100vh', color: '#ffffff', padding: '30px', fontFamily: 'Arial, sans-serif' }}>
      
      {/* RESTORED & DYNAMIC TELEMETRY ANALYTICS METRICS BAR */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div style={{ flex: 1, background: '#131921', padding: '20px', borderRadius: '6px', borderLeft: '5px solid #ffd814', textAlign: 'center' }}>
          <h4 style={{ color: '#aaaaaa', margin: '0 0 10px 0', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase' }}>Items Logged In Matrix</h4>
          <span style={{ fontSize: '32px', fontWeight: 'bold' }}>{products.length}</span>
        </div>
        <div style={{ flex: 1, background: '#131921', padding: '20px', borderRadius: '6px', borderLeft: '5px solid #0066c0', textAlign: 'center' }}>
          <h4 style={{ color: '#aaaaaa', margin: '0 0 10px 0', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase' }}>Active Group Classifications</h4>
          <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#0066c0' }}>{categories.length}</span>
        </div>
        <div style={{ flex: 1, background: '#131921', padding: '20px', borderRadius: '6px', borderLeft: '5px solid #2e7d32', textAlign: 'center' }}>
          <h4 style={{ color: '#aaaaaa', margin: '0 0 10px 0', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase' }}>Fulfillable Sales Volume</h4>
          <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#2e7d32' }}>{livePipelineOrdersCount}</span>
        </div>
        <div style={{ flex: 1, background: '#131921', padding: '20px', borderRadius: '6px', borderLeft: '5px solid #ff9900', textAlign: 'center' }}>
          <h4 style={{ color: '#aaaaaa', margin: '0 0 10px 0', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase' }}>Total Revenue Earned</h4>
          <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff9900' }}>${liveTotalMoneyEarned.toFixed(2)}</span>
        </div>
      </div>

      {/* System Feedback Message Alert Toast */}
      {feedback.text && (
        <div style={{ background: feedback.isError ? '#c62828' : '#2e7d32', color: 'white', padding: '15px', borderRadius: '6px', marginBottom: '25px', fontWeight: 'bold' }}>
          {feedback.text}
        </div>
      )}

      {/* Primary Workspace Panel Area */}
      <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', marginBottom: '40px' }}>
        
        {/* FORM MODULE SHEET */}
        <div style={{ flex: 2, background: '#131921', padding: '25px', borderRadius: '8px', border: '1px solid #232f3e' }}>
          <h3 style={{ borderBottom: '1px solid #232f3e', paddingBottom: '12px', marginTop: 0, color: '#ffd814' }}>Add New Storefront Catalog Item Record</h3>
          
          <form onSubmit={handleProductSubmission}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '6px', color: '#ccc' }}>Product Title Name</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#1a222d', color: 'white' }} />
            </div>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
              
              {/* Category selector split mode block */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ color: '#ccc' }}>Inventory Category Group</label>
                  <button type="button" onClick={() => setIsCreatingCustomCategory(!isCreatingCustomCategory)} style={{ background: 'none', border: 'none', color: '#0066c0', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>
                    {isCreatingCustomCategory ? "✕ Choose Existing Option" : "➕ Define New Custom Category"}
                  </button>
                </div>
                
                {isCreatingCustomCategory ? (
                  <input type="text" placeholder="Type new custom category choice" value={customCategoryName} onChange={(e) => setCustomCategoryName(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #0066c0', background: '#1a222d', color: 'white' }} />
                ) : (
                  <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#1a222d', color: 'white' }}>
                    {categories.map((cat, i) => <option key={i} value={cat}>{cat}</option>)}
                  </select>
                )}
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '6px', color: '#ccc' }}>Price Value ($ USD)</label>
                <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#1a222d', color: 'white' }} />
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '6px', color: '#ccc' }}>Asset Image URL Link</label>
              <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://images.unsplash.com/..." style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#1a222d', color: 'white' }} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', color: '#ccc' }}>Product Item Summary Overview Log</label>
              <textarea rows="3" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter brief product features layout overview..." style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#1a222d', color: 'white', resize: 'vertical' }} />
            </div>

            <button type="submit" style={{ width: '100%', padding: '12px', background: '#ffd814', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', color: '#111', fontSize: '14px' }}>
              Commit Item to Active Display Matrix
            </button>
          </form>
        </div>

        {/* SIDE BAR ACTIVE OPTIONS PREVIEW COMPONENT */}
        <div style={{ flex: 1, background: '#131921', padding: '25px', borderRadius: '8px', border: '1px solid #232f3e' }}>
          <h4 style={{ marginTop: 0, marginBottom: '15px', color: '#aaaaaa', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.5px' }}>Registered Category Manifest Options</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {categories.map((cat, i) => (
              <span key={i} style={{ padding: '6px 12px', background: '#232f3e', borderRadius: '20px', fontSize: '12px', color: '#ffd814', border: '1px solid #3a4b5e', fontWeight: '500' }}>
                {cat}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* CATALOG DIRECTORY DATA TABLE */}
      <div style={{ background: '#131921', padding: '25px', borderRadius: '8px', border: '1px solid #232f3e' }}>
        <h3 style={{ borderBottom: '1px solid #232f3e', paddingBottom: '12px', marginTop: 0, color: '#ffd814' }}>Active Storefront Catalog Management Directory</h3>
        <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #232f3e', color: '#aaaaaa', fontSize: '13px' }}>
                <th style={{ padding: '12px' }}>Visual</th>
                <th style={{ padding: '12px' }}>Product Title Designation</th>
                <th style={{ padding: '12px' }}>Category Node</th>
                <th style={{ padding: '12px' }}>Listed Price</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Action Suite</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => (
                <tr key={prod.id} style={{ borderBottom: '1px solid #1a222d', fontSize: '14px' }}>
                  <td style={{ padding: '10px' }}>
                    <img src={prod.image_url} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #232f3e' }} />
                  </td>
                  <td style={{ padding: '10px', fontWeight: 'bold', color: '#ffffff' }}>{prod.title}</td>
                  <td style={{ padding: '10px' }}>
                    <span style={{ padding: '4px 8px', background: '#232f3e', borderRadius: '4px', fontSize: '11px', color: '#ccc' }}>{prod.category}</span>
                  </td>
                  <td style={{ padding: '10px', color: '#ffd814', fontWeight: 'bold' }}>${prod.price}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <button onClick={() => handleItemDeletion(prod.id)} style={{ padding: '6px 14px', background: '#c62828', border: 'none', borderRadius: '4px', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#aaa' }}>No active tracking catalog metrics logged in MySQL memory blocks.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
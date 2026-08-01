
import React, { useState, useEffect } from 'react';

export default function ProductList({ addToCart, searchTerm, selectedCategory }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null); // Tracks the open product popup detail view

  useEffect(() => {
    fetch('http://10.7.239.58:5000/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        // Safe database fallback collection
        setProducts([
          { id: 1, name: "Modern Ceramic Desktop Flower Vase", price: 22.50, category: "Home & Kitchen", image_url: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=500", description: "Beautiful ceramic handcrafted desk ornament vase." },
          { id: 2, name: "Scented Soy Wax Luxury Candle Set", price: 18.00, category: "Home & Kitchen", image_url: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=500", description: "Sourced from certified organic fields for long lasting clean burning air." },
          { id: 3, name: "Minimalist Adjustable Desktop LED Reading Lamp", price: 35.99, category: "Electronics", image_url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500", description: "Eye protection dimming flexible metallic reading lamp structure." },
          { id: 4, name: "Kindle Paperwhite (16 GB) 6.8\" Display", price: 139.99, category: "Books", image_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500", description: "Adjustable warm light mode panel holding thousands of catalog entries." }
        ]);
        setLoading(false);
      });
  }, []);

  // Filtering Logic Matrix
  const filteredProducts = products.filter(product => {
    const matchesSearch = (product.name || product.title || "").toLowerCase().includes((searchTerm || "").toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <div style={{ color: '#fff', textAlign: 'center', padding: '80px' }}>Loading Live Inventory Grid...</div>;
  }

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial' }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
        {filteredProducts.map((product) => {
          const title = product.name || product.title || "ShopZon Item";
          const image = product.image_url || product.image || "https://via.placeholder.com/200";
          const price = product.price ? Number(product.price) : 0.00;

          return (
            <div key={product.id} style={cardStyles.container}>
              <div style={cardStyles.imgFrame} onClick={() => setSelectedProduct(product)}>
                <img src={image} alt="" style={cardStyles.image} />
              </div>
              <h3 style={cardStyles.title} onClick={() => setSelectedProduct(product)}>{title}</h3>
              <div style={cardStyles.actionRow}>
                <span style={cardStyles.price}>${price.toFixed(2)}</span>
                <button 
                  onClick={() => addToCart({ ...product, title, price, image })}
                  style={cardStyles.addBtn}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 💬 POPUP DESCRIPTION & COMMENTS VIEW MODAL */}
      {selectedProduct && (
        <div style={modalStyles.overlay} onClick={() => setSelectedProduct(null)}>
          <div style={modalStyles.modalCard} onClick={(e) => e.stopPropagation()}>
            <button style={modalStyles.closeBtn} onClick={() => setSelectedProduct(null)}>✕</button>
            
            <div style={modalStyles.mainInfo}>
              <div style={modalStyles.leftColumn}>
                <img src={selectedProduct.image_url || selectedProduct.image} alt="" style={modalStyles.popImg} />
              </div>
              <div style={modalStyles.rightColumn}>
                <span style={modalStyles.badge}>{selectedProduct.category.toUpperCase()}</span>
                <h2 style={modalStyles.popTitle}>{selectedProduct.name || selectedProduct.title}</h2>
                <div style={{ color: '#ff9900', margin: '10px 0' }}>⭐ 4.5 out of 5 stars <span style={{ color: '#3498db', fontSize: '13px', marginLeft: '8px' }}>10 global ratings</span></div>
                <div style={modalStyles.popPrice}>Price: <span style={{ color: '#f08804' }}>${Number(selectedProduct.price).toFixed(2)}</span></div>
                <div style={{ color: '#2ecc71', fontSize: '14px', fontWeight: 'bold', margin: '15px 0' }}>🟢 In Stock. Available for immediate shipping.</div>
                
                <button 
                  onClick={() => { addToCart({ ...selectedProduct, title: selectedProduct.name, image: selectedProduct.image_url }); setSelectedProduct(null); }}
                  style={modalStyles.popAddBtn}
                >
                  Add 1 Item to Shopping Cart
                </button>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #333', marginTop: '25px', paddingTop: '20px' }}>
              <h4 style={{ color: '#aaa', margin: '0 0 8px 0' }}>Product Description:</h4>
              <p style={{ color: '#fff', fontSize: '14px', lineHeight: '1.5' }}>{selectedProduct.description || "Premium choice bringing optimal functionality directly into your lifestyle loop structure configuration."}</p>
            </div>

            {/* User Review Comments Section */}
            <div style={{ borderTop: '1px solid #333', marginTop: '25px', paddingTop: '20px' }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>Customer Reviews</h3>
              <div style={modalStyles.reviewRow}>
                <div style={{ fontWeight: 'bold', color: '#febd69' }}>Verified Buyer "Alex M." ⭐⭐⭐⭐⭐</div>
                <p style={{ margin: '5px 0 0 0', color: '#ccc', fontSize: '13px' }}>Unbelievable delivery speed. The packaging arrived perfectly crisp, and performance exceeds listed baseline specifications.</p>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

const cardStyles = {
  container: { background: '#252525', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid #333', transition: 'transform 0.2s' },
  imgFrame: { background: '#fff', borderRadius: '6px', padding: '15px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' },
  image: { maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' },
  title: { color: '#fff', fontSize: '15px', margin: '15px 0 10px 0', height: '40px', overflow: 'hidden', cursor: 'pointer', lineHeight: '1.4' },
  actionRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' },
  price: { color: '#ff9900', fontSize: '20px', fontWeight: 'bold' },
  addBtn: { background: '#ffd814', border: 'none', padding: '8px 14px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', color: '#000' }
};

const modalStyles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5000, padding: '20px' },
  modalCard: { background: '#1a1a1a', border: '1px solid #444', width: '100%', maxWidth: '750px', borderRadius: '12px', padding: '30px', position: 'relative', maxHeight: '90vh', overflowY: 'auto', color: '#fff', fontFamily: 'Arial' },
  closeBtn: { position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' },
  mainInfo: { display: 'flex', gap: '30px', flexWrap: 'wrap' },
  leftColumn: { flex: '1 1 250px', background: '#fff', borderRadius: '8px', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '240px' },
  rightColumn: { flex: '1 2 350px', display: 'flex', flexDirection: 'column' },
  badge: { background: '#232f3e', color: '#febd69', padding: '4px 10px', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px', alignSelf: 'flex-start' },
  popImg: { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' },
  popTitle: { fontSize: '22px', margin: '10px 0 5px 0', color: '#fff', fontWeight: 'bold' },
  popPrice: { fontSize: '16px', fontWeight: 'bold', margin: '10px 0' },
  popAddBtn: { background: '#ffd814', border: 'none', borderRadius: '20px', padding: '12px', fontWeight: 'bold', color: '#000', cursor: 'pointer', marginTop: '15px' },
  reviewRow: { background: '#222', padding: '15px', borderRadius: '6px', border: '1px solid #333' }
};
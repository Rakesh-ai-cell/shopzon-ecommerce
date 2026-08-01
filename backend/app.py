from flask import Flask, request, jsonify
from flask_cors import CORS
import pymysql

app = Flask(__name__)
# Enable CORS for React running on port 5173
CORS(app)

import os

# Read database details from environment variables
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "defaultdb")
DB_PORT = int(os.getenv("DB_PORT", 3306))

def get_db_connection():
    return pymysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        port=DB_PORT,
        ssl={'ssl': True} if DB_HOST != "localhost" else None,
        cursorclass=pymysql.cursors.DictCursor
    )

# ==================== CATEGORIES ENDPOINTS ====================
@app.route('/api/categories', methods=['GET'])
def get_categories():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != ''")
        categories = [row['category'] for row in cursor.fetchall()]
        if not categories:
            categories = ["Electronics", "Home & Kitchen", "Books", "Fashion"]
        return jsonify(categories), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

# ==================== PRODUCTS ENDPOINTS ====================
@app.route('/api/products', methods=['GET'])
def get_products():
    category = request.args.get('category', 'All')
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        if category == 'All':
            cursor.execute("SELECT * FROM products ORDER BY id DESC")
        else:
            cursor.execute("SELECT * FROM products WHERE category = %s ORDER BY id DESC", (category,))
        return jsonify(cursor.fetchall()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@app.route('/api/products', methods=['POST'])
def add_product():
    data = request.json or {}
    title = data.get('title')
    category = data.get('category')
    price = data.get('price')
    image_url = data.get('image_url', 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500')
    description = data.get('description', '')
    
    if not title or not category or not price:
        return jsonify({"error": "Title, Category, and Price fields are required"}), 400
        
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO products (title, category, price, image_url, description, rating_rate, rating_count) VALUES (%s, %s, %s, %s, %s, %s, %s)",
            (title, category, price, image_url, description, "4.50", 15)
        )
        conn.commit()
        return jsonify({"message": "Product committed to catalog effectively!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@app.route('/api/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id FROM products WHERE id = %s", (product_id,))
        if not cursor.fetchone():
            return jsonify({"error": "Target catalog item profile not found"}), 404
            
        cursor.execute("DELETE FROM products WHERE id = %s", (product_id,))
        conn.commit()
        return jsonify({"message": "Product removed from database successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

# ==================== AUTHENTICATION ENDPOINTS ====================
@app.route('/api/auth/login', methods=['POST'])
def auth_login():
    data = request.json or {}
    username_or_email = data.get('username')  
    password = data.get('password')
    
    if not username_or_email or not password:
        return jsonify({"error": "Missing login credentials parameters"}), 400
        
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT id, username, email, role FROM users WHERE (username = %s OR email = %s) AND password = %s", 
            (username_or_email, username_or_email, password)
        )
        user = cursor.fetchone()
        if user:
            return jsonify({"message": "Login authorization granted!", "user": user}), 200
        return jsonify({"error": "Invalid username/email or identity password"}), 401
    except Exception as e:
        return jsonify({"error": f"Database interaction crash: {str(e)}"}), 500
    finally:
        conn.close()

@app.route('/api/auth/register', methods=['POST'])
def auth_register():
    data = request.json or {}
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    if not username or not password or not email:
        return jsonify({"error": "All creation criteria fields are required"}), 400
        
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id FROM users WHERE username = %s OR email = %s", (username, email))
        if cursor.fetchone():
            return jsonify({"error": "Username or Email address registry conflict"}), 409
            
        cursor.execute(
            "INSERT INTO users (username, email, password, role) VALUES (%s, %s, %s, %s)", 
            (username, email, password, "USER")
        )
        conn.commit()
        return jsonify({"message": "Account created successfully!"}), 201
    except Exception as e:
        return jsonify({"error": f"Database write crash: {str(e)}"}), 500
    finally:
        conn.close()

# ==================== SINGLE PRODUCT & REVIEWS ENDPOINTS ====================
@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_single_product(product_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM products WHERE id = %s", (product_id,))
        product = cursor.fetchone()
        if not product:
            return jsonify({"error": "Product not found"}), 404
            
        cursor.execute("SELECT * FROM reviews WHERE product_id = %s ORDER BY id DESC", (product_id,))
        reviews = cursor.fetchall()
        product['reviews'] = reviews
        
        return jsonify(product), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@app.route('/api/products/<int:product_id>/reviews', methods=['POST'])
def add_product_review(product_id):
    data = request.json or {}
    username = data.get('username', 'Anonymous')
    comment = data.get('comment', '').strip()
    rating = data.get('rating', 5)
    
    if not comment:
        return jsonify({"error": "Comment text cannot be empty"}), 400
        
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO reviews (product_id, username, comment, rating) VALUES (%s, %s, %s, %s)",
            (product_id, username, comment, rating)
        )
        
        cursor.execute("SELECT AVG(rating) as avg_rate, COUNT(*) as total FROM reviews WHERE product_id = %s", (product_id,))
        stats = cursor.fetchone()
        
        cursor.execute(
            "UPDATE products SET rating_rate = %s, rating_count = %s WHERE id = %s",
            (str(round(stats['avg_rate'], 2)), stats['total'], product_id)
        )
        
        conn.commit()
        return jsonify({"message": "Review posted successfully!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

# ==================== ORDERS ENDPOINTS (FIXED) ====================
@app.route('/api/orders', methods=['POST'])
def place_order():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        data = request.json or {}
        username = data.get('username')
        total_charge = data.get('total_charge')
        items = data.get('items')

        if not username or not items:
            return jsonify({"error": "Missing order payload data"}), 400

        # 1. Insert into main orders table
        cursor.execute(
            "INSERT INTO orders (username, total_price) VALUES (%s, %s)",
            (username, total_charge)
        )
        order_id = cursor.lastrowid 

        # 2. Insert detailed items array
        for item in items:
            cursor.execute(
                """INSERT INTO order_items 
                   (order_id, product_id, quantity, price_at_purchase) 
                   VALUES (%s, %s, %s, %s)""",
                (order_id, item['id'], item['qty'], item['price'])
            )

        conn.commit()
        return jsonify({"message": "Order saved successfully", "order_id": order_id}), 201

    except Exception as e:
        print("Database error:", str(e))
        return jsonify({"error": f"Internal system fault: {str(e)}"}), 500
    finally:
        conn.close()

@app.route('/api/admin/metrics', methods=['GET'])
def get_admin_metrics():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Pull dynamic analytics figures from orders table schema
        cursor.execute("SELECT COUNT(*) AS total_sales, COALESCE(SUM(total_price), 0.00) AS total_earnings FROM orders")
        metrics = cursor.fetchone()
        
        return jsonify({
            "totalSalesCount": metrics['total_sales'],
            "totalEarnings": float(metrics['total_earnings'])
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
import os
import random
import string
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_mail import Mail, Message
import pymysql

app = Flask(__name__)
CORS(app)

# ==================== GMAIL SMTP CONFIGURATION ====================
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv("MAIL_USERNAME", "yourgmail@gmail.com")
app.config['MAIL_PASSWORD'] = os.getenv("MAIL_PASSWORD", "your_app_password")
app.config['MAIL_DEFAULT_SENDER'] = app.config['MAIL_USERNAME']

mail = Mail(app)

# Temporary in-memory storage for OTPs: { "email@domain.com": "123456" }
otp_store = {}

# ==================== DATABASE CONFIGURATION ====================
DB_HOST = os.getenv("DB_HOST", "mysql-afcb92d-rakeysh122-a4e8.g.aivencloud.com").strip()
DB_USER = os.getenv("DB_USER", "avnadmin").strip()
DB_PASSWORD = os.getenv("DB_PASSWORD", "AVNS_Mtj06xX2Hn6ZOow5X15").strip()
DB_NAME = os.getenv("DB_NAME", "defaultdb").strip()
DB_PORT = int(os.getenv("DB_PORT", 26165))

def get_db_connection():
    ssl_config = {"ssl_mode": "REQUIRED"} if DB_HOST != "localhost" else None
    
    return pymysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        port=DB_PORT,
        ssl=ssl_config,
        cursorclass=pymysql.cursors.DictCursor
    )

def init_db():
    """ Automatically creates required tables on application startup """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # 1. Users table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(100) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(20) DEFAULT 'USER'
        );
        """)

        # 2. Products table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            category VARCHAR(100) NOT NULL,
            price DECIMAL(10, 2) NOT NULL,
            image_url TEXT,
            description TEXT,
            rating_rate DECIMAL(3, 2) DEFAULT 4.50,
            rating_count INT DEFAULT 10
        );
        """)

        # 3. Reviews table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS reviews (
            id INT AUTO_INCREMENT PRIMARY KEY,
            product_id INT NOT NULL,
            username VARCHAR(100) DEFAULT 'Anonymous',
            comment TEXT NOT NULL,
            rating INT DEFAULT 5,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        );
        """)

        # 4. Orders table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(100) NOT NULL,
            total_price DECIMAL(10, 2) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 5. Order items table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS order_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            order_id INT NOT NULL,
            product_id INT NOT NULL,
            quantity INT NOT NULL,
            price_at_purchase DECIMAL(10, 2) NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
        );
        """)

        conn.commit()
        cursor.close()
        conn.close()
        print("Database schema verified and tables initialized successfully!")
    except Exception as e:
        print("Schema setup warning:", str(e))

init_db()

# ==================== CATEGORIES ENDPOINTS ====================
@app.route('/api/categories', methods=['GET'])
def get_categories():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != ''")
        categories = [row['category'] for row in cursor.fetchall()]
        if not categories:
            categories = ["Electronics", "Jewelery", "Men's Clothing", "Women's Clothing"]
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
    image_url = data.get('image_url', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500')
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
        return jsonify({"message": "Product added successfully!"}), 201
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
            return jsonify({"error": "Product not found"}), 404
            
        cursor.execute("DELETE FROM products WHERE id = %s", (product_id,))
        conn.commit()
        return jsonify({"message": "Product deleted successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

# ==================== AUTHENTICATION & OTP ENDPOINTS ====================
@app.route('/api/auth/login', methods=['POST'])
def auth_login():
    data = request.json or {}
    username_or_email = data.get('username')  
    password = data.get('password')
    
    if not username_or_email or not password:
        return jsonify({"error": "Missing login credentials"}), 400
        
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT id, username, email, role FROM users WHERE (username = %s OR email = %s) AND password = %s", 
            (username_or_email, username_or_email, password)
        )
        user = cursor.fetchone()
        if user:
            return jsonify({"message": "Login successful!", "user": user}), 200
        return jsonify({"error": "Invalid username/email or password"}), 401
    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        conn.close()

@app.route('/api/auth/register', methods=['POST'])
def auth_register():
    data = request.json or {}
    username = data.get('username', '')
    email = data.get('email', '')
    password = data.get('password')
    
    if not username or not password or not email:
        return jsonify({"error": "All fields are required"}), 400
        
    assigned_role = 'ADMIN' if ('admin' in username.lower() or 'admin' in email.lower()) else 'USER'

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id FROM users WHERE username = %s OR email = %s", (username, email))
        if cursor.fetchone():
            return jsonify({"error": "Username or Email already exists"}), 409
            
        cursor.execute(
            "INSERT INTO users (username, email, password, role) VALUES (%s, %s, %s, %s)", 
            (username, email, password, assigned_role)
        )
        conn.commit()
        return jsonify({"message": f"Account created successfully as {assigned_role}!"}), 201
    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        conn.close()

@app.route('/api/auth/send-otp', methods=['POST', 'OPTIONS'])
def send_otp():
    """ Sends a 6-digit OTP code to the requested email address """
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    data = request.json or {}
    email = data.get('email')

    if not email:
        return jsonify({"error": "Email address is required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        if not cursor.fetchone():
            return jsonify({"error": "No account found matching this email address"}), 404

        otp_code = ''.join(random.choices(string.digits, k=6))
        otp_store[email] = otp_code

        msg = Message(
            subject="ShopZon Security Password Reset Code",
            recipients=[email],
            body=f"Your password reset verification code is: {otp_code}\n\nIf you did not request this code, please ignore this email."
        )
        mail.send(msg)

        return jsonify({"message": f"OTP verification code dispatched to {email}"}), 200

    except Exception as e:
        return jsonify({"error": f"Failed to deliver OTP message: {str(e)}"}), 500
    finally:
        conn.close()

@app.route('/api/auth/verify-otp-reset', methods=['POST', 'OPTIONS'])
def verify_otp_and_reset():
    """ Validates the OTP and updates the account password in MySQL """
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    data = request.json or {}
    email = data.get('email')
    otp_code = data.get('otp')
    new_password = data.get('new_password')

    if not email or not otp_code or not new_password:
        return jsonify({"error": "Email, OTP code, and new password are required"}), 400

    if otp_store.get(email) != str(otp_code):
        return jsonify({"error": "Invalid or expired OTP verification code"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE users SET password = %s WHERE email = %s", (new_password, email))
        conn.commit()
        
        otp_store.pop(email, None)
        
        return jsonify({"message": "Password updated successfully! You can now log in."}), 200
    except Exception as e:
        return jsonify({"error": f"Database update error: {str(e)}"}), 500
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

# ==================== ORDERS ENDPOINTS ====================
@app.route('/api/orders', methods=['POST'])
def place_order():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        data = request.json or {}
        username = data.get('username', 'Guest')
        total_charge = float(data.get('total_charge') or data.get('total') or 0.00)
        items = data.get('items', [])

        if not items:
            return jsonify({"error": "Order items list cannot be empty"}), 400

        cursor.execute(
            "INSERT INTO orders (username, total_price) VALUES (%s, %s)",
            (username, total_charge)
        )
        order_id = cursor.lastrowid 

        for item in items:
            raw_id = item.get('id') or item.get('product_id')
            qty = int(item.get('qty') or item.get('quantity') or 1)
            price = float(item.get('price') or 0.00)

            cursor.execute("SELECT id FROM products WHERE id = %s", (raw_id,))
            matched_product = cursor.fetchone()

            if matched_product:
                valid_prod_id = matched_product['id']
            else:
                cursor.execute("SELECT id FROM products LIMIT 1")
                fallback = cursor.fetchone()
                valid_prod_id = fallback['id'] if fallback else 1

            cursor.execute(
                """INSERT INTO order_items 
                   (order_id, product_id, quantity, price_at_purchase) 
                   VALUES (%s, %s, %s, %s)""",
                (order_id, valid_prod_id, qty, price)
            )

        conn.commit()
        return jsonify({"message": "Order processed successfully!", "order_id": order_id}), 201

    except Exception as e:
        print("Database order error:", str(e))
        return jsonify({"error": f"Order placement failed: {str(e)}"}), 500
    finally:
        conn.close()

@app.route('/api/admin/metrics', methods=['GET'])
def get_admin_metrics():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
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

# ==================== SEEDER ENDPOINT ====================
@app.route('/api/seed', methods=['GET'])
def seed_products():
    products_data = [
        ("Fjallraven - Foldsack No. 1 Backpack", 109.95, "Your perfect pack for everyday use and walks in the forest.", "Men's Clothing", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500"),
        ("Mens Casual Premium Slim Fit T-Shirts", 22.30, "Slim-fitting style, contrast raglan long sleeve.", "Men's Clothing", "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500"),
        ("Mens Cotton Jacket", 55.99, "Great outerwear jackets for Spring/Autumn/Winter.", "Men's Clothing", "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500"),
        ("Mens Casual Slim Fit Shirt", 15.99, "Classic everyday versatile casual shirt.", "Men's Clothing", "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500"),
        ("Dragon Station Gold Chain Bracelet", 695.00, "Inspired by mythical designs crafted with premium alloy.", "Jewelery", "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500"),
        ("Solid Gold Petite Micropave Ring", 168.00, "Classic handcrafted elegant solitaire promise ring.", "Jewelery", "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500"),
        ("White Gold Plated Princess Pendant", 9.99, "Beautiful sparkling pendant for special occasions.", "Jewelery", "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500"),
        ("Rose Gold Double Flared Earrings", 10.99, "Stainless steel premium rose gold plated double flared earrings.", "Jewelery", "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=500"),
        ("WD 2TB External Hard Drive - USB 3.0", 64.00, "Fast data transfers and compact portable storage.", "Electronics", "https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=500"),
        ("SanDisk SSD PLUS 1TB Internal SSD", 109.00, "Easy upgrade for faster boot up and load performance.", "Electronics", "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500"),
        ("Silicon Power 256GB SSD Performance", 109.00, "High speed 3D NAND flash for quick responsiveness.", "Electronics", "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500"),
        ("WD 4TB Gaming Drive Portable Storage", 114.00, "Expand your gaming library with rapid read/write speeds.", "Electronics", "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500"),
        ("Acer SB220Q 21.5-inch Full HD Monitor", 599.00, "Ultra-thin IPS widescreen display with crisp clarity.", "Electronics", "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500"),
        ("Samsung 49-Inch Curved Gaming Monitor", 999.99, "Super ultrawide 144Hz curved gaming display.", "Electronics", "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500"),
        ("Women's 3-in-1 Snowboard Winter Coat", 56.99, "Durable weatherproof insulated outdoor mountain jacket.", "Women's Clothing", "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=500"),
        ("Women's Removable Hooded Faux Leather Jacket", 29.95, "Stylish comfortable fitted faux leather outerwear.", "Women's Clothing", "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500"),
        ("Rain Jacket Women Windbreaker Raincoat", 39.99, "Lightweight waterproof coat perfect for travel and daily wear.", "Women's Clothing", "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500"),
        ("MBJ Women's Solid Short Sleeve Boat Neck V", 9.85, "Soft lightweight stretch fabric daily casual tee.", "Women's Clothing", "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500"),
        ("Opna Women's Short Sleeve Moisture Shirt", 7.95, "Breathable active athletic performance top.", "Women's Clothing", "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=500"),
        ("DANVOUBA Women's Casual Cotton Short Sleeve", 12.99, "Comfortable cotton blend everyday basic shirt.", "Women's Clothing", "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500")
    ]
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SET FOREIGN_KEY_CHECKS = 0;")
        cursor.execute("TRUNCATE TABLE products;")
        cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")
        
        inserted_count = 0
        for item in products_data:
            cursor.execute(
                "INSERT INTO products (title, price, description, category, image_url) VALUES (%s, %s, %s, %s, %s)",
                item
            )
            inserted_count += 1
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"status": "success", "total_processed": inserted_count, "message": f"Successfully seeded {inserted_count} products!"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
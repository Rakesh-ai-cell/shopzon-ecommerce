import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import pymysql

app = Flask(__name__)
CORS(app)

# Read database details from environment variables
DB_HOST = os.getenv("DB_HOST", "mysql-afcb92d-rakeysh122-a4e8.g.aivencloud.com").strip()
DB_USER = os.getenv("DB_USER", "avnadmin").strip()
DB_PASSWORD = os.getenv("DB_PASSWORD", "AVNS_Mtj06xX2Hn6ZOow5X15").strip()
DB_NAME = os.getenv("DB_NAME", "defaultdb").strip()
DB_PORT = int(os.getenv("DB_PORT", 26165))

def get_db_connection():
    # Correct SSL settings for PyMySQL connecting to Aiven from Render
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
    """ Automatically creates required tables and seeds initial data """
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

# Auto-initialize database on application startup
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

# ==================== ORDERS ENDPOINTS ====================
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

        cursor.execute(
            "INSERT INTO orders (username, total_price) VALUES (%s, %s)",
            (username, total_charge)
        )
        order_id = cursor.lastrowid 

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
        ("Fjallraven - Foldsack No. 1 Backpack", 109.95, "Your perfect pack for everyday use and walks in the forest.", "men's clothing", "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg"),
        ("Mens Casual Premium Slim Fit T-Shirts", 22.30, "Slim-fitting style, contrast raglan long sleeve, three-button henley placket.", "men's clothing", "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg"),
        ("Mens Cotton Jacket", 55.99, "Great outerwear jackets for Spring/Autumn/Winter, suitable for many occasions.", "men's clothing", "https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg"),
        ("Mens Casual Slim Fit", 15.99, "The color could be slightly different between on the screen and in practice.", "men's clothing", "https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_.jpg"),
        ("John Hardy Women's Legends Naga Gold & Silver Dragon Station Chain Bracelet", 695.00, "From our Legends Collection, the Naga was inspired by the mythical water dragon.", "jewelery", "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_QL65_ML3_.jpg"),
        ("Solid Gold Petite Micropave", 168.00, "Satisfaction Guaranteed. Return or exchange any order within 30 days.", "jewelery", "https://fakestoreapi.com/img/61sbMiUnoGL._AC_UL640_QL65_ML3_.jpg"),
        ("White Gold Plated Princess", 9.99, "Classic Created Wedding Engagement Solitaire Diamond Promise Ring for Her.", "jewelery", "https://fakestoreapi.com/img/71YAIFU48IL._AC_UL640_QL65_ML3_.jpg"),
        ("Pierced Owl Rose Gold Plated Stainless Steel Double", 10.99, "Rose Gold Plated Double Flared Tunnel Plug Earrings.", "jewelery", "https://fakestoreapi.com/img/51UDEzMJVpL._AC_UL640_QL65_ML3_.jpg"),
        ("WD 2TB Elements Portable External Hard Drive - USB 3.0", 64.00, "USB 3.0 and USB 2.0 Compatibility Fast data transfers Improve PC Performance.", "electronics", "https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg"),
        ("SanDisk SSD PLUS 1TB Internal SSD - SATA III 6 Gb/s", 109.00, "Easy upgrade for faster boot up, shutdown, application load and response.", "electronics", "https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_.jpg"),
        ("Silicon Power 256GB SSD 3D NAND A55 SLC Cache Performance Boost", 109.00, "3D NAND flash are applied to deliver high transfer speeds.", "electronics", "https://fakestoreapi.com/img/71kWymZ+c+L._AC_SX679_.jpg"),
        ("WD 4TB Gaming Drive Portable External Hard Drive", 114.00, "Expand your PS4 gaming experience, Play anywhere Fast and easy setup.", "electronics", "https://fakestoreapi.com/img/61mtL6ch4L._AC_SX679_.jpg"),
        ("Acer SB220Q bi 21.5 inches Full HD Ultra-Thin", 599.00, "21.5 inches Full HD (1920 x 1080) widescreen IPS display.", "electronics", "https://fakestoreapi.com/img/81QpkIctqPL._AC_SX679_.jpg"),
        ("Samsung 49-Inch CHG90 144Hz Curved Gaming Monitor", 999.99, "49 INCH SUPER ULTRAWIDE 32:9 CURVED GAMING MONITOR.", "electronics", "https://fakestoreapi.com/img/81Zt42ioCgL._AC_SX679_.jpg"),
        ("BIYLACLESEN Women's 3-in-1 Snowboard Jacket Winter Coats", 56.99, "Note: The Jackets is US standard size.", "women's clothing", "https://fakestoreapi.com/img/51Y5NI-IWH3L._AC_UX679_.jpg"),
        ("Lock and Love Women's Removable Hooded Faux Leather Moto Biker Jacket", 29.95, "100% POLYURETHANE(shell) 100% POLYESTER(lining).", "women's clothing", "https://fakestoreapi.com/img/81XH0e8fefL._AC_UY879_.jpg"),
        ("Rain Jacket Women Windbreaker Striped Climbing Raincoats", 39.99, "Lightweight perfect for trip or casual wear.", "women's clothing", "https://fakestoreapi.com/img/71HblAHs5xL._AC_UY879_-2.jpg"),
        ("MBJ Women's Solid Short Sleeve Boat Neck V", 9.85, "95% RAYON 5% SPANDEX, Made in USA.", "women's clothing", "https://fakestoreapi.com/img/71z3kpMAYsL._AC_UY879_.jpg"),
        ("Opna Women's Short Sleeve Moisture", 7.95, "100% Polyester, Machine wash, Soft premium lightweight fabric.", "women's clothing", "https://fakestoreapi.com/img/51eg55uWmdL._AC_UX679_.jpg"),
        ("DANVOUBA Women's Casual Cotton Short Sleeve", 12.99, "95% Cotton, 5% Spandex. Features: Casual, Short Sleeve.", "women's clothing", "https://fakestoreapi.com/img/61pHAEJ4NML._AC_UX679_.jpg")
    ]
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
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
import os
import pymysql

DB_HOST = os.getenv("DB_HOST", "mysql-afcb92d-rakeysh122-a4e8.g.aivencloud.com")
DB_USER = os.getenv("DB_USER", "avnadmin")
DB_PASSWORD = os.getenv("DB_PASSWORD", "AVNS_Mtj06xX2Hn6ZOow5X15")
DB_NAME = os.getenv("DB_NAME", "defaultdb")
DB_PORT = int(os.getenv("DB_PORT", 26165))

def setup_database():
    print("Connecting to cloud MySQL...")
    conn = pymysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        port=DB_PORT,
        ssl={'ssl': True}
    )
    cursor = conn.cursor()

    print("Creating tables...")
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        image VARCHAR(255),
        rating DECIMAL(3, 2) DEFAULT 0.0
    );
    """)

    # Seed sample product
    cursor.execute("SELECT COUNT(*) FROM products;")
    if cursor.fetchone()[0] == 0:
        print("Inserting initial products...")
        cursor.execute("""
        INSERT INTO products (title, price, description, category, image, rating)
        VALUES ('Sample Product', 29.99, 'Sample description', 'Electronics', 'https://via.placeholder.com/150', 4.5);
        """)

    conn.commit()
    cursor.close()
    conn.close()
    print("Database setup complete!")

if __name__ == "__main__":
    setup_database()
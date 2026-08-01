from app import get_db_connection

PRODUCTS = [
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

def run_seed():
    conn = get_db_connection()
    cursor = conn.cursor()
    print("Inserting 20 items into MySQL...")
    for item in PRODUCTS:
        cursor.execute(
            "INSERT INTO products (title, price, description, category, image_url) VALUES (%s, %s, %s, %s, %s)",
            item
        )
    conn.commit()
    cursor.close()
    conn.close()
    print("Done! All 20 products inserted successfully.")

if __name__ == '__main__':
    run_seed()
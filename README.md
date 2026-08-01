# 🛒 ShopZon E-Commerce Portal

A full-stack, responsive e-commerce web application with full Admin & Storefront support.

---

## 💻 How to Run on Laptop

### 1. Start MySQL Database
* Open **XAMPP Control Panel**.
* Start the **Apache** and **MySQL** services.
* Open `http://localhost/phpmyadmin`, create a database named `shopzon_db`, and run the database schema SQL.

### 2. Start Python Flask Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate   # On Windows
pip install flask flask-cors pymysql
python app.py
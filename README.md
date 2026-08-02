[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=vercel)](https://shopzon-ecommerce.vercel.app)
![ShopZon Preview](<img width="1878" height="824" alt="Screenshot 2026-08-03 020007" src="https://github.com/user-attachments/assets/90cfc03e-de0c-4f68-a533-7576ed48769a" />
)
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

import db from './database.js';

export function initializeSchema() {
  const init = db.transaction(() => {
    // 1. Products Table
    db.prepare(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT,
        price REAL DEFAULT 0,
        discount_percentage REAL DEFAULT 0,
        rating REAL DEFAULT 0,
        stock INTEGER DEFAULT 0,
        brand TEXT,
        sku TEXT,
        weight REAL,
        dimensions TEXT,
        warranty_information TEXT,
        shipping_information TEXT,
        availability_status TEXT,
        tags TEXT,
        reviews TEXT,
        return_policy TEXT,
        minimum_order_quantity INTEGER DEFAULT 1,
        meta TEXT,
        images TEXT,
        thumbnail TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    // 2. Users Table
    // Excludes sensitive info like password, bank, ssn
    db.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT,
        maiden_name TEXT,
        age INTEGER,
        gender TEXT,
        email TEXT,
        phone TEXT,
        username TEXT,
        birth_date TEXT,
        image TEXT,
        blood_group TEXT,
        height REAL,
        weight REAL,
        eye_color TEXT,
        hair TEXT,
        ip TEXT,
        address TEXT,
        mac_address TEXT,
        university TEXT,
        company_name TEXT,
        company_department TEXT,
        company_title TEXT,
        company_address TEXT,
        company_ein TEXT,
        user_agent TEXT,
        crypto TEXT,
        role TEXT DEFAULT 'user',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    // 3. Orders Table
    // Completely independent of Cart functionality
    db.prepare(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        customer_name TEXT,
        products TEXT,
        total_amount REAL DEFAULT 0,
        status TEXT DEFAULT 'pending',
        order_date TEXT,
        payment_method TEXT,
        shipping_address TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
  });

  init();
  console.log('Database schema initialized successfully. Tables verified: products, users, orders.');
}

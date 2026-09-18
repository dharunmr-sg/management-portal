import { parse } from 'csv-parse/sync';
import db from '../database/database.js';

// ─── Shared helpers ──────────────────────────────────────────────────────────

const toFloat = (v) => {
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
};
const toInt = (v) => {
  const n = parseInt(v, 10);
  return isNaN(n) ? null : n;
};
const trim = (v) => (typeof v === 'string' ? v.trim() : v);

/**
 * Get the next safe unique ID for a table.
 * Uses MAX(id) + 1 so the generated ID never collides with existing rows.
 * Returns at least `startAfter` so CSV-provided IDs don't overlap auto-ids.
 */
function getNextId(table, startAfter = 0) {
  const row = db.prepare(`SELECT COALESCE(MAX(id), 0) AS maxId FROM ${table}`).get();
  return Math.max(row.maxId, startAfter) + 1;
}

// ─── Product import ───────────────────────────────────────────────────────────

const PRODUCT_ALLOWED = [
  'title', 'description', 'category', 'price', 'discount_percentage', 'rating',
  'stock', 'brand', 'sku', 'weight', 'availability_status', 'thumbnail',
  'minimum_order_quantity', 'warranty_information', 'shipping_information',
  'return_policy', 'tags', 'dimensions', 'reviews', 'meta', 'images',
];

const PRODUCT_NUMERIC_FLOAT = ['price', 'discount_percentage', 'rating', 'weight'];
const PRODUCT_NUMERIC_INT   = ['stock', 'minimum_order_quantity'];
const PRODUCT_JSON_FIELDS   = ['dimensions', 'tags', 'reviews', 'meta', 'images'];

function buildProductRow(raw) {
  const row = {};
  for (const key of PRODUCT_ALLOWED) {
    const val = raw[key];
    if (val !== undefined && trim(val) !== '') {
      if (PRODUCT_NUMERIC_FLOAT.includes(key)) {
        row[key] = toFloat(val);
      } else if (PRODUCT_NUMERIC_INT.includes(key)) {
        row[key] = toInt(val);
      } else if (PRODUCT_JSON_FIELDS.includes(key)) {
        row[key] = trim(val);
      } else {
        row[key] = trim(val);
      }
    }
  }
  return row;
}

// Single INSERT statement that always includes id
const insertProduct = db.prepare(`
  INSERT INTO products (
    id, title, description, category, price, discount_percentage,
    rating, stock, brand, sku, weight, availability_status, thumbnail,
    minimum_order_quantity, warranty_information, shipping_information,
    return_policy, tags, dimensions, reviews, meta, images
  ) VALUES (
    @id, @title, @description, @category, @price, @discount_percentage,
    @rating, @stock, @brand, @sku, @weight, @availability_status, @thumbnail,
    @minimum_order_quantity, @warranty_information, @shipping_information,
    @return_policy, @tags, @dimensions, @reviews, @meta, @images
  )
  ON CONFLICT(id) DO UPDATE SET
    title = COALESCE(excluded.title, products.title),
    description = COALESCE(excluded.description, products.description),
    category = COALESCE(excluded.category, products.category),
    price = COALESCE(excluded.price, products.price),
    discount_percentage = COALESCE(excluded.discount_percentage, products.discount_percentage),
    rating = COALESCE(excluded.rating, products.rating),
    stock = COALESCE(excluded.stock, products.stock),
    brand = COALESCE(excluded.brand, products.brand),
    sku = COALESCE(excluded.sku, products.sku),
    weight = COALESCE(excluded.weight, products.weight),
    availability_status = COALESCE(excluded.availability_status, products.availability_status),
    thumbnail = COALESCE(excluded.thumbnail, products.thumbnail),
    minimum_order_quantity = COALESCE(excluded.minimum_order_quantity, products.minimum_order_quantity),
    warranty_information = COALESCE(excluded.warranty_information, products.warranty_information),
    shipping_information = COALESCE(excluded.shipping_information, products.shipping_information),
    return_policy = COALESCE(excluded.return_policy, products.return_policy),
    tags = COALESCE(excluded.tags, products.tags),
    dimensions = COALESCE(excluded.dimensions, products.dimensions),
    reviews = COALESCE(excluded.reviews, products.reviews),
    meta = COALESCE(excluded.meta, products.meta),
    images = COALESCE(excluded.images, products.images),
    updated_at = CURRENT_TIMESTAMP
`);

export const importProducts = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No CSV file uploaded.' });
    }

    let records;
    try {
      records = parse(req.file.buffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
      });
    } catch (parseErr) {
      return res.status(400).json({ success: false, message: `CSV parse error: ${parseErr.message}` });
    }

    if (records.length === 0) {
      return res.status(400).json({ success: false, message: 'CSV file is empty or has no data rows.' });
    }

    const headers = Object.keys(records[0]);
    if (!headers.includes('title')) {
      return res.status(400).json({ success: false, message: 'CSV must contain a "title" column.' });
    }

    const summary = { total: records.length, inserted: 0, updated: 0, duplicates: 0, invalid: 0, errors: [] };

    // Collect explicit IDs from CSV rows that have them, so we can reserve a
    // starting point for auto-generated IDs above all of them.
    const explicitIds = records
      .map(r => toInt(r.id))
      .filter(n => n !== null && n > 0);
    const maxCsvId = explicitIds.length > 0 ? Math.max(...explicitIds) : 0;

    // Auto-ID counter — starts above both the DB max and the CSV max
    let nextAutoId = getNextId('products', maxCsvId);

    const runImport = db.transaction((rows) => {
      rows.forEach((raw, idx) => {
        const rowNum = idx + 2; // 1-indexed + skip header
        const title = trim(raw.title);

        if (!title) {
          summary.invalid++;
          summary.errors.push({ row: rowNum, reason: 'Missing required field: title' });
          return;
        }

        const row = buildProductRow(raw);
        row.title = title;

        const params = {
          id: null, // filled below
          title: row.title ?? null,
          description: row.description ?? null,
          category: row.category ?? null,
          price: row.price ?? null,
          discount_percentage: row.discount_percentage ?? null,
          rating: row.rating ?? null,
          stock: row.stock ?? null,
          brand: row.brand ?? null,
          sku: row.sku ?? null,
          weight: row.weight ?? null,
          availability_status: row.availability_status ?? null,
          thumbnail: row.thumbnail ?? null,
          minimum_order_quantity: row.minimum_order_quantity ?? null,
          warranty_information: row.warranty_information ?? null,
          shipping_information: row.shipping_information ?? null,
          return_policy: row.return_policy ?? null,
          tags: row.tags ?? null,
          dimensions: row.dimensions ?? null,
          reviews: row.reviews ?? null,
          meta: row.meta ?? null,
          images: row.images ?? null,
        };

        try {
          const csvId = raw.id ? toInt(raw.id) : null;
          let isUpdate = false;

          if (csvId !== null && csvId > 0) {
            // CSV provided an explicit ID — check if it's an update
            const exists = db.prepare('SELECT id FROM products WHERE id = ?').get(csvId);
            if (exists) {
              isUpdate = true;
            }
            params.id = csvId;
          } else {
            // Auto-assign a guaranteed unique ID
            params.id = nextAutoId++;
          }

          insertProduct.run(params);
          if (isUpdate) {
            summary.updated++;
          } else {
            summary.inserted++;
          }
        } catch (err) {
          summary.invalid++;
          summary.errors.push({ row: rowNum, reason: err.code === 'SQLITE_CONSTRAINT' ? `Constraint violation: ${err.message}` : err.message });
        }
      });
    });

    runImport(records);

    return res.status(200).json({ success: true, summary });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── User import ─────────────────────────────────────────────────────────────

const USER_ALLOWED = [
  'first_name', 'last_name', 'maiden_name', 'age', 'gender', 'email', 'phone',
  'username', 'birth_date', 'image', 'blood_group', 'height', 'weight',
  'eye_color', 'hair', 'ip', 'university', 'role',
  'company_name', 'company_department', 'company_title', 'company_ein',
];

// Passwords, SSN, bank details, complex JSON fields are never imported
const USER_NUMERIC_FLOAT = ['height', 'weight'];
const USER_NUMERIC_INT   = ['age'];

function buildUserRow(raw) {
  const row = {};
  for (const key of USER_ALLOWED) {
    const val = raw[key];
    if (val !== undefined && trim(val) !== '') {
      if (USER_NUMERIC_FLOAT.includes(key)) {
        row[key] = toFloat(val);
      } else if (USER_NUMERIC_INT.includes(key)) {
        row[key] = toInt(val);
      } else {
        row[key] = trim(val);
      }
    }
  }
  return row;
}

// Single INSERT statement that always includes id
const insertUser = db.prepare(`
  INSERT INTO users (
    id, first_name, last_name, maiden_name, age, gender, email, phone,
    username, birth_date, image, blood_group, height, weight, eye_color, hair,
    ip, university, role, company_name, company_department, company_title, company_ein
  ) VALUES (
    @id, @first_name, @last_name, @maiden_name, @age, @gender, @email, @phone,
    @username, @birth_date, @image, @blood_group, @height, @weight, @eye_color, @hair,
    @ip, @university, @role, @company_name, @company_department, @company_title, @company_ein
  )
  ON CONFLICT(id) DO UPDATE SET
    first_name = COALESCE(excluded.first_name, users.first_name),
    last_name = COALESCE(excluded.last_name, users.last_name),
    maiden_name = COALESCE(excluded.maiden_name, users.maiden_name),
    age = COALESCE(excluded.age, users.age),
    gender = COALESCE(excluded.gender, users.gender),
    email = COALESCE(excluded.email, users.email),
    phone = COALESCE(excluded.phone, users.phone),
    username = COALESCE(excluded.username, users.username),
    birth_date = COALESCE(excluded.birth_date, users.birth_date),
    image = COALESCE(excluded.image, users.image),
    blood_group = COALESCE(excluded.blood_group, users.blood_group),
    height = COALESCE(excluded.height, users.height),
    weight = COALESCE(excluded.weight, users.weight),
    eye_color = COALESCE(excluded.eye_color, users.eye_color),
    hair = COALESCE(excluded.hair, users.hair),
    ip = COALESCE(excluded.ip, users.ip),
    university = COALESCE(excluded.university, users.university),
    role = COALESCE(excluded.role, users.role),
    company_name = COALESCE(excluded.company_name, users.company_name),
    company_department = COALESCE(excluded.company_department, users.company_department),
    company_title = COALESCE(excluded.company_title, users.company_title),
    company_ein = COALESCE(excluded.company_ein, users.company_ein),
    updated_at = CURRENT_TIMESTAMP
`);

export const importUsers = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No CSV file uploaded.' });
    }

    let records;
    try {
      records = parse(req.file.buffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
      });
    } catch (parseErr) {
      return res.status(400).json({ success: false, message: `CSV parse error: ${parseErr.message}` });
    }

    if (records.length === 0) {
      return res.status(400).json({ success: false, message: 'CSV file is empty or has no data rows.' });
    }

    const headers = Object.keys(records[0]);
    if (!headers.includes('first_name')) {
      return res.status(400).json({ success: false, message: 'CSV must contain a "first_name" column.' });
    }

    const summary = { total: records.length, inserted: 0, updated: 0, duplicates: 0, invalid: 0, errors: [] };

    const explicitIds = records
      .map(r => toInt(r.id))
      .filter(n => n !== null && n > 0);
    const maxCsvId = explicitIds.length > 0 ? Math.max(...explicitIds) : 0;

    let nextAutoId = getNextId('users', maxCsvId);

    const runImport = db.transaction((rows) => {
      rows.forEach((raw, idx) => {
        const rowNum = idx + 2;
        const first_name = trim(raw.first_name);

        if (!first_name) {
          summary.invalid++;
          summary.errors.push({ row: rowNum, reason: 'Missing required field: first_name' });
          return;
        }

        const row = buildUserRow(raw);
        row.first_name = first_name;

        const params = {
          id: null, // filled below
          first_name: row.first_name ?? null,
          last_name: row.last_name ?? null,
          maiden_name: row.maiden_name ?? null,
          age: row.age ?? null,
          gender: row.gender ?? null,
          email: row.email ?? null,
          phone: row.phone ?? null,
          username: row.username ?? null,
          birth_date: row.birth_date ?? null,
          image: row.image ?? null,
          blood_group: row.blood_group ?? null,
          height: row.height ?? null,
          weight: row.weight ?? null,
          eye_color: row.eye_color ?? null,
          hair: row.hair ?? null,
          ip: row.ip ?? null,
          university: row.university ?? null,
          role: row.role || 'user',
          company_name: row.company_name ?? null,
          company_department: row.company_department ?? null,
          company_title: row.company_title ?? null,
          company_ein: row.company_ein ?? null,
        };

        try {
          const csvId = raw.id ? toInt(raw.id) : null;
          let isUpdate = false;

          if (csvId !== null && csvId > 0) {
            const exists = db.prepare('SELECT id FROM users WHERE id = ?').get(csvId);
            if (exists) {
              isUpdate = true;
            }
            params.id = csvId;
          } else {
            params.id = nextAutoId++;
          }

          insertUser.run(params);
          if (isUpdate) {
            summary.updated++;
          } else {
            summary.inserted++;
          }
        } catch (err) {
          summary.invalid++;
          summary.errors.push({ row: rowNum, reason: err.code === 'SQLITE_CONSTRAINT' ? `Constraint violation: ${err.message}` : err.message });
        }
      });
    });

    runImport(records);

    return res.status(200).json({ success: true, summary });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

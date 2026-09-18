import db from '../database/database.js';

const ALLOWED_FIELDS = [
  'title', 'description', 'category', 'price', 'discount_percentage', 'rating',
  'stock', 'brand', 'sku', 'weight', 'dimensions', 'warranty_information',
  'shipping_information', 'availability_status', 'tags', 'reviews', 'return_policy',
  'minimum_order_quantity', 'meta', 'images', 'thumbnail'
];

const filterAllowedFields = (data) => {
  const filtered = {};
  Object.keys(data).forEach(key => {
    if (ALLOWED_FIELDS.includes(key)) {
      filtered[key] = data[key];
    }
  });
  return filtered;
};

const parseProductJson = (product) => {
  if (!product) return product;
  const jsonFields = ['dimensions', 'tags', 'reviews', 'meta', 'images'];
  jsonFields.forEach(field => {
    if (product[field]) {
      try {
        product[field] = JSON.parse(product[field]);
      } catch (e) {}
    }
  });
  return product;
};

const stringifyProductJson = (data) => {
  const jsonFields = ['dimensions', 'tags', 'reviews', 'meta', 'images'];
  const result = { ...data };
  jsonFields.forEach(field => {
    if (result[field] !== undefined) {
      result[field] = JSON.stringify(result[field]);
    }
  });
  return result;
};

export const getProducts = (req, res) => {
  try {
    let { 
      page = 1, limit = 10, sortBy = 'id', order = 'desc', 
      search, category, brand, availability_status, 
      minimum_price, maximum_price, minimum_stock, maximum_stock 
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    if (isNaN(page) || page < 1) return res.status(400).json({ success: false, message: "page must be a positive integer" });
    if (isNaN(limit) || limit < 1) return res.status(400).json({ success: false, message: "limit must be a positive integer" });
    if (limit > 100) limit = 100;

    const allowedSortFields = ['id', 'title', 'price', 'rating', 'stock', 'category', 'created_at', 'updated_at'];
    if (!allowedSortFields.includes(sortBy)) return res.status(400).json({ success: false, message: "Invalid sortBy field" });
    
    order = order.toLowerCase();
    if (order !== 'asc' && order !== 'desc') return res.status(400).json({ success: false, message: "order must be asc or desc" });

    let whereClauses = [];
    let params = [];

    if (search) {
      whereClauses.push('(title LIKE ? OR description LIKE ? OR category LIKE ? OR brand LIKE ? OR sku LIKE ?)');
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam, searchParam);
    }
    if (category) {
      whereClauses.push('category = ?');
      params.push(category);
    }
    if (brand) {
      whereClauses.push('brand = ?');
      params.push(brand);
    }
    if (availability_status) {
      whereClauses.push('availability_status = ?');
      params.push(availability_status);
    }
    if (minimum_price !== undefined) {
      const minP = parseFloat(minimum_price);
      if (isNaN(minP)) return res.status(400).json({ success: false, message: "minimum_price must be a valid number" });
      whereClauses.push('price >= ?');
      params.push(minP);
    }
    if (maximum_price !== undefined) {
      const maxP = parseFloat(maximum_price);
      if (isNaN(maxP)) return res.status(400).json({ success: false, message: "maximum_price must be a valid number" });
      whereClauses.push('price <= ?');
      params.push(maxP);
    }
    if (minimum_stock !== undefined) {
      const minS = parseInt(minimum_stock);
      if (isNaN(minS)) return res.status(400).json({ success: false, message: "minimum_stock must be a valid number" });
      whereClauses.push('stock >= ?');
      params.push(minS);
    }
    if (maximum_stock !== undefined) {
      const maxS = parseInt(maximum_stock);
      if (isNaN(maxS)) return res.status(400).json({ success: false, message: "maximum_stock must be a valid number" });
      whereClauses.push('stock <= ?');
      params.push(maxS);
    }

    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    
    const countQuery = `SELECT count(*) as total FROM products ${whereString}`;
    const total = db.prepare(countQuery).get(...params).total;
    
    const totalPages = Math.ceil(total / limit) || 0;
    const offset = (page - 1) * limit;

    const dataQuery = `SELECT * FROM products ${whereString} ORDER BY ${sortBy} ${order.toUpperCase()} LIMIT ? OFFSET ?`;
    const dataParams = [...params, limit, offset];
    
    const products = db.prepare(dataQuery).all(...dataParams);

    res.status(200).json({
      success: true,
      data: products.map(parseProductJson),
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductById = (req, res) => {
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ success: true, data: parseProductJson(product) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProduct = (req, res) => {
  try {
    const { title, price, stock } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: "title is required for creation" });
    }
    if (price !== undefined && isNaN(price)) {
      return res.status(400).json({ success: false, message: "price must be a valid number" });
    }
    if (stock !== undefined && isNaN(stock)) {
      return res.status(400).json({ success: false, message: "stock must be a valid number" });
    }

    const data = stringifyProductJson(filterAllowedFields(req.body));

    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    
    const stmt = db.prepare(`INSERT INTO products (${keys.join(', ')}) VALUES (${placeholders})`);
    const info = stmt.run(values);

    const newProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json({ success: true, message: "Product created successfully", data: parseProductJson(newProduct) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProduct = (req, res) => {
  try {
    const { id } = req.params;
    const exists = db.prepare('SELECT id FROM products WHERE id = ?').get(id);
    if (!exists) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    
    const { title, price, stock } = req.body;
    if (req.method === 'PUT' && !title) {
      return res.status(400).json({ success: false, message: "title is required for update" });
    }
    if (price !== undefined && isNaN(price)) {
      return res.status(400).json({ success: false, message: "price must be a valid number" });
    }
    if (stock !== undefined && isNaN(stock)) {
      return res.status(400).json({ success: false, message: "stock must be a valid number" });
    }

    const data = stringifyProductJson(filterAllowedFields(req.body));

    const keys = Object.keys(data);
    if (keys.length === 0) {
      return res.status(400).json({ success: false, message: "No data provided to update" });
    }

    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const values = [...Object.values(data), id];
    
    db.prepare(`UPDATE products SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(values);
    
    const updatedProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    res.status(200).json({ success: true, message: "Product updated successfully", data: parseProductJson(updatedProduct) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProduct = (req, res) => {
  try {
    const { id } = req.params;
    const exists = db.prepare('SELECT id FROM products WHERE id = ?').get(id);
    if (!exists) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

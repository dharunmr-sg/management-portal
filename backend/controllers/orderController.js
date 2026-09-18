import db from '../database/database.js';

const ALLOWED_FIELDS = [
  'user_id', 'customer_name', 'products', 'total_amount', 'status', 
  'order_date', 'payment_method', 'shipping_address'
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

const parseOrderJson = (order) => {
  if (!order) return order;
  const jsonFields = ['products', 'shipping_address'];
  jsonFields.forEach(field => {
    if (order[field]) {
      try {
        order[field] = JSON.parse(order[field]);
      } catch (e) {}
    }
  });
  return order;
};

const stringifyOrderJson = (data) => {
  const jsonFields = ['products', 'shipping_address'];
  const result = { ...data };
  jsonFields.forEach(field => {
    if (result[field] !== undefined) {
      result[field] = JSON.stringify(result[field]);
    }
  });
  return result;
};

export const getOrders = (req, res) => {
  try {
    let { 
      page = 1, limit = 10, sortBy = 'id', order = 'desc', 
      search, status, payment_method, minimum_amount, maximum_amount 
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    if (isNaN(page) || page < 1) return res.status(400).json({ success: false, message: "page must be a positive integer" });
    if (isNaN(limit) || limit < 1) return res.status(400).json({ success: false, message: "limit must be a positive integer" });
    if (limit > 100) limit = 100;

    const allowedSortFields = ['id', 'customer_name', 'total_amount', 'status', 'order_date', 'created_at', 'updated_at'];
    if (!allowedSortFields.includes(sortBy)) return res.status(400).json({ success: false, message: "Invalid sortBy field" });
    
    order = order.toLowerCase();
    if (order !== 'asc' && order !== 'desc') return res.status(400).json({ success: false, message: "order must be asc or desc" });

    let whereClauses = [];
    let params = [];

    if (search) {
      whereClauses.push('(customer_name LIKE ? OR payment_method LIKE ? OR status LIKE ?)');
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }
    if (status) {
      whereClauses.push('status = ?');
      params.push(status);
    }
    if (payment_method) {
      whereClauses.push('payment_method = ?');
      params.push(payment_method);
    }
    if (minimum_amount !== undefined) {
      const minA = parseFloat(minimum_amount);
      if (isNaN(minA)) return res.status(400).json({ success: false, message: "minimum_amount must be a valid number" });
      whereClauses.push('total_amount >= ?');
      params.push(minA);
    }
    if (maximum_amount !== undefined) {
      const maxA = parseFloat(maximum_amount);
      if (isNaN(maxA)) return res.status(400).json({ success: false, message: "maximum_amount must be a valid number" });
      whereClauses.push('total_amount <= ?');
      params.push(maxA);
    }

    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    
    const countQuery = `SELECT count(*) as total FROM orders ${whereString}`;
    const total = db.prepare(countQuery).get(...params).total;
    
    const totalPages = Math.ceil(total / limit) || 0;
    const offset = (page - 1) * limit;

    const dataQuery = `SELECT * FROM orders ${whereString} ORDER BY ${sortBy} ${order.toUpperCase()} LIMIT ? OFFSET ?`;
    const dataParams = [...params, limit, offset];
    
    const orders = db.prepare(dataQuery).all(...dataParams);

    res.status(200).json({
      success: true,
      data: orders.map(parseOrderJson),
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

export const getOrderById = (req, res) => {
  try {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.status(200).json({ success: true, data: parseOrderJson(order) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createOrder = (req, res) => {
  try {
    const { total_amount, status } = req.body;
    if (total_amount !== undefined && isNaN(total_amount)) {
      return res.status(400).json({ success: false, message: "total_amount must be a valid number" });
    }

    const data = stringifyOrderJson(filterAllowedFields(req.body));

    // Default status if not provided
    if (!data.status) {
      data.status = 'pending';
    }

    const keys = Object.keys(data);
    
    // Fallback if no data at all
    if (keys.length === 0) {
      data.status = 'pending';
      keys.push('status');
    }

    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    
    const stmt = db.prepare(`INSERT INTO orders (${keys.join(', ')}) VALUES (${placeholders})`);
    const info = stmt.run(values);

    const newOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json({ success: true, message: "Order created successfully", data: parseOrderJson(newOrder) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrder = (req, res) => {
  try {
    const { id } = req.params;
    const exists = db.prepare('SELECT id FROM orders WHERE id = ?').get(id);
    if (!exists) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    
    const { total_amount } = req.body;
    if (total_amount !== undefined && isNaN(total_amount)) {
      return res.status(400).json({ success: false, message: "total_amount must be a valid number" });
    }

    const data = stringifyOrderJson(filterAllowedFields(req.body));

    const keys = Object.keys(data);
    if (keys.length === 0) {
      return res.status(400).json({ success: false, message: "No data provided to update" });
    }

    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const values = [...Object.values(data), id];
    
    db.prepare(`UPDATE orders SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(values);
    
    const updatedOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    res.status(200).json({ success: true, message: "Order updated successfully", data: parseOrderJson(updatedOrder) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteOrder = (req, res) => {
  try {
    const { id } = req.params;
    const exists = db.prepare('SELECT id FROM orders WHERE id = ?').get(id);
    if (!exists) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    db.prepare('DELETE FROM orders WHERE id = ?').run(id);
    res.status(200).json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

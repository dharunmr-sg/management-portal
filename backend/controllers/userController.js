import db from '../database/database.js';

const ALLOWED_FIELDS = [
  'first_name', 'last_name', 'maiden_name', 'age', 'gender', 'email', 'phone', 
  'username', 'birth_date', 'image', 'blood_group', 'height', 'weight', 'eye_color', 
  'hair', 'ip', 'address', 'mac_address', 'university', 'company_name', 
  'company_department', 'company_title', 'company_address', 'company_ein', 
  'user_agent', 'crypto', 'role'
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

const parseUserJson = (user) => {
  if (!user) return user;
  const jsonFields = ['address', 'company_address', 'crypto'];
  jsonFields.forEach(field => {
    if (user[field]) {
      try {
        user[field] = JSON.parse(user[field]);
      } catch (e) {}
    }
  });
  return user;
};

const stringifyUserJson = (data) => {
  const jsonFields = ['address', 'company_address', 'crypto'];
  const result = { ...data };
  jsonFields.forEach(field => {
    if (result[field] !== undefined) {
      result[field] = JSON.stringify(result[field]);
    }
  });
  return result;
};

export const getUsers = (req, res) => {
  try {
    let { 
      page = 1, limit = 10, sortBy = 'id', order = 'desc', 
      search, gender, role 
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    if (isNaN(page) || page < 1) return res.status(400).json({ success: false, message: "page must be a positive integer" });
    if (isNaN(limit) || limit < 1) return res.status(400).json({ success: false, message: "limit must be a positive integer" });
    if (limit > 100) limit = 100;

    const allowedSortFields = ['id', 'first_name', 'last_name', 'age', 'username', 'created_at', 'updated_at'];
    if (!allowedSortFields.includes(sortBy)) return res.status(400).json({ success: false, message: "Invalid sortBy field" });
    
    order = order.toLowerCase();
    if (order !== 'asc' && order !== 'desc') return res.status(400).json({ success: false, message: "order must be asc or desc" });

    let whereClauses = [];
    let params = [];

    if (search) {
      whereClauses.push('(first_name LIKE ? OR last_name LIKE ? OR username LIKE ? OR email LIKE ? OR phone LIKE ?)');
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam, searchParam);
    }
    if (gender) {
      whereClauses.push('gender = ?');
      params.push(gender);
    }
    if (role) {
      whereClauses.push('role = ?');
      params.push(role);
    }

    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    
    const countQuery = `SELECT count(*) as total FROM users ${whereString}`;
    const total = db.prepare(countQuery).get(...params).total;
    
    const totalPages = Math.ceil(total / limit) || 0;
    const offset = (page - 1) * limit;

    const dataQuery = `SELECT * FROM users ${whereString} ORDER BY ${sortBy} ${order.toUpperCase()} LIMIT ? OFFSET ?`;
    const dataParams = [...params, limit, offset];
    
    const users = db.prepare(dataQuery).all(...dataParams);

    res.status(200).json({
      success: true,
      data: users.map(parseUserJson),
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

export const getUserById = (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, data: parseUserJson(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createUser = (req, res) => {
  try {
    const { first_name } = req.body;
    if (!first_name) {
      return res.status(400).json({ success: false, message: "first_name is required" });
    }

    const data = stringifyUserJson(filterAllowedFields(req.body));

    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    
    const stmt = db.prepare(`INSERT INTO users (${keys.join(', ')}) VALUES (${placeholders})`);
    const info = stmt.run(values);

    const newUser = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json({ success: true, message: "User created successfully", data: parseUserJson(newUser) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUser = (req, res) => {
  try {
    const { id } = req.params;
    const exists = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
    if (!exists) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    const { first_name } = req.body;
    if (req.method === 'PUT' && !first_name) {
      return res.status(400).json({ success: false, message: "first_name is required for update" });
    }

    const data = stringifyUserJson(filterAllowedFields(req.body));

    const keys = Object.keys(data);
    if (keys.length === 0) {
      return res.status(400).json({ success: false, message: "No data provided to update" });
    }

    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const values = [...Object.values(data), id];
    
    db.prepare(`UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(values);
    
    const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    res.status(200).json({ success: true, message: "User updated successfully", data: parseUserJson(updatedUser) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUser = (req, res) => {
  try {
    const { id } = req.params;
    const exists = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
    if (!exists) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    db.prepare('DELETE FROM users WHERE id = ?').run(id);
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

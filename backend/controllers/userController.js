import db from '../db.js';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';

export const getUserById = (req, res) => {
  const { id } = req.body;

  if (!id) return res.status(400).json({ message: 'User ID is required' });

  db.query(
    'SELECT id, name, email, password, role, created_at, userimg FROM users WHERE id = ?',
    [id],
    (err, result) => {
      if (err) {
        console.error('Error fetching user:', err);
        return res.status(500).json({ message: 'Failed to get user' });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(result[0]);
    }
  );
};

export const getAllUsers = (req, res) => {
  const query = 'SELECT id, name, email, role, phone, created_at, userimg FROM users ORDER BY created_at DESC';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ message: 'Failed to get users' });
    }

    res.json(results);
  });
};

export const createUser = (req, res) => {
  const { name, email, password, role, phone } = req.body;
  const userimg = req.file ? `/uploads/${req.file.filename}` : null;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }

  const validRole = role === 'admin' ? 'admin' : 'customer';
  const hashedPassword = bcrypt.hashSync(password, 10);

  const query = 'INSERT INTO users (name, email, password, role, phone, userimg) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(query, [name, email, hashedPassword, validRole, phone || null, userimg], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'A user with this email already exists' });
      }
      console.error('Error creating user:', err);
      return res.status(500).json({ message: 'Failed to create user' });
    }
    res.status(201).json({ message: 'User created successfully', id: result.insertId });
  });
};

export const updateUser = (req, res) => {
  const { id } = req.params;
  const { name, email, role, phone, password } = req.body;
  const newUserimg = req.file ? `/uploads/${req.file.filename}` : null;

  const getExisting = 'SELECT * FROM users WHERE id = ?';
  db.query(getExisting, [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'DB error' });
    if (result.length === 0) return res.status(404).json({ message: 'User not found' });

    const existing = result[0];
    const merged = {
      name: name ?? existing.name,
      email: email ?? existing.email,
      role: role === 'admin' || role === 'customer' ? role : existing.role,
      phone: phone ?? existing.phone,
      password: password ? bcrypt.hashSync(password, 10) : existing.password,
      userimg: newUserimg ?? existing.userimg,
    };

    const oldUserimg = existing.userimg;

    const updateQuery = 'UPDATE users SET name = ?, email = ?, role = ?, phone = ?, password = ?, userimg = ? WHERE id = ?';
    db.query(
      updateQuery,
      [merged.name, merged.email, merged.role, merged.phone, merged.password, merged.userimg, id],
      (err) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'A user with this email already exists' });
          }
          console.error('Error updating user:', err);
          return res.status(500).json({ message: 'Failed to update user' });
        }

        if (newUserimg && oldUserimg) {
          const filePath = path.join(path.resolve(), oldUserimg);
          fs.unlink(filePath, (err) => {
            if (err) console.log('Failed to delete old userimg:', err);
          });
        }
        res.json({ message: 'User updated successfully' });
      }
    );
  });
};

export const deleteUserById = (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(400).json({ message: 'User ID is required' });

  // First, delete all products with seller_id = user id
  const deleteProductsQuery = 'DELETE FROM products WHERE seller_id = ?';
  db.query(deleteProductsQuery, [id], (err) => {
    if (err) {
      console.error('Error deleting user products:', err);
      return res.status(500).json({ message: 'Failed to delete user products' });
    }

    // Then delete the user
    const deleteUserQuery = 'DELETE FROM users WHERE id = ?';
    db.query(deleteUserQuery, [id], (err) => {
      if (err) {
        console.error('Error deleting user:', err);
        return res.status(500).json({ message: 'Failed to delete user' });
      }

      return res.json({ message: 'User and associated products deleted successfully' });
    });
  });
};

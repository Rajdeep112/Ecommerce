import db from '../db.js';
import path from 'path';
import fs from 'fs';

export const getAllProducts = (req, res) => {
  const query = 'SELECT * FROM products';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching products:', err);
      return res.status(500).json({ message: 'Failed to get products' });
    }

    res.json(results);
  });
};

export const getProductById = (req, res) => {
  const productId = req.params.id;

  const sql = 'SELECT * FROM products WHERE id = ?';
  db.query(sql, [productId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(result[0]);
  });
};

export const deleteProduct = async (req, res) => {
  const productId = req.params.id;

  try {
    db.query("DELETE FROM `products` WHERE id= ?", [productId], (err, result) => {
    if (err) return res.status(500).json({ message: "Failed in deleteing product" });
    res.json({messgae:"Delete Successfully"});
  });

  } catch (err) {
    res.status(500).json({ message: 'Error deleting product' });
  }
};

const __dirname = path.resolve();

const VALID_STATUSES = ['active', 'sold', 'inactive'];

export const updateProduct = (req, res) => {
  const { id } = req.params;
  const { name, category, price, stock, description, status } = req.body;
  let imagePath = null;

  if (req.file) {
    imagePath = `/products/${req.file.filename}`;
  }

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const getExisting = 'SELECT * FROM products WHERE id = ?';
  db.query(getExisting, [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (result.length === 0) return res.status(404).json({ error: 'Product not found' });

    const existing = result[0];
    const oldImagePath = existing.image;

    const merged = {
      name: name ?? existing.name,
      category: category ?? existing.category,
      price: price ?? existing.price,
      stock: stock ?? existing.stock,
      description: description ?? existing.description,
      status: status ?? existing.status,
      image: imagePath ?? existing.image,
    };

    if (merged.status === 'active' && Number(merged.stock) <= 0) {
      return res.status(400).json({ error: 'Cannot mark as active with 0 stock. Add stock first.' });
    }

    const updateQuery = `
      UPDATE products
      SET name = ?, category = ?, price = ?, stock = ?, description = ?, status = ?, image = ?
      WHERE id = ?
    `;

    const values = [
      merged.name,
      merged.category,
      merged.price,
      merged.stock,
      merged.description,
      merged.status,
      merged.image,
      id,
    ];

    db.query(updateQuery, values, (err) => {
      if (err) return res.status(500).json({ error: 'Update failed' });

      // Delete old image if a new one was uploaded
      if (imagePath && oldImagePath) {
        const filePath = path.join(__dirname, oldImagePath);
        fs.unlink(filePath, (err) => {
          if (err) console.log('Failed to delete old image:', err);
        });
      }

      res.json({ message: 'Product updated successfully' });
    });
  });
};

export const filterProducts = (req, res) => {
  const { category, minPrice, maxPrice, search, page = 1, limit = 10 } = req.query;

  let query = 'SELECT * FROM products WHERE 1=1';
  const values = [];

  if (category) {
    query += ' AND category = ?';
    values.push(category);
  }

  if (minPrice) {
    query += ' AND price >= ?';
    values.push(minPrice);
  }

  if (maxPrice) {
    query += ' AND price <= ?';
    values.push(maxPrice);
  }

  if (search) {
    query += ' AND (name LIKE ? OR category LIKE ? OR description LIKE ?)';
    const likeTerm = `%${search}%`;
    values.push(likeTerm, likeTerm, likeTerm);
  }

  const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) AS total');

  db.query(countQuery, values, (err, countResult) => {
    if (err) {
      console.error('Error counting products:', err);
      return res.status(500).json({ message: 'Failed to filter products' });
    }

    const total = countResult[0].total;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const pagedQuery = query + ' LIMIT ? OFFSET ?';
    const pagedValues = [...values, parseInt(limit), offset];

    db.query(pagedQuery, pagedValues, (err, results) => {
      if (err) {
        console.error('Error filtering products:', err);
        return res.status(500).json({ message: 'Failed to filter products' });
      }

      res.json({ products: results, total, page: parseInt(page), limit: parseInt(limit) });
    });
  });
};
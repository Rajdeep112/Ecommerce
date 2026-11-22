import db from '../db.js';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'products/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

export const uploadProductImg = multer({ storage });

export const addProduct = (req, res) => {
  const { name, description, price, stock, category } = req.body;
  const sellerId = req.user.id;
  const image = req.file ? `/products/${req.file.filename}` : null;

  if (!name || !price || stock === undefined) {
    return res.status(400).json({ message: 'Please provide name, price, and stock.' });
  }

  const query = `INSERT INTO products (name, description, price, stock, category, image, seller_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;

  const values = [name, description, price, stock, category, image, sellerId];

  db.query(query, values, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ message: 'Product added successfully!' });
  });
};

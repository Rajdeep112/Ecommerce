import db from '../db.js';

const getOrCreateCart = (userId, callback) => {
  db.query('SELECT id FROM carts WHERE user_id = ?', [userId], (err, results) => {
    if (err) return callback(err);
    if (results.length > 0) return callback(null, results[0].id);

    db.query('INSERT INTO carts (user_id) VALUES (?)', [userId], (err, result) => {
      if (err) return callback(err);
      callback(null, result.insertId);
    });
  });
};

export const getCart = (req, res) => {
  const userId = req.user.id;

  getOrCreateCart(userId, (err, cartId) => {
    if (err) return res.status(500).json({ message: 'Failed to get cart' });

    const query = `
      SELECT ci.id, ci.product_id, ci.quantity, p.name, p.price, p.image, p.stock
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      WHERE ci.cart_id = ?
    `;

    db.query(query, [cartId], (err, results) => {
      if (err) return res.status(500).json({ message: 'Failed to get cart items' });
      res.json({ cartId, items: results });
    });
  });
};

export const addToCart = (req, res) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;

  if (!productId || !quantity) {
    return res.status(400).json({ message: 'productId and quantity are required' });
  }

  db.query('SELECT status, stock FROM products WHERE id = ?', [productId], (err, productRows) => {
    if (err) return res.status(500).json({ message: 'Failed to check product' });
    if (productRows.length === 0) return res.status(404).json({ message: 'Product not found' });

    const product = productRows[0];
    if (product.status !== 'active' || product.stock <= 0) {
      return res.status(400).json({ message: 'This product is sold out and not available for purchase' });
    }

    getOrCreateCart(userId, (err, cartId) => {
      if (err) return res.status(500).json({ message: 'Failed to get cart' });

      db.query(
        'SELECT quantity FROM cart_items WHERE cart_id = ? AND product_id = ?',
        [cartId, productId],
        (err, existingRows) => {
          if (err) return res.status(500).json({ message: 'Failed to check cart' });

          const existingQty = existingRows.length > 0 ? existingRows[0].quantity : 0;
          if (existingQty + Number(quantity) > product.stock) {
            return res.status(400).json({ message: `Only ${product.stock} in stock` });
          }

          const query = `
            INSERT INTO cart_items (cart_id, product_id, quantity)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
          `;

          db.query(query, [cartId, productId, quantity], (err) => {
            if (err) return res.status(500).json({ message: 'Failed to add to cart' });
            res.json({ message: 'Added to cart' });
          });
        }
      );
    });
  });
};

export const updateCartItem = (req, res) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;

  if (!productId || quantity === undefined) {
    return res.status(400).json({ message: 'productId and quantity are required' });
  }

  getOrCreateCart(userId, (err, cartId) => {
    if (err) return res.status(500).json({ message: 'Failed to get cart' });

    if (quantity <= 0) {
      db.query('DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?', [cartId, productId], (err) => {
        if (err) return res.status(500).json({ message: 'Failed to update cart' });
        res.json({ message: 'Item removed from cart' });
      });
      return;
    }

    db.query('SELECT status, stock FROM products WHERE id = ?', [productId], (err, productRows) => {
      if (err) return res.status(500).json({ message: 'Failed to check product' });
      if (productRows.length === 0) return res.status(404).json({ message: 'Product not found' });

      const product = productRows[0];
      if (product.status !== 'active' || product.stock <= 0) {
        return res.status(400).json({ message: 'This product is sold out and not available for purchase' });
      }
      if (quantity > product.stock) {
        return res.status(400).json({ message: `Only ${product.stock} in stock` });
      }

      db.query(
        'UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?',
        [quantity, cartId, productId],
        (err) => {
          if (err) return res.status(500).json({ message: 'Failed to update cart' });
          res.json({ message: 'Cart updated' });
        }
      );
    });
  });
};

export const removeFromCart = (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;

  getOrCreateCart(userId, (err, cartId) => {
    if (err) return res.status(500).json({ message: 'Failed to get cart' });

    db.query('DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?', [cartId, productId], (err) => {
      if (err) return res.status(500).json({ message: 'Failed to remove item' });
      res.json({ message: 'Item removed from cart' });
    });
  });
};

export const clearCart = (req, res) => {
  const userId = req.user.id;

  getOrCreateCart(userId, (err, cartId) => {
    if (err) return res.status(500).json({ message: 'Failed to get cart' });

    db.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId], (err) => {
      if (err) return res.status(500).json({ message: 'Failed to clear cart' });
      res.json({ message: 'Cart cleared' });
    });
  });
};

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

export const checkout = (req, res) => {
  const userId = req.user.id;
  const {
    addressId,
    fullName: fullNameCamel,
    full_name: fullNameSnake,
    phone,
    line1,
    line2,
    city,
    state,
    pincode,
    paymentMethod,
  } = req.body;
  const fullName = fullNameCamel || fullNameSnake;

  getOrCreateCart(userId, (err, cartId) => {
    if (err) return res.status(500).json({ message: 'Failed to resolve cart' });

    const cartItemsQuery = `
      SELECT ci.product_id, ci.quantity, p.name, p.price, p.stock, p.seller_id
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      WHERE ci.cart_id = ?
    `;

    db.query(cartItemsQuery, [cartId], (err, items) => {
      if (err) return res.status(500).json({ message: 'Failed to read cart items' });
      if (!items || items.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
      }

      for (const item of items) {
        if (item.quantity > item.stock) {
          return res.status(400).json({
            message: `Insufficient stock for ${item.name}. Available: ${item.stock}`,
          });
        }
      }

      const totalAmount = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

      const resolveAddress = (cb) => {
        if (addressId) return cb(null, addressId);
        if (fullName && phone && line1 && city && state && pincode) {
          const insertAddr = `
            INSERT INTO addresses (user_id, full_name, phone, line1, line2, city, state, pincode)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `;
          db.query(
            insertAddr,
            [userId, fullName, phone, line1, line2 || null, city, state, pincode],
            (err, result) => {
              if (err) return cb(err);
              cb(null, result.insertId);
            }
          );
          return;
        }
        cb(null, null);
      };

      resolveAddress((err, resolvedAddressId) => {
        if (err) return res.status(500).json({ message: 'Failed to save address' });

        const insertOrder = `
          INSERT INTO orders (user_id, address_id, total_amount, payment_method)
          VALUES (?, ?, ?, ?)
        `;

        db.query(
          insertOrder,
          [userId, resolvedAddressId, totalAmount, paymentMethod === 'online' ? 'online' : 'cod'],
          (err, orderResult) => {
            if (err) return res.status(500).json({ message: 'Failed to create order' });

            const orderId = orderResult.insertId;

            const insertItemsQuery = `
              INSERT INTO order_items (order_id, product_id, product_name, price, quantity, seller_id)
              VALUES ?
            `;
            const itemsValues = items.map((item) => [
              orderId,
              item.product_id,
              item.name,
              item.price,
              item.quantity,
              item.seller_id,
            ]);

            db.query(insertItemsQuery, [itemsValues], (err) => {
              if (err) return res.status(500).json({ message: 'Failed to create order items' });

              let remaining = items.length;
              let stockErr = null;

              items.forEach((item) => {
                const newStock = item.stock - item.quantity;
                const newStatus = newStock <= 0 ? 'sold' : 'active';

                db.query(
                  'UPDATE products SET stock = ?, status = ? WHERE id = ?',
                  [newStock, newStatus, item.product_id],
                  (err) => {
                    if (err) stockErr = err;
                    remaining -= 1;
                    if (remaining === 0) {
                      if (stockErr) {
                        return res.status(500).json({ message: 'Failed to update product stock' });
                      }

                      db.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId], (err) => {
                        if (err) return res.status(500).json({ message: 'Failed to clear cart' });

                        db.query('SELECT * FROM orders WHERE id = ?', [orderId], (err, orderRows) => {
                          if (err) return res.status(500).json({ message: 'Order created but failed to fetch it' });

                          db.query(
                            'SELECT * FROM order_items WHERE order_id = ?',
                            [orderId],
                            (err, orderItemsRows) => {
                              if (err) return res.status(500).json({ message: 'Order created but failed to fetch items' });

                              res.status(201).json({
                                message: 'Order placed successfully',
                                order: orderRows[0],
                                items: orderItemsRows,
                              });
                            }
                          );
                        });
                      });
                    }
                  }
                );
              });
            });
          }
        );
      });
    });
  });
};

export const getMyOrders = (req, res) => {
  const userId = req.user.id;

  db.query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, orders) => {
    if (err) return res.status(500).json({ message: 'Failed to fetch orders' });

    if (orders.length === 0) return res.json([]);

    const orderIds = orders.map((o) => o.id);
    db.query('SELECT * FROM order_items WHERE order_id IN (?)', [orderIds], (err, allItems) => {
      if (err) return res.status(500).json({ message: 'Failed to fetch order items' });

      const result = orders.map((order) => ({
        ...order,
        items: allItems.filter((item) => item.order_id === order.id),
      }));

      res.json(result);
    });
  });
};

export const getOrderById = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const isAdmin = req.user.role === 'admin';

  db.query('SELECT * FROM orders WHERE id = ?', [id], (err, orders) => {
    if (err) return res.status(500).json({ message: 'Failed to fetch order' });
    if (orders.length === 0) return res.status(404).json({ message: 'Order not found' });

    const order = orders[0];
    if (!isAdmin && order.user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    db.query('SELECT * FROM order_items WHERE order_id = ?', [id], (err, items) => {
      if (err) return res.status(500).json({ message: 'Failed to fetch order items' });
      res.json({ ...order, items });
    });
  });
};

export const getAllOrders = (req, res) => {
  const query = `
    SELECT o.*, u.name AS customer_name, u.email AS customer_email,
           a.full_name, a.phone, a.line1, a.line2, a.city, a.state, a.pincode
    FROM orders o
    JOIN users u ON u.id = o.user_id
    LEFT JOIN addresses a ON a.id = o.address_id
    ORDER BY o.created_at DESC
  `;

  db.query(query, (err, orders) => {
    if (err) return res.status(500).json({ message: 'Failed to fetch orders' });
    if (orders.length === 0) return res.json([]);

    const orderIds = orders.map((o) => o.id);
    db.query('SELECT * FROM order_items WHERE order_id IN (?)', [orderIds], (err, allItems) => {
      if (err) return res.status(500).json({ message: 'Failed to fetch order items' });

      const result = orders.map((order) => ({
        ...order,
        items: allItems.filter((item) => item.order_id === order.id),
      }));

      res.json(result);
    });
  });
};

export const updateOrderStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  db.query('SELECT * FROM orders WHERE id = ?', [id], (err, orderRows) => {
    if (err) return res.status(500).json({ message: 'Failed to fetch order' });
    if (orderRows.length === 0) return res.status(404).json({ message: 'Order not found' });

    const order = orderRows[0];
    const isNewlyCancelled = status === 'cancelled' && order.status !== 'cancelled';

    db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id], (err, result) => {
      if (err) return res.status(500).json({ message: 'Failed to update order status' });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Order not found' });

      if (!isNewlyCancelled) {
        return res.json({ message: 'Order status updated' });
      }

      // Restore stock for each item when an order is cancelled
      db.query('SELECT * FROM order_items WHERE order_id = ?', [id], (err, items) => {
        if (err) return res.json({ message: 'Order status updated, but failed to restore stock' });
        if (items.length === 0) return res.json({ message: 'Order status updated' });

        let remaining = items.length;
        items.forEach((item) => {
          if (!item.product_id) {
            remaining -= 1;
            if (remaining === 0) res.json({ message: 'Order status updated' });
            return;
          }

          db.query(
            'UPDATE products SET stock = stock + ?, status = IF(status = "sold", "active", status) WHERE id = ?',
            [item.quantity, item.product_id],
            () => {
              remaining -= 1;
              if (remaining === 0) res.json({ message: 'Order status updated' });
            }
          );
        });
      });
    });
  });
};

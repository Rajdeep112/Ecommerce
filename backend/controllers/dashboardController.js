import db from '../db.js';

export const getStats = (req, res) => {
  const stats = {};

  db.query("SELECT COUNT(*) AS count FROM users WHERE role = 'customer'", (err, userResult) => {
    if (err) return res.status(500).json({ message: 'Failed to fetch user stats' });
    stats.totalUsers = userResult[0].count;

    db.query('SELECT COUNT(*) AS count FROM products', (err, productResult) => {
      if (err) return res.status(500).json({ message: 'Failed to fetch product stats' });
      stats.totalProducts = productResult[0].count;

      db.query('SELECT COUNT(*) AS count FROM orders', (err, orderResult) => {
        if (err) return res.status(500).json({ message: 'Failed to fetch order stats' });
        stats.totalOrders = orderResult[0].count;

        db.query(
          "SELECT COALESCE(SUM(total_amount), 0) AS revenue FROM orders WHERE status != 'cancelled'",
          (err, revenueResult) => {
            if (err) return res.status(500).json({ message: 'Failed to fetch revenue stats' });
            stats.totalRevenue = revenueResult[0].revenue;

            db.query(
              'SELECT status, COUNT(*) AS count FROM orders GROUP BY status',
              (err, statusResult) => {
                if (err) return res.status(500).json({ message: 'Failed to fetch order status stats' });
                stats.ordersByStatus = statusResult;

                const dailySeriesQuery = `
                  SELECT DATE(created_at) AS date, COUNT(*) AS orders, COALESCE(SUM(total_amount), 0) AS revenue
                  FROM orders
                  WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                  GROUP BY DATE(created_at)
                  ORDER BY date ASC
                `;

                db.query(dailySeriesQuery, (err, seriesResult) => {
                  if (err) return res.status(500).json({ message: 'Failed to fetch daily series' });
                  stats.dailySeries = seriesResult;

                  res.json(stats);
                });
              }
            );
          }
        );
      });
    });
  });
};

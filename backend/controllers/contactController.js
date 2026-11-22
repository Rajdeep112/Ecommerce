import db from '../db.js';

export const createMessage = (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email and message are required' });
  }

  const query = 'INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)';
  db.query(query, [name, email, subject || null, message], (err) => {
    if (err) {
      console.error('Error saving contact message:', err);
      return res.status(500).json({ message: 'Failed to send message' });
    }
    res.status(201).json({ message: 'Message sent successfully' });
  });
};

export const getAllMessages = (req, res) => {
  db.query('SELECT * FROM contact_messages ORDER BY created_at DESC', (err, results) => {
    if (err) {
      console.error('Error fetching contact messages:', err);
      return res.status(500).json({ message: 'Failed to fetch messages' });
    }
    res.json(results);
  });
};

export const markAsRead = (req, res) => {
  const { id } = req.params;
  db.query('UPDATE contact_messages SET is_read = 1 WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Failed to update message' });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Message not found' });
    res.json({ message: 'Marked as read' });
  });
};

export const deleteMessage = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM contact_messages WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Failed to delete message' });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Message not found' });
    res.json({ message: 'Message deleted' });
  });
};

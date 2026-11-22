import nodemailer from "nodemailer";
import db from "../db.js";
import bcrypt from "bcryptjs";

const verificationCodes = {};

export const sendcode = (req, res) => {
  const { email } = req.body;
  const code = Math.floor(100000 + Math.random() * 900000);

  const query = "SELECT * FROM users WHERE email = ?";
  db.query(query, [email], (err, result) => {
    if (err || result.length === 0) {
      return res.status(404).json({ message: "Email not registered." });
    }

    verificationCodes[email] = code;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Code",
      text: `Your verification code is: ${code}`,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) return res.status(500).json({ message: "Email failed to send" });
      res.json({ message: "Verification code sent to email" });
    });
  });
};

export const resetpassword = (req, res) => {
  const { email, code, newPassword } = req.body;

  if (verificationCodes[email] != code) {
    return res.status(400).json({ message: "Invalid verification code" });
  }

  const hashedPassword = bcrypt.hashSync(newPassword, 10);

  const updateQuery = "UPDATE users SET password = ? WHERE email = ?";
  db.query(updateQuery, [hashedPassword, email], (err) => {
    if (err) return res.status(500).json({ message: "Failed to reset password" });

    delete verificationCodes[email];
    res.json({ message: "Password reset successfully" });
  });
};

import { RequestHandler } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query } from '../config/database.config.js';
import { DbUser } from '../types/database.types.js';
import { EmailService } from '../services/email.service.js';

export const register: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      res.status(400).json({ error: 'Email, password and username are required' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await query<DbUser>(
      'INSERT INTO users (email, password_hash, username) VALUES ($1, $2, $3) RETURNING *',
      [email, hashedPassword, username]
    );

    const user = result.rows[0];
    const userForToken = {
      id: user.id,
      email: user.email,
      username: user.username
    };

    const token = jwt.sign(userForToken, process.env.JWT_SECRET!);

    res.status(201).json({ token });
  } catch (error) {
    next(error);
  }
};

export const login: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const { email, password } = req.body;

    const result = await query<DbUser>(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    const user = result.rows[0];

    if (!user || !await bcrypt.compare(password, user.password_hash)) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const userForToken = {
      id: user.id,
      email: user.email,
      username: user.username
    };

    const token = jwt.sign(userForToken, process.env.JWT_SECRET!);

    res.json({ token });
  } catch (error) {
    next(error);
  }
};

export const requestPasswordReset: RequestHandler = async (req, res, next): Promise<void> => {
  try {
      const { email } = req.body;

      // Debug log
      console.log('Password reset requested for:', email);

      const result = await query<DbUser>(
          'SELECT * FROM users WHERE email = $1',
          [email]
      );

      if (result.rows.length === 0) {
          console.log('No user found with email:', email);
          res.json({ message: 'If an account exists with this email, you will receive a password reset link.' });
          return;
      }

      const user = result.rows[0];
      
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenHash = await bcrypt.hash(resetToken, 10);

      // Debug log
      console.log('Generated reset token for user:', user.id);

      try {
          // Store reset token and expiry
          await query(
              'UPDATE users SET reset_token_hash = $1, reset_token_expires = NOW() + INTERVAL \'1 hour\' WHERE id = $2',
              [resetTokenHash, user.id]
          );

          // Debug log
          console.log('Stored reset token for user:', user.id);

          // Send reset email
          const emailService = EmailService.getInstance();
          await emailService.sendPasswordResetEmail(email, resetToken);
          
          console.log('Successfully sent reset email to:', email);
          
          res.json({ message: 'If an account exists with this email, you will receive a password reset link.' });
      } catch (error) {
          console.error('Detailed error:', error);
          throw error;
      }
  } catch (error) {
      console.error('Password reset error:', error);
      next(error);
  }
};

export const resetPassword: RequestHandler = async (req, res, next): Promise<void> => {
  try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
          res.status(400).json({ error: 'Token and new password are required' });
          return;
      }

      const result = await query<DbUser>(
          'SELECT * FROM users WHERE reset_token_expires > NOW()',
          []
      );

      const user = result.rows[0];
      if (!user) {
          res.status(400).json({ error: 'Invalid or expired reset token' });
          return;
      }

      if (!user.reset_token_hash) {
          res.status(400).json({ error: 'Invalid or expired reset token' });
          return;
      }
      const isValidToken = await bcrypt.compare(token, user.reset_token_hash);
      if (!isValidToken) {
          res.status(400).json({ error: 'Invalid or expired reset token' });
          return;
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await query(
          'UPDATE users SET password_hash = $1, reset_token_hash = NULL, reset_token_expires = NULL WHERE id = $2',
          [hashedPassword, user.id]
      );

      res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
      next(error);
  }
};

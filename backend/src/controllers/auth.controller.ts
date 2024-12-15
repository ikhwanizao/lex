import { RequestHandler } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.config.js';
import { DbUser } from '../types/database.types.js';

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
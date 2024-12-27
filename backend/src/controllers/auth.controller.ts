import { RequestHandler } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';
import { EmailService } from '../services/email.service.js';

export const register: RequestHandler = async (req, res, next): Promise<void> => {
    try {
        const { email, password, username } = req.body;

        if (!email || !password || !username) {
            res.status(400).json({ error: 'Email, password and username are required' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.users.create({
            data: {
                email,
                username,
                password_hash: hashedPassword,
            },
        });

        const userForToken = {
            id: user.id,
            email: user.email,
            username: user.username
        };

        const token = jwt.sign(userForToken, process.env.JWT_SECRET!);

        res.status(201).json({ token });
    } catch (error) {
        if ((error as any).code === 'P2002') {
            res.status(400).json({ error: 'Email already exists' });
            return;
        }
        next(error);
    }
};

export const login: RequestHandler = async (req, res, next): Promise<void> => {
    try {
        const { email, password } = req.body;

        const user = await prisma.users.findUnique({
            where: { email }
        });

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

        const user = await prisma.users.findUnique({
            where: { email }
        });

        if (!user) {
            // For security reasons, we send the same response whether the user exists or not
            res.json({ message: 'If an account exists with this email, you will receive a password reset link.' });
            return;
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = await bcrypt.hash(resetToken, 10);

        await prisma.users.update({
            where: { id: user.id },
            data: {
                reset_token_hash: resetTokenHash,
                reset_token_expires: new Date(Date.now() + 3600000) // 1 hour from now
            }
        });

        const emailService = EmailService.getInstance();
        await emailService.sendPasswordResetEmail(email, resetToken);

        res.json({ message: 'If an account exists with this email, you will receive a password reset link.' });
    } catch (error) {
        next(error);
    }
};

export const resetPassword: RequestHandler = async (req, res, next): Promise<void> => {
    try {
        const { token, newPassword } = req.body;

        const user = await prisma.users.findFirst({
            where: {
                reset_token_expires: {
                    gt: new Date()
                }
            }
        });

        if (!user || !user.reset_token_hash) {
            res.status(400).json({ error: 'Invalid or expired reset token' });
            return;
        }

        const isValidToken = await bcrypt.compare(token, user.reset_token_hash);
        if (!isValidToken) {
            res.status(400).json({ error: 'Invalid or expired reset token' });
            return;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.users.update({
            where: { id: user.id },
            data: {
                password_hash: hashedPassword,
                reset_token_hash: null,
                reset_token_expires: null
            }
        });

        res.json({ message: 'Password has been reset successfully' });
    } catch (error) {
        next(error);
    }
};
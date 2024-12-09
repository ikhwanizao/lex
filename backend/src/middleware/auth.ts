import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface JwtPayload {
    id: number;
    email: string;
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ error: 'Missing token' });
        return;
    }

    jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
        if (err) {
            res.status(403).json({ error: 'Invalid token' });
            return;
        }
        req.user = decoded as JwtPayload;
        next();
    });
};
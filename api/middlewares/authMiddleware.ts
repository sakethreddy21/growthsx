import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        res.status(401).json({ error: 'Access denied. No token provided.' });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        req.body.user = decoded;
        next(); // Pass control to the next middleware or route handler
    } catch (err) {
        res.status(400).json({ error: 'Invalid token.' });
    }
};


export const roleMiddleware = (roles: Array<string>) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const user = req.body.user;

        if (!user || !roles.includes(user.role)) {
            res.status(403).json({ error: 'Access denied.'});
            return;
        }

        next(); // Pass control to the next middleware or route handler
    };
};

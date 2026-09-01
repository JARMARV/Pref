import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";

// Middleware to verify JWT token and extract user data
export const verifyToken = (req, res, next) => {
    try {
        const token = req.cookies.token;
        
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        
        if (!decoded) {
            return res.status(401).json({ message: "Invalid token" });
        }

        // Attach decoded token data to request object
        req.user = {
            userId: decoded.userId,
            userName: decoded.userName,
            authorizationLevel: decoded.authorizationLevel,
            organizationID: decoded.organizationID
        };

        // Validate required fields
        if (!req.user.userId || req.user.authorizationLevel === undefined || !req.user.organizationID) {
            return res.status(400).json({ message: "Invalid token data" });
        }

        next();
    } catch (error) {
        return res.status(401).json({ message: "Token verification failed" });
    }
};

// Middleware to verify token AND require admin authorization (level 2)
export const requireAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.authorizationLevel !== 2) {
            return res.status(403).json({ message: "Authorization failed. Admin access required" });
        }
        next();
    });
};

// Middleware to verify token AND require temp user authorization (level 0)
export const requireTempUser = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.authorizationLevel !== 0) {
            return res.status(403).json({ message: "Authorization failed" });
        }
        next();
    });
};

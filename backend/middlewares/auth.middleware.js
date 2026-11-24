import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";
import pool from "../postgre_database/database.js";
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

//Middleware to verify token AND require superUser authorization (level 3)
export const requireSuperUser = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.authorizationLevel !== 3) {
            console.log("Authorization failed. Admin access required");
            return res.status(403).json({ message: "Authorization failed. Admin access required" });
        }
        next();
    });
};

// Middleware to verify token AND require admin authorization (level 2)
export const requireAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.authorizationLevel < 2) {
            console.log("Authorization failed. Admin access required");
            return res.status(403).json({ message: "Authorization failed. Admin access required" });
        }
        next();
    });
};

// Middleware to verify token AND require user authorization (level 1)
export const requireUser = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.authorizationLevel !== 1) {
            console.log("Authorization failed. Admin access required");
            return res.status(403).json({ message: "Authorization failed. Admin access required" });
        }
        next();
    });
};

// Middleware to verify token AND require temp user authorization (level 0)
export const requireTempUser = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.authorizationLevel > 0) {
            console.log("Authorization failed. Temp user access required");
            return res.status(403).json({ message: "Authorization failed" });
        }
        next();
    });
};

export const requireOwnEvent = async (req, res, next) => {
    const eventID = req.params.eventID;
    const organizationID = req.user?.organizationID;

    if (!eventID || !organizationID) {
        return res.status(400).json({ message: "Missing event or organization" });
    }

    try {
        const result = await pool.query(
            `SELECT 1 FROM events
             WHERE event_id = $1 AND organization_id = $2`,
            [eventID, organizationID]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Event not found" });
        }

        next();
    } catch (error) {
        next(error);
    }
};

export const requireUserInEvent = async (req, res, next) => {
    const eventID = req.params.eventID;
    const userID = req.user?.userId;

    if (!eventID || !userID) {
        return res.status(400).json({ message: "Missing event or organization" });
    }

    try {
        const result = await pool.query(
            `SELECT 1 FROM users_in_events
             WHERE event_id = $1 AND user_id = $2`,
            [eventID, userID]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "User is not assigned to this event" });
        }

        next();
    } catch (error) {
        next(error);
    }
}

export const requireSlotInEvent = async (req, res, next) => {
    const eventID = req.params.eventID;
    const slotID = req.params.slotID;

    if (!eventID || !slotID) {
        return res.status(400).json({ message: "Missing event or slot" });
    }

    try {
        const result = await pool.query(
            `SELECT 1 FROM slots
             WHERE event_id = $1 AND slot_id = $2`,
            [eventID, slotID]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Slot not found" });
        }

        next();
    } catch (error) {
        next(error);
    }
}

export const requireModuleInSlot = async (req, res, next) => {
    const slotID = req.params.slotID;
    const moduleID = req.params.moduleID;

    if (!slotID || !moduleID) {
        return res.status(400).json({ message: "Missing slot or module" });
    }

    try {
        const result = await pool.query(
            `SELECT 1 FROM modules
             WHERE slot_id = $1 AND module_id = $2`,
            [slotID, moduleID]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Module not found" });
        }

        next();
    } catch (error) {
        next(error);
    }
}
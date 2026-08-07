import pool from "../postgre_database/database.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/env.js";
import cookieParser from "cookie-parser";

export const getAllUsers = async (req, res) => {
    const client = await pool.connect();
    try{

        const users = await client.query("SELECT * FROM users");
        res.json(users.rows);

    }catch(error){
        console.error(error);
        res.status(500).send('Database error');
    }finally{
        client.release();
    }
}

export const newTempUser = async (req, res) => {
    const client = await pool.connect();

    try {
        let userName;
        while (true) {
            userName = generateRandomString(8);
            const password = generateRandomString(12);
            const organizationName = "test_organization";
            const authorizationLevel = 0;

            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);

            try {
                await client.query(
                    `
                    INSERT INTO temp_users 
                    (name, password_hash, organization_name, authorization_level)
                    VALUES ($1, $2, $3, $4);
                    `,
                    [
                        userName,
                        passwordHash,
                        organizationName,
                        authorizationLevel
                    ]
                );
                //const token = jwt.sign({userName},JWT_SECRET,{ expiresIn: JWT_EXPIRES_IN });
                res.status(201).json({
                    success: true,
                    message: "Temporary user created successfully",
                });
                console.log(userName,password,organizationName);
                break;

            } catch (error) {
                if (error.code === "23505") {
                    res.status(400).json({ message: "Username collision, trying another one" });
                    continue;
                }

                throw error;
            }
        }

    } catch(error) {
        console.error(error);
        res.status(500).send("Database error");

    } finally {
        client.release();
    }
};
    
export const newUser = async (req, res) => {
    const client = await pool.connect();
    // check for valid token in the request cookies
    let transactionStarted = false;
    try{
        const reqtoken = req.cookies.token;
        if (!reqtoken) {
            return res.status(401).json({ message: "No token provided" });
        };
        const decoded = jwt.verify(reqtoken, JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({ message: "Invalid token" });
        };
        const userID = decoded.userId;
        const authorizationLevel = decoded.authorizationLevel;
        const organization = decoded.organization;
        if (userID === undefined || authorizationLevel === undefined || organization === undefined) {
            return res.status(400).json({ message: "Invalid token data" });
        };
        if (authorizationLevel !== 0){
            return res.status(403).json({message: "Authorization failed"});
        };

        const newUserName = req.body.name;
        const newUserPassword = req.body.password;

        if(!newUserName || !newUserPassword){
            return res.status(400).json({message: "Missing username or password"});
        };

        const salt = await bcrypt.genSalt(10);
        const newHashedPassword = await bcrypt.hash(newUserPassword, salt);
        const existing = await client.query(`SELECT 1 FROM users WHERE name = $1 AND organization_name = $2`,
            [newUserName, organization]
        );

        if (existing.rows.length > 0) {
            return res.status(409).json({
                message: "Username already exists"
            });
        };
        await client.query("BEGIN");
        transactionStarted = true;
        const result = await client.query(`DELETE FROM temp_users WHERE user_id = $1`,[userID]);
        const newAuthLevel = 1;
        if (result.rowCount !== 1) {
            throw new Error("Temporary user not found");
        };
        await client.query(`INSERT INTO users (user_id, name, password_hash, organization_name, authorization_level ) 
            VALUES($1,$2,$3,$4,$5)`,
            [userID,newUserName,newHashedPassword,organization,newAuthLevel]
        );
        await client.query("COMMIT");
        transactionStarted = false;
        const token = jwt.sign({
            userName: newUserName,
            userId: userID,
            authorizationLevel: newAuthLevel,
            organization: organization},
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );
        res.cookie("token",token,{
            httpOnly: true, 
            secure: false, // Set to true in production
            sameSite: "lax", // Set to "strict" in production
            maxAge: 1000 * 60 * 60 * 24
        });
        return res.status(200).json({
            message: "User successfully created and signed in",
            success: true,   
            userAuth: newAuthLevel
        });
    }catch(error){
        if (transactionStarted) {
            await client.query("ROLLBACK");
        }
        if (error.code === "23505") {
            return res.status(409).json({
                message: "Username already exists"
            });
        }
        console.error(error);
        return res.status(500).send('Database error');
    }finally{
        client.release();
    }
}

function generateRandomString(length) {
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";

    for (let i = 0; i < length; i++) {
        password += chars[Math.floor(Math.random() * chars.length)];
    }

    return password;
}
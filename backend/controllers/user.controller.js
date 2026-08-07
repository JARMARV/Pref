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
    try{
       const token = req.cookies.token;
       if (!token) {
        return res.status(401).json({ message: "No token provided" });
       };
       const decoded = jwt.verify(token, JWT_SECRET);
       if (!decoded) {
        return res.status(401).json({ message: "Invalid token" });
       };
       const userID = decoded.userId;
       const authorizationLevel = decoded.authorizationLevel;
       const organization = decoded.organization;
       if (userID === undefined || authorizationLevel === undefined || organization === undefined) {
        return res.status(400).json({ message: "Invalid token data" });
       };
       if (authorizationLevel = 1){
        return res.status(403).json({message: "Authorization failed"});
       };
       if (authorizationLevel = 0){
        const newUserName = req.name;
        const newUserPassword = req.password;

        const salt = await bcrypt.genSalt(10);
        const newHashedPassword = await bcrypt.hash(newUserPassword, salt);

        await client.query(`DELETE FROM temp_users WHERE user_id = $1`,[userID]);

       };




       return res.status(200).json({ message: "Token is valid", userID, authorizationLevel, organization });
    }catch(error){
       // await client.query("ROLLBACK");
        console.error(error);
        res.status(500).send('Database error');
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
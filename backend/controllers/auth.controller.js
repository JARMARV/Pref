import pool from "../postgre_database/database.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/env.js";
import cookieParser from "cookie-parser";

//sign in request handler
export const signIn=async (req,res) => {
    const client = await pool.connect();
    try{
        const name = req.body.name;
        const password = req.body.password;
        const organizationName = req.body.organizationName;

        const organization = await client.query(
            `
            SELECT organization_id
            FROM organizations
            WHERE organization_name = $1
            `,
            [organizationName]
        );
        if (organization.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Organization not found"
            });
        }
        const organizationID = organization.rows[0].organization_id;

        let users = await client.query("SELECT * FROM users WHERE name=$1 AND organization_id=$2",
        [name,organizationID]);
        //if there are no matching users in the users table check in temp_users
        if (users.rows.length === 0) {
            
            const temp_users = await client.query("SELECT * FROM temp_users WHERE name=$1 AND organization_id=$2",
            [name,organizationID]);
            
            if (temp_users.rows.length === 0) {
                return res.status(404).json({ message: "User not found" });

            }else if (users.rows.length > 1) {
             return res.status(400).json({ message: "Multiple users found with the same credentials" });

            }else if (temp_users.rows.length === 1) {
                const user = temp_users.rows[0];
                const passwordMatches = await bcrypt.compare(password, user.password_hash)
                if (passwordMatches){
                    const token = jwt.sign({
                        userName: name,
                        userId: user.user_id,
                        authorizationLevel: user.authorization_level,
                        organizationID: user.organization_id},
                        JWT_SECRET,
                        { expiresIn: JWT_EXPIRES_IN }
                    );
                    res.cookie("token",token,{
                        httpOnly: true, 
                        path: "/",
                        secure: false, // Set to true in production
                        sameSite: "lax", // Set to "strict" in production
                        maxAge: 1000 * 60 * 60 * 24
                    });
                    return res.status(200).json({
                        message: "Temporary user signed in successfully",
                        success: true,   
                        userAuth: 0
                    });
                }else{
                    return res.status(400).json({ message: "User not found" });
                }
            }
            
        //spit out error if there are multiple matching users which should theoretically not be possible 
        } else if (users.rows.length > 1) {
            return res.status(400).json({ message: "Multiple users found with the same credentials" });
        //if the user is found sign them in and give them a token cookie
        }else if (users.rows.length === 1) {
            const user = users.rows[0];
            const passwordMatches = await bcrypt.compare(password, user.password_hash)

            if (passwordMatches){
                const token = jwt.sign({
                    userName: name,
                    userId:user.user_id,
                    authorizationLevel: user.authorization_level,
                    organizationID: user.organization_id},
                    JWT_SECRET,
                    { expiresIn: JWT_EXPIRES_IN }
                );
                res.cookie("token",token,{
                    httpOnly: true,
                    path: "/",
                    secure: false, // Set to true in production
                    sameSite: "lax", // Set to "strict" in production
                    maxAge: 1000 * 60 * 60 * 24
                });
                return res.status(200).json({
                    success: true,
                    message: "User signed in successfully",
                    userAuth: user.authorization_level
                });
            }else{
                return res.status(400).json({ message: "User not found" });
            }
        }
        console.log(res.statusCode);  
    //end the fetch
    }catch(error){
        throw error;
    }finally{
        client.release();
    }   
}

export const signOut=async (req,res) => {
    res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    path: "/",
    sameSite: "lax"
    });
    console.log(req.header.cookies)
    return res.status(200).json({
        success: true,
        message: "Successfully signed out"
    });
}
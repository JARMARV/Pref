import pool from "../postgre_database/database.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/env.js";

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
        // User data is already validated and attached by middleware
        const organizationID = req.user.organizationID;
        
        let userName;
        while (true) {
            userName = generateRandomString(8);
            const password = generateRandomString(12);
            const newAuthorizationLevel = 0;
            if(!organizationID){
                return res.status(400).json({success:false , message:"no organization id"})
            };
            try {
                await client.query("BEGIN");
                const result = await client.query(
                    `
                    INSERT INTO temp_users 
                    (name, password_hash, organization_id, authorization_level)
                    VALUES ($1, $2, $3, $4)
                    RETURNING user_id;
                    `,
                    [
                        userName,
                        password,
                        organizationID,
                        newAuthorizationLevel
                    ]
                );
                const userID = result.rows[0].user_id;
                const eventID = req.params.eventID;
                await client.query(
                    `
                    INSERT INTO users_in_events (user_id, event_id)
                    VALUES($1, $2);
                    `,
                    [
                        userID,
                        eventID
                    ]
                )

                await client.query("COMMIT");
                res.status(201).json({
                    success: true,
                    message: "Temporary user created successfully",
                    userName: userName,
                    password: password
                });
                break;

            } catch (error) {
                await client.query("ROLLBACK");
                if (error.code === "23505") {
                    continue;
                }
                throw error;
            }
        }

    } catch(error) {
        console.error(error);
        return res.status(500).json({message:"Database error"});

    } finally {
        client.release();
    }
};
    
export const newUser = async (req, res) => {
    const client = await pool.connect();
    // check for valid token in the request cookies
    let transactionStarted = false;
    try{
        // User data is already validated and attached by middleware
        const userID = req.user.userId;
        const organizationID = req.user.organizationID;

        const newUserName = req.body.name;
        const newUserPassword = req.body.password;

        if(!newUserName || !newUserPassword){
            return res.status(400).json({message: "Missing username or password"});
        };

        const salt = await bcrypt.genSalt(10);
        const newHashedPassword = await bcrypt.hash(newUserPassword, salt);
        const existing = await client.query(`SELECT * FROM users WHERE name = $1 AND organization_id = $2`,
            [newUserName, organizationID]
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
        await client.query(`INSERT INTO users (user_id, name, password_hash, organization_id, authorization_level ) 
            VALUES($1,$2,$3,$4,$5)`,
            [userID,newUserName,newHashedPassword,organizationID,newAuthLevel]
        );
        await client.query("COMMIT");
        transactionStarted = false;
        const token = jwt.sign({
            userName: newUserName,
            userId: userID,
            authorizationLevel: newAuthLevel,
            organizationID: organizationID},
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
            message: "User successfully created and signed in",
            success: true,   
            userAuth: newAuthLevel
        });
    }catch(error){
        if (transactionStarted) {
            await client.query("ROLLBACK");
            return;
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

//returns all users in a specified event to the client
export const getEventUsers = async (req,res) => {
    const client = await pool.connect();
    try {
        //getting the user data
        const eventID = req.params.eventID
        const response = await client.query(`SELECT * FROM users_in_events WHERE event_id = $1 `,[eventID])

        let users = [];
        let tempUsers = [];
        for (const row of response.rows) {
            const userResponse = await client.query(`SELECT * FROM users WHERE user_id = $1`,[row.user_id])
            if (userResponse.rows[0] !== undefined) {
                users.push(userResponse.rows[0]);
                continue;    
            }
            const tempUserResponse = await client.query(`SELECT * FROM temp_users WHERE user_id = $1`,[row.user_id])
            if (tempUserResponse.rows[0] !== undefined) {
                tempUsers.push(tempUserResponse.rows[0]);
                continue;
            }
            console.warn(`User with ID ${row.user_id} not found in either users or temp_users table`);
        }
        //making sure the password hash isnt sent to the client
        for ( const user of users){
            delete user.password_hash;
            delete user.authorization_level;
            delete user.organization_id;
        }
        for ( const user of tempUsers){
            delete user.authorization_level;
            delete user.organization_id;
        }
        //returning temp users and normal users
        return res.status(200).json({users:users, tempUsers: tempUsers});


    } catch(error) {
        console.error(error);
        return res.status(500).json({message:"Database error"});

    } finally {
        client.release();
    }
}

//generates a random string of specified length with the characters in "chars"
function generateRandomString(length) {
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";

    for (let i = 0; i < length; i++) {
        password += chars[Math.floor(Math.random() * chars.length)];
    }

    return password;
}
/*
Username:FcSx8iYe
Password:Lo3XbE3tUMeL
organization:please_set_organization_name
*/
import pool from "../postgre_database/database.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN ,TEMP_USER_DELETION_INTERVAL} from "../config/env.js";

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
                    INSERT INTO users
                    (name, password_hash, organization_id, authorization_level, expires_at)
                    VALUES ($1, $2, $3, $4, NOW() + $5::interval)
                    RETURNING user_id;
                    `,
                    [
                        userName,
                        password,
                        organizationID,
                        newAuthorizationLevel,
                        TEMP_USER_DELETION_INTERVAL
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
        const newAuthLevel = 1;
        const result = await client.query(`UPDATE users
            SET name = $1, 
            password_hash = $2, 
            authorization_level = $3,
            expires_at = NULL
            WHERE user_id = $4 AND organization_id = $5 AND authorization_level = 0
            RETURNING user_id`,
            [newUserName,newHashedPassword,newAuthLevel,userID,organizationID]
        );
        if (result.rowCount !== 1) {
            throw new Error("Temporary user not found");
        }
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

//deletes the users given in the request selectedUsers array from the database
export const deleteUsers = async (req,res) => {
    const {selectedUsers} = req.body;
    if (!Array.isArray(selectedUsers) || selectedUsers.length === 0) {
        return res.status(400).json({
            success: false,
            message: "No users selected"
        });
    }
    const maxDeletionLevel = req.user.authorizationLevel;

    const client = await pool.connect();

    try{
        const result = await client.query(
            `
            DELETE FROM users
            WHERE user_id = ANY($1::uuid[])
            AND organization_id = $2
            AND authorization_level < $3
            RETURNING user_id;
            `,
            [selectedUsers,req.user.organizationID,maxDeletionLevel]
        );
        if (result.rowCount !== selectedUsers.length) {
            return res.status(200).json({
                success: true,
                message: `couldnt delete ${selectedUsers.length - result.rowCount} user/s`
            });
        }
        return res.status(200).json({success:true, message:"deleted users from database"});


    }catch(error){
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

        const users = [];
        const tempUsers = [];
        for (const row of response.rows) {
            const userResponse = await client.query(`SELECT * FROM users WHERE user_id = $1`,[row.user_id])
            if (userResponse.rows[0] !== undefined) {
                const user = userResponse.rows[0];
                if (user.authorization_level === 0) {
                    tempUsers.push(user);
                } else {
                    users.push(user);
                }
                continue;    
            }
            console.warn(`User with ID ${row.user_id} not found in users table`);
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

export const savePref = async (req,res) => { //saves the user preference to database using a list of json objects called userPref which contains pref value and module id
    const {userId} = req.user;
    const {userPref} = req.body;
    let moduleIDs = [];
    let preferenceValues = [];
    if (!Array.isArray(userPref)) {
        return res.status(400).json({
            success: false,
            message: "userPref must be an array"
        });
    }

    for (const { moduleID, preferenceValue } of userPref) {
        moduleIDs.push(moduleID);
        preferenceValues.push(preferenceValue);
    }

    const client = await pool.connect();
    try {
        await client.query(`
            INSERT INTO user_preferences (user_id, module_id, preference_value)
            SELECT $1,module_id,preference_value
            FROM unnest($2::uuid[], $3::integer[])
            AS t(module_id, preference_value)
            ON CONFLICT (user_id, module_id)
            DO UPDATE SET preference_value = EXCLUDED.preference_value
            `,
            [userId,moduleIDs,preferenceValues]
        )

        return res.status(200).json({success:true,message:"updated the preference settings of the user"+ userId})

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
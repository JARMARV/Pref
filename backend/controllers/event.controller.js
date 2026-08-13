import pool from "../postgre_database/database.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/env.js";
import cookieParser from "cookie-parser";

export const newEvent = async (req, res) => {
    const client = await pool.connect();
    try{
        //Getting user data from cookie and making sure user has admin authorization
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
        const organizationID = decoded.organizationID;
        if (userID === undefined || authorizationLevel === undefined || organizationID === undefined) {
            return res.status(400).json({ message: "Invalid token data" });
        };
        if (authorizationLevel !== 2){
            return res.status(403).json({message: "Authorization failed"});
        };
        //adding new event to event table
        const startDate = req.body.startDate;
        const endDate = req.body.endDate;
        const eventName = req.body.eventName;
        await client.query(`INSERT INTO events (organization_id, event_name, start_date, end_date) 
            VALUES($1,$2,$3,$4)`,
            [organizationID,eventName,startDate,endDate]
        );
        return res.status(200).json({success:true,message:"Created new event"})
    }catch(error){
        console.error(error);
        res.status(500).json({success:false,message:'Database error'});
    }finally{
        client.release();
    }
};

export const newSlot = async (req, res) => {
    const client = await pool.connect();
    try{


    }catch(error){
        console.error(error);
        res.status(500).json({success:false,message:'Database error'});
    }finally{
        client.release();
    }

};

export const newModule = async (req, res) => {
     const client = await pool.connect();
    try{


    }catch(error){
        console.error(error);
        res.status(500).json({success:false,message:'Database error'});
    }finally{
        client.release();
    }

};
export const getEventJson = async (req, res)=>{
    const client = await pool.connect();

    //Getting user data from cookie and making sure user has user or above authorization
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
    const organizationID = decoded.organizationID;
    if (userID === undefined || authorizationLevel === undefined || organizationID === undefined) {
        return res.status(400).json({ message: "Invalid token data" });
    };
    if (authorizationLevel === 0){
        return res.status(403).json({message: "Authorization failed"});
    };
    //checking if there is a event id
    if (!req.params.eventID){
        return res.status(400).json({success:false,message:"wrong api request"})
    };
    const eventID = req.params.eventID;
    try{
        
        //Get event and check if it exists
        const eventRes = await client.query(`SELECT * FROM events WHERE $1 = event_id`,
            [eventID]
        );
        if (event.rows.length !== 1){
            return res.status(500).json({success:false, message:"Database error could not find event or there were multiple events with the same id"});
        }
        const event = eventRes.rows;

        //get slots of the event
        const slotsRes = await client.query(`SELECT * FROM slots WHERE $1 = event_id`,
            [eventID]
        );
        const slots = slotsRes.rows;
        let modules= []
        //get modules
        for (let i = 0; i < slots.rows.length; i++){
            const slotID = slots.rows[i].slot_id;
            const result = await client.query(`SELECT * FROM modules WHERE $1 = slot_id`,
                [slotID]
            )
            modules.push(...result.rows)
        };

        
        return res.status(200).json({success:true,message: (event,slots,modules)});

    }catch(error){
        console.error(error);
        return res.status(500).json({success:false,message:'Database error'});
    }finally{
        client.release();
    }
};
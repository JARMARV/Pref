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
            VALUES($1,$2,$3::timestamp AT TIME ZONE 'Europe/Berlin',$4::timestamp AT TIME ZONE 'Europe/Berlin')`,
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
    try{
        //adding new event to event table
        const startDate = req.body.startDate;
        const endDate = req.body.endDate;
        const eventID = req.body.eventID;
        await client.query(`INSERT INTO slots (event_id, start_time, end_time) 
            VALUES($1,$2::timestamp AT TIME ZONE 'Europe/Berlin',$3::timestamp AT TIME ZONE 'Europe/Berlin')`,
            [eventID,startDate,endDate]
        );
        return res.status(200).json({success:true,message:"Created new event"})

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

    //checking for event id
    const eventID = req.params.eventID;
    if (!eventID) {
        return res.status(400).json({
            success: false,
            message: "Event ID missing"
        });
    }

    try{
        // get event data from database
        const result = await client.query(
            `
            SELECT
                e.event_id,
                e.start_date,
                e.end_date,
                e.organization_id,
                e.event_name,

                s.slot_id,
                s.start_time,
                s.end_time,

                m.module_id,
                m.module_name,
                m.location_info,
                m.general_info

            FROM events e

            LEFT JOIN slots s
                ON s.event_id = e.event_id

            LEFT JOIN modules m
                ON m.slot_id = s.slot_id

            WHERE e.event_id = $1
              AND e.organization_id = $2

            ORDER BY s.start_time,m.module_id
            `,
            [eventID,organizationID]
        );

        //convert to json format
        
        const event = {
            startDate: berlinDateTime(result.rows[0].start_date),
            endDate: berlinDateTime(result.rows[0].end_date),
            eventID: result.rows[0].event_id,
            slots: []
        };
        console.log(event.startDate)
        for (const row of result.rows) {
            // Find whether this slot already exists
            let slot = event.slots.find(
                slot => slot.slotID === row.slot_id
            );
            // Create slot if necessary
            if (!slot && row.slot_id !== null) {

                slot = {
                    start: berlinDateTime(row.start_time),
                    end: berlinDateTime(row.end_time),
                    slotID: row.slot_id,
                    modules: []
                };
                event.slots.push(slot);
            }
            // Add module
            if (row.module_id !== null) {
                slot.modules.push({
                    locationInfoShort: row.location_info_short,
                    additionalInfo: row.additional_info,
                    name: row.module_name,
                    moduleID: row.module_id
                });
            }
        }
        //return if successful
        return res.status(200).json({
            success: true,
            event: event
        });
    }catch(error){
        console.error(error);
        return res.status(500).json({success:false,message:'Database error'});
    }finally{
        client.release();
    }
};

function berlinDateTime(utcString) {
    const date = new Date(utcString);

    const parts = new Intl.DateTimeFormat("sv-SE", {
        timeZone: "Europe/Berlin",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    }).formatToParts(date);

    const get = type => parts.find(p => p.type === type).value;

    return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}
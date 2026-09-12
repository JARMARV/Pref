import pool from "../postgre_database/database.js";
import { HIGH_VALUE_BIAS } from "../config/env.js";
//creation
export const newEvent = async (req, res) => {
    const client = await pool.connect();
    try{
        // User data is already validated and attached by middleware
        const organizationID = req.user.organizationID;
        
        //adding new event to event table
        const startDate = req.body.startDate;
        const endDate = req.body.endDate;
        const eventName = req.body.eventName;
        const response = await client.query(`INSERT INTO events (organization_id, event_name, start_date, end_date) 
            VALUES($1,$2,$3::timestamp AT TIME ZONE 'Europe/Berlin',$4::timestamp AT TIME ZONE 'Europe/Berlin')
            RETURNING event_id
            `,
            [organizationID,eventName,startDate,endDate]
            
        );
        return res.status(200).json({success:true,message:"Created new event",eventID:response.rows[0].event_id})
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
        // User data is already validated and attached by middleware
        //adding new slot to slots table
        const startDate = req.body.startDate;
        const endDate = req.body.endDate;
        const eventID = req.body.eventID;

        const result = await client.query(`INSERT INTO 
            slots (event_id, start_time, end_time) 
            VALUES($1,$2::timestamp AT TIME ZONE 'Europe/Berlin',$3::timestamp AT TIME ZONE 'Europe/Berlin')
            RETURNING slot_id
            `,
            [eventID,startDate,endDate]
        );
        
        const slotID = result.rows[0].slot_id;
        return res.status(200).json({success:true,message:"Created new Slot",slotID:slotID})

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
        // User data is already validated and attached by middleware
        //adding new module to modules table
        const slotID = req.body.slotID;
        const locationInfo = req.body.locationInfo;
        const generalInfo = req.body.generalInfo;
        const moduleName = req.body.moduleName;
        const result = await client.query(`INSERT INTO modules (slot_id, location_info, general_info, module_name) 
            VALUES($1,$2,$3,$4)
            RETURNING module_id
            `,
            [slotID,locationInfo,generalInfo,moduleName]
        );
        const moduleID = result.rows[0].module_id;
        return res.status(200).json({success:true,message:"Created new module",moduleID:moduleID})

    }catch(error){
        console.error(error);
        res.status(500).json({success:false,message:'Database error'});
    }finally{
        client.release();
    }

};

//updation
export const updateEvent = async (req,res) => {
     const client = await pool.connect();
    try{
        // User data is already validated and attached by middleware
        const eventID = req.params.eventID;
        const startDate = req.body.startDate;
        const endDate = req.body.endDate;
        const eventName = req.body.eventName;


        if (!eventID||!startDate||!endDate||!eventName){
            return res.status(400).json({ success:false, message:"missing information"})
        }
        const result = await client.query(`UPDATE events SET 
            start_date = $1::timestamp AT TIME ZONE 'Europe/Berlin',
            end_date = $2::timestamp AT TIME ZONE 'Europe/Berlin',
            event_name = $3
            WHERE event_id = $4
            RETURNING event_id
            `,
            [startDate,endDate,eventName,eventID]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }
        return res.status(200).json({success:true,message:"Updated event" ,eventID: result.rows[0].event_id})

    }catch(error){
        console.error(error);
        res.status(500).json({success:false,message:'Database error'});
    }finally{
        client.release();
    }
};

export const updateSlot = async (req,res) => {
     const client = await pool.connect();
    try{
        // User data is already validated and attached by middleware
        if (! req.params.slotID || ! req.params.eventID){
            return res.status(400).json({success:false,message:"false parameters for this request"})
        };
        const slotID = req.params.slotID;
        const eventID = req.params.eventID;
        const startTime = req.body.startTime;
        const endTime = req.body.endTime;


        if (!slotID || !eventID){
            return res.status(400).json({ success:false, message:"missing information"})
        }
        const result = await client.query(`UPDATE slots SET 
            start_time = $1::timestamp AT TIME ZONE 'Europe/Berlin',
            end_time = $2::timestamp AT TIME ZONE 'Europe/Berlin'
            WHERE slot_id = $3 AND event_id = $4
            RETURNING slot_id
            `,
            [startTime,endTime,slotID,eventID]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Slot not found"
            });
        }
        return res.status(200).json({success:true,message:"Updated slot" ,slotID: result.rows[0].slot_id})

    }catch(error){
        console.error(error);
        res.status(500).json({success:false,message:'Database error'});
    }finally{
        client.release();
    }
};

export const updateModule = async (req,res) =>{
    const client = await pool.connect();
    try{
        // User data is already validated and attached by middleware
        const slotID = req.body.slotID;
        const locationInfo = req.body.locationInfo;
        const generalInfo = req.body.generalInfo;
        const moduleName = req.body.moduleName;
        const moduleID = req.body.moduleID;
        let maxUsers = req.body.maxUsers;
        if (!slotID || !moduleID){
            return res.status(404).json({ success:false, message:"missing information"})
        }
        if (!maxUsers){
            maxUsers = 0
        }
        const result = await client.query(`UPDATE modules SET 
            slot_id = $1,
            location_info = $2,
            general_info = $3,
            module_name= $4,
            max_users= $6
            WHERE module_id = $5
            `,
            [slotID,locationInfo,generalInfo,moduleName,moduleID,maxUsers]
        );
        return res.status(200).json({success:true,message:"Updated module" ,moduleID: moduleID})

    }catch(error){
        console.error(error);
        res.status(500).json({success:false,message:'Database error'});
    }finally{
        client.release();
    }
};

export const lockEvent = async (req,res) =>{

    const eventID = req.params.eventID
    const client = await pool.connect();
    try{
        const result = await client.query(`
            UPDATE events
            SET is_locked = NOT is_locked
            WHERE event_id = $1
            RETURNING is_locked;
            `,
            [eventID]
        );
        if (result.rowCount !== 1){
            return res.status(500).json({success:false,message:'Database error'});
        }
        return res.status(200).json({success:true,message:"set is_locked of event to: "+ result.rows[0].is_locked})
    }catch(error){
        console.error(error);
        res.status(500).json({success:false,message:'Database error'});
    }finally{
        client.release();
    }
};
//deletion
export const deleteEvent = async (req,res) => {
     const client = await pool.connect();
    try{
        // User data is already validated and attached by middleware
        const eventID = req.params.eventID
        await client.query("BEGIN");

        //deletes modules of each slot in the event
        const slots = await client.query("SELECT * FROM slots WHERE event_id = $1",
        [eventID]
        )
        for(const slot of slots.rows){
            await client.query("DELETE FROM modules WHERE slot_id = $1",
            [slot.slot_id]
            )
        }
        // deletes all slots of the event
        await client.query("DELETE FROM slots WHERE event_id = $1",
        [eventID]
        )
        //deletes the event itself
        const result = await client.query("DELETE FROM events WHERE event_id = $1",
        [eventID]
        )
        //checks if the event was found and thereby deleted
        if (result.rowCount === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }

        await client.query("COMMIT");

        return res.status(200).json({
            success:true,
            message:"event deleted successfully"
        })

    }catch(error){
        await client.query("ROLLBACK");
        console.error(error);
        res.status(500).json({success:false,message:'Database error'});
    }finally{
        client.release();
    }
};

export const deleteSlot = async (req,res) => {
    const client = await pool.connect();
    try{
        // User data is already validated and attached by middleware
        const slotID = req.params.slotID

        await client.query("BEGIN");

        await client.query("DELETE FROM modules WHERE slot_id = $1",
        [slotID]
        )

        const result = await client.query("DELETE FROM slots WHERE slot_id = $1",
        [slotID]
        )
        
        if (result.rowCount === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                success: false,
                message: "Slot not found"
            });
        }

        await client.query("COMMIT");

        return res.status(200).json({
            success:true,
            message:"slot deleted successfully"
        })

    }catch(error){
        await client.query("ROLLBACK");
        console.error(error);
        res.status(500).json({success:false,message:'Database error'});
    }finally{
        client.release();
    }
};

export const deleteModule = async (req,res) => {
     const client = await pool.connect();
    try{
        // User data is already validated and attached by middleware
        const moduleID = req.params.moduleID

        const result = await client.query("DELETE FROM modules WHERE module_id = $1",
        [moduleID]
        )

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "module not found"
            });
        }

        return res.status(200).json({
            success:true,
            message:"module deleted successfully"
        })


    }catch(error){
        console.error(error);
        res.status(500).json({success:false,message:'Database error'});
    }finally{
        client.release();
    }
};

//aquisition
export const getEventJson = async (req, res)=>{
    // User data is already validated and attached by middleware
    const userID = req.user.userId;
    const authorizationLevel = req.user.authorizationLevel;
    const organizationID = req.user.organizationID;

    //checking if there is a event id
    if (!req.params.eventID){
        return res.status(400).json({success:false,message:"wrong api request"})
    };

    if (authorizationLevel === 0){
        console.log("Authorization failed. Temp user access required");
        return res.status(403).json({message: "Authorization failed"});
    };
    const client = await pool.connect();
    if (authorizationLevel === 1){
        if (await checkEventAccess(client, userID, req) === false){
            console.log("Authorization failed. User not connected to event");
            return res.status(403).json({message: "Authorization failed"});
        }
    }

    const eventID = req.params.eventID;
    assignUsersToModules(client,eventID)
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
                e.is_locked,

                s.slot_id,
                s.start_time,
                s.end_time,

                m.module_id,
                m.module_name,
                m.location_info,
                m.max_users,
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
            eventName: result.rows[0].event_name,
            isLocked: result.rows[0].is_locked,
            slots: []
        };
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
                    slotID:row.slot_id,
                    locationInfoShort: row.location_info,
                    additionalInfo: row.general_info,
                    name: row.module_name,
                    moduleID: row.module_id,
                    maxUsers: row.max_users
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

export const getEventPref = async (req, res)=>{
    const userID = req.user.userId;
    const eventID = req.params.eventID;

    const client = await pool.connect();
    try{
        // get event data from database
        const result = await client.query(`
            SELECT 
                m.module_id,
                p.preference_value 
            FROM events e

            JOIN slots s
                ON s.event_id = e.event_id

            JOIN modules m 
                ON m.slot_id = s.slot_id

            LEFT JOIN user_preferences p
                ON p.module_id = m.module_id
                AND p.user_id = $2

            WHERE e.event_id = $1
            `,
            [eventID,userID]
        );
        const pref = result.rows
        //convert to json format
        
        return res.status(200).json({
            success: true,
            preferences: pref
        });
    }catch(error){
        console.error(error);
        return res.status(500).json({success:false,message:'Database error'});
    }finally{
        client.release();
    }
}

export const getOrganizationEvents = async (req,res)=>{

    // User data is already validated and attached by middleware
    const authorizationLevel = req.user.authorizationLevel;
    const organizationID = req.user.organizationID;
    
    if (authorizationLevel < 2){
        return res.status(403).json({message: "Authorization failed"});
    };

    const client = await pool.connect();

    try{
        const result = await client.query(`
            SELECT * FROM events
            WHERE $1 = organization_id
            `,
            [organizationID]
        )
        let response = [];
        for (const row of result.rows){
            response.push({
                eventName: row.event_name,
                eventID:row.event_id
            })
        }
        return res.status(200).json({success:true,message:"sucessfully gethered all events of the given organization",events:response})
    }catch(error){
        console.error(error);
        res.status(500).json({success:false,message:'Database error'});
    }finally{
        client.release();
    }
};

export const getEventsConnectedToUser = async (req,res) =>{
    const userID = req.user.userId
    const client = await pool.connect();

    try{
        const result = await client.query(`
            SELECT events.*
            FROM users_in_events
            JOIN events
                ON events.event_id = users_in_events.event_id
            JOIN users
                ON users.user_id = users_in_events.user_id
            WHERE users_in_events.user_id = $1
            AND events.organization_id = users.organization_id;
            `,
            [userID]   
        )

        let response = [];
        for (const row of result.rows){
            response.push({
                eventName: row.event_name,
                eventID:row.event_id
            })
        }
        return res.status(200).json({success:true,message:"gathered all events connected to the requesting user", events:response})
    }catch(error){
        console.error(error);
        res.status(500).json({success:false,message:'Database error'});
    }finally{
        client.release();
    }
};

//function to do some timezone magic
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
// checks if the requested event is connected to the user in the users_in_events table and return true or false
async function checkEventAccess(client, userID, req){
    const result = await client.query(
        "SELECT * FROM users_in_events WHERE user_id = $1",
        [userID]
    );
    for (const row of result.rows){
        if (row.event_id === req.params.eventID){
            return true;
        }
    }
    return false;
}

/*naive algorithm : 
    For each slot:

    1. Start with no assignments.

    2. Repeatedly find the best available user-module assignment.

       Score each possible assignment using:

           preference²
           - fairness penalty
           - penalty if the module is nearly full

    3. Assign the best candidate.

    4. Continue until:
           - every user has a module, or
           - all modules are full, or
           - no acceptable preference remains

    5. Try to improve the result:
           - swap two users
           - move a user to another module
           - keep the change only if it improves the objective


What i will eventually have to do to always get optimal results (according to chat gpt): 
    Mixed-Integer Linear Programming 
    Fair capacitated assignment using mixed-integer linear programming

    And i think this is stuff you learn late into a computer science degree,
    explaining why 90% of it looks like dark magic to me

    (-_-)

*/

async function getUserPreferenceData(client, eventID) {

    const pref = await client.query(`
        SELECT 
            m.module_id,
            p.preference_value,
            p.user_id,
            s.slot_id
        FROM events e

        JOIN slots s
            ON s.event_id = e.event_id

        JOIN modules m 
            ON m.slot_id = s.slot_id

        LEFT JOIN user_preferences p
            ON p.module_id = m.module_id

        WHERE e.event_id = $1
    `, [eventID]);

    const slotsAndModules = await client.query(`
        SELECT 
            m.module_id,
            s.slot_id
        FROM events e
        
        JOIN slots s
            ON s.event_id = e.event_id
        
        LEFT JOIN modules m 
            ON m.slot_id = s.slot_id

        WHERE e.event_id = $1
    `, [eventID]);

    const userIDs = [
        ...new Set(
            pref.rows
                .map(row => row.user_id)
                .filter(userID => userID !== null)
        )
    ];

    const slotIDs = [
        ...new Set(
            slotsAndModules.rows.map(row => row.slot_id)
        )
    ];

    const preferenceMap = new Map(
        pref.rows
            .filter(row => row.user_id !== null)
            .map(row => [
                `${row.user_id}:${row.module_id}`,
                row.preference_value
            ])
    );


    // Create users
    const users = userIDs.map(userID => {

        // Create slots for this user
        const slots = slotIDs.map(slotID => ({

            slotID: slotID,

            // Find all modules belonging to this slot
            modules: slotsAndModules.rows
                .filter(module =>
                    module.slot_id === slotID &&
                    module.module_id !== null
                )
                .map(module => {

                    // Look up this user's preference for this module
                    const preference = preferenceMap.get(
                        `${userID}:${module.module_id}`
                    );

                    return {
                        moduleID: module.module_id,
                        preference: preference ?? null
                    };
                })
        }));
        return {
            userID: userID,
            slots: slots
        };
    });
    //console.log(JSON.stringify(users, null, 2));
    return(users);
}

async function assignUsersToModules(client, eventID){
    const userData = getUserPreferenceData(client,eventID);
    const highValueBias = parseFloat(HIGH_VALUE_BIAS);
    

}
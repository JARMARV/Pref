import pool from "../postgre_database/database.js";

//aquisition
export const getAllOrganizations = async (req, res) => {
    const client = await pool.connect();
    const result = await client.query(`SELECT * FROM organizations`);
    const resultJson = result.rows;
    return res.status(200).json({success:true,organizations:resultJson});

}
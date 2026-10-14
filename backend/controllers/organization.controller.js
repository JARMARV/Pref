import pool from "../postgre_database/database.js";

//aquisition
export const getAllOrganizations = async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            "SELECT * FROM organizations"
        );

        return res.status(200).json({
            success: true,
            organizations: result.rows
        });
    } catch (error) {
        console.error("Failed to get organizations:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve organizations"
        });
    } finally {
        if (client) {
            client.release();
        }
    }
};
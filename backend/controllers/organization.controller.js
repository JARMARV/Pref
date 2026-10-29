import pool from "../postgre_database/database.js";


export const getAllOrganizations = async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT * FROM organizations 
            WHERE organization_id != $1`,
            ["11111111-1111-1111-1111-111111111111"]
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

export const createOrganization = async (req, res) => {
    const client = await pool.connect();
    const organizationName = req.params.name;
    if (!organizationName || organizationName === null){
        return res.status(400).json({success:false,message:"error no organization name provided"});
    };
    try {
        const response = await client.query(`
            INSERT INTO organizations
            (organization_name) VALUES($1)
            RETURNING organization_id,organization_name`,
            [organizationName]
        );
        return res.status(200).json({success:true,message:"created new organization with name: " + organizationName, organization:response.rows[0]});
    } catch (error) {
        console.error();

        return res.status(500).json({
            success: false,
            message: ""
        });
    } finally {
        if (client) {
            client.release();
        }
    }
}

export const deleteOrganization = async (req, res) => {
    const client = await pool.connect();
    try {
        
    } catch (error) {
        console.error();

        return res.status(500).json({
            success: false,
            message: ""
        });
    } finally {
        if (client) {
            client.release();
        }
    }
}

export const updateOrganization = async (req, res) => {
    const client = await pool.connect();
    try {
        
    } catch (error) {
        console.error();

        return res.status(500).json({
            success: false,
            message: ""
        });
    } finally {
        if (client) {
            client.release();
        }
    }
}

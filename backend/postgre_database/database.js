import pg from "pg";

import { PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE } from "../config/env.js";

const { Pool } = pg;

const port = Number(PGPORT || 5400);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PostgreSQL port: ${PGPORT}`);
}

const dbConfig = {
    host: PGHOST,
    port:PGPORT,
    user: PGUSER ,
    password: PGPASSWORD,
    database: PGDATABASE,
};

if (!dbConfig.host || !dbConfig.user || !dbConfig.password || !dbConfig.database) {
    throw new Error("Incomplete PostgreSQL configuration. Check PGHOST, PGUSER, PGPASSWORD, and PGDATABASE.");
}

const pool = new Pool(dbConfig);

pool.on("error", (error) => {
    throw new Error(`Unexpected PostgreSQL pool error: ${error.message}`);
});

export async function initializeDatabase() {
    const client = await pool.connect();

    try {
        await client.query("SELECT 1");
    } catch (error) {
        throw new Error(`Database connection verification failed: ${error.message}`);
    } finally {
        client.release();
    }
}

await initializeDatabase();

export default pool;
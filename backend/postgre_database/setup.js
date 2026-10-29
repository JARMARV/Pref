import pg from "pg";
import fs from "fs";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const { Client } = pg;

import { PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE } from "../config/env.js";

const serverConfig = {
    host: PGHOST,
    port:PGPORT,
    user: PGUSER ,
    password: PGPASSWORD,
    database: "postgres",
};
const dbConfig = {
    host: PGHOST,
    port:PGPORT,
    user: PGUSER ,
    password: PGPASSWORD,
    database: PGDATABASE,
};

let client;

try {
    client = new Client(serverConfig);
    await client.connect();

    console.log("Connected to PostgreSQL server");

        const result = await client.query(
        "SELECT 1 FROM pg_database WHERE datname = $1",
        [PGDATABASE]
    );

    if (result.rowCount > 0) {
        console.log(`Dropping database "${PGDATABASE}"...`);

        await client.query(
            `DROP DATABASE "${PGDATABASE}" WITH (FORCE)`
        );
    }

    console.log(`Creating database "${PGDATABASE}"...`);

    await client.query(
        `CREATE DATABASE "${PGDATABASE}"`
);

    await client.end();


    // -------------------------
    // Connect to application DB
    // -------------------------

    client = new Client(dbConfig);

    await client.connect();

    console.log(`Connected to database "${PGDATABASE}"`);


    // -------------------------
    // Run setup.sql
    // -------------------------

    const schema = fs.readFileSync(
        "./postgre_database/setup.sql",
        "utf8"
    );

    await client.query(schema);

    const adminName = PGUSER;

    const adminPassword = PGPASSWORD;
    const salt = await bcrypt.genSalt(10);
    const hashedAdminPassword = await bcrypt.hash(adminPassword, salt);
    
    const adminAuth = 3;

    await client.query(`
        INSERT INTO users 
        (name,password_hash,authorization_level,organization_id)
         VALUES ($1,$2,$3,$4);
        `,
        [adminName,hashedAdminPassword,adminAuth,"11111111-1111-1111-1111-111111111111"]
        )



    console.log("Database setup completed successfully!");

} catch (error) {

    console.error("Database setup failed:");
    console.error(error);

} finally {

    if (client) {
        await client.end();
    }

}
import pg from "pg";
import fs from "fs";

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
        `SELECT 1 FROM pg_database WHERE datname = $1`,
        [PGDATABASE]
    );


    if (result.rowCount === 0) {

        console.log(`Database "${PGDATABASE}" does not exist.`);

        await client.query(
            `CREATE DATABASE "${PGDATABASE}"`
        );

        console.log(`Database "${PGDATABASE}" created!`);

    } else {

        console.log(`Database "${PGDATABASE}" already exists.`);

    }

    await client.end();


    // -------------------------
    // Connect to application DB
    // -------------------------

    client = new Client(databaseConfig);

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

    console.log("Database setup completed successfully!");
    
} catch (error) {

    console.error("Database setup failed:");
    console.error(error);

} finally {

    if (client) {
        await client.end();
    }

}
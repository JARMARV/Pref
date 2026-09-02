import { config } from 'dotenv';

config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export const {
    PORT,
    NODE_ENV,
    PGHOST,
    PGPORT,
    PGUSER,
    PGPASSWORD,
    PGDATABASE,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    ORIGIN,
} = process.env;

const requiredVariables = [
    "PORT",
    "NODE_ENV",
    "PGHOST",
    "PGPORT",
    "PGUSER",
    "PGPASSWORD",
    "PGDATABASE",
    "JWT_SECRET",
    "JWT_EXPIRES_IN",
    "ORIGIN",
];

for (const key of requiredVariables) {
    if (!process.env[key]) {
        console.warn(
            `Warning: ${key} is not defined in the environment variables.`
        );
    }
}
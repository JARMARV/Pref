
import express from 'express';

import { PORT } from './config/env.js';
import {ORIGIN} from './config/env.js';

import eventRouter from './routes/event.routes.js';
import userRouter from './routes/user.routes.js';
import authRouter from './routes/auth.routes.js';
import errorMiddleware from './middlewares/error.middleware.js';
import cookieParser from 'cookie-parser';
import cors from "cors";

import pool from './postgre_database/database.js';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
    origin: ORIGIN,
    credentials: true,
}));

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/events', eventRouter);


app.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Database error');
    }
});

// Error handling middleware (must be last)
app.use(errorMiddleware);

app.listen(PORT, () => {
    console.log (`running on port ${ PORT } ?`);
});

export default app;
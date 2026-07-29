
import express from 'express';

import{ PORT } from './config/env.js';

const app = express();

app.get('/', (req, res) => {
    res.send('test');
});

app.listen(PORT, () => {
    console.log (`running on port ${ PORT } ?`);
});

export default app;
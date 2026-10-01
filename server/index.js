import express from 'express';
import cors from 'cors';
import app from './app.js';

const server = express();
server.use(cors());
server.use(app);
server.listen(3001, () => console.log('Server on http://localhost:3001'));

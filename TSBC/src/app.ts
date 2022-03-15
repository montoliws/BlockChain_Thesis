import express from 'express';

// Routes

import path from 'path';
import apiRouter from './routes/api.routes';
import blockchainRouter from './routes/blockchain.routes';
import proof from './routes/proof.routes';
// Create Express server
const app = express();

// Express configuration
app.set('port', process.env.PORT || 3000);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../public'), { maxAge: 31557600000 }));

app.use(apiRouter);
app.use(blockchainRouter);
app.use(proof);

export default app;

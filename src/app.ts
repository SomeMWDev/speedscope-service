import express from 'express';
import routes from './routes/routes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import config from './config/config.js';

const app = express();

app.use(express.json({ limit: config.requestSizeLimit }));

app.use('/', routes);
app.use(errorHandler);

export default app;

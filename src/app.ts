import express from 'express';
import routes from './routes/routes.ts';
import { errorHandler } from './middlewares/errorHandler.ts';
import config from './config/config.ts';

const app = express();

app.use(express.json({ limit: config.requestSizeLimit }));

app.use('/', routes);
app.use(errorHandler);

export default app;

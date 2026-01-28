import express from 'express';
import routes from './routes/routes';
import { errorHandler } from './middlewares/errorHandler';
import config from './config/config';

const app = express();

app.use(express.json({ limit: config.requestSizeLimit }));

app.use('/', routes);
app.use(errorHandler);

export default app;

import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  logToken: string;
  requestSizeLimit: string;
}

const logToken = process.env.LOG_TOKEN;
if (!logToken) {
  throw new Error('LOG_TOKEN must be defined!');
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  logToken: logToken,
  // during testing, some requests were up to 63mb large
  requestSizeLimit: process.env.REQUEST_SIZE_LIMIT || '100mb',
};

export default config;

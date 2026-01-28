import { Router } from 'express';
import {
  aggregate,
  getProfile,
  logProfile,
} from '../controllers/profileController';
import {body, query} from 'express-validator';
import { handleValidationErrors } from '../middlewares/errorHandler';
import cors from 'cors';
import config from "../config/config";
import {AggregatedProfileType} from "../../generated/prisma/enums";

const router = Router();

router.get(
  '/get', [
    query('id').isString().notEmpty(),
  ],
  cors({
    origin: config.allowedOrigin,
  }),
  handleValidationErrors,
  getProfile
);

router.post('/log', [
  body('id').isString().notEmpty(),
  body('wiki').isString().notEmpty(),
  body('url').isString().notEmpty(),
  body('cfRay').isString().notEmpty(),
  body('forced').isBoolean(),
  body('speedscopeData').isString(),
  body('parserReport').optional(),
  body('environment').isString().notEmpty(),
], handleValidationErrors, logProfile);

router.get(
    '/aggregate',
    cors({
      origin: config.allowedOrigin,
    }),
    [
      query('type').exists().isIn([AggregatedProfileType.HOURLY, AggregatedProfileType.DAILY])
    ],
    handleValidationErrors,
    aggregate
);

export default router;

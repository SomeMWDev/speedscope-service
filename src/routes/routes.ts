import { Router } from 'express';
import {
  aggregate,
  getProfile,
  logProfile,
} from '../controllers/profileController.ts';
import {body, query} from 'express-validator';
import { handleValidationErrors } from '../middlewares/errorHandler.ts';

const router = Router();

router.get('/get', [
    query('id').isString().notEmpty(),
], handleValidationErrors, getProfile);

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

router.get('/aggregate', [
    query('type').exists().isIn(['hourly', 'daily'])
], handleValidationErrors, aggregate);

export default router;

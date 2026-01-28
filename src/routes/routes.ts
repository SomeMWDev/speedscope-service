import { Router } from 'express';
import {
  aggregate,
  getProfile,
  logProfile,
} from '../controllers/profileController.js';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middlewares/errorHandler.js';

const router = Router();

router.get('/get', getProfile);

const logProfileValidators = [
  body('id').isString().notEmpty(),
  body('wiki').isString().notEmpty(),
  body('url').isString().notEmpty(),
  body('cfRay').isString().notEmpty(),
  body('forced').isBoolean(),
  body('speedscopeData').isString(),
  body('parserReport').optional(),
  body('environment').isString().notEmpty(),
];

router.post('/log', logProfileValidators, handleValidationErrors, logProfile);

router.get('/aggregate', aggregate);

export default router;

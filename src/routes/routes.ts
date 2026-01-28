import { Router } from 'express';
import {
  aggregate,
  getProfile,
  logProfile,
} from '../controllers/profileController.js';

const router = Router();

router.get('/get', getProfile);
router.post('/log', logProfile);
router.get('/aggregate', aggregate);

export default router;

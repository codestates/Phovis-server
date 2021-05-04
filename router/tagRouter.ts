/* eslint-disable @typescript-eslint/no-misused-promises */
import { tagController } from '../controllers';
import express from 'express';

const router = express.Router();

router.get('/', tagController.get);

export default router;

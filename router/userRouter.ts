/* eslint-disable @typescript-eslint/no-misused-promises */
import { userController } from '../controllers';
import express from 'express';

const router = express.Router();
router.get('/info', userController.getinfo);

export default router;

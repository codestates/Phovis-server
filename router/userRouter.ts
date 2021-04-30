/* eslint-disable @typescript-eslint/no-misused-promises */
import { userController } from '../controllers';
import express from 'express';

const router = express.Router();

router.get('/info', userController.getinfo);
router.put('/info', userController.updateInfo);

export default router;

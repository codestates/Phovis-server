/* eslint-disable @typescript-eslint/no-misused-promises */
import { authController } from '../controllers';
import express from 'express';

const router = express.Router();

router.post('/login', authController.login);
router.post('/google', authController.google);
router.post('/kakao', authController.login);

export default router;
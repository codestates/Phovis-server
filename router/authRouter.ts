/* eslint-disable @typescript-eslint/no-misused-promises */
import { authController } from '../controllers';
import express from 'express';

const router = express.Router();

router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.post('/google', authController.google);
router.post('/kakao', authController.kakao);
router.post('/password', authController.checkPW);
router.put('/password', authController.updatePW);
router.get('/token', authController.requestToken);
router.put('/option', authController.updateOption);
export default router;

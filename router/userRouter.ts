/* eslint-disable @typescript-eslint/no-misused-promises */
import { userController } from '../controllers';
import express from 'express';

const router = express.Router();
router.get('/info', userController.getinfo);
router.put('/info', userController.updateInfo);
router.put('/like', userController.likeContent);
router.put('/follow', userController.followUser);

export default router;

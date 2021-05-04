/* eslint-disable @typescript-eslint/no-misused-promises */
import { userController } from '../controllers';
import express from 'express';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
const profileUpload = upload.single('image');

const router = express.Router();
router.get('/info', userController.getinfo);
router.put('/info', profileUpload, userController.updateInfo);
router.put('/like', userController.likeContent);

export default router;

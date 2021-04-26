import { userController } from '../controllers';
import express from 'express';

const router = express.Router();

router.get('/', userController.get);

export default router;

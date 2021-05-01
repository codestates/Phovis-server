/* eslint-disable @typescript-eslint/no-misused-promises */
import { contentController } from '../controllers';
import express from 'express';

const router = express.Router();

router.post('/', contentController.post);

export default router;

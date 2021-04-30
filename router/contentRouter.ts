/* eslint-disable @typescript-eslint/no-misused-promises */
import { contentController } from '../controllers';
import express from 'express';

const router = express.Router();

router.post('/', contentController.post);
router.get('/', contentController.get);
// router.delete('/content', contentController.delete);
// router.put('/content', contentController.put);

export default router;

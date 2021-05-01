/* eslint-disable @typescript-eslint/no-misused-promises */
import { contentController } from '../controllers';
import express from 'express';
import multer from 'multer';

const router = express.Router();

const upload = multer();
const cpUpload = upload.fields([
  { name: 'title' },
  { name: 'mainimagefile' },
  { name: 'tags' },
  { name: 'description' },
  { name: 'location' },
  { name: 'images' },
]);
router.post('/', cpUpload, contentController.post);

export default router;

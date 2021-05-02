/* eslint-disable @typescript-eslint/no-misused-promises */
import { contentController } from '../controllers';
import express, { Request, Response } from 'express';
import multer from 'multer';
import * as auth from '../middleware/service/authorize';

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });
const cpUpload = upload.fields([
  { name: 'title' },
  { name: 'mainimagefile' },
  { name: 'tags' },
  { name: 'description' },
  { name: 'location' },
  { name: 'images' },
]);

router.post('/', function (req: Request, res: Response, next) {
  cpUpload(req, res, (err: any) => {
    if (err) {
      console.log(err);
    } else {
      next(auth);
    }
  });
});
router.post('/', contentController.post);
router.get('/', contentController.get);

export default router;

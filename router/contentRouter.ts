/* eslint-disable @typescript-eslint/no-misused-promises */
import { contentController } from '../controllers';
import express, { Request, Response } from 'express';
import multer from 'multer';

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });
const cpUpload = upload.fields([
  { name: 'title' },
  { name: 'mainImageData' },
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
      next();
    }
  });
});

router.post('/', contentController.post);

router.get('/', contentController.get);

router.put('/', cpUpload, contentController.put);

router.delete('/', contentController.delete);

export default router;

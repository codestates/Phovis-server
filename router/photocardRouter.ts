/* eslint-disable @typescript-eslint/no-misused-promises */
import { photocardController } from '../controllers';
import express, { Request, Response } from 'express';
import multer from 'multer';
import * as auth from '../middleware/service/authorize';

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });
const cpUpload = upload.fields([{ name: 'image' }]);

router.post('/', function (req: Request, res: Response, next) {
  console.log('here');
  cpUpload(req, res, (err: any) => {
    if (err) {
      console.log(err);
    } else {
      next();
    }
  });
});

router.post('/', photocardController.post);

// router.get('/', photoCardController.get);

// router.put('/', cpUpload, photoCardController.put);

// router.delete('/', photoCardController.delete);

export default router;

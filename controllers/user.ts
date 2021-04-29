import { Request, Response } from 'express';
import axios from 'axios';
import { getRepository } from 'typeorm';
import jwt from 'jsonwebtoken';

// TODO:
class userController {
  // user Controller
  public getinfo = async (req: Request, res: Response): Promise<void> => {
    const { authorization } = req.headers;
    if (!authorization) {
      res.status(403).send('not authorize');
    } else {
      const token = authorization.split(' ')[1];
    }
  };
}

export default new userController();

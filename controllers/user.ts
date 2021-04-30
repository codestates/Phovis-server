import { Request, Response } from 'express';
import axios from 'axios';
import { getRepository } from 'typeorm';
import jwt from 'jsonwebtoken';
import { User } from '@entity/User';
import { userRouter } from 'router';

// TODO:
class userController {
  // user Controller
  public getinfo = async (req: Request, res: Response): Promise<void> => {
    const { authorization } = req.headers;
    if (!authorization) {
      res.status(403).send('not authorize');
    } else {
      try {
        const token = authorization.split(' ')[1];
        if (authorization.split(' ')[0] !== 'Bearer') {
          res.status(401).send('token error').end();
          throw 'token error';
        }
        const response = jwt.verify(
          token,
          process.env.ACCESS_SECRET as string
        ) as { id: string };
        const user = await getRepository(User)
          .createQueryBuilder('user')
          .select(['user.userName', 'user.email', 'user.imgUrl', 'user.type'])
          .where('user.id = :id', { id: response.id })
          .getOne();
        if (user) {
          res.status(200).send({ ...user });
        } else {
          res.status(404).send('not found user');
        }
      } catch (e) {
        throw e;
      }
    }
  };

  public updateInfo = async (req: Request, res: Response): Promise<void> => {
    const { authorization } = req.headers;
    if (!authorization) {
      res.status(403).send('not authorize');
    } else {
      try {
        const token = authorization.split(' ')[1];
        if (authorization.split(' ')[0] !== 'Bearer') {
          res.status(401).send('token error').end();
          throw 'token error';
        }
        const { userName, img } = req.body;
        if (!userName && !img) {
          res
            .status(400)
            .send({ message: 'fill body data (userName or img)' })
            .end();
        }
        // img 처리 과정
        const response = jwt.verify(
          token,
          process.env.ACCESS_SECRET as string
        ) as User;
        userName &&
          (await getRepository(User)
            .createQueryBuilder()
            .update({
              userName,
            })
            .where('user.id = :id', { id: response.id })
            .execute());
        img &&
          (await getRepository(User)
            .createQueryBuilder()
            .update({
              imgUrl: img,
            })
            .where('user.id = :id', { id: response.id })
            .execute());
        res.status(200).send({ message: 'ok' });
      } catch (e) {
        res.status(403).send({ message: 'input error' });
        throw e;
      }
    }
  };
}

export default new userController();

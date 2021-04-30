import { Request, Response } from 'express';
import axios from 'axios';
import { getRepository } from 'typeorm';
import jwt from 'jsonwebtoken';
import { User } from '@entity/User';

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
        console.log(response);
        const user = await getRepository(User)
          .createQueryBuilder('user')
          .select(['user.userName', 'user.email', 'user.imgUrl', 'user.type'])
          .where('user.id = :id', { id: response.id })
          .getOne();
        console.log(user);
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
}

export default new userController();

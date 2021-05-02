import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { User } from '@entity/User';

// TODO:
class userController {
  // user Controller
  public getinfo = async (req: Request, res: Response): Promise<void> => {
    const { checkedId } = req;
    if (!checkedId) {
      res.status(403).send('not authorized');
    } else {
      try {
        const user = await getRepository(User)
          .createQueryBuilder('user')
          .select(['user.userName', 'user.email', 'user.imgUrl', 'user.type'])
          .where('user.id = :id', { id: checkedId })
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
}

export default new userController();

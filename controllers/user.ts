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

  public updateInfo = async (req: Request, res: Response): Promise<void> => {
    const { checkedId } = req;
    if (!checkedId) {
      res.status(403).send('not authorize');
    } else {
      try {
        const { userName, img } = req.body;
        if (!userName && !img) {
          res
            .status(400)
            .send({ message: 'fill body data (userName or img)' })
            .end();
        }
        // img 처리 과정
        userName &&
          (await getRepository(User)
            .createQueryBuilder()
            .update({
              userName,
            })
            .where('user.id = :id', { id: checkedId })
            .execute());
        img &&
          (await getRepository(User)
            .createQueryBuilder()
            .update({
              imgUrl: img,
            })
            .where('user.id = :id', { id: checkedId })
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

import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { updateUserInfoResult } from '@interface/index';
import { User } from '@entity/User';
import { Content } from '@entity/Content';
import { uploadToS3 } from '@middleware/service/aws_sdk';

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
          .select([
            'user.id',
            'user.userName',
            'user.email',
            'user.imgUrl',
            'user.type',
          ])
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
        const image = req.file as any;
        const { userName } = req.body;

        const profileImg = image
          ? await uploadToS3(image)
          : 'https://phovisimgs.s3.ap-northeast-2.amazonaws.com/blank-profile-picture-973460_1280-300x300-1.jpg';
        if (!userName) {
          res.status(400).send({ message: 'fill body data userName' }).end();
        }

        // profileImg  처리 과정
        userName &&
          (await getRepository(User)
            .createQueryBuilder()
            .update({
              userName,
            })
            .where('user.id = :id', { id: checkedId })
            .execute());

        profileImg &&
          (await getRepository(User)
            .createQueryBuilder()
            .update({
              imgUrl: profileImg,
            })
            .where('user.id = :id', { id: checkedId })
            .execute());

        res.status(200).send({ profileImg, userId: checkedId, userName });
      } catch (e) {
        res.status(403).send({ message: 'input error' });
        throw e;
      }
    }
  };
  public likeContent = async (req: Request, res: Response): Promise<void> => {
    const { checkedId } = req;
    if (!checkedId) {
      res.status(403).send('not authorize');
    } else {
      const contentId = req.body.id;
      if (!contentId) {
        res.status(400).send('Fill content ID');
      }
      try {
        const userRepo = await getRepository(User);
        const contentRepo = await getRepository(Content);
        const content = await contentRepo.findOne({ id: contentId });
        const user = await userRepo.findOne({
          relations: ['favourite'],
          where: { id: checkedId },
        });
        if (user && content) {
          const leftFavor = user.favourite.filter(
            (list) => list.id !== contentId
          );
          const isLike = leftFavor.length === user.favourite.length;
          user.favourite = isLike ? [...leftFavor, content] : [...leftFavor];
          userRepo.save(user);
          res.status(201).send({ isLike });
        } else {
          res.status(400).send('bad request');
        }
      } catch (e) {
        console.log(e.message);
        res.status(400).send('bad request');
      }
    }
  };
}

export default new userController();

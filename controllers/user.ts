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
      const { id } = req.query as { id: string | undefined };
      const userRepo = await getRepository(User);
      try {
        if (id !== undefined) {
          const user = await userRepo.findOne(id, {
            select: ['userName', 'imgUrl'],
          });
          res.status(200).send({ ...user });
        } else {
          const user = await userRepo.findOne(checkedId, {
            select: ['id', 'userName', 'email', 'imgUrl', 'type'],
          });
          if (user) {
            const { id, userName, email, imgUrl, type } = user;
            res
              .status(200)
              .send({ id, userName, email, profileImg: imgUrl, type });
          } else {
            res.status(404).send('not found user');
          }
        }
      } catch (e) {
        res.status(404).send('not found user');
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
        const content = await contentRepo.findOne(contentId, {
          relations: ['favourite'],
        });
        const user = await userRepo.findOne(checkedId, {
          relations: ['favourite'],
        });
        if (user && content) {
          const leftFavor = user.favourite.filter(
            (list) => list.id !== contentId
          );
          const leftIsFavorUser = content.favourite.filter(
            (list) => list.id !== checkedId
          );
          const isLike = leftFavor.length === user.favourite.length;
          user.favourite = isLike ? [...leftFavor, content] : [...leftFavor];
          content.favourite = isLike
            ? [...leftIsFavorUser, user]
            : [...leftIsFavorUser];
          userRepo.save(user);
          contentRepo.save(content);
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
  public bookmarkContent = async (
    req: Request,
    res: Response
  ): Promise<void> => {
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
        const user = await userRepo.findOne(checkedId, {
          relations: ['bookmark'],
        });
        const content = await contentRepo.findOne(contentId, {
          relations: ['bookmark'],
        });

        if (user && content) {
          const leftBookmarks = user.bookmark.filter(
            (list) => list.id !== contentId
          );
          const leftIsBookmarkUser = content.bookmark.filter(
            (list) => list.id !== checkedId
          );
          const isBookmark = leftBookmarks.length === user.bookmark.length;
          user.bookmark = isBookmark
            ? [...leftBookmarks, content]
            : [...leftBookmarks];
          content.bookmark = isBookmark
            ? [...leftIsBookmarkUser, user]
            : [...leftIsBookmarkUser];
          userRepo.save(user);
          contentRepo.save(content);
          res.status(201).send({ isBookmark });
        } else {
          res.status(400).send('bad request');
        }
      } catch (e) {
        console.log(e);
        res.status(400).send('bad request');
      }
    }
  };

  public followUser = async (req: Request, res: Response): Promise<void> => {
    const { checkedId } = req;
    if (!checkedId) {
      res.status(403).send('not authorize');
    } else {
      const userId = req.body.id;
      if (!userId) {
        res.status(400).send('Fill user ID');
      }
      try {
        const userRepo = await getRepository(User);
        const follower = await userRepo.findOne(checkedId, {
          relations: ['following'],
        });
        const followee = await userRepo.findOne(userId, {
          relations: ['follower'],
        });
        if (follower && followee) {
          const leftFollowee = follower.following.filter(
            (list) => list.id !== userId
          );
          const leftFollower = followee.follower.filter(
            (list) => list.id !== checkedId
          );
          const isFollow = leftFollowee.length === follower.following.length;
          follower.following = isFollow
            ? [...leftFollowee, followee]
            : [...leftFollowee];

          followee.follower = isFollow
            ? [...leftFollower, follower]
            : [...leftFollower];

          userRepo.save(follower);
          userRepo.save(followee);
          res.status(201).send({ isFollow });
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

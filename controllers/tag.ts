import { Content } from '@entity/Content';
import { Tag } from '@entity/Tag';
import { Request, Response } from 'express';
import { getRepository } from 'typeorm';

class tagController {
  public get = async (req: Request, res: Response) => {
    try {
      const result = await getRepository(Content)
        .createQueryBuilder('content')
        .select(['tag.tagName'])
        .addSelect('COUNT(*)', 'count')
        .innerJoin('content.tag', 'tag')
        .groupBy('tag.tagName')
        .orderBy('count', 'DESC')
        .limit(Number(req.query.maxnum) || 5)
        .execute();

      for (let i = 0; i < result.length; i++) {
        const { tag_tagName, count, ...rest } = result[i];
        result[i] = {
          ...rest,
          tag: tag_tagName,
          count,
        };
      }

      res.status(200).send(result).end();
    } catch (err) {
      console.log(err);
      res.status(400).send({ message: 'Bad request' }).end();
    }
  };
}

export default new tagController();

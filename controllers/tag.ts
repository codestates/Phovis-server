import { Content } from '@entity/Content';
import { Tag } from '@entity/Tag';
import { Request, Response } from 'express';
import { getRepository } from 'typeorm';

class tagController {
  public get = async (req: Request, res: Response) => {
    const result = await getRepository(Content)
      .createQueryBuilder('content')
      .select(['tag.tagName'])
      .addSelect('COUNT(*)', 'count')
      .innerJoin('content.tag', 'tag')
      .groupBy('tag.tagName')
      .orderBy('count', 'DESC')
      .take(Number(req.query.maxnum) || 5)
      .execute();
    console.log('here', Number(req.query.maxnum));

    for (let i = 0; i < result.length; i++) {
      const { tag_tagName, count, ...rest } = result[i];
      result[i] = {
        ...rest,
        tag: tag_tagName,
        count,
      };
    }

    res.status(200).send(result);
  };
}

export default new tagController();

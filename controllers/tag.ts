import { Content } from '@entity/Content';
import { Tag } from '@entity/Tag';
import { Request, Response } from 'express';
import { getRepository } from 'typeorm';

class tagController {
  public get = async (req: Request, res: Response) => {
    const result = await getRepository(Content)
      .createQueryBuilder('content')
      .select('tag.tagName')
      .addSelect('COUNT(*)', 'count')
      .innerJoin('content.tag', 'tag')
      .groupBy('tag.tagName')
      .orderBy('count', 'DESC')
      .limit(10)
      .execute();

    res.status(200).send(result);
  };
}

export default new tagController();

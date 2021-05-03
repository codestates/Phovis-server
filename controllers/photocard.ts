import { Content } from '@entity/Content';
import { Imagecard } from '@entity/Imagcard';
import { User } from '@entity/User';
import { contentfile } from '@interface/types';
import { Request, Response } from 'express';
import { uploadToS3 } from 'src/aws_sdk';
import { insertdb, CreateRelation } from 'src/DBfunctionCollections';
import { getRepository } from 'typeorm';

class photoCardController {
  public post = async (req: Request, res: Response) => {
    if (!req.checkedId) res.status(401).send({ message: 'unauthorized' }).end();
    if (!req.query.contentId) {
      res.status(400).send({ message: 'Bad Request' }).end();
    }

    const id = req.checkedId || '';
    const { image } = req.body;
    const { image: imageData } = req.files as contentfile;

    let description = JSON.parse(image);

    let uri = await uploadToS3(imageData as Express.Multer.File);

    const imageUrl = {
      uri,
      name: imageData!.originalname,
    };

    const { identifiers: photocardId } = await insertdb(Imagecard, {
      description,
    });

    const { identifiers: imageId } = await insertdb(Image, {
      uri: imageUrl.uri,
      type: 'imgCard',
    });

    await CreateRelation(Imagecard, 'image', imageId, photocardId, 'O');
    await CreateRelation(User, 'imagecards', id, photocardId, 'O');

    const result = await getRepository(Content)
      .createQueryBuilder('content')
      .addSelect('location')
      .addSelect('tag')
      .innerJoin('content.tag', 'tag')
      .innerJoin('content.location', 'location')
      .where('content.id = :id', { id: req.query.contentId })
      .getMany();

    console.log(result);
    res.status(200).send({ message: 'ok' });
  };
}

export default new photoCardController();

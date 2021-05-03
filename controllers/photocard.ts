import { User, Content, Imagecard, Image, Location } from '@entity/index';
import { contentfile, photocardres } from '@interface/types';
import { Request, Response } from 'express';
import { uploadToS3 } from '../middleware/service/aws_sdk';
import { insertdb, CreateRelation } from 'src/DBfunctionCollections';
import { getRepository } from 'typeorm';

class photocardController {
  public post = async (req: Request, res: Response) => {
    if (!req.checkedId) res.status(401).send({ message: 'unauthorized' }).end();
    if (!req.query.contentId) {
      res.status(400).send({ message: 'Bad Request' }).end();
    }

    try {
      const id = req.checkedId || '';
      const { image } = req.body;
      const { image: imageData } = req.files as contentfile;

      let { description } = JSON.parse(image);

      let uri = imageData ? await uploadToS3(imageData[0]) : '';

      const imageUrl = {
        uri,
        name: imageData![0].originalname,
      };

      const { identifiers: photocardId } = await insertdb(Imagecard, {
        description,
      });

      const { identifiers: imageId } = await insertdb(Image, {
        uri: imageUrl.uri,
        type: 'imgCard',
      });

      await CreateRelation(Imagecard, 'image', photocardId, imageId, 'O');
      await CreateRelation(User, 'imagecards', id, photocardId, 'M');

      const result = await getRepository(Content)
        .createQueryBuilder('content')
        .addSelect('tag.tagName')
        .innerJoin('content.tag', 'tag')
        .where('content.id = :id', { id: req.query.contentId })
        .getMany();

      const imageinfo = await getRepository(Image)
        .createQueryBuilder('image')
        .select('image.uri')
        .where('image.id = :id', { id: imageId[0].id })
        .getOne();

      const photocard = await getRepository(Imagecard)
        .createQueryBuilder('imagecard')
        .select('imagecard.description')
        .where('imagecard.id = :id', { id: photocardId[0].id })
        .getOne();

      const locationinfo = await getRepository(Location)
        .createQueryBuilder('location')
        .addSelect(['location.location', 'location.lat', 'location.lng'])
        .innerJoinAndSelect('location.content', 'content', 'content.id = :id', {
          id: req.query.contentId,
        })
        .getOne();

      if (imageinfo && photocard && locationinfo) {
        const { id, uri } = imageinfo;
        const { id: photocardId, description } = photocard;
        const { tag } = result[0];
        const tags = tag.map((el) => el.tagName);
        const { location, lat, lng } = locationinfo;
        const returndata = {
          url: uri,
          photocardId,
          imageId: id,
          description,
          location: {
            location,
            lat,
            lng,
          },
          tag: tags,
        };

        res.status(200).send({ ...returndata });
      } else {
        throw 'not content';
      }
    } catch (err) {
      console.log(err);
      res.status(400).send({ message: 'Bad request' });
    }
  };
}

export default new photocardController();

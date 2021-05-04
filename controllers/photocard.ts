import { User, Content, Imagecard, Image, Location, Tag } from '@entity/index';
import { contentfile, photocardres } from '@interface/types';
import { Request, Response } from 'express';
import { uploadToS3 } from '../middleware/service/aws_sdk';
import { insertdb, CreateRelation } from 'src/DBfunctionCollections';
import { getRepository } from 'typeorm';
import axios from 'axios';

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

      await CreateRelation(User, 'imagecards', id, photocardId[0], 'M');
      await CreateRelation(Imagecard, 'image', photocardId[0], imageId[0], 'O');

      const result = (await getRepository(Content)
        .createQueryBuilder('content')
        .addSelect('tag')
        .innerJoin('content.tag', 'tag')
        .where('content.id = :id', { id: req.query.contentId })
        .getMany()) as any;

      const imageinfo = await getRepository(Image)
        .createQueryBuilder('image')
        .select('image.uri')
        .where('image.id = :id', { id: imageId[0].id })
        .getOne();

      const photocard = await getRepository(Imagecard)
        .createQueryBuilder('imagecard')
        .select(['imagecard.description', 'imagecard.id'])
        .where('imagecard.id = :id', { id: photocardId[0].id })
        .getOne();

      const locationinfo = await getRepository(Location)
        .createQueryBuilder('location')
        .addSelect(['location.location', 'location.lat', 'location.lng'])
        .innerJoinAndSelect('location.content', 'content', 'content.id = :id', {
          id: req.query.contentId,
        })
        .getOne();

      if (locationinfo) {
        await CreateRelation(
          Imagecard,
          'location',
          photocardId,
          locationinfo.id,
          'O'
        );

        for (let idx = 0; idx < result[0].tag.length; idx++) {
          await CreateRelation(
            Imagecard,
            'tag',
            photocardId,
            result[0].tag[idx].id,
            'M'
          );
        }
      }

      if (imageinfo && photocard && locationinfo) {
        const { id, uri } = imageinfo;
        const { id: photocardId, description } = photocard;
        const { tag } = result[0];
        const tags = tag.map((el: any) => el.tagName);
        const { location, lat, lng } = locationinfo;
        const returndata = {
          id: photocardId,
          imageurl: uri,
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

  public get = async (req: Request, res: Response) => {
    if (req.query.contentId) {
      // const result = (await getRepository(Content)
      //   .createQueryBuilder('content')
      //   .innerJoin('content.tag', 'tag')
      //   .where('content.id = :id', { id: req.query.contentId })
      //   .getOne()) as any;

      const result = (await getRepository(Content).find({
        relations: ['tag', 'tag.imagecard'],
        where: { id: req.query.contentId },
      })) as any;

      const findkeys = [] as string[];

      if (result[0].tag) {
        for (let i = 0; i < result[0].tag.length; i++) {
          result[0].tag[i].imagecard.forEach((el: Imagecard) =>
            findkeys.push(el.id)
          );
        }
      }

      const imagecard = await getRepository(Imagecard)
        .createQueryBuilder('imagecard')
        .select(['imagecard.description', 'imagecard.id'])
        .addSelect('tags.tagName')
        .addSelect('images.uri')
        .addSelect(['locations.location', 'locations.lat', 'locations.lng'])
        .innerJoin('imagecard.location', 'locations')
        .innerJoin('imagecard.tag', 'tags')
        .innerJoin('imagecard.image', 'images')
        .where('imagecard.id IN (:...id)', { id: findkeys })
        .getMany();

      const resBody = imagecard.map((ele) => {
        const { image, ...rest } = ele;
        return {
          ...rest,
          tag: ele.tag.map((el) => el.tagName),
          imageurl: ele.image.uri,
        };
      });

      res.status(200).send({ data: resBody });
    } else if (Number(req.query.random) === 1) {
      const tags = (await axios.get('https://localhost:4000/tag')) as any;

      const tag = tags.data.map((el: any) => el.tag_tagName);

      const imagecard = await getRepository(Imagecard)
        .createQueryBuilder('imagecard')
        .select(['imagecard.description', 'imagecard.id'])
        .addSelect('tags.tagName')
        .addSelect('images.uri')
        .addSelect(['locations.location', 'locations.lat', 'locations.lng'])
        .innerJoin('imagecard.location', 'locations')
        .innerJoin('imagecard.tag', 'tags')
        .innerJoin('imagecard.image', 'images')
        .where('tags.tagName IN (:...tagName)', { tagName: tag })
        .getMany();

      const resBody = imagecard.map((ele) => {
        const { image, ...rest } = ele;
        return {
          ...rest,
          tag: ele.tag.map((el) => el.tagName),
          imageurl: ele.image.uri,
        };
      });

      res.status(200).send({ data: resBody });
    }
  };
}

export default new photocardController();

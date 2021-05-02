import e, { Request, Response } from 'express';
import axios from 'axios';
import connection, {
  createConnection,
  Entity,
  Generated,
  getConnection,
  getManager,
  getRepository,
  getTreeRepository,
  InsertResult,
} from 'typeorm';
import {
  Content,
  ContentCard,
  Image,
  Location,
  Tag,
  User,
} from '@entity/index';
import jwt from 'jsonwebtoken';
import { content, JWT } from '../interface/index';
import {
  transformInstance,
  insertdb,
  CreateRelation,
} from 'src/functionCollections';

class contentController {
  public post = async (req: Request, res: Response): Promise<void> => {
    if (req.headers.authorization) {
      try {
        const { id } = jwt.verify(
          req.headers.authorization,
          process.env.ACCESS_SCERET as string
        ) as JWT;

        const {
          title,
          mainimageUrl,
          tags,
          description,
          location,
          images,
        }: content = req.body;

        const jointags = await getRepository(Tag)
          .createQueryBuilder('tag')
          .where('tag.tagName IN (:...tagName)', { tagName: tags })
          .getMany();

        // tags에 담겨전달 받는 모든 tag 정보가 db에 있는지 확인
        if (tags.length !== jointags.length) {
          tags.forEach(async (NeedTag) => {
            const existTags = jointags.map((existTag) => existTag.tagName);
            //없는 tag DB에 넣어주기
            if (existTags.indexOf(NeedTag) === -1) {
              const { generatedMaps } = await insertdb(Tag, {
                tagName: NeedTag,
              });
              generatedMaps.forEach((NeedTag) => jointags.push(NeedTag as Tag));
            }
          });
        }

        const { identifiers: mainimageid } = await insertdb(Image, {
          uri: mainimageUrl,
          type: 'content',
        });

        const { lat, lng, ...rest } = location;
        const { identifiers: locationid } = await insertdb(Location, {
          lat,
          lng,
          location: rest.location,
        });

        let { identifiers: contentid } = await insertdb(Content, {
          title,
          description,
        });

        images.forEach(async (el) => {
          try {
            let { identifiers: contentcard } = await insertdb(ContentCard, {
              description: el.description,
            });

            let { identifiers: image } = await insertdb(Image, {
              uri: el.uri,
              type: 'content',
            });

            await CreateRelation(
              ContentCard,
              'image',
              contentcard[0],
              image[0],
              'O'
            );
            await CreateRelation(
              Content,
              'contentCard',
              contentid[0],
              contentcard[0],
              'M'
            );
          } catch (err) {
            console.log(err);
          }
        });

        await CreateRelation(
          Content,
          'image',
          contentid[0],
          mainimageid[0],
          'O'
        );

        await CreateRelation(Content, 'user', contentid[0], id, 'O');
        const tagsid = jointags.map((el) => {
          return el.id;
        });

        for (let el of tagsid) {
          if (el) {
            await CreateRelation(Tag, 'location', el, locationid[0], 'M');
            await CreateRelation(Content, 'tag', contentid[0], el, 'M');
          }
        }
        type id = {
          id: string | number;
        };

        let result = await getRepository(Content)
          .createQueryBuilder('content')
          .select(['content.title', 'content.description'])
          .addSelect('user.userName')
          .addSelect('image.uri')
          .innerJoin('content.user', 'user')
          .innerJoin('content.image', 'image')
          .where('content.id = :id', { id: contentid[0].id })
          .getOne();

        let contantcards = await getRepository(ContentCard)
          .createQueryBuilder('contentCard')
          .select('contentCard.description')
          .addSelect('image.uri')
          .leftJoin('contentCard.image', 'image')
          .where('contentCard.content = :id', { id: contentid[0].id })
          .getMany();

        let tag = await getRepository(Content)
          .createQueryBuilder('content')
          .select('')
          .addSelect('tag.tagName')
          .innerJoin('content.tag', 'tag')
          .where('content.id = :id', { id: contentid[0].id })
          .getMany();

        let locations = await getRepository(Location)
          .createQueryBuilder('location')
          .select(['location.location', 'location.lat', 'location.lng'])
          .leftJoin('location.content', 'content')
          .where('location.id = :id', { id: locationid[0].id })
          .getOne();

        // 보내줘야할 객체 생성하기
        if (result && contantcards) {
          contantcards = contantcards.map((el) => {
            const { image, ...rest } = el;
            return { ...rest, uri: image.uri };
          }) as any[];
          const { user, image, ...rest } = result as any;
          let { tag: itag } = tag[0] as any;
          itag = itag.map((el: Tag) => el.tagName);
          result = {
            ...rest,
            userName: user.userName,
            mainimageUrl: image.uri,
            contentCard: contantcards,
            tag: [...itag],
            location: locations,
          };
        }

        res.status(201).send({ ...result });
      } catch (err) {
        console.log(err);
        res.status(400).send({ message: 'Bad Request' });
      }
    } else {
      res.status(401).end({ message: 'unauthorized' });
    }
  };

  public get = async (req: Request, res: Response): Promise<void> => {};
}

export default new contentController();

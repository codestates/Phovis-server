import { Request, Response } from 'express';
import { getRepository, ObjectLiteral } from 'typeorm';
import { Content, ContentCard, Image, Location, Tag } from '@entity/index';
import jwt from 'jsonwebtoken';
import {
  content,
  contentfile,
  JWT,
  ConvertImg,
  Locationtype,
  Imagetype,
} from '../interface/index';
import { insertdb, CreateRelation } from '../src/functionCollections';
import { uploadToS3 } from '../src/aws_sdk';

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
          tags,
          description,
          location,
          images,
        }: content = req.body;
        console.log(images);
        const { images: imageData } = req.files as contentfile;

        // json 데이터 변환
        const convetTags = JSON.parse(tags) as string[];
        const convertLocation = JSON.parse(location) as Locationtype;
        const convertImages = images.map((el) => {
          return JSON.parse(el) as Imagetype;
        });

        // image bucket에 먼저 써주기
        let imagesUrls: ConvertImg[] = [];
        if (imageData) {
          for (let i = 0; i < imageData.length; i++) {
            let uri = await uploadToS3(imageData[i]);
            imagesUrls[i] = {
              uri,
              name: imageData[i].originalname,
            };
          }
        }

        const jointags = await getRepository(Tag)
          .createQueryBuilder('tag')
          .where('tag.tagName IN (:...tagName)', { tagName: tags })
          .getMany();

        // tags에 담겨전달 받는 모든 tag 정보가 db에 있는지 확인
        console.log(convetTags);
        if (convetTags.length !== jointags.length) {
          convetTags.forEach(async (NeedTag) => {
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

        // db에 해당 데이터 넣는 과정
        const { identifiers: mainimageid } = await insertdb(Image, {
          uri: imagesUrls[0].uri,
          type: 'content',
        });

        const { lat, lng, ...rest } = convertLocation;
        const { identifiers: locationid } = await insertdb(Location, {
          lat,
          lng,
          location: rest.location,
        });

        let { identifiers: contentid } = await insertdb(Content, {
          title,
          description,
        });

        convertImages.forEach(async (el, idx) => {
          try {
            let { identifiers: contentcard } = await insertdb(ContentCard, {
              description: el.description,
            });

            let image: ObjectLiteral[];
            for (let i = 0; i < imagesUrls.length; i++) {
              // image name과 파일의 name 비교하여 데이터 추가
              if (imagesUrls[i].name === el.name) {
                let { identifiers } = await insertdb(Image, {
                  uri: imagesUrls[idx].uri,
                  type: 'content',
                });
                console.log(identifiers);
                image = identifiers;
              }
            }
            // 관계 설정과정
            await CreateRelation(
              ContentCard,
              'image',
              contentcard[0],
              image![0],
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
          .select(['content.id', 'content.title', 'content.description'])
          .addSelect(['user.id', 'user.userName'])
          .addSelect('image.uri')
          .innerJoin('content.user', 'user')
          .innerJoin('content.image', 'image')
          .where('content.id = :id', { id: contentid[0].id })
          .getOne();

        let contantcards = await getRepository(ContentCard)
          .createQueryBuilder('contentCard')
          .select(['contentCard.id', 'contentCard.description'])
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
            const { id, image, ...rest } = el;
            return { ...rest, uri: image.uri, contentCardId: id };
          }) as any[];
          const { id, user, image, ...rest } = result as any;
          let { tag: itag } = tag[0] as any;
          itag = itag.map((el: Tag) => el.tagName);
          result = {
            ...rest,
            contentId: id,
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
      res.status(401).send({ message: 'unauthorized' });
    }
  };

  public get = async (req: Request, res: Response): Promise<void> => {};
  // console.log(req.params);
  // if (req.params.id) {
  //   const contentid = req.params.id;

  //   let result = await getRepository(Content)
  //     .createQueryBuilder('content')
  //     .select(['content.title', 'content.description'])
  //     .addSelect('user.userName')
  //     .addSelect('image.uri')
  //     .innerJoin('content.user', 'user')
  //     .innerJoin('content.image', 'image')
  //     .where('content.id = :id', { id: contentid })
  //     .getOne();

  //   let contantcards = await getRepository(ContentCard)
  //     .createQueryBuilder('contentCard')
  //     .select('contentCard.description')
  //     .addSelect('image.uri')
  //     .leftJoin('contentCard.image', 'image')
  //     .where('contentCard.content = :id', { id: contentid })
  //     .getMany();

  //   let tag = await getRepository(Content)
  //     .createQueryBuilder('content')
  //     .select('')
  //     .addSelect('tag.tagName')
  //     .innerJoin('content.tag', 'tag')
  //     .where('content.id = :id', { id: contentid })
  //     .getMany();

  //   let locations = await getRepository(Location)
  //     .createQueryBuilder('location')
  //     .select(['location.location', 'location.lat', 'location.lng'])
  //     .leftJoin('location.content', 'content')
  //     .where('location.id = :id', { id: contentid })
  //     .getOne();

  //   // 보내줘야할 객체 생성하기
  //   if (result && contantcards) {
  //     contantcards = contantcards.map((el) => {
  //       const { image, ...rest } = el;
  //       return { ...rest, uri: image.uri };
  //     }) as any[];
  //     const { user, image, ...rest } = result as any;
  //     let { tag: itag } = tag[0] as any;
  //     itag = itag.map((el: Tag) => el.tagName);
  //     result = {
  //       ...rest,
  //       userName: user.userName,
  //       mainimageUrl: image.uri,
  //       contentCard: contantcards,
  //       tag: [...itag],
  //       location: locations,
  //     };
  //   }

  //   res.status(200).send({ result });
  // } else if (req.params.tag) {
  //   const tags = req.params.tag;

  //   const jointags = await getRepository(Tag)
  //     .createQueryBuilder('tag')
  //     .where('tag.tagName IN (:...tagName)', { tagName: tags })
  //     .getMany();

  //   let result = await getRepository(Content)
  //     .createQueryBuilder('content')
  //     .select(['content.title', 'content.description'])
  //     .addSelect('user.userName')
  //     .addSelect('image.uri')
  //     .innerJoin('content.user', 'user')
  //     .innerJoin('content.image', 'image')
  //     .where('content.tag IN (:...tag)', { tag: jointags })
  //     .getOne();

  //   console.log(result);

  // let contantcards = await getRepository(ContentCard)
  //   .createQueryBuilder('contentCard')
  //   .select('contentCard.description')
  //   .addSelect('image.uri')
  //   .leftJoin('contentCard.image', 'image')
  //   .where('contentCard.content = :id', { id: contentid })
  //   .getMany();

  // let tag = await getRepository(Content)
  //   .createQueryBuilder('content')
  //   .select('')
  //   .addSelect('tag.tagName')
  //   .innerJoin('content.tag', 'tag')
  //   .where('content.id = :id', { id: contentid })
  //   .getMany();

  // let locations = await getRepository(Location)
  //   .createQueryBuilder('location')
  //   .select(['location.location', 'location.lat', 'location.lng'])
  //   .leftJoin('location.content', 'content')
  //   .where('location.id = :id', { id: contentid })
  //   .getOne();

  // // 보내줘야할 객체 생성하기
  // if (result && contantcards) {
  //   contantcards = contantcards.map((el) => {
  //     const { image, ...rest } = el;
  //     return { ...rest, uri: image.uri };
  //   }) as any[];
  //   const { user, image, ...rest } = result as any;
  //   let { tag: itag } = tag[0] as any;
  //   itag = itag.map((el: Tag) => el.tagName);
  //   result = {
  //     ...rest,
  //     userName: user.userName,
  //     mainimageUrl: image.uri,
  //     contentCard: contantcards,
  //     tag: [...itag],
  //     location: locations,
  //   };
  // }
  //   } else if (req.params.name) {
  //   } else if (req.params.filter && req.params.userId) {
  //   }
  // };
}

export default new contentController();

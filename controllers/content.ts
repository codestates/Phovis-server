import { Request, Response } from 'express';
import { Brackets, getRepository, ObjectLiteral } from 'typeorm';
import {
  Content,
  ContentCard,
  Image,
  Location,
  Tag,
  User,
} from '@entity/index';
import {
  content,
  contentfile,
  ConvertImg,
  Locationtype,
  Imagetype,
  resultContent,
} from '../interface/index';
import { insertdb, CreateRelation } from '../src/DBfunctionCollections';
import { uploadToS3, deleteToS3 } from '../middleware/service/aws_sdk';
import {
  CreateResult,
  transfromContentResult,
} from '../middleware/service/content';

class contentController {
  public post = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.checkedId;

      const { title, tags, description, location, images }: content = req.body;

      const { images: imageData } = req.files as contentfile;

      // json 데이터 변환
      const convetTags = tags ? (JSON.parse(tags) as string[]) : [];
      const convertLocation = JSON.parse(location) as Locationtype;
      const convertImages = [];
      if (Array.isArray(images)) {
        images.forEach((el) => {
          convertImages.push(JSON.parse(el) as Imagetype);
        });
      } else {
        convertImages.push(JSON.parse(images));
      }

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
      });

      await CreateRelation(Content, 'image', contentid[0], mainimageid[0], 'O');

      await CreateRelation(
        Location,
        'content',
        locationid[0],
        contentid[0],
        'M'
      );

      await CreateRelation(Content, 'user', contentid[0], id!, 'O');
      const tagsid = jointags.map((el) => {
        return el.id;
      });

      for (let el of tagsid) {
        if (el) {
          await CreateRelation(Tag, 'location', el, locationid[0], 'M');
          await CreateRelation(Content, 'tag', contentid[0], el, 'M');
        }
      }

      let result = (await getRepository(Content)
        .createQueryBuilder('content')
        .select(['content.id', 'content.title', 'content.description'])
        .addSelect(['user.id', 'user.userName', 'user.imgUrl'])
        .addSelect('image.uri')
        .innerJoin('content.user', 'user')
        .innerJoin('content.image', 'image')
        .where('content.id = :id', { id: contentid[0].id })
        .getOne()) as Content;

      let contentCards = await getRepository(ContentCard)
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

      let locations = (await getRepository(Location)
        .createQueryBuilder('location')
        .select(['location.location', 'location.lat', 'location.lng'])
        .leftJoin('location.content', 'content')
        .where('location.id = :id', { id: locationid[0].id })
        .getOne()) as Location;

      //보내 줘야할 객체 생성
      result = transfromContentResult(result, contentCards, tag, locations);

      res.status(201).send({ ...result });
    } catch (err) {
      console.log(err);
      res.status(400).send({ message: 'Bad Request' });
    }
  };

  public get = async (req: Request, res: Response): Promise<void> => {
    const limit = Number(req.query.maxnum) || 1;
    if (req.query.id) {
      const contentid = req.query.id;
      try {
        let result = (await getRepository(Content)
          .createQueryBuilder('content')
          .select(['content.id', 'content.title', 'content.description'])
          .addSelect(['user.id', 'user.userName', 'user.imgUrl'])
          .addSelect('image.uri')
          .innerJoin('content.user', 'user')
          .innerJoin('content.image', 'image')
          .where('content.id = :id', { id: contentid })
          .getOne()) as any;

        if (!result) res.status(400).send({ message: 'Bad request' }).end();

        let contentCards = await getRepository(ContentCard)
          .createQueryBuilder('contentCard')
          .select(['contentCard.id', 'contentCard.description'])
          .addSelect('image.uri')
          .leftJoin('contentCard.image', 'image')
          .where('contentCard.content = :id', { id: contentid })
          .getMany();

        let tag = await getRepository(Content)
          .createQueryBuilder('content')
          .select('')
          .addSelect('tag.tagName')
          .innerJoin('content.tag', 'tag')
          .where('content.id = :id', { id: contentid })
          .getMany();

        let locations = (await getRepository(Location)
          .createQueryBuilder('location')
          .select(['location.location', 'location.lat', 'location.lng'])
          .leftJoinAndSelect(
            'location.content',
            'content',
            'content.id = :id',
            {
              id: contentid,
            }
          )
          .getOne()) as Location;

        const likeinfo = await getRepository(User)
          .createQueryBuilder('user')
          .innerJoin('user.favourite', 'favourite')
          .where('user.id = :userid', { userid: req.checkedId })
          .andWhere('favourite.id = :id', {
            id: contentid,
          })
          .getOne();

        const bookmark = await getRepository(User)
          .createQueryBuilder('user')
          .innerJoin('user.bookmark', 'bookmark')
          .where('bookmark.id = :id', {
            id: contentid,
          })
          .andWhere('user.id = :userid', { userid: req.checkedId })
          .getOne();

        result.islike = likeinfo ? true : false;
        result.isbookmark = bookmark ? true : false;

        //보내 줘야할 객체 생성
        result = transfromContentResult(result, contentCards, tag, locations);

        res.status(200).send({ result }).end();
      } catch (err) {
        console.log(err);
        res.status(400).send({ message: 'Bad Request' }).end();
      }
    } else if (req.query.tag) {
      const tag = req.query.tag as string;
      const tags = tag.split(',');

      let result = (await getRepository(Content)
        .createQueryBuilder('content')
        .select(['content.id', 'content.title', 'content.description'])
        .addSelect(['user.userName', 'user.id', 'user.imgUrl'])
        .addSelect('image.uri')
        .addSelect(['contentCard.description', 'contentCard.id'])
        .innerJoin('content.tag', 'tag')
        .innerJoin('content.user', 'user')
        .innerJoin('content.image', 'image')
        .innerJoin('content.contentCard', 'contentCard')
        .where('tag.tagName IN (:...tagName)', { tagName: [...tags] })
        .take(limit)
        .getMany()) as any;

      result = await CreateResult(result, req.checkedId as string);

      res.status(200).send({ maxnum: limit, data: result });
    } else if (req.query.filter || req.query.userId) {
      let result = [];
      if (!req.query.filter) {
        try {
          result = (await getRepository(Content)
            .createQueryBuilder('content')
            .select(['content.id', 'content.title', 'content.description'])
            .addSelect(['image.uri', 'image.id'])
            .addSelect(['contentCard.description', 'contentCard.id'])
            .addSelect(['users.id', 'users.userName', 'users.imgUrl'])
            .innerJoin('content.user', 'users')
            .innerJoin('content.image', 'image')
            .innerJoin('content.tag', 'tag')
            .innerJoin('content.contentCard', 'contentCard')
            .where('users.id = :id', { id: req.query.userId })
            .take(limit)
            .getMany()) as any;
        } catch (err) {
          console.log(err);
        }
      } else if (req.query.filter === 'bookmark') {
        result = (await getRepository(Content)
          .createQueryBuilder('content')
          .select(['content.id', 'content.title', 'content.description'])
          .addSelect(['image.uri', 'image.id'])
          .addSelect(['contentCard.description', 'contentCard.id'])
          .addSelect(['user.id', 'user.userName', 'user.imgUrl'])
          .innerJoin('content.user', 'user')
          .innerJoinAndSelect(
            'user.bookmark',
            'bookmark',
            'bookmark.user = :id',
            {
              id: req.query.userId,
            }
          )
          .innerJoin('content.image', 'image')
          .innerJoin('content.tag', 'tag')
          .innerJoin('content.contentCard', 'contentCard')
          .take(limit)
          .getMany()) as any;
      } else if (req.query.filter === 'like') {
        result = (await getRepository(Content)
          .createQueryBuilder('content')
          .select(['content.id', 'content.title', 'content.description'])
          .addSelect(['image.uri', 'image.id'])
          .addSelect(['contentCard.description', 'contentCard.id'])
          .addSelect(['user.id', 'user.userName', 'user.imgUrl'])
          .innerJoin('content.user', 'user')
          .innerJoinAndSelect(
            'user.favourite',
            'favourite',
            'favourite.user = :id',
            {
              id: req.query.userId,
            }
          )
          .innerJoin('content.image', 'image')
          .innerJoin('content.tag', 'tag')
          .innerJoin('content.contentCard', 'contentCard')
          .take(limit)
          .getMany()) as any;
      }
      if (!result) res.status(400).send({ message: 'Bad Request' }).end();
      result = (await CreateResult(result)) as Promise<resultContent>[];
      res.status(200).send(result).end();
    }
  };

  public put = async (req: Request, res: Response): Promise<void> => {
    if (req.query.contentid) {
      const id = req.checkedId;
      try {
        const {
          title,
          tags,
          description,
          location,
          images,
        }: content = req.body;
        const { images: imageData } = req.files as contentfile;

        // json 데이터 변환
        const convetTags = JSON.parse(tags) as string[];
        const convertLocation = JSON.parse(location) as Locationtype;
        let convertImages = [];
        if (Array.isArray(images)) {
          convertImages = images.map((el) => {
            return JSON.parse(el) as Imagetype;
          });
        } else {
          convertImages.push(JSON.parse(images));
        }

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
            res.status(400).send({ message: 'Bad request' });
          }
        });

        await CreateRelation(
          Content,
          'image',
          contentid[0],
          mainimageid[0],
          'O'
        );

        await CreateRelation(
          Location,
          'content',
          locationid[0],
          contentid[0],
          'M'
        );

        await CreateRelation(Content, 'user', contentid[0], id!, 'O');
        const tagsid = jointags.map((el) => {
          return el.id;
        });

        for (let el of tagsid) {
          if (el) {
            await CreateRelation(Tag, 'location', el, locationid[0], 'M');
            await CreateRelation(Content, 'tag', contentid[0], el, 'M');
          }
        }

        let result = (await getRepository(Content)
          .createQueryBuilder('content')
          .select(['content.id', 'content.title', 'content.description'])
          .addSelect(['user.id', 'user.userName', 'user.imgUrl'])
          .addSelect('image.uri')
          .innerJoin('content.user', 'user')
          .innerJoin('content.image', 'image')
          .where('content.id = :id', { id: contentid[0].id })
          .getOne()) as Content;

        let contentCards = await getRepository(ContentCard)
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

        let locations = (await getRepository(Location)
          .createQueryBuilder('location')
          .select(['location.location', 'location.lat', 'location.lng'])
          .leftJoin('location.content', 'content')
          .where('location.id = :id', { id: locationid[0].id })
          .getOne()) as Location;

        //보내 줘야할 객체 생성
        result = transfromContentResult(result, contentCards, tag, locations);

        //기존 데이터 삭제 버킷 이미지 삭제
        const uris = await getRepository(ContentCard)
          .createQueryBuilder('contentCard')
          .select('contentCard.id')
          .addSelect('image.uri')
          .innerJoin('contentCard.image', 'image')
          .where('contentCard.contentId = :id', { id: req.query.contentid })
          .getMany();

        for (let idx = 0; idx < uris.length; idx++) {
          deleteToS3(uris[idx].image.uri);
        }

        await getRepository(Content)
          .createQueryBuilder()
          .delete()
          .from(Content)
          .where('id = :id', { id: req.query.contentid })
          .execute();

        res
          .status(201)
          .send({ ...result })
          .end();
      } catch (err) {
        console.log(err);
        res.status(400).send({ message: 'Bad request' }).end();
      }
    } else {
      res.status(400).send({ message: 'Bad request' }).end();
    }
  };

  public delete = async (req: Request, res: Response) => {
    try {
      const uris = await getRepository(ContentCard)
        .createQueryBuilder('contentCard')
        .select('contentCard.id')
        .addSelect('image.uri')
        .innerJoin('contentCard.image', 'image')
        .where('contentCard.contentId = :id', { id: req.query.contentid })
        .getMany();

      for (let idx = 0; idx < uris.length; idx++) {
        deleteToS3(uris[idx].image.uri);
      }

      await getRepository(Content)
        .createQueryBuilder()
        .delete()
        .from(Content)
        .where('id = :id', { id: req.query.contentid })
        .execute();
    } catch (err) {
      res.status(400).send({ message: 'Bad Request' });
    }
    res.status(205).send({ message: 'ok' });
  };
}

export default new contentController();

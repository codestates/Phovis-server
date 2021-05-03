import { Request, Response } from 'express';
import { getRepository, ObjectLiteral } from 'typeorm';
import { Content, ContentCard, Image, Location, Tag } from '@entity/index';
import {
  content,
  contentfile,
  ConvertImg,
  Locationtype,
  Imagetype,
  resultContent,
} from '../interface/index';
import { insertdb, CreateRelation } from '../src/functionCollections';
import { uploadToS3, deleteToS3 } from '../middleware/service/aws_sdk';
import { CreateResult } from '../middleware/service/content';

class contentController {
  public post = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.checkedId;
      console.log(id);
      const { title, tags, description, location, images }: content = req.body;
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
        }
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

      let result = await getRepository(Content)
        .createQueryBuilder('content')
        .select(['content.id', 'content.title', 'content.description'])
        .addSelect(['user.id', 'user.userName', 'user.imgUrl'])
        .addSelect('image.uri')
        .innerJoin('content.user', 'user')
        .innerJoin('content.image', 'image')
        .where('content.id = :id', { id: contentid[0].id })
        .getOne();

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

      let locations = await getRepository(Location)
        .createQueryBuilder('location')
        .select(['location.location', 'location.lat', 'location.lng'])
        .leftJoin('location.content', 'content')
        .where('location.id = :id', { id: locationid[0].id })
        .getOne();

      // 보내줘야할 객체 생성하기
      if (result && contentCards) {
        contentCards = contentCards.map((el) => {
          const { image, ...rest } = el;
          return { ...rest, uri: image.uri };
        }) as any[];
        const { user, image, ...rest } = result as any;
        let itag: any[];
        if (tag.length !== 0) {
          let { tag: tags } = tag[0] as any;
          console.log(tags);
          itag = tags.map((el: Tag) => el.tagName);
          rest.tag = [...itag];
        }

        result = {
          ...rest,
          user: {
            userName: user.userName,
            id: user.id,
            profileImg: user.imgUrl,
          },
          mainimageUrl: image.uri,
          images: contentCards,
          location: locations,
        };
      }

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
        let result = await getRepository(Content)
          .createQueryBuilder('content')
          .select(['content.id', 'content.title', 'content.description'])
          .addSelect(['user.id', 'user.userName', 'user.imgUrl'])
          .addSelect('image.uri')
          .innerJoin('content.user', 'user')
          .innerJoin('content.image', 'image')
          .where('content.id = :id', { id: contentid })
          .getOne();

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

        let locations = await getRepository(Location)
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
          .getOne();

        // 보내줘야할 객체 생성하기
        if (result && contentCards) {
          contentCards = contentCards.map((el) => {
            const { image, ...rest } = el;
            return { ...rest, uri: image.uri };
          }) as any[];
          const { user, image, ...rest } = result as any;
          let itag: any[];
          if (tag.length !== 0) {
            let { tag: tags } = tag[0] as any;
            itag = tags.map((el: Tag) => el.tagName);
            rest.tag = [...itag];
          }
          const { content, ...locationinfo } = locations as Location;
          result = {
            ...rest,
            user: {
              userName: user.userName,
              id: user.id,
              profileImg: user.imgUrl,
            },
            mainimageUrl: image.uri,
            images: contentCards,
            location: locationinfo,
          };
        }

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
        .innerJoinAndSelect(
          'content.tag',
          'tag',
          'tag.tagName In (:...tagName)',
          { tagName: tags }
        )
        .innerJoin('content.user', 'user')
        .innerJoin('content.image', 'image')
        .innerJoin('content.contentCard', 'contentCard')
        .limit(limit as number)
        .getMany()) as any;

      result = await CreateResult(result);
      res.status(200).send({ maxnum: limit, data: result });
    } else if (req.query.filter || req.query.userId) {
      let result = [];
      if (!req.query.filter) {
        result = (await getRepository(Content)
          .createQueryBuilder('content')
          .select(['content.id', 'content.title', 'content.description'])
          .addSelect(['image.uri', 'image.id'])
          .addSelect(['contentCard.description', 'contentCard.id'])
          .addSelect(['user.id', 'user.userName', 'user.imgUrl'])
          .innerJoinAndSelect('content.user', 'user', 'user.id = :id', {
            id: req.query.userId,
          })
          .innerJoin('content.image', 'image')
          .innerJoinAndSelect('content.tag', 'tag')
          .innerJoin('content.contentCard', 'contentCard')
          .limit(limit)
          .getMany()) as any;
      } else if (req.query.filter === 'bookmark') {
        result = (await getRepository(Content)
          .createQueryBuilder('content')
          .select(['content.id', 'content.title', 'content.description'])
          .addSelect(['image.uri', 'image.id'])
          .addSelect(['contentCard.description', 'contentCard.id'])
          .addSelect(['user.id', 'user.userName', 'user.imgUrl'])
          .innerJoinAndSelect('content.user', 'user')
          .innerJoinAndSelect(
            'user.bookmark',
            'bookmark',
            'bookmark.user = :id',
            {
              id: req.query.userId,
            }
          )
          .innerJoin('content.image', 'image')
          .innerJoinAndSelect('content.tag', 'tag')
          .innerJoin('content.contentCard', 'contentCard')
          .limit(limit)
          .getMany()) as any;
      } else if (req.query.filter === 'like') {
        result = (await getRepository(Content)
          .createQueryBuilder('content')
          .select(['content.id', 'content.title', 'content.description'])
          .addSelect(['image.uri', 'image.id'])
          .addSelect(['contentCard.description', 'contentCard.id'])
          .addSelect(['user.id', 'user.userName', 'user.imgUrl'])
          .innerJoinAndSelect('content.user', 'user')
          .innerJoinAndSelect(
            'user.favourite',
            'favourite',
            'favourite.user = :id',
            {
              id: req.query.userId,
            }
          )
          .innerJoin('content.image', 'image')
          .innerJoinAndSelect('content.tag', 'tag')
          .innerJoin('content.contentCard', 'contentCard')
          .limit(limit)
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

        let result = await getRepository(Content)
          .createQueryBuilder('content')
          .select(['content.id', 'content.title', 'content.description'])
          .addSelect(['user.id', 'user.userName', 'user.imgUrl'])
          .addSelect('image.uri')
          .innerJoin('content.user', 'user')
          .innerJoin('content.image', 'image')
          .where('content.id = :id', { id: contentid[0].id })
          .getOne();

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

        let locations = await getRepository(Location)
          .createQueryBuilder('location')
          .select(['location.location', 'location.lat', 'location.lng'])
          .leftJoin('location.content', 'content')
          .where('location.id = :id', { id: locationid[0].id })
          .getOne();

        // 보내줘야할 객체 생성하기
        if (result && contentCards) {
          contentCards = contentCards.map((el) => {
            const { image, ...rest } = el;
            return { ...rest, uri: image.uri };
          }) as any[];
          const { user, image, ...rest } = result as any;
          let itag: any[];
          if (tag.length !== 0) {
            let { tag: tags } = tag[0] as any;
            itag = tags.map((el: Tag) => el.tagName);
            rest.tag = [...itag];
          }
          result = {
            ...rest,
            user: {
              userName: user.userName,
              id: user.id,
              profileImg: user.imgUrl,
            },
            mainimageUrl: image.uri,
            images: contentCards,
            location: locations,
          };
        }

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

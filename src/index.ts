import {
  makeRelation,
  insertJoinColumn,
  transformInstance,
} from './make_relation';
import { Group } from './relations';
import { getRepository, createConnection, getConnection } from 'typeorm';
import {
  ContentCardSeed,
  ContentSeed,
  UserSeed,
  ImageSeed,
  ImageCardSeed,
  LocationSeed,
  TagSeed,
} from './seed/index';
import {
  Content,
  ContentCard,
  Image,
  Imagecard,
  Location,
  Tag,
  User,
} from './entity';

const InsertSeedData = async () => {
  try {
    const connection = await createConnection();

    let contentcardinstance = transformInstance(ContentCardSeed, ContentCard);
    let imageinstance = transformInstance(ImageSeed, Image);
    let imagecardinstance = transformInstance(ImageCardSeed, Imagecard);
    let locationinsatance = transformInstance(LocationSeed, Location);
    let taginstance = transformInstance(TagSeed, Tag);
    let userinstance = transformInstance(UserSeed, User);
    let contentinstance = transformInstance(ContentSeed, Content);
    try {
      await insertJoinColumn(taginstance, 'location', locationinsatance);
      await insertJoinColumn(contentcardinstance, 'image', imageinstance);
      await insertJoinColumn(contentinstance, 'image', imageinstance);
      await insertJoinColumn(
        contentinstance,
        'contentCard',
        contentcardinstance
      );
      await insertJoinColumn(imagecardinstance, 'location', locationinsatance);
      await insertJoinColumn(imagecardinstance, 'image', imageinstance);
      console.log('시작 :', userinstance[0]);

      await insertJoinColumn(userinstance, 'content', contentinstance);
      console.log('시작 :', userinstance[0]);

      await insertJoinColumn(userinstance, 'imagecards', imagecardinstance);
      console.log('시작 :', userinstance[0]);

      let result: any[] = [];
      for (let i = 0; i < userinstance.length; i++) {
        result.unshift(userinstance[i]);
      }

      await insertJoinColumn(userinstance, 'follower', result);

      await insertJoinColumn(userinstance, 'bookmark', contentinstance);
      console.log('시작 :', userinstance[0]);

      await insertJoinColumn(userinstance, 'favourite', contentinstance);
      console.log('마지막 :', userinstance[0]);

      await connection.getRepository(Tag).save(taginstance);
      await connection.getRepository(Location).save(locationinsatance);
      await connection.getRepository(Image).save(imageinstance);
      await connection.getRepository(ContentCard).save(contentcardinstance);
      await connection.getRepository(User).save(userinstance);
      await connection.getRepository(Content).save(contentinstance);
      await connection.getRepository(Imagecard).save(imagecardinstance);
    } catch (err) {
      console.log(err.name, ' : ', err.message, err.lineNumber);
    }

    Group.forEach(
      async (el) => await makeRelation(el.entity, el.fields, connection)
    );
    console.log('make Seed check your database');
    await connection.close();
  } catch (err) {
    console.log(err);
  }
};

InsertSeedData();

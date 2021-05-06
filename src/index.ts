import {
  makeRelation,
  insertJoinColumn,
  transformInstance,
} from './DBfunctionCollections';
import { Group } from './relations';
import { getRepository, createConnection, getConnection } from 'typeorm';
import {
  ContentCardSeed,
  ContentSeed,
  UserSeed,
  contentImageSeed,
  photocardImageSeed,
  LocationSeed,
  contentTagSeed,
  ImageCardSeed,
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
  const connection = await createConnection();
  try {
    let contentinstance = transformInstance(ContentSeed, Content);
    let contentCardinstance = transformInstance(ContentCardSeed, ContentCard);
    let contentImageinstance = transformInstance(contentImageSeed, Image);
    let locationinsatance = transformInstance(LocationSeed, Location);
    let contentTaginstance = transformInstance(contentTagSeed, Tag);
    let userinstance = transformInstance(UserSeed, User);
    let photoCardinstance = transformInstance(ImageCardSeed, Imagecard);
    let photocardImageinstance = transformInstance(photocardImageSeed, Image);

    for (let i = 0; i < contentinstance.length; i++) {
      contentinstance[i].image = contentImageinstance[i][0];
      locationinsatance[i].content = locationinsatance[i].content || [];
      contentinstance[i].contentCard = contentinstance[i].contentCard || [];
      userinstance[i].content = userinstance[i].content || [];
      userinstance[i].favourite = userinstance[i].favourite || [];
      userinstance[i].bookmark = userinstance[i].bookmark || [];

      for (let j = 0; j < contentCardinstance[i].length; j++) {
        contentCardinstance[i][j] = {
          ...contentCardinstance[i][j],
          image: contentImageinstance[i][j],
        };

        contentinstance[i] = {
          ...contentinstance[i],
          contentCard: [
            ...contentinstance[i].contentCard,
            ...contentCardinstance[i][j],
          ],
        };
      }
      locationinsatance[i] = {
        ...locationinsatance[i],
        content: [...locationinsatance[i].content, ...contentinstance[i]],
      };

      userinstance[i] = {
        ...userinstance[i],
        content: [...userinstance[i].content, ...contentinstance[i]],
      };

      userinstance[i] = {
        ...userinstance[i],
        favourite:
          Math.floor(Math.random() * 30) % 2 === 1
            ? [...userinstance[i].favourite, ...contentinstance[i]]
            : [...userinstance[i].favourite],
      };
      userinstance[i] = {
        ...userinstance[i],
        bookmark:
          Math.floor(Math.random() * 30) % 2 === 1
            ? [...userinstance[i].bookmark, ...contentinstance[i]]
            : [...userinstance[i].bookmark],
      };
    }

    for (let i = 0; i < photoCardinstance.length; i++) {
      photoCardinstance[i] = {
        ...photoCardinstance[i],
        image: photocardImageinstance[i],
      };

      photoCardinstance[i] = {
        ...photoCardinstance[i],
        user: userinstance[i % 4],
      };

      photoCardinstance[i] = {
        ...photoCardinstance[i],
        location: locationinsatance[i % 4],
      };
    }

    for (let i = 0; i < contentTaginstance.length; i++) {
      const ci = Math.floor(Math.random() * 20) % 4;
      const imgi = Math.floor(Math.random() * 20) % 4;
      contentinstance[ci].tag = contentinstance[ci].tag || [];
      contentinstance[ci] = {
        ...contentinstance[ci],
        tag: [...contentinstance[ci].tag, ...contentTaginstance[i]],
      };
      contentTaginstance[i].location = contentTaginstance[i].location || [];
      contentTaginstance[i] = {
        ...contentTaginstance[i],
        location: [
          ...contentTaginstance[i].location,
          ...locationinsatance[Math.floor(Math.random() * 20) % 3],
        ],
      };
      contentTaginstance[i].content = contentTaginstance[i].content || [];

      contentTaginstance[i] = {
        ...contentTaginstance[i],
        content: [
          ...contentTaginstance[i].content,
          ...contentinstance[Math.floor(Math.random() * 20) % 3],
        ],
      };
      photoCardinstance[imgi].tag = photoCardinstance[imgi].tag || [];
      photoCardinstance[imgi] = {
        ...photoCardinstance[imgi],
        tag: [...photoCardinstance[imgi].tag, ...contentTaginstance[i]],
      };
      console.log(contentTaginstance[i].content);
    }
    for (let i = 0; i < 15; i++) {
      Array.isArray(contentCardinstance[i]) &&
        (await connection
          .getRepository(ContentCard)
          .save(contentCardinstance[i]));
      Array.isArray(contentImageinstance[i]) &&
        (await connection.getRepository(Image).save(contentImageinstance[i]));
    }
    await connection.getRepository(Image).save(photocardImageinstance);
    await connection.getRepository(Tag).save(contentTaginstance);
    await connection.getRepository(Location).save(locationinsatance);
    await connection.getRepository(User).save(userinstance);
    await connection.getRepository(Content).save(contentinstance);
    await connection.getRepository(Imagecard).save(photoCardinstance);

    console.log('make Seed! check your database');
  } catch (err) {
    console.log(err);
  }
  await connection.close();
};

InsertSeedData();

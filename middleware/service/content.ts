import { getRepository } from 'typeorm';
import { ContentCard, Location, User } from '@entity/index';
import { resultContent } from '../../interface/index';

export async function CreateResult(result: any[]) {
  for (let i = 0; i < result.length; i++) {
    for (let j = 0; j < result[i].contentCard.length; j++) {
      const tempContentCard = (await getRepository(ContentCard)
        .createQueryBuilder('contentCard')
        .select(['contentCard.description', 'contentCard.id'])
        .addSelect('image.uri')
        .leftJoin('contentCard.image', 'image')
        .where('contentCard.id = :id', {
          id: result[i].contentCard[j].id,
        })
        .getOne()) as any;

      let location = (await getRepository(Location)
        .createQueryBuilder('location')
        .select(['location.location', 'location.lat', 'location.lng'])
        .leftJoinAndSelect('location.content', 'content', 'content.id = :id', {
          id: result[i].id,
        })
        .getOne()) as any;

      let likes = (await getRepository(User)
        .createQueryBuilder('user')
        .innerJoinAndSelect('user.content', 'content', 'content.id = :id', {
          id: result[i].id,
        })
        .loadRelationCountAndMap('user.favouriteCount', 'user.favourite')
        .getOne()) as any;

      if (tempContentCard && location && likes) {
        const { image, ...rest1 } = tempContentCard;
        result[i].contentCard[j] = {
          ...rest1,
          uri: image.uri,
        };
        const { content, ...rest2 } = location;
        result[i].location = rest2;

        const { favouriteCount } = likes;
        result[i].likes = favouriteCount;
      }
    }
    if (result[i].tag.length !== 0) {
      for (let j = 0; j < result[i].tag.length; j++) {
        if (result[i].tag[j]) {
          const { tagName, ...rest } = result[i].tag[j];
          if (tagName) result[i].tag[j] = tagName as resultContent;
        }
      }
    }
    const { contentCard, image, ...rest } = result[i];
    const { id, userName, imgUrl } = result[i].user;
    result[i] = {
      ...rest,
      mainimageUrl: image.uri,
      images: contentCard,
      user: { id, userName, profileImg: imgUrl },
    } as resultContent;
  }
  return result as Promise<resultContent>[];
}

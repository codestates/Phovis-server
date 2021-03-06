import { getRepository } from 'typeorm';
import { ContentCard, Location, User, Content, Tag } from '@entity/index';
import { resultContent } from '../../interface/index';

export async function CreateResult(result: any, checkedid?: string | null) {
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

      let like = (await getRepository(User)
        .createQueryBuilder('user')
        .innerJoinAndSelect('user.content', 'content', 'content.id = :id', {
          id: result[i].id,
        })
        .loadRelationCountAndMap('user.favouriteCount', 'user.favourite')
        .getOne()) as any;

      if (tempContentCard && location && like) {
        const { image, ...rest1 } = tempContentCard;
        result[i].contentCard[j] = {
          ...rest1,
          uri: image.uri,
        };
        const { content, ...rest2 } = location;
        result[i].location = rest2;

        const { favouriteCount } = like;
        result[i].like = favouriteCount;
      }
    }
    if (result[i].tag) {
      for (let j = 0; j < result[i].tag.length; j++) {
        if (result[i].tag[j]) {
          const { tagName, ...rest } = result[i].tag[j];
          if (tagName) result[i].tag[j] = tagName as resultContent;
        }
      }
    }

    if (checkedid) {
      const likeinfo = await getRepository(User)
        .createQueryBuilder('user')
        .innerJoin('user.favourite', 'favourite')
        .where('user.id = :userid', { userid: checkedid })
        .andWhere('favourite.id = :id', {
          id: result[i].id,
        })
        .getOne();

      const bookmark = await getRepository(User)
        .createQueryBuilder('user')
        .innerJoin('user.bookmark', 'bookmark')
        .where('bookmark.id = :id', {
          id: result[i].id,
        })
        .andWhere('user.id = :userid', { userid: checkedid })
        .getOne();

      result[i].isLike = likeinfo ? true : false;
      result[i].isBookmark = bookmark ? true : false;
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

// ??????????????? ?????? ????????????
export const transfromContentResult = (
  result: Content,
  contentCards: ContentCard[],
  tag: Content[],
  locations: Location
) => {
  if (result && contentCards) {
    contentCards = contentCards.map((el) => {
      const { image, ...rest } = el;
      return { ...rest, imageurl: image.uri };
    }) as any[];
    const { user, image, ...rest } = result as any;
    let itag: any[];
    if (tag.length !== 0) {
      let { tag: tags } = tag[0] as any;
      itag = tags.map((el: Tag) => el.tagName);
      rest.tag = [...itag];
    }

    const { content, ...locationinfo } = locations as Location;
    return (result = {
      ...rest,
      user: {
        userName: user.userName,
        id: user.id,
        profileImg: user.imgUrl,
      },
      mainimageUrl: image.uri,
      images: contentCards,
      location: locationinfo,
    });
  }
};

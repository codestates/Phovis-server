import connection from 'typeorm';
import { Content, ContentCard, Imagecard, Location, Tag, User } from './entity';

interface Relation {
  entity: connection.EntityTarget<unknown>;
  fields: string[];
}

export const Group: Relation[] = [
  {
    entity: Content,
    fields: ['tag', 'image'],
  },
  {
    entity: User,
    fields: ['content', 'bookmark', 'favourite', 'follower', 'imagecards'],
  },
  {
    entity: Location,
    fields: ['content'],
  },
  {
    entity: Imagecard,
    fields: ['image', 'location'],
  },
  {
    entity: ContentCard,
    fields: ['image', 'content'],
  },
  {
    entity: Tag,
    fields: ['location'],
  },
];

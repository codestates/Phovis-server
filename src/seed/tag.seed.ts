import { Location } from '../entity';

interface Tagseed {
  tagName?: string;
  location?: Location[];
}

export const TagSeed: Tagseed[] = [
  {
    tagName: '야경',
  },
  {
    tagName: '서울',
  },
  {
    tagName: '새벽',
  },
  {
    tagName: '저녁',
  },
];

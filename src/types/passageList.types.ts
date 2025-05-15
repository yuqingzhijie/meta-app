const enum MediaTypeEnum {
  image,
  video
}

interface Passage {
  id: string;
  imgUrl: string;
  videoUrl: string;
  type: MediaTypeEnum;
  text: string;
  community: string;
  avatarUrl: string;
  userName: string;
  likes: number;
  height: number;
  isActive: boolean;
}

interface PassageListResp {
  list: Passage[];
  hasMore: 0 | 1;
}

export { MediaTypeEnum, type Passage, type PassageListResp };

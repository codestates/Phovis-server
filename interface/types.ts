// userinfo
export type updateUserInfoResult = {
  profileImg?: string;
  userName?: string;
};

// auth
export interface loginReqeustBody {
  // POST auth/login Request
  email: string | null;
  password: string | null;
}

export interface googleRequestType {
  // POST auth/google Request
  id_token: string;
}

export interface signupRequestBody {
  // POST auth/signup Request
  userName?: string;
  email: string;
  password: string;
}

export interface googleOauthResponse {
  // Axios google OAuth endpoint Response
  token?: string;
}

export interface googleUserinfo {
  // Axios google OAuth GET userInfo from google
  iss: string;
  sub: string;
  azp: string;
  aud: string;
  iat: string;
  exp: string;
  email: string;
  email_verified: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  locale: string;
}

export interface kakaoTokenRes {
  // Axios Kakao OAuth GET token from kakao
  token_type: string;
  access_token: string;
  expires_in: number;
  refresh_token: string;
  refresh_token_expires_in: number;
  scope: string;
  error?: string;
}
export interface kakaoUserRes {
  // Axios kakao OAuth GET userInfo from kakao
  id: number;
  kakao_account: {
    profile_needs_agreement: boolean;
    profile: {
      nickname: string;
      thumbnail_image_url: string;
      profile_image_url: string;
    };
    email_needs_agreement: boolean;
    is_email_valid: boolean;
    is_email_verified: boolean;
    email: string;
    age_range_needs_agreement: boolean;
    age_range: string;
    birthday_needs_agreement: boolean;
    birthday: string;
    gender_needs_agreement: boolean;
    gender: string;
  };
}

// content Types
export interface content {
  // content types (from Entity)
  imageid: number;
  title: string;
  tags: string;
  description: string;
  location: string;
  user: User;
  like: number;
  images: string[];
  potocards: photocard[];
}

export interface contentfile {
  // content image file Types
  images?: Express.Multer.File[];
  image?: Express.Multer.File[];
  tmpimages?: ConvertImg;
}

export type ConvertImg = {
  // Convert content image file to data
  name: string;
  uri: string;
};

type images = {
  // image Entity
  description: string;
  image: File;
};

export type Locationtype = {
  // location Entity
  location: string;
  lat?: number;
  lng?: number;
};

type User = {
  // User Response Type
  id: string;
  userName: string;
};

export type Imagetype = {
  // image Entity Types
  name: string;
  description: string;
};

type photocard = {
  userid: User;
  userName: User;
  image: images;
  message: string;
};

export interface JWT {
  id: string;
}

export interface resultContent {
  title: string;
  description: string;
  tag: string[];
  user: User;
  mainimageUrl: string;
  contentCard: contentCardType[];
  location: Locationtype;
}

type contentCardType = {
  id: string;
  description: string;
  uri: string;
};

export interface photocardres {
  photocardId: string;
  imageId: number;
  url: string;
  description: string;
  location: Location;
  tags: string[];
}

export interface loginReqeustBody {
  email: string | null;
  password: string | null;
}

export interface googleRequestType {
  id_token: string;
}

export interface signupRequestBody {
  userName?: string;
  email: string;
  password: string;
}

export interface googleOauthResponse {
  token?: string;
}

export interface googleUserinfo {
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
  token_type: string;
  access_token: string;
  expires_in: number;
  refresh_token: string;
  refresh_token_expires_in: number;
  scope: string;
  error?: string;
}
export interface kakaoUserRes {
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

export interface content {
  imageid: number;
  title: string;
  mainimageUrl: string;
  tags: string[];
  description: string;
  location: Location;
  user: User;
  like: number;
  images: Image[];
  potocards: photocard[];
}

type Location = {
  location: string;
  lat: number;
  lng: number;
};
type User = {
  id: string;
  userName: string;
};

type Image = {
  uri: string;
  description: string;
  type: string;
};

type photocard = {
  userid: User;
  userName: User;
  image: Image;
  message: string;
};

export interface JWT {
  id: string;
}

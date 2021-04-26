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

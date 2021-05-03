import { Request, Response } from 'express';
import axios from 'axios';
import { getRepository } from 'typeorm';
import crypto from 'crypto';
import cryptoPW from '@middleware/service/customCrypto';
import { signToken } from '@middleware/service/tokenController';
import { User } from '@entity/User';
import {
  loginReqeustBody,
  signupRequestBody,
  googleOauthResponse,
  googleUserinfo,
  kakaoTokenRes,
  kakaoUserRes,
} from '@interface/index';
// TODO:
// 1. google에서 password 어떻게 넣을지 생각해보기
class authController {
  public checkPW = async (req: Request, res: Response): Promise<void> => {
    const { password } = req.body;
    if (!req.checkedId || password) {
      res.status(403).send({ message: 'not authorize' });
    } else {
      const encodedPW = cryptoPW(password, req.checkedId);
      const user = await getRepository(User)
        .createQueryBuilder('user')
        .where('user.password = :password', { password: encodedPW })
        .getOne();
      if (user) {
        const token = crypto.randomBytes(64).toString();
        req.session.token = token;
        res.status(200).send({ key: token });
      } else {
        res.status(403).send('wrong password');
      }
    }
  };
  public updatePW = async (req: Request, res: Response): Promise<void> => {
    if (!req.checkedId) {
      res.status(403).send({ message: 'not authorize' }).end();
    }
    if (!req.session) {
      res.status(400).send({ message: 'bad Request (not session)' }).end();
    }
    const { key } = req.body;
    if (!key) {
      res.status(400).send('bad Request "not key"').end();
    }
    if (key === req.session.token) {
      const { newPassword } = req.body;
      const { checkedId } = req;
      const endcodePW = cryptoPW(newPassword, checkedId as string);
      await getRepository(User)
        .createQueryBuilder()
        .update({
          password: endcodePW,
        })
        .where('id = :id', { id: checkedId })
        .execute();
      res.status(203).send({ message: 'Update finish' });
    }
  };
  public requestToken = async (req: Request, res: Response): Promise<void> => {
    if (!req.cookies.refreshToken) {
      res.status(403).send('not refresh token');
    } else {
      try {
        const { checkedId } = req;
        if (!checkedId) res.status(403).send('not authorized').end();
        const user = await getRepository(User)
          .createQueryBuilder('user')
          .where('user.id = :id', { id: checkedId })
          .getOne();
        if (user) {
          const { accessToken, refreshToken } = signToken(user.id);
          res
            .status(200)
            .cookie('refreshToken', refreshToken, {
              maxAge: 864000,
              secure: true,
              sameSite: 'none',
            })
            .send({ accessToken });
        } else {
          res.status(403).send('invalid refresh token');
        }
      } catch (_e) {
        res.status(403).send('expire');
      }
    }
  };
  public login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body as loginReqeustBody;
    if (!email || !password) {
      res.status(404).send('bad request');
    }

    const user = (await getRepository(User)
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .getOne()) as User;
    const decode = cryptoPW(password as string, user.id);
    console.log(user, decode);
    if (user && decode === user.password) {
      const { accessToken, refreshToken } = signToken(user.id);
      res
        .status(201)
        .cookie('refreshToken', refreshToken, {
          maxAge: 864000,
          secure: true,
          sameSite: 'none',
        })
        .send({ accessToken });
    } else {
      res.status(404).send('not found user');
    }
  };

  public signup = async (req: Request, res: Response): Promise<void> => {
    const { userName, email, password } = req.body as signupRequestBody;
    if (!email || !password) res.status(403).send('not enough prams');
    const user = await getRepository(User)
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .getOne();
    if (!user) {
      const { identifiers } = await getRepository(User)
        .createQueryBuilder()
        .insert()
        .into(User)
        .values([
          {
            userName: userName || 'unkown',
            email,
            password: '',
            imgUrl: 'e',
            type: 'email',
          },
        ])
        .execute();
      const { id } = identifiers[0];
      const encodePW = cryptoPW(password, id);
      await getRepository(User)
        .createQueryBuilder()
        .update({
          password: encodePW,
        })
        .where('user.id = :id', { id: id })
        .execute();
      res.status(201).send('ok');
    } else {
      res.status(404).send('valid email');
    }
  };

  public google = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.body as googleOauthResponse;
      if (!token) res.status(403).send('fill token'); // 토큰을 안보내면
      const { data } = await axios.post<googleUserinfo>(
        'https://oauth2.googleapis.com/tokeninfo',
        { id_token: token }
      );
      if (!data.sub) res.status(403).send('not authorized'); // 토큰을 안보내면
      const user = await getRepository(User)
        .createQueryBuilder('user')
        .where('user.id = :id', { id: data.sub })
        .getOne();
      if (user) {
        // 만약 기존에 있는 유저라면
        const { accessToken, refreshToken } = signToken(user.id);
        res
          .status(201)
          .cookie('refreshToken', refreshToken, {
            maxAge: 864000,
            secure: true,
            sameSite: 'none',
          })
          .send({ accessToken });
      } else {
        // 기존에 없는 유저라면 새로 유저 등록
        const customPW = crypto.randomBytes(64).toString();
        const { identifiers } = await getRepository(User)
          .createQueryBuilder()
          .insert()
          .into(User)
          .values([
            {
              id: data.sub,
              userName: data.name,
              email: data.email,
              password: customPW,
              type: 'google',
            },
          ])
          .execute();
        const { id } = identifiers[0] as User;
        const { accessToken, refreshToken } = signToken(id);
        res
          .status(201)
          .cookie('refreshToken', refreshToken, {
            maxAge: 864000,
            secure: true,
            sameSite: 'none',
          })
          .send({ accessToken });
      }
    } catch (error) {
      console.log(error);
      res.status(404).send(error);
    }
  };

  public kakao = async (req: Request, res: Response): Promise<void> => {
    // 이메일이 선택임 아무거나 넣어야 할수도 있음
    const { kakaoCode } = req.body;
    if (kakaoCode) res.status(404).send('bad request');
    const kakaoTokenData = await axios.post<kakaoTokenRes>(
      'https://kauth.kakao.com/oauth/token',
      {
        grant_type: 'authorization_code',
        client_id: process.env.KAKAO_CLIENT_ID as string,
        redirect_uri: 'https//localhost:3000/auth/kakao',
        code: kakaoCode,
      },
      { headers: { application: 'x-www-form-urlencoded;charset=utf-8' } }
    );
    if (!kakaoTokenData) res.status(403).send('Not authentication Kakao');
    const { access_token } = kakaoTokenData.data;
    const { data } = await axios.post<kakaoUserRes>(
      'https://kapi.kakao.com/v2/user/me',
      {
        property_keys: ['kakao_account.profile', 'kakao_account.email'],
      },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    const user = await getRepository(User)
      .createQueryBuilder('user')
      .where('user.id = :id', { id: `${data.id}` })
      .getOne();
    if (user) {
      const { accessToken, refreshToken } = signToken(user.id);
      res
        .status(200)
        .cookie('refreshToken', refreshToken, {
          maxAge: 864000,
          secure: true,
          sameSite: 'none',
        })
        .send({ accessToken });
    } else {
      const customPW = crypto.randomBytes(64).toString();
      const { identifiers } = await getRepository(User)
        .createQueryBuilder()
        .insert()
        .into(User)
        .values([
          {
            id: `${data.id}`,
            userName: data.kakao_account.profile.nickname,
            email: data.kakao_account.email || '',
            password: customPW,
            type: 'kakao',
          },
        ])
        .execute();
      const { id } = identifiers[0] as User;
      const { accessToken, refreshToken } = signToken(id);
      res
        .status(201)
        .cookie('refreshToken', refreshToken, {
          maxAge: 864000,
          secure: true,
          sameSite: 'none',
        })
        .send({ accessToken });
    }
  };
}

export default new authController();

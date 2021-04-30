import { Request, Response } from 'express';
import axios from 'axios';
import { getRepository } from 'typeorm';
import jwt from 'jsonwebtoken';
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
  public requestToken = async (req: Request, res: Response): Promise<void> => {
    if (!req.cookies.refreshToken) {
      res.status(403).send('not refresh token');
    } else {
      try {
        const tokenResponse = jwt.verify(
          req.cookies.refreshToken,
          process.env.REFRESH_SECRET as string
        ) as { id: string };
        const user = await getRepository(User)
          .createQueryBuilder('user')
          .where('user.id = :id', { id: tokenResponse.id })
          .getOne();
        if (user) {
          const accessToken = jwt.sign(
            { id: user.id },
            process.env.ACCESS_SECRET as string,
            { expiresIn: '1h' }
          );
          const refreshToken = jwt.sign(
            { id: user.id },
            process.env.REFRESH_SECRET as string,
            { expiresIn: '10d' }
          );
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
    const user = await getRepository(User)
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .andWhere('user.password = :password', { password })
      .getOne();
    if (user) {
      const accessToken = jwt.sign(
        { id: user.id },
        process.env.ACCESS_SECRET as string,
        { expiresIn: '1h' }
      );
      const refreshToken = jwt.sign(
        { id: user.id },
        process.env.REFRESH_SECRET as string,
        { expiresIn: '10d' }
      );
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
      await getRepository(User)
        .createQueryBuilder()
        .insert()
        .into(User)
        .values([
          {
            userName: userName || 'unkown',
            email,
            password,
            imgUrl: 'e',
            type: 'email',
          },
        ])
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
        const accessToken = jwt.sign(
          { id: user.id },
          process.env.ACCESS_SECRET as string,
          { expiresIn: '1h' }
        );
        const refreshToken = jwt.sign(
          { id: user.id },
          process.env.REFRESH_SECRET as string,
          { expiresIn: '10d' }
        );
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
        const { identifiers } = await getRepository(User)
          .createQueryBuilder()
          .insert()
          .into(User)
          .values([
            {
              id: data.sub,
              userName: data.name,
              email: data.email,
              password: 'hashcrypto',
              type: 'google',
            },
          ])
          .execute();
        const { id } = identifiers[0] as User;
        const accessToken = jwt.sign(
          { id },
          process.env.ACCESS_SECRET as string,
          { expiresIn: '1h' }
        );
        const refreshToken = jwt.sign(
          { id },
          process.env.REFRESH_SECRET as string,
          { expiresIn: '10d' }
        );
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
      const { id } = user;
      const accessToken = jwt.sign(
        { id },
        process.env.ACCESS_SECRET as string,
        { expiresIn: '1h' }
      );
      const refreshToken = jwt.sign(
        { id },
        process.env.REFRESH_SECRET as string,
        { expiresIn: '10d' }
      );
      res
        .status(200)
        .cookie('refreshToken', refreshToken, {
          maxAge: 864000,
          secure: true,
          sameSite: 'none',
        })
        .send({ accessToken, refreshToken });
    } else {
      const { identifiers } = await getRepository(User)
        .createQueryBuilder()
        .insert()
        .into(User)
        .values([
          {
            id: `${data.id}`,
            userName: data.kakao_account.profile.nickname,
            email: data.kakao_account.email || '',
            password: 'hashcrypto',
            type: 'kakao',
          },
        ])
        .execute();
      const { id } = identifiers[0] as User;
      const accessToken = jwt.sign(
        { id },
        process.env.ACCESS_SECRET as string,
        { expiresIn: '1h' }
      );
      const refreshToken = jwt.sign(
        { id },
        process.env.REFRESH_SECRET as string,
        { expiresIn: '10d' }
      );
      res
        .status(201)
        .cookie('refreshToken', refreshToken, {
          maxAge: 864000,
          secure: true,
          sameSite: 'none',
        })
        .send({ accessToken, refreshToken });
    }
  };
}

export default new authController();

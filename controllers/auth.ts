import { Request, Response } from 'express';
import axios from 'axios';
import { getRepository } from 'typeorm';
import crypto from 'crypto';
import cryptoPW from '@middleware/service/customCrypto';
import { signToken } from '@middleware/service/tokenController';
import { User } from '@entity/User';
import qs from 'qs';
import { Option } from '@entity/Option';
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
  // 비밀번호 확인
  public checkPW = async (req: Request, res: Response): Promise<void> => {
    const { password } = req.body;
    if (!req.checkedId || !password) {
      res.status(403).send({ message: 'not authorize' });
    } else {
      const encodedPW = cryptoPW(password, req.checkedId);
      const user = await getRepository(User)
        .createQueryBuilder('user')
        .where('user.password = :password', { password: encodedPW })
        .getOne();
      if (user) {
        const token = crypto
          .createHash('sha256')
          .update(req.sessionID)
          .digest('hex');
        req.session.token = token;
        res.status(200).send({ key: token });
      } else {
        res.status(403).send('wrong password');
      }
    }
  };
  // 비밀번호 업데이트
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
      const { password } = req.body;
      const { checkedId } = req;
      const encodedPW = cryptoPW(password, checkedId as string);
      try {
        await getRepository(User)
          .createQueryBuilder()
          .update({
            password: encodedPW,
          })
          .where('id = :id', { id: checkedId })
          .execute();
        res.status(203).send({ message: 'Update finish' });
      } catch (e) {
        res.status(400).send({ message: e.message });
      }
    }
  };
  // 엑세스 토큰 재요청
  public requestToken = async (req: Request, res: Response): Promise<void> => {
    if (!req.cookies.refreshToken) {
      res.status(401).send('not refresh token');
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
        res.status(401).send('expire');
      }
    }
  };
  // 로그인
  public login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body as loginReqeustBody;
    if (!email || !password) {
      res.status(404).send('bad request');
    } else {
      const user = await getRepository(User)
        .createQueryBuilder('user')
        .where('user.email = :email', { email })
        .getOne();
      const decodedPW = user && cryptoPW(password as string, user.id);
      if (user && decodedPW === user.password) {
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
    }
  };
  // 회원가입
  public signup = async (req: Request, res: Response): Promise<void> => {
    const { userName, email, password } = req.body as signupRequestBody;
    try {
      if (!email || !password) {
        res.status(403).send('not enough prams');
      } else {
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
                imgUrl:
                  'https://phovisimgs.s3.ap-northeast-2.amazonaws.com/blank-profile-picture-973460_1280-300x300-1.jpg',
                type: 'email',
              },
            ])
            .execute();
          const { id } = identifiers[0];
          const option = new Option();
          option.user = identifiers[0] as User;
          await getRepository(Option).save(option);

          const user = await getRepository(User).findOneOrFail(id);
          const encodePW = cryptoPW(password, id);
          user.Option = option;
          user.password = encodePW;
          await getRepository(User).save(user);
          res.status(201).send('ok');
        } else {
          res.status(404).send('valid email');
        }
      }
    } catch (e) {
      res.status(400).send('bad Request');
    }
  };
  // 구글 회원가입
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
        const customPW = crypto
          .createHash('sha256')
          .update(data.sub)
          .digest('hex');
        const { identifiers } = await getRepository(User)
          .createQueryBuilder()
          .insert()
          .into(User)
          .values([
            {
              id: data.sub,
              userName: data.name,
              imgUrl: data.picture,
              email: data.email,
              password: customPW,
              type: 'google',
            },
          ])
          .execute();
        const { id } = identifiers[0] as User;
        const option = new Option();
        option.user = identifiers[0] as User;
        await getRepository(Option).save(option);

        const user = await getRepository(User).findOneOrFail(id);
        user.Option = option;
        await getRepository(User).save(user);
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
  // 카카오 회원가입
  public kakao = async (req: Request, res: Response): Promise<void> => {
    // 이메일이 선택임 아무거나 넣어야 할수도 있음
    try {
      const { kakaoCode } = req.body;
      if (!kakaoCode) res.status(404).send('bad request');
      const kakaoTokenData = await axios.post<kakaoTokenRes>(
        'https://kauth.kakao.com/oauth/token',
        qs.stringify({
          grant_type: 'authorization_code',
          client_id: process.env.KAKAO_CLIENT_ID as string,
          redirect_uri: `${process.env.CLIENT_URL}/auth/kakao`,
          code: kakaoCode,
          client_secret: process.env.KAKAO_CLIENT_SECRET as string,
        }),
        {
          headers: {
            'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
        }
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
        const customPW = crypto
          .createHash('sha256')
          .update(data.id.toString())
          .digest('hex');
        const { identifiers } = await getRepository(User)
          .createQueryBuilder()
          .insert()
          .into(User)
          .values([
            {
              id: `${data.id}`,
              userName: data.kakao_account.profile.nickname,
              imgUrl:
                data.kakao_account.profile.profile_image_url ||
                'https://phovisimgs.s3.ap-northeast-2.amazonaws.com/blank-profile-picture-973460_1280-300x300-1.jpg',
              email: data.kakao_account.email || '',
              password: customPW,
              type: 'kakao',
            },
          ])
          .execute();
        const { id } = identifiers[0] as User;
        const option = new Option();
        option.user = identifiers[0] as User;
        await getRepository(Option).save(option);

        const user = await getRepository(User).findOneOrFail(id);
        user.Option = option;
        await getRepository(User).save(user);
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
    } catch (e) {
      console.log(e);
      res.status(404).send('bad');
    }
  };
  public updateOption = async (req: Request, res: Response): Promise<void> => {
    const { checkedId } = req;
    if (!checkedId) {
      res.status(401).send('not authorized');
    } else {
      const { isBookmark, isFollow, isEmail, isFavourite } = req.body;
      if (
        isBookmark === undefined &&
        isFollow === undefined &&
        isEmail === undefined &&
        isFavourite === undefined
      ) {
        res.status(400).send(`fill body`);
      } else {
        try {
          const userRepo = await getRepository(User);
          const optionRepo = await getRepository(Option);
          const user = await userRepo.findOneOrFail({
            relations: ['Option'],
            where: { id: checkedId },
          });
          const optionId = user.Option.id;
          const userOption = await optionRepo.findOneOrFail(optionId);
          optionRepo.merge(userOption, {
            isBookmark,
            isEmail,
            isFavourite,
            isFollow,
          });
          const result = await optionRepo.save(userOption);
          res.status(201).send({
            isBookmark: result.isBookmark,
            isEmail: result.isEmail,
            isFavourite: result.isFavourite,
            isFollow: result.isFollow,
          });
        } catch (e) {
          res.status(400).send(`bad Request ${e.message}`);
        }
      }
    }
  };
  public signOut = async (req: Request, res: Response): Promise<void> => {
    const { checkedId } = req;
    try {
      if (!checkedId) {
        res.status(401).send('not authorized');
      } else {
        const { key } = req.body;
        if (req.session.token === key) {
          const userRepo = await getRepository(User);
          await userRepo.softDelete(checkedId);
          res.status(201).send({ message: 'ok' });
        } else {
          res.status(400).send('bad Request');
        }
      }
    } catch (e) {
      res.status(400).send('bad Request');
    }
  };
}

export default new authController();

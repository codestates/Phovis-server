import { sign, verify } from 'jsonwebtoken';

export const verifyToken = (
  token: string,
  type: 'access' | 'refresh'
): string => {
  try {
    const secret =
      type === 'access'
        ? (process.env.ACCESS_SECRET as string)
        : (process.env.REFRESH_SECRET as string);
    const { id } = verify(token, secret) as {
      id: string;
    };
    return id;
  } catch (e) {
    console.log(e.message);
    throw 'not authorize';
  }
};

export const signToken = (id: string) => {
  const accessToken = sign({ id: id }, process.env.ACCESS_SECRET as string, {
    expiresIn: '1h',
  });
  const refreshToken = sign({ id: id }, process.env.REFRESH_SECRET as string, {
    expiresIn: '10d',
  });
  return { accessToken, refreshToken };
};

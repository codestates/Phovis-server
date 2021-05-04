import { Request, Response, NextFunction } from 'express';
import { verifyToken } from './tokenController';

const splitToken = (header: string) => {
  const headerToken = header.split(' ');
  const type = headerToken[0].toUpperCase();
  const token = headerToken[1];
  return [type, token];
};

export default (req: Request, res: Response, next: NextFunction) => {
  if (!req.headers.authorization) {
    next();
  } else {
    const [type, token] = splitToken(req.headers.authorization);
    if (type === 'BEARER') {
      try {
        const id = verifyToken(token, 'access');
        req.checkedId = id;
        next();
      } catch (e) {
        res.status(401).send('not authorized');
      }
    } else {
      res.status(403).send(`token type Error: ${type}`);
    }
  }
};

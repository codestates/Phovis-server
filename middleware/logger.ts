import express from 'express';

export default (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void => {
  console.log('Request URL:', req.originalUrl);
  console.log('Request Type:', req.method);
  next();
};

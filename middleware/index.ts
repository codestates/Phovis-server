import cors from './cors';
import express from 'express';
import cookieParser from 'cookie-parser';
import session from './session';
import authorize from './service/authorize';

const defaultMiddleware = [
  cors,
  session,
  express.json(),
  cookieParser(),
  authorize,
];

export default {
  develope: [...defaultMiddleware, require('./logger').default],
  production: [...defaultMiddleware],
};

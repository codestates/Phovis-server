import session, { SessionOptions } from 'express-session';

const options: SessionOptions = {
  secret: 'phovisSession',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 300,
    secure: true,
    httpOnly: true,
    sameSite: 'none',
  },
};

export default session(options);

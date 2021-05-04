import express from 'express';
import fs from 'fs';
import 'reflect-metadata';
import {
  authRouter,
  contentRouter,
  userRouter,
  photocardRouter,
  tagRouter,
} from '../router';
import https from 'https';
import middleware from '../middleware/index';
import { createConnection } from 'typeorm';
import '@config';

type port = number | string;
type env = 'production' | 'develope';

const app = express();
const env: env = (process.env.NODE_ENV as 'production' | null) || 'develope';
const port: port = process.env.DEPLOY_PORT || 4000;
type liveServer = 'https' | 'http' | undefined;

function checkSSL(): boolean {
  return (
    fs.existsSync(__dirname + '/key.pem') &&
    fs.existsSync(__dirname + '/cert.pem')
  );
}

// middleware
app.use(...middleware[env]);

app.get('/', async (req: express.Request, res: express.Response) => {
  // route 53 health check
  try {
    res.send('Hello World');
  } catch (err) {
    console.log(err);
  }
});

// router
app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/tag', tagRouter);
app.use('/content', contentRouter);
app.use('/photocard', photocardRouter);

let liveServer: liveServer = checkSSL() ? 'https' : 'http';
const server = checkSSL()
  ? https.createServer(
      {
        key: fs.readFileSync(__dirname + '/key.pem', 'utf-8'),
        cert: fs.readFileSync(__dirname + '/cert.pem', 'utf-8'),
      },
      app
    )
  : app;

createConnection()
  .then(() => {
    server.listen(port, () => {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      console.log(`liveServer : ${liveServer}`);
      console.log(`middleware: ${env}`);
      console.log(`https server on : ${port} port`);
    });
  })
  .catch(console.log);

export default server;

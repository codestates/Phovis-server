import express from 'express';
import fs from 'fs';
import 'reflect-metadata';
<<<<<<< HEAD

import { authRouter, contentRouter, userRouter } from '../router';
=======
import { User } from '@entity/index';
import { authRouter, contentRouter } from '../router';
>>>>>>> 84a7091ffd0df4c01426cb83aa119cb686de418a
import https from 'https';
import * as middleware from '../middleware/index';
import { createConnection, getRepository } from 'typeorm';
import '@config';

type port = string;

const app = express();
const port = process.env.DEPLOY_PORT || 4000;
type liveServer = 'https' | 'http' | undefined;

function checkSSL(): boolean {
  return (
    fs.existsSync(__dirname + '/key.pem') &&
    fs.existsSync(__dirname + '/cert.pem')
  );
}

// middleware
app.use(middleware.cors);
app.use(...middleware.express);

app.get('/', async (req: express.Request, res: express.Response) => {
  try {
    res.send('Hello World');
  } catch (err) {
    console.log(err);
  }
});

// router
app.use('/auth', authRouter);
app.use('/user', userRouter);

app.use('/content', contentRouter);

let liveServer = checkSSL() ? 'https' : 'http';
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
      console.log(`middleware: ${Object.keys(middleware)}`);
      console.log(`https server on : ${port} port`);
    });
  })
  .catch(console.log);

export default server;

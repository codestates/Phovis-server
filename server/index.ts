import express from 'express';
import fs from 'fs';
import 'reflect-metadata';

import { authRouter, userRouter } from '../router';
import https from 'https';
import * as middleware from '../middleware/index';
import { createConnection } from 'typeorm';
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

app.get('/', (req: express.Request, res: express.Response) => {
  res.send('Hello World');
});

// rotuer
app.use('/auth', authRouter);
app.use('/user', userRouter);

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

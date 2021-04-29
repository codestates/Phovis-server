import express from 'express';
import fs from 'fs';
import 'reflect-metadata';
import { User } from '@entity/index';
import { authRouter, contentRouter } from '../router';
import https from 'https';
import * as middleware from '../middleware/index';
import { createConnection, getRepository } from 'typeorm';
import '@config';

type port = string;

const app = express();
const port = process.env.DEPLOY_PORT || 4000;

// middleware
app.use(middleware.cors);
app.use(middleware.express);

app.get('/', async (req: express.Request, res: express.Response) => {
  try {
    const result = await getRepository(User)
      .createQueryBuilder()
      .where('userName = :name', { name: 'qwerag' })
      .getOneOrFail();
    console.log(result);
    res.send('Hello World');
  } catch (err) {
    console.log(err);
  }
});

// router
app.use('/auth', authRouter);
// app.use('/user', userRouter);

app.use('/content', contentRouter);

const server = https.createServer(
  {
    key: fs.readFileSync(__dirname + '/key.pem', 'utf-8'),
    cert: fs.readFileSync(__dirname + '/cert.pem', 'utf-8'),
  },
  app
);

createConnection()
  .then(() => {
    server.listen(port, () => {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      console.log(`middleware: ${Object.keys(middleware)}`);
      console.log(`https server on : ${port} port`);
    });
  })
  .catch(console.log);

export default server;

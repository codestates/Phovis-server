import express from 'express';
import fs from 'fs';
import { userRouter } from '../router';
import https from 'https';
import * as middleware from '../middleware/index';
import { createConnection } from 'typeorm';

type port = string;

const app = express();
const port = process.env.DEPLOY_PORT || 4000;

// middleware
app.use(middleware.cors);
app.use(middleware.express);
app.use(express.json());

app.get('/', (req: express.Request, res: express.Response) => {
  res.send({ data: 'Hello World' });
});

// rotuer
app.use('/user', userRouter);

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

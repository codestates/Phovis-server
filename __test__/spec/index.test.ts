/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import app from '../../server/index';
import { agent as request } from 'supertest';
import { describe } from 'mocha';
import { expect } from 'chai';
import nock from 'nock';

const agent = request(app);

describe('Index Test', () => {
  it('should always pass', () => {
    expect(true).to.eql(true);
  });

  it('should GET / test', async function () {
    //
    nock('https://localhost:4000').get('/').reply(200, 'Hello World');

    const res = await agent.get('/');

    expect(res.status).to.equal(200);
    expect(res.body).to.exist;
    expect(res.body.data).to.not.be.empty;
    expect(res.body.data).to.eql('Hello World');
    expect(res.body.error).to.not.exist;
  });
});

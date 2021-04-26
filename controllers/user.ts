import express from 'express';

export default {
  get: (req: express.Request, res: express.Response) => {
    res.send('user nice');
  },
};

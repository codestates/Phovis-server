import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const BUCKET = 'maintestbuild33';
const bucket = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export const uploadToS3 = async (data: string): Promise<string> => {
  try {
    const buf = Buffer.from(
      data.replace(/^data:image\/\w+;base64,/, ''),
      'base64'
    );
    const sts = new AWS.STS({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });
    const key = sts.getCallerIdentity();
    console.log(key);
    console.log('KEY', bucket);
    const res = await bucket
      .listObjects({
        Bucket: BUCKET,
      })
      .promise();
    // const name = uuidv4();
    // await bucket
    //   .putObject({
    //     Key: name,
    //     Bucket: BUCKET,
    //     ContentType: 'image/png',
    //     Body: buf,
    //     ACL: 'public-read',
    //   })
    //   .promise();
    console.log(res);
    return 'set';
  } catch (err) {
    console.log(err);
    return 'wrong data';
  }
};

export const deleteToS3 = async (name: string): Promise<boolean> => {
  try {
    await bucket
      .deleteObject({
        Bucket: BUCKET,
        Key: name,
      })
      .promise();
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

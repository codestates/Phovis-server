import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import * as multer from 'multer';
import fs from 'fs';

dotenv.config();

const BUCKET = 'maintestbuild33';
const bucket = new AWS.S3({
  apiVersion: '2006-03-10',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export const uploadToS3 = async (
  data: Express.Multer.File
): Promise<string> => {
  try {
    const tempFileName = data.originalname.split('.');
    const fileExtension = tempFileName[tempFileName.length - 1];
    const name = uuidv4();

    await bucket
      .putObject({
        Key: name + '.' + fileExtension,
        Bucket: BUCKET,
        ContentType: 'image/' + fileExtension,
        Body: data.buffer,
        ACL: 'public-read',
      })
      .promise();

    return `https://${BUCKET}.s3.ap-northeast-2.amazonaws.com/${name}.${fileExtension}`;
  } catch (err) {
    console.log(err);
    return 'wrong data';
  }
};

export const deleteToS3 = async (name: string): Promise<boolean> => {
  try {
    const target = name.split('.');

    await bucket
      .deleteObject({
        Bucket: BUCKET,
        Key: target[target.length - 2] + '.' + target[target.length - 1],
      })
      .promise();
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

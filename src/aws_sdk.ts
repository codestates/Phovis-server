import * as AWS from 'aws-sdk';
import { HexBase64BinaryEncoding } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
// import dotenv from 'dotenv';

// dotenv.config();

const BUCKET = 'sampleimagebucket22';
const S3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export const uploadToS3 = async (
  data: HexBase64BinaryEncoding
): Promise<string> => {
  const name = uuidv4();
  await S3.putObject({
    Key: name,
    Bucket: BUCKET,
    ContentType: 'image',
    Body: data,
    ACL: 'public-read',
  }).promise();
  return name;
};

export const deleteToS3 = async (name: string): Promise<boolean> => {
  try {
    await S3.deleteObject({
      Bucket: BUCKET,
      Key: name,
    }).promise();
    return true;
  } catch (err) {
    return false;
  }
};

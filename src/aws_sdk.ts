import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import * as multer from 'multer';

dotenv.config();

const BUCKET = 'maintestbuild33';
const s3 = new AWS.S3({
  apiVersion: '2006-03-10',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});
const guidGenerator = uuidv4;
const storage = multer.diskStorage({
  destination: function (
    req: Express.Request,
    file: Express.Multer.File,
    callback: (error: Error | null, destination: string) => void
  ) {
    callback(null, './upload/');
  },
});

export const uploadToS3 = async (
  data: Express.Multer.File[]
): Promise<string> => {
  try {
    // sts.assumeRole();
    // const key = sts.getCallerIdentity();
    // console.log(key);
    s3.listBuckets(function (err, data) {
      if (err) {
        console.log('Error', err);
      } else {
        console.log('Success', data.Buckets);
      }
    });
    // console.log('KEY', bucket);
    // const res = await bucket
    //   .listObjects({
    //     Bucket: BUCKET,
    //   })
    //   .promise();
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
    // console.log('3234', res);
    return 'set';
  } catch (err) {
    console.log(err);
    return 'wrong data';
  }
};

// export const deleteToS3 = async (name: string): Promise<boolean> => {
//   try {
//     await bucket
//       .deleteObject({
//         Bucket: BUCKET,
//         Key: name,
//       })
//       .promise();
//     return true;
//   } catch (err) {
//     console.log(err);
//     return false;
//   }
// };

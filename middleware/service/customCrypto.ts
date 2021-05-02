import crypto from 'crypto';

export default (pw: string, id: string): string => {
  try {
    const salt = id.length > 5 ? id.slice(-5) : id;
    const hashpw = crypto.pbkdf2Sync(pw, salt, 211423, 64, 'sha512');
    return hashpw.toString('hex');
  } catch (e) {
    throw `crypto encoded error:  ${e.type} \n ${e.message}`;
  }
};

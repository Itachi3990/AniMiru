import CryptoJS from 'crypto-js';
import type { PasswordStatus } from './interfaces';

const isDomainValid = (domain: string | null): boolean => {
  if (!domain) return false;
  const hash = CryptoJS.SHA256(domain).toString();
  return hash === '5312f53b466efa32f071bb2432a58f0fa4c85f4fcd665717224b17290db23726';
};


const decryptAESCTR = (encryptedMessage: string, secretKey: string): string => {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedMessage, secretKey, {
      mode: CryptoJS.mode.CTR,
      padding: CryptoJS.pad.NoPadding
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('AES-CTR decryption error:', error);
    return '';
  }
};

export const analyzePwd = (pwd :string | null) : PasswordStatus => {
    if(!pwd) return 'Wrong Password';
    const plainTxt = decryptAESCTR(pwd, 'dont look at me ... baka!!');
    const [dom, dateStr] = plainTxt.split('|');
    if(!isDomainValid(dom)) return 'Wrong Password';
    if(new Date().getTime() - new Date(dateStr).getTime() > 24*60*60*1000 ) return 'Password Expired';
    (globalThis as any).dom = dom;
    return 'ok';
};
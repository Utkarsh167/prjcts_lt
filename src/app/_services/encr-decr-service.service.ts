import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class EncrDecrServiceService {

  constructor() { }

  set(keys, value){
   // var key = CryptoJS.enc.Utf8.parse(keys);
   // var iv = CryptoJS.enc.Utf8.parse(keys);
    var encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(value.toString()), keys,
    {
        //keySize: 128 / 8,
        iv: keys,
        mode: CryptoJS.mode.CBC,
       // padding: CryptoJS.pad.Pkcs7
    });

    return encrypted.toString();
  }

  //The get method is use for decrypt the value.
  get(keys, value){
    var key = CryptoJS.enc.Utf8.parse(keys);
    var iv = CryptoJS.enc.Utf8.parse(keys);
    var decrypted = CryptoJS.AES.decrypt(value, keys, {
       // keySize: 128 / 8,
        iv: keys,
        mode: CryptoJS.mode.CBC,
     //   padding: CryptoJS.pad.Pkcs7
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
  }

}

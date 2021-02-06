import {Component, OnInit, ViewChild} from '@angular/core';
import {EncrDecrServiceService} from '../_services/encr-decr-service.service'
//import {CryptLib}  from '@skavinvarnan/cryptlib';
import * as CryptoJS from 'crypto-js';
// import * as CanvasJS from 'src/assets/js/canvasjs.min';



@Component({
  selector: 'app-check-ui',
  templateUrl: './check-ui.component.html',
  styleUrls: ['./check-ui.component.css']
})
export class CheckUiComponent implements OnInit {

  // cryptLib:cryptLib;
  plainText = "this is my plain text";
  key = "your key";
  constructor(private EncrDecr: EncrDecrServiceService) { }
  step = 0;
  today: number = Date.now();

  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step++;
  }

  ngOnInit() {
    // let chart = new CanvasJS.Chart("chartContainer", {
    //   animationEnabled: true,
    //   exportEnabled: true,
    //   title: {
    //     text: "Basic Column Chart in Angular"
    //   },
    //   data: [{
    //     type: "column",
    //     dataPoints: [
    //       { y: 71, label: "Apple" },
    //       { y: 55, label: "Mango" },
    //       { y: 50, label: "Orange" },
    //       { y: 65, label: "Banana" },
    //       { y: 95, label: "Pineapple" },
    //       { y: 68, label: "Pears" },
    //       { y: 28, label: "Grapes" },
    //       { y: 34, label: "Lychee" },
    //       { y: 14, label: "Jackfruit" }
    //     ]
    //   }]
    // });
      
    // chart.render();

    var encrypted = this.EncrDecr.set('123456$', 'askjbhfsadsa faksjf zmdjkfs casbahfs acasefva');
    var decrypted = this.EncrDecr.get('123456$', 'U2FsdGVkX19gClMPSJHHThNBoo6OHX95Dgc82gHTMYTdwlUwEINbfBl+4ucYeFzcsO5EQCOfW+nH7qMTWq8zVg==');
    //var encrypted = AES.encrypt('Utkarsh Patil', 'Translab12');
    // var decrypted = AES.decrypt(encrypted, 'Translab12');
   
    // console.log('Encrypted :' + encrypted);
    // console.log('Decrypted :' + decrypted);

      var aesEncryption = CryptoJS.AES.encrypt('Utkarsh Patil', 'Translab12').toString();
      var aesDecryption = CryptoJS.AES.decrypt(aesEncryption, 'Translab12').toString();

      console.log('Encrypted :' + aesEncryption);
      console.log('Decrypted :' + aesDecryption);


            // var cryptLib = require('cryptlib');
            // const cipherText = cryptLib.encryptPlainTextWithRandomIV('plainText', 'key');
            // console.log('cipherText %s', cipherText);
            
            // const decryptedString = cryptLib.decryptCipherTextWithRandomIV('cipherText', 'key');
            // console.log('decryptedString %s', decryptedString);

    }

}

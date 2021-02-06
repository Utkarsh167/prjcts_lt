import { Component, OnInit, Renderer, ElementRef } from '@angular/core';
import { FormBuilder,FormControl, FormGroup, Validators, AbstractControl } from '@angular/forms';
import {AuthenticationService} from '../_services/authentication.service';
import { first } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService } from '../_services/alert.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

 	  loginForm: FormGroup;
    returnUrl: string;
    captcha;
    submitted = false;
    show:boolean;
    loading=false;
    isCaptcha:boolean=false;

  


  constructor(private formBuilder: FormBuilder,private authenticationService : AuthenticationService, private route: ActivatedRoute,
        private router: Router,private alertService: AlertService,el: ElementRef, renderer: Renderer,private toastrService:ToastrService) {
          this.show=false;
         //console.log(this.makeid(5));
         this.captcha=this.makeid(6);
         var events = 'cut copy paste';
      events.split(' ').forEach(e => 
      renderer.listen(el.nativeElement, e, (event) => {
        event.preventDefault();
        })
      );
         }

          makeid(length) {
          var result           = '';
          var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
          var charactersLength = characters.length;
          for ( var i = 0; i < length; i++ ) {
             result += characters.charAt(Math.floor(Math.random() * charactersLength));
          }
          return result;
       }

  ngOnInit() {
  this.loginForm =
  this.formBuilder.group({
            username: ['',[Validators.required, Validators.email]],
            password: ['', [Validators.required,Validators.minLength(6)]],
            // captcha: ['',[Validators.required,Validators.minLength(6)]],
             myRecaptcha: new FormControl(null, Validators.required)
        });
        //this.id=this.route.snapshot.paramMap.get('id');
        //console.log(this.id);
        //if(this.id)
        //{
         //   alert('id received is '+this.id);
        //}

        // reset login status
        this.authenticationService.logout();
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  // convenience getter for easy access to form fields
    get f() { return this.loginForm.controls; }

    get captchaUnpVal(){
      return this.loginForm.get('captcha');
    }
    onSubmit() {

        // stop here if form is invalid
        if (this.loginForm.invalid) {
          this.toastrService.error('Please provide valid data','', {
            timeOut: 3000,
            positionClass: 'toast-bottom-right',
          });
            return;
        }
      //   if (this.f.captcha.value!==this.captcha) {
      //     this.captcha=this.makeid(6);
      //     this.f.captcha.reset();
      //    // alert('Enter correct captcha')
      //    // this.alertService.error("Enter Correct Sum");
      //     return;
      // }

      this.loading=true;

      console.log(this.loginForm.value);
    
        this.authenticationService.login(this.f.username.value, this.f.password.value)
            .pipe(first())
            .subscribe(
                data => {
                  console.log(data);
                  if(data.status!=0){
                         
                    // for(let i=0;i<data.message.length;i++){
                console.log(data.result.name);
               
                if(data.result.status==='archived'){
                 // alert("User is archived please contact admin"); 
                 this.loading=false;        
                  
                 this.toastrService.info('User is archived please contact admin','', {
                    timeOut: 3000,
                    positionClass: 'toast-bottom-right',
                  })          
                }else if(data.result.status==='inactive'){
                  //alert("Inactive user");
                  if(data.result.admin_type=='super'){
                    sessionStorage.setItem('is_super','true');
                  }else{
                    sessionStorage.setItem('is_super','false');
                    
                  }
                  this.loading=false;        
                  sessionStorage.setItem('name', data.result.name);
                  sessionStorage.setItem('location_id', data.result.location_id);
                  sessionStorage.setItem('user_name', data.result.user_name);
                  sessionStorage.setItem('admin_type', data.result.admin_type);
                  sessionStorage.setItem('admin_id',data.result.id);
                  sessionStorage.setItem('client_id',data.result.client_id);
                  sessionStorage.setItem('user_rights',data.result.user_rights);
                  this.router.navigate(['workplace-details']);
                  this.toastrService.info('Please fill workplace form details','Welcome '+data.result.name[0].toUpperCase() + data.result.name.slice(1), {
                    timeOut: 2000,
                    positionClass: 'toast-bottom-right',
                  })

                }else{
                // alert("Active user");
                if(data.result.admin_type=='super'){
                  sessionStorage.setItem('is_super','true');
                }else{
                  sessionStorage.setItem('is_super','false');
                }
                this.loading=false;        

                  sessionStorage.setItem('name', data.result.name);
                  sessionStorage.setItem('location_id', data.result.location_id);
                  sessionStorage.setItem('user_name', data.result.user_name);
                  sessionStorage.setItem('admin_type', data.result.admin_type);
                  sessionStorage.setItem('admin_id',data.result.id);
                  sessionStorage.setItem('user_rights',data.result.user_rights);
                  sessionStorage.setItem('client_id',data.result.client_id);

                 // this.router.navigate([this.returnUrl]);
                 this.router.navigate(['home']);
                 this.toastrService.success('','Welcome back '+data.result.name[0].toUpperCase() + data.result.name.slice(1), {
                  timeOut: 2000,
                  positionClass: 'toast-bottom-right',
                });
                
               // }
                }
                            
             
            }else{
              this.loading=false;        
              //alert("Please enter valid id and password");
              this.toastrService.error('Please enter correct password or contact admin for password','Wrong Email or Password', {
                timeOut: 4000,
                positionClass: 'toast-bottom-right',
              });
            }
                },
                error => {
                  this.loading=false;        
                    console.log(error);
                    this.toastrService.error('Server Error','Please try again later', {
                      timeOut: 2000,
                      positionClass: 'toast-bottom-right',
                    });
                    //this.alertService.error(error);
                });
    }

   ageRangeValidator(control: AbstractControl): { [key: string]: boolean } | null {
      if (control.value !== undefined && (isNaN(control.value) || control.value < 18 || control.value > 45)) {
          return { 'ageRange': true };
      }
      return null;
  }

  reloadCaptch(){
    this.captcha=this.makeid(6);
    this.f.captcha.reset();
  }

  togglePassword() {
    this.show = !this.show;
}

onScriptLoad() {
  console.log('Google reCAPTCHA loaded and is ready for use!')
}

onScriptError() {
  console.log('Something went long when loading the Google reCAPTCHA')
}

handleSuccess(event){
  console.log(event);
  this.loginForm.controls['myRecaptcha'].setValue(true);
  this.isCaptcha=true;
  console.log(this.loginForm.get('myRecaptcha').value);
  console.log(this.loginForm.get('username').value);
  console.log(this.loginForm.get('password').value);
  if(this.loginForm.invalid){
    console.log('invalid');
  }else{
    console.log('valid');
  }
}

}

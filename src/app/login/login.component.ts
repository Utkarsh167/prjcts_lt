import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {AuthenticationService} from '../_services/authentication.service';
import { first } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

 	  loginForm: FormGroup;
    returnUrl: string;


  constructor(private formBuilder: FormBuilder,private authenticationService : AuthenticationService, private route: ActivatedRoute,
        private router: Router) { }

  ngOnInit() {
  this.loginForm =
  this.formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.required],
          //  sum: ['', Validators.required]
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

    onSubmit() {

        // stop here if form is invalid
        if (this.loginForm.invalid) {
            return;
        }
        this.authenticationService.login(this.f.username.value, this.f.password.value)
            .pipe(first())
            .subscribe(
                data => {
                  console.log(data);
                  if(data.success!="false"){
                    console.log(data);    
                    // for(let i=0;i<data.message.length;i++){
                console.log(data.message.name);
               
                if(data.message.status==='archived'){
                  alert("User is archived please contact admin");           
                }else if(data.message.status==='inactive'){
                  //alert("Inactive user");
                  sessionStorage.setItem('name', JSON.stringify(data.message.name));
                  sessionStorage.setItem('location_id', JSON.stringify(data.message.location_id));
                  sessionStorage.setItem('user_name', JSON.stringify(data.message.user_name));
                  sessionStorage.setItem('admin_type', JSON.stringify(data.message.admin_type));
                  sessionStorage.setItem('admin_id',JSON.stringify(data.message.id));
                  sessionStorage.setItem('client_id',JSON.stringify(data.message.client_id));

                  this.router.navigate(['workplace-details']);

                }else{
                // alert("Active user");
                  sessionStorage.setItem('name', JSON.stringify(data.message.name));
                  sessionStorage.setItem('location_id', JSON.stringify(data.message.location_id));
                  sessionStorage.setItem('user_name', JSON.stringify(data.message.user_name));
                  sessionStorage.setItem('admin_type', JSON.stringify(data.message.admin_type));
                  sessionStorage.setItem('admin_id',JSON.stringify(data.message.id));
                  sessionStorage.setItem('client_id',JSON.stringify(data.message.client_id));

                 // this.router.navigate([this.returnUrl]);
                 this.router.navigate(['home']);
                
               // }
                }            
              }else{
                alert("Please enter valid id and password");
              }
                },
                error => {
                    console.log(error);
                    //this.alertService.error(error);
                });
    }

}

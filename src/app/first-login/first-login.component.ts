import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormArray,FormControl, Validators,FormGroupDirective, NgForm } from '@angular/forms';
import { AdminService } from '../admin.service';
import { Router, ActivatedRoute } from '@angular/router';
import {AuthenticationService} from '../_services/authentication.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-first-login',
  templateUrl: './first-login.component.html',
  styleUrls: ['./first-login.component.css']
})
export class FirstLoginComponent implements OnInit {

  workplaceForm;
  loading=false;
  area_count:number;
  //callFirstTimeSetup;
  //data;
  constructor(private formBuilder:FormBuilder,private adminService : AdminService,
    private router: Router,private authenticationService :AuthenticationService,private toastrService:ToastrService) { }
  admin_id;
  client_id;
  ngOnInit() {
    this.workplaceForm = this.formBuilder.group({     
      // lot_no:[''],  
      workplace_name:[null,Validators.required],
      location_name:['',Validators.required],
      area_list: this.formBuilder.array([]) 
    });
    this.addCreds();
    this.area_count=1;
    console.log(sessionStorage.getItem('admin_id'));
    console.log(sessionStorage.getItem('client_id'));

    this.admin_id=sessionStorage.getItem('admin_id');
    this.client_id=sessionStorage.getItem('client_id');

    }

  addCreds(){
    this.area_count++;
    if(this.area_count>5){
      this.toastrService.warning("You have reached your maximum limit",'Maximum limit', {
        timeOut: 1500,
        positionClass: 'toast-bottom-right',
      });
    }else{
      console.log('addCreds called'+this.area_count);
    const creds = this.workplaceForm.controls.area_list as FormArray;
      creds.push(this.formBuilder.group({
        area_name:['']
      }));
    }
  }

  closeCreds(Index: number){
    this.area_count--;
    // removeSkillButtonClick(skillGroupIndex: number): void {
(<FormArray>this.workplaceForm.get('area_list')).removeAt(Index);
}


firstTimeSetup(){
  if(this.workplaceForm.invalid){
    return;
  }
  let workPlaceData=this.workplaceForm.value;
  workPlaceData.admin_id=this.admin_id;
  workPlaceData.client_id=this.client_id;
  console.log(JSON.stringify(workPlaceData));
  this.loading=true;
  this.adminService.firstTimeSetup(workPlaceData)
            .subscribe(
                data=>{
                console.log(data);
                if(data.status!=0){
                this.loading=false;
                this.toastrService.success('','Workplace data added successfully ', {
                  timeOut: 2000,
                  positionClass: 'toast-bottom-right',
                });
                this.router.navigate(['home']);
              }else{
                this.loading=false;
                this.toastrService.error('Server Error','Please try again later', {
                  timeOut: 2000,
                  positionClass: 'toast-bottom-right',
                });
              }
              },
                error=>{
                    console.log(error);
                    this.loading=false;
                    this.toastrService.error('Server Error','Please try again later', {
                      timeOut: 2000,
                      positionClass: 'toast-bottom-right',
                    });
                }
            ); 
}

logout(){
  this.authenticationService.logout();
  this.router.navigate(["/login"]);
 }
}

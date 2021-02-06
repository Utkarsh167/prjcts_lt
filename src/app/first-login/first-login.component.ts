import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormArray,FormControl, Validators,FormGroupDirective, NgForm } from '@angular/forms';
import { AdminService } from '../admin.service';
import { Router, ActivatedRoute } from '@angular/router';
import {AuthenticationService} from '../_services/authentication.service';

@Component({
  selector: 'app-first-login',
  templateUrl: './first-login.component.html',
  styleUrls: ['./first-login.component.css']
})
export class FirstLoginComponent implements OnInit {

  workplaceForm;
  //callFirstTimeSetup;
  //data;
  constructor(private formBuilder:FormBuilder,private adminService : AdminService,
    private router: Router,private authenticationService :AuthenticationService) { }
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
    console.log(sessionStorage.getItem('admin_id'));
    console.log(sessionStorage.getItem('client_id'));

    this.admin_id=sessionStorage.getItem('admin_id');
    this.client_id=sessionStorage.getItem('client_id');

    }

  addCreds(){
    console.log('addCreds called');
    const creds = this.workplaceForm.controls.area_list as FormArray;
      creds.push(this.formBuilder.group({
        area_name:['']
      }));
  }

  closeCreds(Index: number){
    // removeSkillButtonClick(skillGroupIndex: number): void {
(<FormArray>this.workplaceForm.get('area_list')).removeAt(Index);
}


firstTimeSetup(){
  let workPlaceData=this.workplaceForm.value;
  workPlaceData.admin_id=this.admin_id;
  workPlaceData.client_id=this.client_id;
  console.log(workPlaceData);
  this.adminService.firstTimeSetup(workPlaceData)
            .subscribe(
                data=>{
                console.log(data);
                this.router.navigate(['home']);
              },
                error=>{
                    console.log(error)
                }
            ); 
}

logout(){
  this.authenticationService.logout();
  this.router.navigate(["/login"]);
 }
}

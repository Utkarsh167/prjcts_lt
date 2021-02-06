import { Component, OnInit } from '@angular/core';
import { AdminService } from '../admin.service';
import { FormGroup, FormBuilder, FormArray, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-new-user',
  templateUrl: './add-new-user.component.html',
  styleUrls: ['./add-new-user.component.css']
})
export class AddNewUserComponent implements OnInit {

  checkboxForm:FormGroup;
  moduleData:any;
  add_user:FormGroup;
  userWholeData;
  locationList;
  loading=true;
  constructor(private adminService:AdminService,private formBuilder:FormBuilder,
    private router:Router,private toastrService:ToastrService) { 
    this.checkboxForm = this.formBuilder.group({
      modules: new FormArray([])
    });
    //this.addCheckboxes();
  }


  ngOnInit() {
    this.add_user =
    this.formBuilder.group({
              name: ['', Validators.required],
              client_email: ['', Validators.required],
              location_id: ['0', Validators.required],
              client_passwd: ['', Validators.required],
              admin_type: ['0', Validators.required]
          });
    this.getUserModulesData();
    this.getUsersData();
   
  }

  getUserModulesData(){
    this.adminService.getUserModules()
            .subscribe(
                data=>{
                    console.log(data);
                    this.moduleData=data;
                    this.moduleData=this.moduleData.user_modules;
                    this.moduleData.map((o, i) => {
                      const control = new FormControl(); // if first item set to true, else false
                      (this.checkboxForm.controls.modules as FormArray).push(control);
                    });
                    this.loading=false;
                },
                error=>{
                    console.log(error);
                    this.toastrService.error('Server Error','Please try again later', {
                      timeOut: 2000,
                      positionClass: 'toast-bottom-right',
                    });
                    this.loading=false;
                }

            );
  }


  submit() {
    const selectedOrderIds = this.checkboxForm.value.modules
      .map((v, i) => v ? this.moduleData[i].module_id : null)
      .filter(v => v !== null);
    console.log(JSON.stringify(selectedOrderIds));
  }

  selectAllCheckBoxes(){
    var all;
    for(let i=0;i<this.moduleData.length;i++){
      all[i]=1;
   //   this.checkboxForm.setValue(1);

      //this.checkboxForm.controls.modules[i].updateValue(1);
    }
     //  this.checkboxForm.patchValue({modules:[1,1,1,1,1,1,1,1,1,1,1,1,1] });

    // this.moduleData.map((o, i) => {
    //  // const control = new FormControl(i); // if first item set to true, else false
    //   (this.checkboxForm.controls.modules as FormArray).setValue(i);
    // });
  }

  addNewUser(){
    this.loading=true;
    var finalData;
    finalData=this.add_user.value;
    finalData.client_id=sessionStorage.getItem('client_id');
    //console.log(finalData);
    const selectedOrderIds = this.checkboxForm.value.modules
    .map((v, i) => v ? 1 : 0)
    .filter(v => v !== null);
    console.log(JSON.stringify(selectedOrderIds));
    finalData.user_rights=JSON.stringify(selectedOrderIds);
    console.log(finalData);
    this.adminService.addNewUser(finalData).subscribe(
      data=>{
            console.log(data);
            this.loading=false;
            this.router.navigate['/home/users'];
            this.toastrService.success('User Added Successfully','', {
              timeOut: 3000,
              positionClass: 'toast-bottom-right',
            });
           // this.getUsersData();
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


  getUsersData(){
    this.adminService.getAllUsers()
             .subscribe(
                 data=>{
                     console.log(data);
                     this.userWholeData=data;
                    this.loading=false;              
                     this.locationList=this.userWholeData.location_data;
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
 

}

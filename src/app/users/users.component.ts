import { Component, OnInit,ViewChild } from '@angular/core';
import { AdminService } from '../admin.service';
import html2canvas from 'html2canvas';  
import * as jspdf from 'jspdf';  
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import { ModalService } from '../_modal';
import { FormBuilder,Validators,FormControl, FormArray,FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
callUserData;
allUserData;
data;
add_user:FormGroup;
displayedColumns: string[] = [ 'position','name', 'client_email', 'location_name','admin_type','created_at'];
  dataSource;
  userWholeData;
  locationList;
  checkboxForm:FormGroup;
  moduleData:any;
  loading=true;

  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  constructor(private adminService:AdminService,private modalService:ModalService,
    private formBuilder : FormBuilder,private toastrService:ToastrService) {
      this.checkboxForm = this.formBuilder.group({
        modules: new FormArray([])
      });
     }
  

  ngOnInit() {
  this.getUsersData();
  this.add_user =
  this.formBuilder.group({
            name: ['', Validators.required],
            client_email: ['', Validators.required],
            location_id: ['0', Validators.required],
            client_passwd: ['', Validators.required],
            admin_type: ['0', Validators.required]
        });
        this.getUserModulesData();
  }

  //migrated
  getUsersData(){
   this.callUserData=this.adminService.getAllUsers()
            .subscribe(
                data=>{
                    console.log(data);
                    this.loading=false;
                    this.userWholeData=data;
                    this.allUserData=this.userWholeData.result;
                    this.locationList=this.userWholeData.location_data;
                    // for(let i=0;i<this.allUserData.length;i++){
                    //   this.allUserData[i].position=i+1;
                    // }
                    this.dataSource=new MatTableDataSource(this.allUserData);
                    this.dataSource.sort = this.sort;
                    this.dataSource.paginator = this.paginator;

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

  public captureScreen()  
  {  
    var data = document.getElementById('contentToConvert');  
    html2canvas(data).then(canvas => {  
      // Few necessary setting options  
      var imgWidth = 208;   
      var pageHeight = 295;    
      var imgHeight = canvas.height * imgWidth / canvas.width;  
      var heightLeft = imgHeight;  
  
      const contentDataURL = canvas.toDataURL('image/png')  
      let pdf = new jspdf('p', 'mm', 'a4'); // A4 size page of PDF  
      var position = 0;  
      pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight)  
      pdf.save('MYPdf.pdf'); // Generated PDF   
    });  
  }  
test(data){
  alert(data);
}

applyFilter(filterValue: string) {
  this.dataSource.filter = filterValue.trim().toLowerCase();

  if (this.dataSource.paginator) {
    this.dataSource.paginator.firstPage();
  }
}


openModalForNewUser(){
  this.openModal('add-new-user');
}

openModal(id: string) {
  this.modalService.open(id);
  //console.log("clicked under : "+underId);
 // this.modalWorkplaceId=underId;
}

closeModal(id: string) {
  this.modalService.close(id);
}

// addNewUser(){
//   var finalData;
//   finalData=this.add_user.value;
//   finalData.client_id=sessionStorage.getItem('client_id');
//   console.log(finalData);
//   this.adminService.addNewUser(finalData).subscribe(
//     data=>{
//           console.log(data);
//           this.getUsersData();
//     },
//     error=>{
//           console.log(error);
//           this.toastrService.error('Server Error','Please try again later', {
//             timeOut: 2000,
//             positionClass: 'toast-bottom-right',
//           });
//     }

//   );
// }







getUserModulesData(){
  this.adminService.getUserModules()
          .subscribe(
              data=>{
                  console.log(data);
                  this.moduleData=data;
                  this.loading=false;
                  this.moduleData=this.moduleData.result;
                  this.moduleData.map((o, i) => {
                    const control = new FormControl(); // if first item set to true, else false
                    (this.checkboxForm.controls.modules as FormArray).push(control);
                  });
                  this.loading=false;
              },
              error=>{
                  console.log(error);
                  this.loading=false;
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
  }
}

addNewUser(){

  if(this.add_user.invalid){
    this.toastrService.warning('','Please fill all data', {
      timeOut: 2000,
      positionClass: 'toast-bottom-right',
    });
    return;
   
  }
  if(this.add_user.get('admin_type').value=="0"){
    this.toastrService.warning('','Please fill all data', {
      timeOut: 2000,
      positionClass: 'toast-bottom-right',
    });
    return;
  }
  if(this.add_user.get('location_id').value=="0"){
    this.toastrService.warning('','Incomplete data', {
      timeOut: 2000,
      positionClass: 'toast-bottom-right',
    });
    return;
  }
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
  console.log(JSON.stringify(finalData));
  this.adminService.addNewUser(finalData).subscribe(
    data=>{
          console.log(data);
          if(data.status!=0){

          this.loading=false;
         // this.router.navigate['/home/users'];
         this.getUsersData();
         this.closeModal('add-new-user');
          this.toastrService.success('User Added Successfully','', {
            timeOut: 3000,
            positionClass: 'toast-bottom-right',
          });
        }else{
          this.loading=false;
         this.closeModal('add-new-user');
          this.toastrService.error('Server Error','Please try again later', {
            timeOut: 2000,
            positionClass: 'toast-bottom-right',
          });
        }
         // this.getUsersData();
    },
    error=>{
          console.log(error);
          this.loading=false;
         this.closeModal('add-new-user');
          this.toastrService.error('Server Error','Please try again later', {
            timeOut: 2000,
            positionClass: 'toast-bottom-right',
          });
    }

  );
}



}

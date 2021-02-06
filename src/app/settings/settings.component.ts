import { Component, OnInit,ViewChild} from '@angular/core';
import * as XLSX from 'xlsx';
import { AdminService } from '../admin.service';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import { ModalService } from '../_modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  
  
  constructor(private adminService:AdminService,private modalService:ModalService
    ,private formBuilder:FormBuilder,private toastrService:ToastrService) { }

  finalData:any;
  fileName='null';
  displayedColumnsEmpList: string[] = [ 'position','emp_id', 'emp_name', 'emp_email','created_at','is_active','action'];
  dataSourceEmpList;
  allEmpData;
  arrayBuffer:any;
  file:any=null;
  empData;
  isEdit:boolean;
  selected_emp;
  add_emp:FormGroup;
  @ViewChild(MatSort, {static: false}) sortEmpList: MatSort;
  @ViewChild(MatPaginator, {static: false}) paginatorEmpList: MatPaginator;

  callUserData;
  allUserData;
  data;
  add_user:FormGroup;
  displayedColumnsUserList: string[] = [ 'position','name', 'client_email', 'location_name','admin_type','created_at','action'];
    dataSourceUserList;
    userWholeData;
    locationList;

    isSuper;
    user_rights;
    user_right_json;
  
   @ViewChild(MatSort, {static: false}) sortUserList: MatSort;
   @ViewChild(MatPaginator, {static: false}) paginatorUserList: MatPaginator;
  
  ngOnInit() {

    this.isSuper=sessionStorage.getItem('is_super');
    if(!(this.isSuper=='true')){
    //this.user_rights=JSON.parse(String(sessionStorage.getItem('user_rights')));
    this.user_rights=sessionStorage.getItem('user_rights');
    this.user_right_json=JSON.parse(this.user_rights)
    console.log(this.user_right_json);
    }
    console.log(this.isSuper);

    console.log(this.file);
    this.fileName="null";
    //this.getEmpList();
    this.add_emp =
    this.formBuilder.group({
              emp_id: ['', Validators.required],
              emp_name: ['', Validators.required],
              emp_email: ['', Validators.required],
          });

          //this.getUsersData();
          this.add_user =
          this.formBuilder.group({
                    name: ['', Validators.required],
                    client_email: ['', Validators.required],
                    location_id: ['0', Validators.required],
                    client_passwd: ['', Validators.required],
                    admin_type: ['', Validators.required]
                });
  }

  incomingfile(event) 
  {
  console.log(this.file);
  this.file= event.target.files[0]; 
  console.log(this.file.name);
  this.fileName=this.file.name;
  }

 Upload() {
      let fileReader = new FileReader();
        fileReader.onload = (e) => {
            this.arrayBuffer = fileReader.result;
            var data = new Uint8Array(this.arrayBuffer);
            var arr = new Array();
            for(var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
            var bstr = arr.join("");
            var workbook = XLSX.read(bstr, {type:"binary"});
            var first_sheet_name = workbook.SheetNames[0];
            var worksheet = workbook.Sheets[first_sheet_name];
            console.log(XLSX.utils.sheet_to_json(worksheet,{raw:true}));

            this.finalData={"json_data":XLSX.utils.sheet_to_json(worksheet,{raw:true})}
            this.finalData.client_id=sessionStorage.getItem('client_id');
            this.finalData.admin_id=sessionStorage.getItem('admin_id');
            this.adminService.uploadExcellFile(this.finalData)
            .subscribe(
                data=>{
                console.log(data);    
                },
                error=>{
                console.log(error);
                this.toastrService.error('Server Error','Please try again later', {
                  timeOut: 2000,
                  positionClass: 'toast-bottom-right',
                });
                }
            );
        }
        fileReader.readAsArrayBuffer(this.file);

       
}

getEmpList(){
  this.adminService.getEmpList(sessionStorage.getItem('client_id'))
  .subscribe(
      data=>{
      console.log(data);  
      this.allEmpData=data;
      this.dataSourceEmpList=new MatTableDataSource(this.allEmpData.emp_list);
      this.dataSourceEmpList.sort = this.sortEmpList;
      this.dataSourceEmpList.paginator = this.paginatorEmpList;  
      },
      error=>{
      console.log(error);
      this.toastrService.error('Server Error','Please try again later', {
        timeOut: 2000,
        positionClass: 'toast-bottom-right',
      });
      }
  );
}

applyFilterEmpList(filterValue: string) {
  this.dataSourceEmpList.filter = filterValue.trim().toLowerCase();

  if (this.dataSourceEmpList.paginator) {
    this.dataSourceEmpList.paginator.firstPage();
  }
}


AddNewEmployeeOpenModal(modal){
this.add_emp.reset();
this.isEdit=false;
this.openModal(modal);
}

openModal(id: string) {
  this.modalService.open(id);
  
}

closeModal(id: string) {
  this.modalService.close(id);
}
onSubmitEmpForm()
{
  console.log(this.add_emp.value);
this.empData=this.add_emp.value;
this.empData.client_id=sessionStorage.getItem('client_id');
this.empData.admin_id=sessionStorage.getItem('admin_id');

  if(!this.isEdit){
this.adminService.addEmpData(this.empData)
.subscribe(
    data=>{
    console.log(data);  
    this.closeModal('add-new-emp');
    this.getEmpList();
    },
    error=>{
    console.log(error);
    this.toastrService.error('Server Error','Please try again later', {
      timeOut: 2000,
      positionClass: 'toast-bottom-right',
    });
    }
);
  }else{
    this.empData.id=this.selected_emp.id;
    this.adminService.editEmpData(this.empData)
.subscribe(
    data=>{
    console.log(data);  
    this.closeModal('add-new-emp');
    this.getEmpList();
    },
    error=>{
    console.log(error);
    this.toastrService.error('Server Error','Please try again later', {
      timeOut: 2000,
      positionClass: 'toast-bottom-right',
    });
    }
);
  }
}

editEmployee(emp,modal){
  console.log(emp);
  this.selected_emp=emp;
  this.isEdit=true;
  this.add_emp.patchValue(
      emp
  );
  this.openModal(modal);
}

// disableEmployee(emp){
//   var status='';
//   if(emp.is_active==1){
//     emp.is_active=0;
//     status='disable'
//   }else{
//     emp.is_active=1;
//     status='enable'
//   }
//   if(window.confirm('Are sure you want to '+status+' this employee ?')){
//     //put your delete method logic here
//     var data = new FormData();

//     data.append("id", emp.id);
//     data.append('is_active', emp.is_active);
//    console.log(JSON.stringify(data));
//     this.adminService.disableEnableEmployee()
//     .subscribe(
//         data=>{
//         console.log(data);  
//         //this.closeModal('add-new-emp');
//         this.getEmpList();
//         },
//         error=>{
//         console.log(error);
//         this.toastrService.error('Server Error','Please try again later', {
//           timeOut: 2000,
//           positionClass: 'toast-bottom-right',
//         });
//         }
//     );
//    }
 
 
// }

getUsersData(){
  this.callUserData=this.adminService.getAllUsers()
           .subscribe(
               data=>{
                   console.log(data);
                   this.userWholeData=data;
                   this.allUserData=this.userWholeData.user_data;
                   this.locationList=this.userWholeData.location_data;
                   // for(let i=0;i<this.allUserData.length;i++){
                   //   this.allUserData[i].position=i+1;
                   // }
                   this.dataSourceUserList=new MatTableDataSource(this.allUserData);
                   this.dataSourceUserList.sort = this.sortUserList;
                   this.dataSourceUserList.paginator = this.paginatorUserList;

               },
               error=>{
                 console.log(error);
                 this.toastrService.error('Server Error','Please try again later', {
                   timeOut: 2000,
                   positionClass: 'toast-bottom-right',
                 });
                   
               }

           );
 }


applyFilterUserList(filterValue: string) {
 this.dataSourceUserList.filter = filterValue.trim().toLowerCase();

 if (this.dataSourceUserList.paginator) {
   this.dataSourceUserList.paginator.firstPage();
 }
}


openModalForNewUser(){
 this.openModal('add-new-user');
}




addNewUser(){
 var finalData;
 finalData=this.add_user.value;
 finalData.client_id=sessionStorage.getItem('client_id');
 console.log(finalData);
 this.adminService.addNewUser(finalData).subscribe(
   data=>{
         console.log(data);
         this.getUsersData();
   },
   error=>{
         console.log(error);
         this.toastrService.error('Server Error','Please try again later', {
           timeOut: 2000,
           positionClass: 'toast-bottom-right',
         });
   }

 );
}


}

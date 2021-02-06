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
  selector: 'app-emp-list',
  templateUrl: './emp-list.component.html',
  styleUrls: ['./emp-list.component.css']
})
export class EmpListComponent implements OnInit {

  constructor(private adminService:AdminService,private modalService:ModalService
    ,private formBuilder:FormBuilder,private toastrService:ToastrService) { }

  finalData:any;
  displayedColumns: string[] = [ 'position','emp_id', 'emp_name', 'emp_email','created_at','action'];
  dataSource;
  allEmpData;
  arrayBuffer:any;
  file:File;
  fileName='null';
  empData;
  isEdit:boolean;
  selected_emp;
  add_emp:FormGroup;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  loading=true;
  disable_emp_data;
  status;


  ngOnInit() {
    this.getEmpList();
    this.add_emp =
    this.formBuilder.group({
              emp_id: ['', Validators.required],
              emp_name: ['', Validators.required],
              emp_email: ['', Validators.required],
          });
    this.fileName="null";

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
      this.loading=true;
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

            this.finalData={"emp_list":XLSX.utils.sheet_to_json(worksheet,{raw:true})}
            this.finalData.client_id=sessionStorage.getItem('client_id');
            this.finalData.admin_id=sessionStorage.getItem('admin_id');
            console.log(JSON.stringify(this.finalData));
            this.adminService.uploadExcellFile(this.finalData)
            .subscribe(
                data=>{
                console.log(data); 
                if(data.status!=0){  
                this.loading=false;
                this.toastrService.success('',data.msg, {
                  timeOut: 3000,
                  positionClass: 'toast-bottom-right',
                });
                this.closeModal('bulk-upload');
                this.getEmpList();
              }else{
                this.loading=false;
                this.toastrService.error('Server Error','Please try again later', {
                  timeOut: 2000,
                  positionClass: 'toast-bottom-right',
                });
                this.closeModal('bulk-upload');

              }
                },
                error=>{
                console.log(error);
                this.loading=false;
                this.toastrService.error('Server Error','Please try again later', {
                  timeOut: 2000,
                  positionClass: 'toast-bottom-right',
                });
                this.closeModal('bulk-upload');
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
      this.loading=false;
      this.allEmpData=data;
      this.dataSource=new MatTableDataSource(this.allEmpData.result);
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

applyFilter(filterValue: string) {
  this.dataSource.filter = filterValue.trim().toLowerCase();

  if (this.dataSource.paginator) {
    this.dataSource.paginator.firstPage();
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
this.loading=true;

  if(!this.isEdit){
this.adminService.addEmpData(this.empData)
.subscribe(
    data=>{
    console.log(data); 
    if(data.status!=0){ 
    this.closeModal('add-new-emp');
    this.loading=false;
    this.getEmpList();
    this.toastrService.success('','Employee data Added Successfully', {
      timeOut: 3000,
      positionClass: 'toast-bottom-right',
    });
  }else{
    this.loading=false;
    this.toastrService.warning('Employee id already exist','Please type a different id', {
      timeOut: 2000,
      positionClass: 'toast-bottom-right',
    });
  }
    },
    error=>{
    console.log(error);
    this.loading=false;
    this.closeModal('add-new-emp');
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
    if(data.status!=0){
    this.closeModal('add-new-emp');
    this.loading=false;
    this.toastrService.success('','Employee data Updated Successfully', {
      timeOut: 3000,
      positionClass: 'toast-bottom-right',
    });
    this.getEmpList();
  }else{
    this.loading=false;
    this.toastrService.warning('Employee id already exist','Please type a different id', {
      timeOut: 2000,
      positionClass: 'toast-bottom-right',
    });
  }
    },
    error=>{
    console.log(error);
    this.loading=false;
    this.closeModal('add-new-emp');
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

openModalDisableEmployee(emp,modal){
  var status='';
  this.disable_emp_data=emp;
  if(emp.is_active==1){
    this.disable_emp_data.is_active='0';
    status='disable';
    this.status=status;
  }else{
    this.disable_emp_data.is_active='1';
    status='enable';
    this.status=status;
  }
 // this.disable_emp_data=emp;
  this.openModal(modal);
}

disableEmployee(modal){
  var data = new FormData();

    data.append("id", this.disable_emp_data.id);
    data.append('is_active', this.disable_emp_data.is_active);
   console.log(JSON.stringify(data));
   this.loading=true;

    this.adminService.disableEnableEmployee(this.disable_emp_data.id, this.disable_emp_data.is_active)
    .subscribe(
        data=>{
        console.log(data);  
        //this.closeModal('add-new-emp');
        this.closeModal(modal);
        this.getEmpList();
        this.loading=false;
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

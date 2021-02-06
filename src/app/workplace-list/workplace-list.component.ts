import { Component, OnInit,ViewChild } from '@angular/core';
import { AdminService } from '../admin.service';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import { ModalService } from '../_modal';
import { FormBuilder,Validators,FormControl, FormArray,FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-workplace-list',
  templateUrl: './workplace-list.component.html',
  styleUrls: ['./workplace-list.component.css']
})
export class WorkplaceListComponent implements OnInit {
  
  
  allWorkplaceData;
  data;
  add_user:FormGroup;
  displayedColumns: string[] = [ 'position','workplace_name','created_at','action'];
  dataSource;
  loading=true;
  workplace_name_change;
  selected_wp_id;
  deleteWpId;
  
    @ViewChild(MatSort, {static: true}) sort: MatSort;
    @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  
    constructor(private adminService:AdminService,private modalService:ModalService,
      private formBuilder : FormBuilder,private toastrService:ToastrService) {
       }
  
  ngOnInit() {
    this.getWorkplaceData();
  this.add_user =
  this.formBuilder.group({
            name: ['', Validators.required],
            client_email: ['', Validators.required],
            location_id: ['0', Validators.required],
            client_passwd: ['', Validators.required],
            admin_type: ['0', Validators.required]
        });
  }


  getWorkplaceData(){
    this.adminService.getAllWorkplaces(sessionStorage.getItem('client_id'))
             .subscribe(
                 data=>{
                     console.log(data);
                     this.loading=false;
                     this.allWorkplaceData=data;
                     this.dataSource=new MatTableDataSource(this.allWorkplaceData.result);
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
  
  
  openModalForWorkplace(){
    this.openModal('add-new-user');
  }
  
  openModal(id: string) {
    this.modalService.open(id);
  }
  
  closeModal(id: string) {
    this.modalService.close(id);
  }


  openModalForChangeWorkplaceName(wp_name,wp_id){
    this.workplace_name_change=wp_name;
    this.selected_wp_id=wp_id;
    this.openModal('edit-workplace-name');
  }
  
    openWpModal(element,modal){
      this.deleteWpId=element.workplace_id;
      this.openModal(modal);
    }

  editWorkplaceName(){
    this.loading=true;
    this.adminService.editWorkplaceName(this.selected_wp_id,this.workplace_name_change)
             .subscribe(
                 data=>{
                     console.log(data);
                     if(data.status!=0){
                     this.loading=false;
                     this.closeModal('edit-workplace-name');
                     this.toastrService.success('','Workplace Updated Successfully', {
                      timeOut: 3000,
                      positionClass: 'toast-bottom-right',
                    });
                     this.getWorkplaceData();
                  }else{
                    this.loading=false;
                    this.closeModal('edit-workplace-name');
                   this.toastrService.error('Server Error','Please try again later', {
                     timeOut: 2000,
                     positionClass: 'toast-bottom-right',
                   });
                  }
                 },
                 error=>{
                   console.log(error);
                   this.loading=false;
                   this.closeModal('edit-workplace-name');
                   this.toastrService.error('Server Error','Please try again later', {
                     timeOut: 2000,
                     positionClass: 'toast-bottom-right',
                   });
                     
                 }
 
             ); 
  }

  deleteWorkplace(modal){
    this.loading=true;
    this.adminService.deleteWp(this.deleteWpId)
    .subscribe(
        data=>{
            console.log(data);
            this.loading=false;
            this.closeModal(modal);
            this.toastrService.success('','Workplace Deleted Successfully', {
              timeOut: 3000,
              positionClass: 'toast-bottom-right',
            });
            this.getWorkplaceData();
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

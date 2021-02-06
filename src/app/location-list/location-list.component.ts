import { Component, OnInit,ViewChild } from '@angular/core';
import { AdminService } from '../admin.service';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import { ModalService } from '../_modal';
import { FormBuilder,Validators,FormControl, FormArray,FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-location-list',
  templateUrl: './location-list.component.html',
  styleUrls: ['./location-list.component.css']
})
export class LocationListComponent implements OnInit {
 
  
  allLocationData;
  data;
  add_location:FormGroup;
  displayedColumns: string[] = [ 'position','name','created_at','action'];
    dataSource;
    userWholeData;
    locationList;
    checkboxForm:FormGroup;
    moduleData:any;
    loading=true;
    location_name;
    selected_loc_id;
    arch_loc_id;
    del_loc_id;
    
  
    @ViewChild(MatSort, {static: true}) sort: MatSort;
    @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  
    constructor(private adminService:AdminService,private modalService:ModalService,
      private formBuilder : FormBuilder,private toastrService:ToastrService) {
        this.checkboxForm = this.formBuilder.group({
          modules: new FormArray([])
        });
       }
  
  ngOnInit() {
    this.getLocationData();
  this.add_location =
  this.formBuilder.group({
            name: ['', Validators.required],
        });
  }


  openLocationModal(element,modal){
    this.del_loc_id=element.id;
    this.openModal(modal);
  }


  getLocationData(){
    this.adminService.getAllLocations(sessionStorage.getItem('client_id'))
             .subscribe(
                 data=>{
                     console.log(data);
                     this.loading=false;
                     this.allLocationData=data;
                     this.dataSource=new MatTableDataSource(this.allLocationData.result);
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
  
  
  openModalForLocation(name,loc_id){
    this.location_name=name;
    this.selected_loc_id=loc_id;
    this.openModal('edit-location');
  }
  
  openModal(id: string) {
    this.modalService.open(id);
  }
  
  closeModal(id: string) {
    this.modalService.close(id);
  }

  editLocationName(){
    this.loading=true;
    this.adminService.editLocationName(this.selected_loc_id,this.location_name)
             .subscribe(
                 data=>{
                     console.log(data);
                     if(data.status!=0){
                     this.loading=false;
                     this.closeModal('edit-location');
                     this.toastrService.success('','Location updated successfully', {
                      timeOut: 3000,
                      positionClass: 'toast-bottom-right',
                    });
  
                     this.getLocationData();
                  }else{
                    this.loading=false;
                   this.toastrService.error('Server Error','Please try again later', {
                     timeOut: 2000,
                     positionClass: 'toast-bottom-right',
                   });
                   this.closeModal('edit-location');

                  }
                 },
                 error=>{
                   console.log(error);
                   this.loading=false;
                   this.toastrService.error('Server Error','Please try again later', {
                     timeOut: 2000,
                     positionClass: 'toast-bottom-right',
                   });
                   this.closeModal('edit-location');

                     
                 }
 
             ); 
  }


  openModalForArchive(modal,loc_id){
    this.openModal(modal);
    this.arch_loc_id=loc_id;
  }

  archiveLocation(){
    this.adminService.archiveLocation(this.arch_loc_id)
    .subscribe(
        data=>{
            console.log(data);
            this.loading=false;
            this.closeModal('change-confirmation');
            this.getLocationData();
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

  deleteLocation(modal){
    this.loading=true;
    this.adminService.deleteLocation(this.del_loc_id)
    .subscribe(
        data=>{
            console.log(data);
            this.loading=false;
            this.closeModal(modal);
            this.toastrService.success('','Location Deleted Successfully', {
              timeOut: 3000,
              positionClass: 'toast-bottom-right',
            });
            this.getLocationData();
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

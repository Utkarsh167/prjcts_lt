import { Component, OnInit,ViewChild } from '@angular/core';
import { AdminService } from '../admin.service';
import html2canvas from 'html2canvas';  
import * as jspdf from 'jspdf';  
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ModalService } from '../_modal';



@Component({
  selector: 'app-areas',
  templateUrl: './areas.component.html',
  styleUrls: ['./areas.component.css']
})
export class AreasComponent implements OnInit {
 callAreaData;
 allAreaData;
 data;
 area_obj;
 displayedColumns: string[] = [ 'position','area_name', 'location_name','created_at'];
  dataSource;
  locationList;
  add_area:FormGroup;
  loading=true;
  area_name_change;
  selected_area_id;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;


  constructor(private adminService:AdminService,private toastrService:ToastrService,private formBuilder:FormBuilder,private modalService : ModalService) { }
  

  ngOnInit() {
  this.add_area =
  this.formBuilder.group({
            area_name: ['', Validators.required],
            location_id:['0',Validators.required]
        });
  this.getAreasData();
  }

  //migrated
   getAreasData(){
   this.callAreaData=this.adminService.getAllAreas()
            .subscribe(
                data=>{
                    console.log(data);
                    this.allAreaData=data;
                    this.loading=false;
                    this.locationList=this.allAreaData.locations;
                    this.dataSource=new MatTableDataSource(this.allAreaData.area);
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
                    //
                }

            );
  }
  openModalForAddArea(){
    this.add_area.reset();
    this.add_area.controls['location_id'].setValue('0');
    this.openModal('add-area')
  }

  openModal(id: string) {
    this.modalService.open(id);
    
}

closeModal(id: string) {
    this.modalService.close(id);
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


//migrated
onSubmitArea(){
  console.log(this.add_area.value);
  this.loading=true;
  this.area_obj=this.add_area.value;
  this.area_obj.admin_id=sessionStorage.getItem('admin_id');
  console.log(this.area_obj);
  this.adminService.addNewArea(this.area_obj)
            .subscribe(
                data=>{
                    console.log(data);
                    if(data.status!=0){
                    this.closeModal('add-area');
                    this.toastrService.success('','Area added Successfully', {
                      timeOut: 3000,
                      positionClass: 'toast-bottom-right',
                    });
                    this.getAreasData();
                    this.loading=false;
                  }else{
                    this.loading=false;
                    this.closeModal('add-area');
                    this.toastrService.error('Server Error','Please try again later', {
                      timeOut: 3000,
                      positionClass: 'toast-bottom-right',
                    });
                  }
                   
                },
                error=>{
                  console.log(error);
                  this.loading=false;
                  this.closeModal('add-area');
                  this.toastrService.error('Server Error','Please try again later', {
                    timeOut: 3000,
                    positionClass: 'toast-bottom-right',
                  });
                    //
                }

            );
}

openModalForChangeAreaName(area_name,area_id){
  this.area_name_change=area_name;
  this.selected_area_id=area_id;
  this.openModal('edit-area-name');
}


//migrated
editAreaName(){
  this.adminService.editDeviceAreaName(this.selected_area_id,this.area_name_change)
           .subscribe(
               data=>{
                   console.log(data);
                   this.loading=false;
                   this.closeModal('edit-area-name');
                   this.getAreasData();
                   this.toastrService.success('','Device Area name updated Successfully', {
                    timeOut: 3000,
                    positionClass: 'toast-bottom-right',
                  });
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

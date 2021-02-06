import { Component, OnInit,ViewChild } from '@angular/core';
import { AdminService } from '../admin.service';
import html2canvas from 'html2canvas';  
import * as jspdf from 'jspdf';  
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { ModalService } from '../_modal';


@Component({
  selector: 'app-devices',
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.css']
})
export class DevicesComponent implements OnInit {
  callDeviceData;
  allDeviceData:any;
  data;
  displayedColumns: string[] = [ 'position','tablet_name', 'location_name', 'area_name','survey_name','created_at','battery_status'];
  dataSource;
  areaList;
  surveyList;
  selectedArea=0;
  selectedSurvey=0;
  selectedDevice;
  loading=true;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  edit_type;
  tablet_name_change;
  selected_tablet_id;

  constructor(private adminService:AdminService,private toastrService:ToastrService,private modalService:ModalService) { }

  ngOnInit() {
  this.getDeviceData();

  }

  //migrated
   getDeviceData(){
   this.callDeviceData=this.adminService.getAllDeviceData()
            .subscribe(
                data=>{
                  console.log(data);
                  if(data.status!=1){
                    this.loading=false;
                    this.allDeviceData=data.result;
                    this.dataSource=new MatTableDataSource(this.allDeviceData);
                    this.dataSource.sort = this.sort;
                    this.dataSource.paginator = this.paginator;
                  }else{
                    this.loading=false;
                    this.allDeviceData=data.result;                    
                    this.dataSource=new MatTableDataSource(this.allDeviceData);
                    this.dataSource.sort = this.sort;
                    this.dataSource.paginator = this.paginator;
                  }
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

editDevice(device,modal,edit_type){
  this.edit_type=edit_type;
  console.log(device);
  if(edit_type=='edit_area'){
  this.selectedArea=device.area_id;
  this.openModal(modal);
  this.areaList=device.area_list;
  this.selectedDevice=device;
  }else{
  this.selectedSurvey=device.survey_id;
  this.openModal(modal);
  this.surveyList=device.survey_list;
  this.selectedDevice=device;
  }
}

openModal(id: string) {
  this.modalService.open(id);
  //console.log("clicked under : "+underId);
 // this.modalWorkplaceId=underId;
}

closeModal(id: string) {
  this.modalService.close(id);
}

//migrated
editTabletArea(){
  this.loading=true;
  console.log(this.selectedArea);
  if(this.edit_type=='edit_area'){
  if(this.selectedArea==0){
    this.toastrService.warning('Please Select Area','', {
      timeOut: 2000,
      positionClass: 'toast-bottom-right',
    });
    this.loading=false;
  }else{
    this.adminService.editTabletArea(this.selectedDevice.tablet_id,this.selectedArea)
            .subscribe(
                data=>{
                  if(data.status!=0){
                    console.log(data);
                    this.loading=false;
                    this.closeModal('add-new-device');
                    this.toastrService.success('Area Assigned Successfully','', {
                      timeOut: 2000,
                      positionClass: 'toast-bottom-right',
                    });
                    this.getDeviceData();
                  }else{
                    this.loading=false;
                    this.closeModal('add-new-device');
                    this.toastrService.error('Server Error','Please try again later', {
                      timeOut: 2000,
                      positionClass: 'toast-bottom-right',
                    });
                  }
                },
                error=>{
                  console.log(error);
                  this.loading=false;
                  this.closeModal('add-new-device');
                  this.toastrService.error('Server Error','Please try again later', {
                    timeOut: 2000,
                    positionClass: 'toast-bottom-right',
                  });
                }
            );
  }
}else{
  if(this.selectedSurvey==0){
    this.toastrService.warning('Please Select Survey','', {
      timeOut: 2000,
      positionClass: 'toast-bottom-right',
    });
    this.loading=false;
  }else{
    this.adminService.editTabletSurvey(this.selectedDevice.tablet_id,this.selectedSurvey)
            .subscribe(
                data=>{
                  if(data.status!=0){
                    console.log(data);
                    this.loading=false;
                    this.closeModal('add-new-device');
                    this.toastrService.success('Survey Assigned Successfully','', {
                      timeOut: 2000,
                      positionClass: 'toast-bottom-right',
                    });
                    this.getDeviceData();
                  }else{
                    this.closeModal('add-new-device');
                    this.loading=false;
                    this.toastrService.error('Server Error','Please try again later', {
                      timeOut: 2000,
                      positionClass: 'toast-bottom-right',
                    });
                  }
                },
                error=>{
                  console.log(error);
                  this.closeModal('add-new-device');
                  this.loading=false;
                  this.toastrService.error('Server Error','Please try again later', {
                    timeOut: 2000,
                    positionClass: 'toast-bottom-right',
                  });
                }
            );
  }

     }
}


openModalForChangeDeviceName(tablet_name,tablet_id){
  this.tablet_name_change=tablet_name;
  this.selected_tablet_id=tablet_id;
  this.openModal('edit-device-name');
}


//migrated
editDeviceName(){
  this.adminService.editDeviceName(this.selected_tablet_id,this.tablet_name_change)
           .subscribe(
               data=>{
                 if(data.status!=0){
                   console.log(data);
                   this.loading=false;
                   this.closeModal('edit-device-name');
                   this.getDeviceData();
                   this.toastrService.success('','Device name updated Successfully', {
                    timeOut: 3000,
                    positionClass: 'toast-bottom-right',
                  });
                }else{
                  this.loading=false;
                  this.closeModal('edit-device-name');
                  this.toastrService.error('Server Error','Please try again later', {
                    timeOut: 2000,
                    positionClass: 'toast-bottom-right',
                  });
                }
               },
               error=>{
                 console.log(error);
                 this.loading=false;
                 this.closeModal('edit-device-name');
                 this.toastrService.error('Server Error','Please try again later', {
                   timeOut: 2000,
                   positionClass: 'toast-bottom-right',
                 });
                   
               }

           ); 
}


}

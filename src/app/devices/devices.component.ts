import { Component, OnInit,ViewChild } from '@angular/core';
import { AdminService } from '../admin.service';
import html2canvas from 'html2canvas';  
import * as jspdf from 'jspdf';  
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';


@Component({
  selector: 'app-devices',
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.css']
})
export class DevicesComponent implements OnInit {
  callDeviceData;
  allDeviceData:any;
  data;
  displayedColumns: string[] = [ 'position','tablet_name', 'location_name', 'area_name','survey_name','created_at','last_responsed','action'];
  dataSource;

  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;


  constructor(private adminService:AdminService) { }

  ngOnInit() {
  this.getDeviceData();

  }

   getDeviceData(){
   this.callDeviceData=this.adminService.getAllDeviceData(this.data)
            .subscribe(
                data=>{
                    console.log(data);
                    this.allDeviceData=data;

                    // for(let i=0;i<this.allDeviceData.length;i++){
                    //   this.allDeviceData[i].position=i+1;
                    // }
                    this.dataSource=new MatTableDataSource(this.allDeviceData);
                    this.dataSource.sort = this.sort;
                    this.dataSource.paginator = this.paginator;

                },
                error=>{
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

}

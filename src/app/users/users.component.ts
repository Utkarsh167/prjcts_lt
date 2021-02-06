import { Component, OnInit,ViewChild } from '@angular/core';
import { AdminService } from '../admin.service';
import html2canvas from 'html2canvas';  
import * as jspdf from 'jspdf';  
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';


@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
callUserData;
allUserData;
data;
displayedColumns: string[] = [ 'position','name', 'client_email', 'location_name','admin_type','created_at','action'];
  dataSource;

  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  constructor(private adminService:AdminService) { }
  

  ngOnInit() {
  this.getUsersData();
  }

  getUsersData(){
   this.callUserData=this.adminService.getAllUsers(this.data)
            .subscribe(
                data=>{
                    console.log(data);
               
                    this.allUserData=data;
                    // for(let i=0;i<this.allUserData.length;i++){
                    //   this.allUserData[i].position=i+1;
                    // }
                    this.dataSource=new MatTableDataSource(this.allUserData);
                    this.dataSource.sort = this.sort;
                    this.dataSource.paginator = this.paginator;

                },
                error=>{
                    
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

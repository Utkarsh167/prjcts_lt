import { Component, OnInit } from '@angular/core';
import {DatePipe} from '@angular/common';
import * as moment from 'moment';
import { AdminService } from '../admin.service';
import { ToastrService } from 'ngx-toastr';
// import { start } from 'repl';

class ImageSnippet {
  constructor(public src: string, public file: File) {}
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

alwaysShowCalendars: boolean;
showRangeLabelOnInput: boolean;
keepCalendarOpeningWithRange: boolean;
selected: any;
startDate;
finalData;
endDate;
activityLogList;
selectedFile: ImageSnippet;
profileData:any;

  invalidDates: moment.Moment[] = [moment().add(2, 'days'), moment().add(3, 'days'), moment().add(5, 'days')];
  ranges: any = {
    Today: [moment(), moment()],
    Yesterday: [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
    'This Month': [moment().startOf('month'), moment().endOf('month')],
    'Last Month': [
      moment()
        .subtract(1, 'month')
        .startOf('month'),
      moment()
        .subtract(1, 'month')
        .endOf('month')
    ]
  };
 
  isInvalidDate = (m: moment.Moment) =>  {
    return this.invalidDates.some(d => d.isSame(m, 'day') )
  }

  public imagePath;
  imgURL: any;
  public message: string;
  editProfileData:any={};
  constructor(private adminService:AdminService,private toastrService:ToastrService) {
    this.alwaysShowCalendars = false;
    this.keepCalendarOpeningWithRange = true;
    this.showRangeLabelOnInput = false;
    this.selected = {startDate: moment().subtract(29, 'days'), endDate: moment()};

   }

  ngOnInit() {
    var datePipe = new DatePipe('en-US');     
    this.startDate= datePipe.transform(moment().subtract(29,'days'), 'yyyy-MM-dd');
    this.endDate= datePipe.transform(moment(), 'yyyy-MM-dd');
    console.log(this.startDate+" "+this.endDate);
    this.getActivityLog();
    this.getProfileData();
  }

  rangeClicked(range) {
    console.log('[rangeClicked] range is : ', range);
  }
  datesUpdated(range) {
    var datePipe = new DatePipe('en-US');
    this.startDate = datePipe.transform(range.startDate._d, 'yyyy-MM-dd');
    this.endDate = datePipe.transform(range.endDate._d, 'yyyy-MM-dd');
    //this.selected = {startDate: this.startDate, endDate: this.endDate};           
    console.log('[datesUpdated] range is : ',  range.startDate._d +"   "+this.startDate+"   "+this.endDate);
    this.getActivityLog();
    //this.getAllResponses(sessionStorage.getItem('survey_id'),1);
    //console.log('selected date : '+this.selected);
  }

  getActivityLog(){
    this.startDate="'"+this.startDate+"'";
    this.endDate="'"+this.endDate+"'";
    

    this.finalData={
      is_super:sessionStorage.getItem('is_super'),
      admin_id:sessionStorage.getItem('admin_id'),
      client_id:sessionStorage.getItem('client_id'),
      start_date:String(this.startDate),
      end_date:String(this.endDate)
    }
    console.log( this.startDate+"   "+this.endDate);
    console.log(JSON.stringify(this.finalData));
    this.adminService.getActivityLog(this.finalData)
            .subscribe(
                data=>{
                    console.log(data);
                    this.activityLogList=data;
                    this.activityLogList=this.activityLogList.result;
                  //  this.surveyList=data;
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

  preview(files) {
    if (files.length === 0)
      return;
 
    var mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      this.message = "Only images are supported.";
      return;
    }
 
    var reader = new FileReader();
    this.imagePath = files;
    reader.readAsDataURL(files[0]); 
    reader.onload = (_event) => { 
      this.imgURL = reader.result; 
    this.editProfileData.fileToUpload=reader.result;
    }

    this.editProfileData.admin_id=sessionStorage.getItem('admin_id')
    this.editProfileData.user_name=sessionStorage.getItem('user_name');
    console.log(this.editProfileData);
    // this.adminService.updateProfileImg(this.editProfileData)
    //         .subscribe(
    //             data=>{
    //                 console.log(data);
    //               //  this.surveyList=data;
    //             },
    //             error=>{
    //                 console.log(error);
    //                 this.toastrService.error('Server Error','Please try again later', {
    //                   timeOut: 2000,
    //                   positionClass: 'toast-bottom-right',
    //                 });
    //             }
      
    //         );
  }
  

  processFile(imageInput: any) {
    const file: File = imageInput.files[0];
    const reader = new FileReader();

    reader.addEventListener('load', (event: any) => {

      this.selectedFile = new ImageSnippet(event.target.result, file);

      const formData = new FormData();
      formData.append('comp_icon', this.selectedFile.file,this.selectedFile.file.name);
      formData.append('admin_id', sessionStorage.getItem('admin_id'));
      formData.append('client_id', sessionStorage.getItem('client_id'));
      formData.append('user_name', sessionStorage.getItem('user_name'));


        // console.log(comp_icon.name);
        // console.log(productImage);
    
      // this.editProfileData.admin_id=sessionStorage.getItem('admin_id')
      // this.editProfileData.user_name=sessionStorage.getItem('user_name');
      // this.editProfileData.fileToUpload=this.selectedFile.file;

      //console.log(formData);
      this.adminService.add_comp_icon(formData).subscribe(
        (res) => {
        console.log(res);
       // this.imgURL=res.img_url;
        },
        (err) => {
          console.log(err);        
        })
    });

    reader.readAsDataURL(file);
  }

  getProfileData(){
    // this.adminService.getProfileData(sessionStorage.getItem('admin_id'))
    // .subscribe(
    //     (res)=>{
    //         console.log(res);
    //         this.profileData=res;
    //         this.profileData=this.profileData.data;
    //         this.imgURL=this.profileData.profile_img;
    //       //  this.surveyList=data;
    //     },
    //     (err)=>{
    //         console.log(err);
    //         this.toastrService.error('Server Error','Please try again later', {
    //           timeOut: 2000,
    //           positionClass: 'toast-bottom-right',
    //         });
    //     }

    // );
  }

}

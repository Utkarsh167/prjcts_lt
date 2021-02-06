import { DataService } from "../_services/data.service";
import { Component, OnInit } from '@angular/core';
import { AdminService } from '../admin.service';
import * as moment from 'moment';
import {DatePipe} from '@angular/common';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ModalService } from '../_modal';
import { ToastrService } from 'ngx-toastr';
declare var $: any;
import { DatepickerOptions } from 'ng2-datepicker';
import * as frLocale from 'date-fns/locale/fr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-responses',
  templateUrl: './responses.component.html',
  styleUrls: ['./responses.component.css']
})
export class ResponsesComponent implements OnInit {
    message;
    allResponses;
    responseData;
    callAllResponses;
    surveyList;
    callResponsesDataBySurveyId;
    multioption;
    survey_name;
    comment;
    area_name;
    location;
    created_at;
    name;
    total_pages;
    pages=[];
    selectedPage=1;
    startDate;
    endDate;
    selectedSurveyId:number;
    selected: any;
    alwaysShowCalendars: boolean;
    adminData;
    response_id;
    ratingCheckedData=[];
  showRangeLabelOnInput: boolean;
  keepCalendarOpeningWithRange: boolean;
  isCritical;
  search_str_filter;
  order_by_filter;
  filter_col_filter;
  checkedResponseList = new Array();
  checkedRatingList = new Array();
  adminList;
  statusList;
  priorityList;
  add_task:FormGroup;
  loading=true;
  /*  maxDate: moment.Moment;
  minDate: moment.Moment; */
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
  filterForm:FormGroup;
  pageOfItems: Array<any>;

  isInvalidDate = (m: moment.Moment) =>  {
    return this.invalidDates.some(d => d.isSame(m, 'day') )
  }

 myData = [
    {
      id: 1,
      title: '1 Star'
    },{
      id: 2,
      title: '2 Star'
    },{
      id: 3,
      title: '3 Star'
    },{
      id: 4,
      title: '4 Star'
    },{
      id: 5,
      title: '5 Star'
    }];
    
    expanded;
    

    options: DatepickerOptions = {
      minYear: 1970,
      maxYear: 2030,
      displayFormat: 'DD/MM/YYYY',
      barTitleFormat: 'MMMM YYYY',
      dayNamesFormat: 'dd',
      firstCalendarDay: 0, // 0 - Sunday, 1 - Monday
      locale: frLocale,
      barTitleIfEmpty: 'Click to select a date',
      placeholder: 'Click to select a date', // HTML input placeholder attribute (default: '')
      addClass: 'form-control', // Optional, value to pass on to [ngClass] on the input field
      addStyle: {'width':'100%'}, // Optional, value to pass to [ngStyle] on the input field
      fieldId: 'my-date-picker', // ID to assign to the input field. Defaults to datepicker-<counter>
      useEmptyBarTitle: false, // Defaults to true. If set to false then barTitleIfEmpty will be disregarded and a date will always be shown 
    };
  
  constructor(private dataService: DataService,private adminService:AdminService,private toastrService :ToastrService,
    private formBuilder : FormBuilder,private modalService:ModalService,private router:Router) { 
    this.alwaysShowCalendars = false;
    this.keepCalendarOpeningWithRange = true;
    this.showRangeLabelOnInput = false;
    this.selected = {startDate: moment().subtract(29, 'days'), endDate: moment()};

  }

  ngOnInit() {
    const component = this;

    $(document).ready(function(){

      $('#example-multiple-selected').multiselect();

    //   $(function() {

    //     $('#chkveg').multiselect({
    //         includeSelectAllOption: true
    //     });
    
    //     $('#btnget').click(function(){
    //         alert($('#chkveg').val());
    //     });
    // });
   });

   // this.dataService.currentMessage.subscribe(message => this.message = message);
    this.message=sessionStorage.getItem("survey_id");
     console.log("data from workplace in response : "+this.message);
     this.isCritical=sessionStorage.getItem('is_critical');
     this.filter_col_filter="";
     this.order_by_filter="";
     this.search_str_filter="";

     this.filterForm =
     this.formBuilder.group({
               search_string: [''],
               filter_col: [''],
               order_by: ['desc'],
           });

           
    this.add_task=
    this.formBuilder.group({
      assigned_user_id:['0'],
      priority_id:['0'],
      task_due_date:['',Validators.required],
      task_comment:[''],
    })

     this.getAllResponses(this.message,this.selectedPage);
     this.getAdminList();
    // this.selected=this.message;
     var datePipe = new DatePipe('en-US');     
     this.startDate= datePipe.transform(moment().subtract(29,'days'), 'yyyy-MM-dd');
     this.endDate= datePipe.transform(moment(), 'yyyy-MM-dd');
     console.log(this.startDate+" "+this.endDate);
     //this.selectedSurveyId='0';
  }

  //migrated
   getAllResponses(survey_id,page_no){
     let ratingString="";
     let response_id='';
     if(sessionStorage.getItem('task_resp_id')!=""){
     response_id=sessionStorage.getItem('task_resp_id');
     }
     if(sessionStorage.getItem('noti_resp_id')!=""){
      response_id=sessionStorage.getItem('noti_resp_id');
      }
     
     console.log(response_id);
     if(response_id==null){
       response_id="";
     }
     for(let i=0;i<this.ratingCheckedData.length;i++){
        ratingString=ratingString+'&rating_list[]='+this.ratingCheckedData[i];
     }
   this.callResponsesDataBySurveyId=this.adminService.getAllResponses(survey_id,page_no,
    this.startDate,this.endDate,this.isCritical,this.search_str_filter,this.filter_col_filter,this.order_by_filter,this.ratingCheckedData,response_id,sessionStorage.getItem('client_id'))
            .subscribe(
                data=>{
                  console.log(data);
                  this.loading=false;
                  this.pages=[];
                  this.responseData=data.result;
                  this.total_pages=data.total_pages;
                  this.allResponses=this.responseData;
                  if(this.allResponses.length==0){
                  this.survey_name='';
                  this.multioption='';
                  this.comment='';
                  this.area_name='';
                  this.location='';
                  this.created_at='';
                  this.name='';   
                  this.response_id=''; 
                }

                if(this.allResponses.length>0){
                console.log(this.allResponses[0]);
                this.getSurveyListForLocation(this.allResponses[0].location_id);
                }else{
                  console.log(sessionStorage.getItem('selected_loc_id'));
                  this.getSurveyListForLocation(sessionStorage.getItem('selected_loc_id'));
                  
                }

                for(let res of this.allResponses){
                this.clicked_response(res);
                break;
                }
                for (let i = 1; i <= this.total_pages; i++) {
                  this.pages.push(i);
                }   
                           console.log(data);
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


        selectOption(data) {
          //getted from event
          console.log("selected item"+data);
         // console.log("selected item"+this.selectedSurveyId);

          sessionStorage.setItem("survey_id",data);
          this.message=data;
          //this.dataService.changeMessage(data);
          this.selectedSurveyId=data;
          this.getAllResponses(data,this.selectedPage);
          //this.getGraphData(data,this.identifier);
          //getted from binding
         // console.log(this.number)
        }

        clicked_response(data){
          this.survey_name=data.survey_name;
          this.multioption=data.multi_option;
          this.comment=data.comment;
          this.area_name=data.area_name;
          this.location=data.location_name;
          this.created_at=data.res_created_at;
          this.name=data.name;   
          this.response_id=data.response_id;     }

          OnPageClick(i){
            console.log(i+" clicked");
            this.selectedPage=i;
            this.getAllResponses(sessionStorage.getItem('survey_id'),this.selectedPage);
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
            this.getAllResponses(sessionStorage.getItem('survey_id'),1);
            //console.log('selected date : '+this.selected);
          }

          getSurveyListForLocation(locId){
            var datum;
            this.adminService.getSurveyListForLocation(locId,datum)
            .subscribe(
                data=>{
                    console.log(data);
                    this.loading=false;
                    this.surveyList=data.result;
                    this.selectedSurveyId=this.message;
                    console.log("in survey list"+this.selectedSurveyId);
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


          
      ngOnDestroy(){
        sessionStorage.setItem('is_critical','0');
      }

      onFilterGo(){
        if($('#example-multiple-selected').val()!=null){
        this.ratingCheckedData=$('#example-multiple-selected').val();
        }
        console.log(this.ratingCheckedData);
        console.log(this.filterForm.value);
        this.search_str_filter=this.filterForm.get('search_string').value;
        this.filter_col_filter=this.filterForm.get('filter_col').value;
        this.order_by_filter=this.filterForm.get('order_by').value;
        this.getAllResponses(this.message,this.selectedPage);        
      }

      openModal(id: string) {
        this.modalService.open(id);
        //console.log("clicked under : "+underId);
       // this.modalWorkplaceId=underId;
      }
      
      closeModal(id: string) {
        this.modalService.close(id);
      }
      

      onCheckboxChange(option, event,identifier) {
        if(identifier=='response'){
        if(event.target.checked) {
          this.checkedResponseList.push(option.response_id);
        } else {
        for(var i=0 ; i < this.allResponses.length; i++) {
          if(this.checkedResponseList[i] == option.response_id) {
            this.checkedResponseList.splice(i,1);
            break;
         }
       }
     }
     console.log(this.checkedResponseList);
    }else{
      if(event.target.checked) {
        this.checkedRatingList.push(option);
      } else {
      for(var i=0 ; i < 5; i++) {
        if(this.checkedRatingList[i] == option) {
          this.checkedRatingList.splice(i,1);
          break;
       }
     }
   }
   console.log(this.checkedRatingList);
    }
   }


   //migrated
   getAdminList(){
     console.log("loc id : "+sessionStorage.getItem('selected_loc_id'));
    this.adminService.getAdminList(sessionStorage.getItem('selected_loc_id'))
    .subscribe(
        data=>{
            console.log(data);
            this.loading=false;
            this.adminData=data;
           this.adminList=this.adminData.result.admins;
            this.priorityList=this.adminData.result.priority;
            this.statusList=this.adminData.result.status;
            var name = sessionStorage.getItem('name').replace(/^"(.*)"$/, '$1');
            console.log(this.adminList);
            this.adminList.push({name:name,id:sessionStorage.getItem('admin_id'),user_rights:[]});

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

   onSelectAll(response,$event){

   }

   assignTask(){
     if(this.add_task.invalid){
      this.toastrService.warning('','Please fill all data', {
                  timeOut: 3000,
                  positionClass: 'toast-bottom-right',
                });
       return;
     }
     if(this.add_task.get('assigned_user_id').value=='0' || this.add_task.get('priority_id').value=='0' ){
      this.toastrService.warning('','Please fill all data', {
        timeOut: 3000,
        positionClass: 'toast-bottom-right',
      });
       return;
     }
    this.loading=true;
     var taskData=this.add_task.value;
     var datePipe = new DatePipe('en-US');
    var task_date = datePipe.transform(this.add_task.get('task_due_date').value, 'yyyy-MM-dd');
    taskData.task_due_date=task_date;
    this.checkedResponseList=new Array();
    this.checkedResponseList.push(this.response_id);
     taskData.response_list=this.checkedResponseList;
     taskData.creator_user_id=sessionStorage.getItem('admin_id');
     for(let status of this.statusList){
       if(status.status_name=='Open'){
        taskData.status_id=status.status_id;
        break;
       }
     }
     console.log(JSON.stringify(taskData));

     this.adminService.addNewTask(taskData)
     .subscribe(
         data=>{
             console.log(data);
             if(data.status!=0){
             this.closeModal('assign-task');
             this.loading=false;
             this.isCritical=1;
             this.toastrService.success('','Task assigned Successfully', {
              timeOut: 3000,
              positionClass: 'toast-bottom-right',
            });
             this.router.navigate(["home/work-place/dashboard"]);
          }else{
            this.closeModal('assign-task');
            this.loading=false;
            this.toastrService.error('Server Error','Please try again later', {
             timeOut: 2000,
             positionClass: 'toast-bottom-right',
           });
          }
            
            // this.getAllResponses(this.message,this.selectedPage);
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
    // taskData.creator_id=sessionStorage.
   }

   openModalAssignTask(modal){
          this.openModal(modal);
  //    if(this.checkedResponseList.length>0){
  //   this.openModal(modal);
  // }else{
  //   this.toastrService.warning('Please Select at least One response','', {
  //     timeOut: 4000,
  //     positionClass: 'toast-bottom-right',
  //   });
  // }
   }

  

   onChangePage(pageOfItems: Array<any>) {
    // update current page of items
    this.pageOfItems = pageOfItems;
}
      
}

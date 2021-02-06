import { Component, OnInit,ViewChild } from '@angular/core';
import { AdminService } from '../admin.service';
import { ModalService } from '../_modal/modal.service';
import { FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import html2canvas from 'html2canvas';  
import * as jspdf from 'jspdf';  
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import { DataService } from "../_services/data.service";
import { Router } from '@angular/router';


@Component({
  selector: 'app-my-tasks',
  templateUrl: './my-tasks.component.html',
  styleUrls: ['./my-tasks.component.css']
})
export class MyTasksComponent implements OnInit {

  data;
  taskList;
  taskData;
  commentData;
  adminData;
  commentList;
  add_comment;
  taskCommentId;
  priorityList;
  statusList;
  isSuper;
  adminList;
  priority_id;
  changeTaskId;
  changeStatusId;
  openOrPendingTasks=new Array();
  resolvedTasks=new Array();
  closedTasks=new Array();
  test;
  user_rights;
  user_right_json;
  isHome;
  modalTaskId;
  deleteComment
  selectedStatus=1000;

  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
 displayedColumns: string[] = [ 'position','task', 'rating','comment','emp_name','due_date','status_name','priority','created_at','open'];
 dataSource;


  constructor(private adminService:AdminService,private modalService:ModalService,
     private formBuilder:FormBuilder,private router: Router,
    private toastrService:ToastrService,private dataService: DataService) { }
  loading=true;
  
  masterStatusId=1000;
  ngOnInit() {
    this.isSuper=sessionStorage.getItem('is_super');
    if(!(this.isSuper=='true')){
      //this.user_rights=JSON.parse(String(sessionStorage.getItem('user_rights')));
      this.user_rights=(sessionStorage.getItem('user_rights'));
      this.user_right_json=JSON.parse(this.user_rights)
      console.log(this.user_right_json);
      }
      console.log(this.isSuper);
      //sessionStorage.setItem('isHome',"true");
      // this.dataService.currentMessage.subscribe(message => this.isHome = message);
      //   this.dataService.changeMessage('true');
    this.getMyTask();
    this.getAdminList();
    this.add_comment=
    this.formBuilder.group({
      task_comment:[''],
    })
  }

  getMyTask(){
    this.adminService.getMyTask(sessionStorage.getItem('admin_id'),sessionStorage.getItem('client_id'),sessionStorage.getItem('is_super'))
    .subscribe(
        data=>{
          this.openOrPendingTasks=[];
          this.resolvedTasks=[];
          this.closedTasks=[];

            console.log(data);
            // this.taskData=data;
            this.taskList=data.result;
            this.openOrPendingTasks=data.result;
            this.loading=false;
            this.dataSource=new MatTableDataSource(this.openOrPendingTasks);
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
            // for(let task of this.taskList){
            //   if(task.status_id==5 || task.status_id==6){
            //       this.openOrPendingTasks.push(task);
            //   }
            //   else if(task.status_id==7){
            //     this.resolvedTasks.push(task);
            //   }
            //   else if(task.status_id==8){
            //     this.closedTasks.push(task);
            //   }
            // }
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

  openCommentModal(modal,task_id){
    this.openModal(modal);
    this.getComments(task_id)
    console.log(task_id);
    this.modalTaskId=task_id;
  }

  //migrated
  getComments(task_id){
    this.adminService.getComments(task_id)
    .subscribe(
        data=>{
            console.log(data);
            this.commentData=data;
            this.loading=false;
            this.commentList=this.commentData.result;
            this.taskCommentId=task_id;
           // if(this.commentList.length>0){
           // }else{

            //}
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

  openModal(id: string) {
    this.modalService.open(id);
   
    //console.log("clicked under : "+underId);
   // this.modalWorkplaceId=underId;
  }
  
  closeModal(id: string) {
    this.modalService.close(id);
  }


  //migrated
  addComment(){
    this.loading=true;
    var commentData=this.add_comment.value;
    commentData.task_id=this.taskCommentId;
    commentData.creator_user_id=sessionStorage.getItem('admin_id');
    commentData.is_deluxe='0';
    console.log(commentData);
    this.adminService.addComment(commentData)
    .subscribe(
        data=>{
          if(data.status!=0){
            console.log(data);
            this.add_comment.reset();
              this.loading=true;            
            this.getComments(this.taskCommentId);
          }else{
            this.loading=false;
            this.toastrService.error('Server Error','Please try again later', {
              timeOut: 2000,
              positionClass: 'toast-bottom-right',
            });
          }
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

  //migrated
  getAdminList(){
    console.log("loc id : "+sessionStorage.getItem('location_id'));
  //  this.adminService.getAdminList(sessionStorage.getItem('location_id'))
  this.adminService.getAdminList(sessionStorage.getItem('location_id'))
   .subscribe(
       data=>{
           console.log(data);
           this.adminData=data;
          //  this.adminList=this.adminData.admin_list;
          //  this.loading=false;
          //  //for(let i=0;i<this.adminList.length;i++)
          //  for(let admin of this.adminList){
          //   // for (let user_rights of admin.user_rights){
          //     this.adminList=admin.user_rights;
          //      console.log(this.adminList);
          //   // }
          //  }
          // this.test=JSON.parse(this.adminList);
          // console.log(this.test);
           this.priorityList=this.adminData.result.priority;
           this.statusList=this.adminData.result.status;
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


//migrated
  changeStatus(task_id,status_id){
   // console.log(status_id);
   // console.log(task_id+" "+status_id );
   this.loading=true;
    this.adminService.changeTaskStatus(task_id,status_id)
    .subscribe(
        data=>{
            console.log(data);
            if(data.status!=0){
            this.changeStatusFilter(this.masterStatusId);
            this.toastrService.success('','Task status changed successfully ', {
              timeOut: 2000,
              positionClass: 'toast-bottom-right',
            });
            this.closeModal('change-confirmation');
           this.loading=false;
          }else{
            this.closeModal('change-confirmation');
            this.loading=false;
            this.toastrService.error('Server Error','Please try again later', {
              timeOut: 2000,
              positionClass: 'toast-bottom-right',
            });
          }
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

  changeStatusFilter(status_id){
    this.openOrPendingTasks=[];
    console.log(status_id)
    this.masterStatusId=status_id;
    //this.taskList=

      //console.log(data);
     // this.taskData=data;
     // this.taskList=this.taskData.task_list;
      for(let task of this.taskList){
        if(task.status_id==status_id){
            this.openOrPendingTasks.push(task);
        }
      }

      if(status_id==1000){
        this.openOrPendingTasks=this.taskList;
      }

      this.dataSource=new MatTableDataSource(this.openOrPendingTasks);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;

      console.log(this.openOrPendingTasks);
  }

  openChangeModal(task_id,status_id,modal){
    this.changeStatusId=status_id;
    this.changeTaskId=task_id;
    this.openModal(modal);
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }



  openSurveyDashboard(data){
    if(!(this.isSuper=='true')){
    if(this.user_right_json[10]){
        console.log(data);
        this.dataService.currentMessage.subscribe(message => this.isHome = message);
        this.dataService.changeMessage('false');
        sessionStorage.setItem('survey_id', data);
        sessionStorage.setItem('isHome',"false");
        console.log(sessionStorage.getItem('isHome'));
        this.router.navigate(["home/work-place/dashboard"]);
    }else  if(this.user_right_json[11]){
        console.log(data);
        this.dataService.currentMessage.subscribe(message => this.isHome = message);
        this.dataService.changeMessage('false');
        sessionStorage.setItem('survey_id', data);
        sessionStorage.setItem('isHome',"false");
        console.log(sessionStorage.getItem('isHome'));
        this.router.navigate(["home/work-place/analytics"]);
        this.toastrService.warning("You don't have dashboard access, please try again later",'Contact Super admin', {
          timeOut: 4000,
          positionClass: 'toast-bottom-right',
        });

    }else  if(this.user_right_json[12]){
        console.log(data);
        this.dataService.currentMessage.subscribe(message => this.isHome = message);
        this.dataService.changeMessage('false');
        sessionStorage.setItem('survey_id', data);
        sessionStorage.setItem('isHome',"false");
        console.log(sessionStorage.getItem('isHome'));
        this.router.navigate(["home/work-place/responses"]);
        this.toastrService.warning("You don't have dashboard access, please try again later",'Contact Super admin', {
          timeOut: 4000,
          positionClass: 'toast-bottom-right',
        });
    }else {
    }
}else{
    console.log(data);
        this.dataService.currentMessage.subscribe(message => this.isHome = message);
        this.dataService.changeMessage('false');
        sessionStorage.setItem('survey_id', data);
        sessionStorage.setItem('isHome',"false");
        console.log(sessionStorage.getItem('isHome'));
        this.router.navigate(["home/work-place/dashboard"]);
}

}


openResponseList(data,response_id){
  this.dataService.currentMessage.subscribe(message => this.isHome = message);
        this.dataService.changeMessage('false');
        sessionStorage.setItem('survey_id', data);
        sessionStorage.setItem('isHome',"false");
        console.log(sessionStorage.getItem('isHome'));
        sessionStorage.setItem('task_resp_id',response_id);
        this.router.navigate(["home/work-place/responses"]);
}

closeModalChangeStatus(modal){
  this.closeModal(modal);
  this.getMyTask();
}

open_delete_comment_modal(modal,comment){
this.openModal(modal);
  this.deleteComment=comment;
}


delete_comment(){
  this.loading=true;
  this.adminService.deleteComment(this.deleteComment.comment_id)
  .subscribe(
      data=>{
          console.log(data);
          if(data.status!=0){
          //this.changeStatusFilter(this.masterStatusId);
          this.toastrService.success('','Comment deleted successfully ', {
            timeOut: 2000,
            positionClass: 'toast-bottom-right',
          });
          this.getComments(this.modalTaskId);
          
          this.closeModal('delete-comment-confirmation');
         this.loading=false;
        }else{
          //this.closeModal('change-confirmation');
          this.loading=false;
          this.toastrService.error('Server Error','Please try again later', {
            timeOut: 2000,
            positionClass: 'toast-bottom-right',
          });
        }
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

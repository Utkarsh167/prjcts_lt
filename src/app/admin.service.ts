import { Injectable } from '@angular/core';
import {HttpClient,HttpHeaders} from '@angular/common/http';
import { sample } from 'rxjs/operators';
// import { start } from 'repl';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http:HttpClient) {}
 // public baseUrlServer="http://13.126.106.225/feediback-backend/admin-panel/api/";
 // public baseUrl="http://localhost/feedibackphp/admin-panel/api/";
 baseUrlCodeigniter="http://localhost/feediback_backend/index.php/";
  // baseUrlCodeigniter="http://13.126.106.225/xp-backend/index.php/";
  //1  //13.126.106.225/feediback-backend
  //localhost/feedibackphp
  // headers = new HttpHeaders({
  //   'Content-Type': 'application/x-www-form-urlencoded',
  //   'Authorization': 'Basic ' +btoa("admin:1234")});
  //   options ={headers:this.headers};
  //headers.append();

  httpOptions = {
    headers: new HttpHeaders({
      'Access-Control-Allow-Origin':'*',
      'Content-Type':  'application/json ; charset-utf-8',
      'x-api-key': '123456'
    })
  };

  //public baseUrlFinal=this.baseUrl;


  
//not in use
// getSurveyData(client_id,isSuper,location_id) {
//     return this.http.get(this.baseUrlFinal+"getSurveyList.php?client_id="+client_id+"&is_super="+isSuper+"&is_under_loc=false"+"&location_id="+location_id,);
//   }

 


  //Workplace
  getWorkplacesAndLocations(data){
    return this.http.post<any>(this.baseUrlCodeigniter+"workplace/get_workplaces_and_location",data,this.httpOptions);
  }
  
  createWp(wp_name,admin_id,client_id){
  return this.http.post<any>(this.baseUrlCodeigniter+"workplace/add_new_wrokplace",{name:wp_name,admin_id:admin_id,client_id:client_id},this.httpOptions);
  }

  createLocation(postData){
    return this.http.post<any>(this.baseUrlCodeigniter+"workplace/add_new_location",postData,this.httpOptions);
    }

  getSurveyUnderLocationData(getSurverUnderLocData){
    return this.http.post<any>(this.baseUrlCodeigniter+"workplace/get_survey_of_location",getSurverUnderLocData,this.httpOptions);
  }

  changeSurveyStatus(data){
    return this.http.post<any>(this.baseUrlCodeigniter+"workplace/change_survey_status",data,this.httpOptions);
  }

  getNotReadNotification(){
    return this.http.post<any>(this.baseUrlCodeigniter+"workplace/get_not_read_notification",{client_id:sessionStorage.getItem('client_id')},this.httpOptions);
    }

  clearNotification(response_id){
  return this.http.post<any>(this.baseUrlCodeigniter+"workplace/clear_all_notification",{client_id:sessionStorage.getItem('client_id'),response_id:response_id},this.httpOptions);
  }

  getAllWorkplaces(client_id){
    return this.http.post<any>(this.baseUrlCodeigniter+"workplace/get_workplace_list",{client_id:client_id},this.httpOptions);
   }
   getAllLocations(client_id){
    return this.http.post<any>(this.baseUrlCodeigniter+"workplace/get_location_list_client",{client_id:client_id},this.httpOptions);
   }

   editLocationName(loc_id,loc_name){
    return this.http.post<any>(this.baseUrlCodeigniter+"workplace/edit_location_name",{location_id:loc_id,location_name:loc_name},this.httpOptions);
   }
   archiveLocation(loc_id){
    return this.http.get(this.baseUrlCodeigniter+"archive_location.php?location_id="+loc_id);
   }
      
   editWorkplaceName(wp_id,wp_name){
    return this.http.post<any>(this.baseUrlCodeigniter+"workplace/edit_workplace_name",{workplace_id:wp_id,workplace_name:wp_name},this.httpOptions);
   }

   firstTimeSetup(data){
    return this.http.post<any>(this.baseUrlCodeigniter+"workplace/add_first_time_setup",data,this.httpOptions);
  }
  deleteWp(data){
    return this.http.get<any>(this.baseUrlCodeigniter+"workplace/delete_workplace?wp_id="+data,this.httpOptions);
  }

  deleteLocation(data){
    return this.http.get<any>(this.baseUrlCodeigniter+"workplace/delete_location?location_id="+data,this.httpOptions);
  }
  

  //Devices
  getAllDeviceData() {
    return this.http.post<any>(this.baseUrlCodeigniter+"devices/get_tablet_list",{client_id:sessionStorage.getItem('client_id')},this.httpOptions);
  }

  editTabletArea(tablet_id,area_id){
    return this.http.post<any>(this.baseUrlCodeigniter+"devices/edit_tablet_area",{tablet_id:tablet_id,area_id:area_id},this.httpOptions);
  }

  editTabletSurvey(tablet_id,survey_id){
    return this.http.post<any>(this.baseUrlCodeigniter+"devices/edit_tablet_survey",{tablet_id:tablet_id,survey_id:survey_id},this.httpOptions);
  }

  editDeviceName(tablet_id,tablet_name){
    return this.http.post<any>(this.baseUrlCodeigniter+"devices/edit_tablet_name",{tablet_id:tablet_id,tablet_name:tablet_name},this.httpOptions);
   }

   //Survey
   getDeviceListForAddSurvey(data){
    return this.http.post<any>(this.baseUrlCodeigniter+"survey/get_tablet_list_for_survey",{location_id:data},this.httpOptions);
  }

  addSurveyData(data){
  return this.http.post<any>(this.baseUrlCodeigniter+"survey/add_new_survey",data,this.httpOptions);
  }

  addNewDraftSurvey(data){
  return this.http.post<any>(this.baseUrlCodeigniter+"survey/add_new_draft_survey",data,this.httpOptions);
  }

  addNewDuplicateSurvey(data){
    return this.http.post<any>(this.baseUrlCodeigniter+"survey/add_new_duplicate_survey",data,this.httpOptions);
    }
  
  getSurveyDetails(data){
    return this.http.post<any>(this.baseUrlCodeigniter+"survey/get_survey_details",{survey_id:data},this.httpOptions);
  }

  editSurveyData(data){
    return this.http.post<any>(this.baseUrlCodeigniter+"survey/edit_survey",data,this.httpOptions);
  }

  //Area
  
  getAllAreas() {
    return this.http.post<any>(this.baseUrlCodeigniter+"device_area/get_area_list",{client_id:sessionStorage.getItem('client_id')},this.httpOptions);
  }

  addNewArea(data){
    return this.http.post<any>(this.baseUrlCodeigniter+'device_area/add_new_device_area',data,this.httpOptions);
   }

  editDeviceAreaName(area_id,area_name){
    return this.http.post<any>(this.baseUrlCodeigniter+"device_area/edit_device_area_name",{area_id:area_id,area_name:area_name},this.httpOptions);
   }

  //MyTask
  getMyTask(admin_id,client_id,isSuper){
    return this.http.post<any>(this.baseUrlCodeigniter+"my_task/get_my_tasks",{admin_id:admin_id,client_id:client_id,is_super:isSuper},this.httpOptions);
   }

   getComments(data){
    return this.http.post<any>(this.baseUrlCodeigniter+"my_task/get_task_comments",{task_id:data,is_deluxe:0},this.httpOptions);
   }

   addComment(data){
    return this.http.post<any>(this.baseUrlCodeigniter+"my_task/add_new_task_comment",data,this.httpOptions);
   }

   changeTaskStatus(task_id,status_id){
    return this.http.post<any>(this.baseUrlCodeigniter+"my_task/change_task_status",{task_id:task_id,status_id:status_id,is_deluxe:0},this.httpOptions);
   }

   getAdminList(location_id){
    return this.http.post<any>(this.baseUrlCodeigniter+"my_task/get_status_priority_admin_list",{location_id:location_id},this.httpOptions);
   }
  addNewTask(data){
    return this.http.post<any>(this.baseUrlCodeigniter+"my_task/add_new_task",data,this.httpOptions);
   }

  deleteComment(data){
    return this.http.get<any>(this.baseUrlCodeigniter+"my_task/delete_comment?comment_id="+data,this.httpOptions);
  }

//Users

  getAllUsers() {
    return this.http.post<any>(this.baseUrlCodeigniter+"users/get_user_list",{client_id:sessionStorage.getItem('client_id'),location_id:sessionStorage.getItem('location_id'),is_super:sessionStorage.getItem('is_super')},this.httpOptions);
  }

  getUserModules(){
    return this.http.post<any>(this.baseUrlCodeigniter+"users/get_user_modules",{is_deluxe:'0'},this.httpOptions);
   }
   uploadExcellFile(jsonData){
    return this.http.post<any>(this.baseUrlCodeigniter+"users/add_bulk_emp_data",jsonData,this.httpOptions);
   }
   getEmpList(client_id){
    return this.http.post<any>(this.baseUrlCodeigniter+"users/get_emp_list",{client_id:client_id},this.httpOptions);
   }
   addEmpData(data){
    return this.http.post<any>(this.baseUrlCodeigniter+"users/add_new_employee",data,this.httpOptions);
   }
   editEmpData(data){
    return this.http.post<any>(this.baseUrlCodeigniter+"users/edit_emp_data",data,this.httpOptions);
   }
   disableEnableEmployee(id,is_active){
    return this.http.post<any>(this.baseUrlCodeigniter+"users/change_emp_status",{id:id,is_active:is_active},this.httpOptions);
   }
   addNewUser(data){
    return this.http.post<any>(this.baseUrlCodeigniter+"users/add_new_user",data,this.httpOptions);
  }


//Dashboard
  getDashboardData(data){
  return this.http.post<any>(this.baseUrlCodeigniter+"dashboard/get_dashboard_data",{survey_id:data},this.httpOptions);
  }
  getGraphData(surveyId, tabletId,identifier,start_date,end_date) {
    return this.http.post<any>(this.baseUrlCodeigniter+"dashboard/get_graph_data",{survey_id:surveyId,tablet_id:tabletId,start_date:start_date,end_date:end_date,identifier:identifier},this.httpOptions);
  }
  getBestWorstHourOfTheDay(surveyId, tabletId) {
    return this.http.post<any>(this.baseUrlCodeigniter+"dashboard/best_hour_of_week",{survey_id:surveyId,tablet_id:tabletId},this.httpOptions);
  }
  getBestWorstDayOfTheWeek(surveyId, tabletId) {
    return this.http.post<any>(this.baseUrlCodeigniter+"dashboard/best_day_of_the_week",{survey_id:surveyId,tablet_id:tabletId},this.httpOptions);
  }


//reports
getReportData(location_id,master_loc_id,survey_id,start_date,end_date,identifier,tablet_id,area_id,data){
  return this.http.post<any>(this.baseUrlCodeigniter+"reports/get_reports",{selected_location_id:location_id,master_loc_id:master_loc_id,survey_id:survey_id,start_date:start_date,end_date:end_date,identifier:identifier,area_id:area_id,client_id:sessionStorage.getItem('client_id')},this.httpOptions);
}

getSurveyListForLocation(location_id,master_loc_id){
  return this.http.post<any>(this.baseUrlCodeigniter+"reports/get_survey_of_loc_reports",{location_id:location_id},this.httpOptions);
}

//responses
  getAllResponses(data,page_no,start_date,end_date,critical_issue,search_str_filter,filter_col_filter,order_by_filter,rating_list,response_id,client_id){
  return this.http.post<any>(this.baseUrlCodeigniter+"responses/get_survey_response",{survey_id:data,page:page_no,start_date:start_date,end_date:end_date,is_critical:critical_issue,search_string:search_str_filter,filter_col:filter_col_filter,order_by:order_by_filter,rating_list:rating_list,response_id:response_id,client_id:client_id},this.httpOptions);
  }
 



  
 

  

 

  

  // getDeviceListForAddSurvey(data){
  //   return this.http.post<any>(this.baseUrlFinal+"addSurvey.php",data,data);
  // }

 
  

 

  // testCodeIgniterAuth(data){
  //  // let headers = new HttpHeaders();
  //   // headers.set('Access-Control-Allow-Origin', '*');
  //   // headers.append('Access-Control-Allow-Origin', '*');
  //   // headers.append('x-api-key', '123456');
  //   //let headers: HttpHeaders = new HttpHeaders();
  //   //headers = headers.append('Accept', 'application/x-www-form-urlencoded');
  //   // headers= headers.append('Content-Type','multipart/form-data');
  //   // headers = headers.append('x-api-key', '123456');
  //   // let formData: FormData = new FormData(); 
  //   // formData.append('x-api-key','123456'); 
  //   return this.http.post<any>(this.baseUrlFinal+"accounts/check_my_code",{'user_id':'hello'},this.httpOptions);
  //    }

     
     
    
      

     getActivityLog(data){
      return this.http.post<any>(this.baseUrlCodeigniter+"profile/get_activity_log",data,this.httpOptions);
     }

     add_comp_icon(data){
      return this.http.post<any>(this.baseUrlCodeigniter+"profile/add_comp_logo",data,this.httpOptions);
     }

    
    

    //  updateProfileImg(data){
    //   return this.http.post<any>(this.baseUrlFinal+'upload_profile_image.php',data);
    //  }
    //  getProfileData(admin_id){
    //   return this.http.get(this.baseUrlFinal+"get_profile_data.php?admin_id="+admin_id);
    //  }

    
}
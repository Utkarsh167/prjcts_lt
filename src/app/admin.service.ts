import { Injectable } from '@angular/core';
import {HttpClient,HttpHeaders} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http:HttpClient) {}

  public baseUrl="http://13.126.106.225/feediback-backend/admin-panel/api/";

getSurveyData(admin_id,data) {
    return this.http.get(this.baseUrl+"getSurveyList.php?admin_id="+admin_id,data);
  }

  getAllDeviceData(data) {
    return this.http.get(this.baseUrl+"getTabletList.php",data);
  }

  getAllAreas(data) {
    return this.http.get(this.baseUrl+"getAreaList.php",data);
  }

  getAllUsers(data) {
    return this.http.get(this.baseUrl+"getUserList.php",data);
  }

  getWorkplacesAndLocations(data){
    return this.http.post<any>(this.baseUrl+"getWorkplaces.php",data,data);
  
  }
  
  createWp(wp_name,admin_id,data){
  return this.http.get(this.baseUrl+"addNewWorkplace.php?name="+wp_name+"&admin_id="+admin_id,data);
  }

  getDashboardData(data){
  return this.http.get(this.baseUrl+"getDashboardData.php?survey_id="+data,data);
  }

  getAllResponses(data){
  return this.http.get(this.baseUrl+"getResponses.php?survey_id="+data,data);
  }

 createLocation(postData,data){
  return this.http.post<any>(this.baseUrl+"addNewLocation.php",postData,data);
  }
  
  getSurveyUnderLocationData(admin_id,url,data){
    return this.http.get(this.baseUrl+"getSurveyList.php?location_id="+url+"&admin_id="+admin_id,data);
  }

  getReportData(location_id,survey_id,start_date,end_date,identifier,tablet_id,area_id,data){
    return this.http.get(this.baseUrl+"getReports.php?selected_location_id="+location_id+"&survey_id="+survey_id+"&start_date="+start_date+"&end_date="+end_date+"&identifier="+identifier+"&area_id="+area_id,data);
  }

  getSurveyListForLocation(location_id,data){
    return this.http.get(this.baseUrl+"getReports.php?selected_location_id="+location_id,data);
  }

  firstTimeSetup(data){
  return this.http.post<any>(this.baseUrl+"firstTimeSetup.php",data,data);
  }

  // getDeviceListForAddSurvey(data){
  //   return this.http.post<any>(this.baseUrl+"addSurvey.php",data,data);
  // }

  getDeviceListForAddSurvey(data){
    return this.http.get(this.baseUrl+"addSurvey.php?location_id="+data,data);
  }

  addSurveyData(data){
  return this.http.post<any>(this.baseUrl+"addSurvey.php",data,data);
  }

  getSurveyDetails(data){
    return this.http.get(this.baseUrl+"getSurveyDetails.php?survey_id="+data,data);
  }
}
import { Component, OnInit } from '@angular/core';
import { AdminService } from '../admin.service';
import { FormGroup, FormBuilder, FormArray,FormControl, Validators,FormGroupDirective, NgForm } from '@angular/forms';
import { Router, ActivatedRoute, Event, NavigationStart, NavigationEnd, NavigationError } from '@angular/router';
import { PlatformLocation } from '@angular/common';
import { ModalService } from '../_modal/modal.service';
import { ConfigService } from '../_services/config.service';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { HostListener } from '@angular/core';
declare var $: any;
@Component({
  selector: 'app-add-survey',
  templateUrl: './add-survey.component.html',
  styleUrls: ['./add-survey.component.css']
})
export class AddSurveyComponent implements OnInit {

  survey_name;
  location_id;
  tablet_name:string;
  isSmiley:boolean=false;
  smiley_question="Enter positive question";
  allTechnologies = [
    'qweq','dfased','dsadsds','asdsadads' 
] ;
selectedTabletsNew=[];
//tabletsNew$: Observable<any[]>;

  deviceList;
  callGetDeviceList: any;
  add_survey;
  callAddSurvey;
  welcome="hello";
  target4='target4';
  isDraft:boolean;
  surveyDraftId;
  survey_all_data_edit;
  discard_message='';
  discard_followup:boolean;

  add_survey_from_wp_name;

  req_wel_screen :Boolean=false;
  req_remark_screen : Boolean=false;
  skip_remark_screen :Boolean=false;


  
  constructor(private adminService:AdminService,private formBuilder:FormBuilder,
    private router:Router,private location: PlatformLocation,private modalService:ModalService,
    private configService:ConfigService,private toastrService:ToastrService ) {
    //   this.router.events.subscribe((event: Event) => {
    //     if (event instanceof NavigationStart) {
    //         // Show loading indicator
    //         console.log(event.navigationTrigger);
    //         //alert('1');
    //         this.router.navigated = false;
    //         window.scrollTo(0, 0);
    //     }

    //     if (event instanceof NavigationEnd) {
    //         // Hide loading indicator
    //         console.log(event.urlAfterRedirects);
    //        // alert('2');

    //     }

    //     if (event instanceof NavigationError) {
    //         // Hide loading indicator

    //         // Present error to user
    //         console.log(event.error);
    //         alert('2');

    //     }
    // });
//       location.onPopState((event) => {
//         // ensure that modal is opened
//       console.log("back pressed");
//       alert('asfasefsdaf');
// });
     }


     @HostListener('window:popstate', ['$event'])
     onPopState(event) {
       console.log('Back button pressed');
       alert('3 back button');

      //  this.openModal
     }

  ngOnInit() {
    

    
    this.router.routeReuseStrategy.shouldReuseRoute = function(){
      return false;
  };
  
  this.router.events.subscribe((evt) => {
      if (evt instanceof NavigationEnd) {
          this.router.navigated = false;
          window.scrollTo(0, 0);
      }
  });
  

    // window.addEventListener("beforeunload", function (e) {
    //   var confirmationMessage = "\o/";
    //   (e || window.event).returnValue = confirmationMessage; //Gecko + IE
    //   return confirmationMessage;                            //Webkit, Safari, Chrome
    // });

    // window.addEventListener('beforeunload', (event) => {
    //   // Cancel the event as stated by the standard.
    //   event.preventDefault();
    //   // Chrome requires returnValue to be set.
    //   event.returnValue = '';
    // });

    // window.onbeforeunload = function(){
    //   this.myfun();
    //   return 'Are you sure you want to leave?';
    // };


  
    this.surveyDraftId=sessionStorage.getItem("survey_draft_id");
    this.add_survey = this.formBuilder.group({  
      survey_name:['',Validators.required],      
      welcome_message:['',],
      tagline:['',],
      followup_question:['',],
      followup_question_positive:['',],
      followup_question_negative:['',],
      followup_question_neutral:['',],
      option_1:['',],
      option_2:['',],
      option_3:['',],
      option_4:['',],
      option_5:['',],
      option_6:['',],
      option_1_positive:['',],
      option_2_positive:['',],
      option_3_positive:['',],
      option_4_positive:['',],
      option_5_positive:['',],
      option_6_positive:['',],
      option_1_negative:['',],
      option_2_negative:['',],
      option_3_negative:['',],
      option_4_negative:['',],
      option_5_negative:['',],
      option_6_negative:['',],
      option_1_neutral:['',],
      option_2_neutral:['',],
      option_3_neutral:['',],
      option_4_neutral:['',],
      option_5_neutral:['',],
      option_6_neutral:['',],
      status_id:['',Validators.required],
      master_question:['',Validators.required],
      selected_tablets:[''],
      remark:['',]
     // selected_tablets:['',Validators.required],
    });//this.tablet_name="sdfgsdjgasdf";
    //this.survey_name=sessionStorage.getItem('add_survey_name');
    if(sessionStorage.getItem('is_edit')=='true'){
      this.location_id=sessionStorage.getItem('edit_survey_loc_id');
    }else {
      this.location_id=sessionStorage.getItem('add_survey_loc_id');
    }
    console.log("location_id"+this.location_id);
    this.callSurveyDetailsData();
    this.getDeviceList();

    
    this.add_survey_from_wp_name= sessionStorage.getItem("add_survey_from_wp_name");
    if(this.add_survey_from_wp_name!=""){
      this.add_survey.controls['survey_name'].setValue(this.add_survey_from_wp_name);
    }
    const component = this;
    $(document).ready(function(){
      // $(".chosen-select").chosen();
       //$("#options").hide();
       //alert(1);
       component.isSmiley=false;
       if(component.survey_all_data_edit==null){
        
       $("#individual_followup_question_rating_positive").hide();
       $("#individual_followup_question_rating_neutral").hide();
       $("#individual_followup_question_rating_negative").hide();
       $("#common_followup_question").show();
       }else{
       $("#individual_followup_question_rating_positive").show();
       $("#individual_followup_question_rating_neutral").hide();
       $("#individual_followup_question_rating_negative").hide();
       $("#common_followup_question").hide();
       }

   });

    $("#5_star").click(function(){
      component.isSmiley=true;
      if(component.add_survey.get('followup_question').value!=''){
        component.discard_message='Common followup question and options will be discarded.';
        component.discard_followup=true;
        component.openModal('disable-confirmation');
      }
     // component.scroll(component.target4);
      $("#individual_followup_question_rating_positive").show();
      $("#individual_followup_question_rating_neutral").hide();
      $("#individual_followup_question_rating_negative").hide();
      $("#common_followup_question").hide();
  });
   $("#4_star").click(function(){
    component.isSmiley=true;
    if(component.add_survey.get('followup_question').value!=''){
      component.discard_message='Common followup question and options will be discarded.';
      component.discard_followup=true;      
      component.openModal('disable-confirmation');
    }
    $("#individual_followup_question_rating_positive").show();
      $("#individual_followup_question_rating_neutral").hide();
      $("#individual_followup_question_rating_negative").hide();
      $("#common_followup_question").hide();
  });
  $("#3_star").click(function(){
      component.isSmiley=true;
      if(component.add_survey.get('followup_question').value!=''){
        component.discard_message='Common followup question and options will be discarded.';
        component.discard_followup=true;        
        component.openModal('disable-confirmation');
      }
      $("#individual_followup_question_rating_positive").hide();
      $("#individual_followup_question_rating_neutral").show();
      $("#individual_followup_question_rating_negative").hide();
      $("#common_followup_question").hide();
  });
  $("#2_star").click(function(){
      component.isSmiley=true;
      if(component.add_survey.get('followup_question').value!=''){
        component.discard_message='Common followup question and options will be discarded.';
        component.discard_followup=true;      
        component.openModal('disable-confirmation');
      }
      $("#individual_followup_question_rating_positive").hide();
      $("#individual_followup_question_rating_neutral").hide();
      $("#individual_followup_question_rating_negative").show();
      $("#common_followup_question").hide();
  });
   $("#1_star").click(function(){
    component.isSmiley=true;
    if(component.add_survey.get('followup_question').value!=''){
      component.discard_message='Common followup question and options will be discarded.';
      component.discard_followup=true;     
      component.openModal('disable-confirmation');
    }
    $("#individual_followup_question_rating_positive").hide();
      $("#individual_followup_question_rating_neutral").hide();
      $("#individual_followup_question_rating_negative").show();
      $("#common_followup_question").hide();
  });

  $("#add_common_question").click(function(){
    component.isSmiley=false;
    if(component.add_survey.get('followup_question_positive').value!='' || component.add_survey.get('followup_question_negative').value!='' || component.add_survey.get('followup_question_neutral').value!=''){
      component.discard_message='Positive, Negative and Neutral questions and options will be discarded.';
      component.discard_followup=false;
      component.openModal('disable-confirmation');
    }
    $("#common_followup_question").show();
      $("#individual_followup_question_rating_positive").hide();
      $("#individual_followup_question_rating_neutral").hide();
      $("#individual_followup_question_rating_negative").hide();
  });

    
  }

 


  ngAfterViewInit() {
  }

  get f() { return this.add_survey.controls; }

  
getDeviceList(){
  var locationdata={"location_id":this.location_id};
  this.callGetDeviceList=this.adminService.getDeviceListForAddSurvey(this.location_id)
            .subscribe(
                data=>{
                    console.log(data);
                    this.deviceList=data.result;
                   // this.tabletsNew$=this.deviceList;
                    // for(let dev of this.deviceList){
                    //     this.tablet_name=String(dev.tablet_name);
                    // }

                                       
                   // callback(component);
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

callSurveyDetailsData(){
  if(sessionStorage.getItem('survey_id')!='0'){

    // console.log("inside if of timeout");
    // var jsonData={"survey_id":sessionStorage.getItem('survey_id')};
     this.adminService.getSurveyDetails(sessionStorage.getItem('survey_id'))
           .subscribe(
               data=>{
                   console.log(JSON.stringify(data));
                     //$('#multipleSelect').val(data.selected_tablets);
                   //  $('#multipleSelect').multiselect("refresh");
 
                     this.survey_all_data_edit=data.result;
                   this.add_survey.patchValue(
                     data.result
                   );
                   if(data.result.welcome_message=="" && data.result.tagline==""){
                    this.req_wel_screen=true;
                   }

                   if(data.result.remark==""){
                    this.skip_remark_screen=true;
                   }

                   const component = this;
    $(document).ready(function(){
      // $(".chosen-select").chosen();
       //$("#options").hide();
       //alert(1);
       //component.isSmiley=false;
       if(component.survey_all_data_edit.followup_question!=""){
         //this.console.log('here in followup');
         //alert('here in followup');
       $("#individual_followup_question_rating_positive").hide();
       $("#individual_followup_question_rating_neutral").hide();
       $("#individual_followup_question_rating_negative").hide();
       $("#common_followup_question").show();
       }else{
        //this.console.log('here in positive');
      //  alert('here in po');

       $("#individual_followup_question_rating_positive").show();
       $("#individual_followup_question_rating_neutral").hide();
       $("#individual_followup_question_rating_negative").hide();
       $("#common_followup_question").hide();
       }

   });

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

}


//not required
myFunction(component){
  
  console.log("after data load callback");
  setTimeout(() => 
{
  console.log("after 5 sec");
  $(".chosen-select").chosen(); 

  if(sessionStorage.getItem('survey_id')!='0'){

    console.log("inside if of timeout");
    var jsonData={"survey_id":sessionStorage.getItem('survey_id')};
    component.adminService.getSurveyDetails(sessionStorage.getItem('survey_id'))
          .subscribe(
              data=>{
                  console.log(data.selected_tablets);
                    $('#multipleSelect').val(data.selected_tablets);
                  //  $('#multipleSelect').multiselect("refresh");

                    component.survey_all_data_edit=data;
                  component.add_survey.patchValue(
                    data
                  );
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
    
},
500);    

}
submitSurveyData(){
  console.log("onsubmit");

  if(this.add_survey.invalid){
    this.toastrService.error('Please fill all data then submit','Incomeplete Data', {
      timeOut: 3000,
      positionClass: 'toast-bottom-right',
    });
    return;
  }

  if(this.add_survey.get('followup_question').value=='' && this.add_survey.get('followup_question_positive').value=='' && this.add_survey.get('followup_question_negative').value=='' && this.add_survey.get('followup_question_neutral').value=='')
      {
        this.toastrService.error('Please fill all data then submit','Incomeplete Data', {
          timeOut: 3000,
          positionClass: 'toast-bottom-right',
        });
        return;
      }
      if(!this.req_wel_screen){
         if(this.add_survey.get('welcome_message').value=='' && this.add_survey.get('tagline').value=='')
      {
        this.toastrService.error('Please fill all data then submit','Incomeplete Data', {
          timeOut: 3000,
          positionClass: 'toast-bottom-right',
        });
        return;
      }
 
       }

       if(!this.skip_remark_screen){
        if(this.add_survey.get('remark').value=='')
     {
       this.toastrService.error('Please fill all data then submit','Incomeplete Data', {
         timeOut: 3000,
         positionClass: 'toast-bottom-right',
       });
       return;
     }

      }
  if(this.isSmiley){
   
    if(this.add_survey.get('followup_question_positive').value!=''){
      if(
       this.add_survey.get('option_1_positive').value=='' ||
       this.add_survey.get('option_2_positive').value=='' ||
       this.add_survey.get('option_3_positive').value=='' ||
       this.add_survey.get('option_4_positive').value=='' ||
       this.add_survey.get('option_5_positive').value=='' ||
       this.add_survey.get('option_6_positive').value==''
      ){
       this.toastrService.error('Please fill all options of Positive Question then submit','Incomeplete Data', {
         timeOut: 4000,
         positionClass: 'toast-bottom-right',
       });
       return;
      }
     }

     if(this.add_survey.get('followup_question_negative').value!=''){
      if(
       this.add_survey.get('option_1_negative').value=='' ||
       this.add_survey.get('option_2_negative').value=='' ||
       this.add_survey.get('option_3_negative').value=='' ||
       this.add_survey.get('option_4_negative').value=='' ||
       this.add_survey.get('option_5_negative').value=='' ||
       this.add_survey.get('option_6_negative').value=='' 
      ){
       this.toastrService.error('Please fill all options of Negative Question then submit','Incomeplete Data', {
         timeOut: 4000,
         positionClass: 'toast-bottom-right',
       });
       return;
      }
      
     }

     if(this.add_survey.get('followup_question_neutral').value!=''){
      if(
       this.add_survey.get('option_1_neutral').value=='' ||
       this.add_survey.get('option_2_neutral').value=='' ||
       this.add_survey.get('option_3_neutral').value=='' ||
       this.add_survey.get('option_4_neutral').value=='' ||
       this.add_survey.get('option_5_neutral').value=='' ||
       this.add_survey.get('option_6_neutral').value=='' 
      ){
       this.toastrService.error('Please fill all options of Neutral Question then submit','Incomeplete Data', {
         timeOut: 4000,
         positionClass: 'toast-bottom-right',
       });
       return;
      }
      
     }

  }else{
    if(this.add_survey.get('followup_question').value!=''){
     if(
      this.add_survey.get('option_1').value=='' ||
      this.add_survey.get('option_2').value=='' ||
      this.add_survey.get('option_3').value=='' ||
      this.add_survey.get('option_4').value=='' ||
      this.add_survey.get('option_5').value=='' ||
      this.add_survey.get('option_6').value==''
     ){
      this.toastrService.error('Please fill all options of followup then submit','Incomeplete Data', {
        timeOut: 4000,
        positionClass: 'toast-bottom-right',
      });
      return;
     }
     
    }
  }



  var finalData=this.add_survey.value;
  if(this.survey_all_data_edit!=null){
    finalData.survey_id=this.survey_all_data_edit.survey_id;
  }
  finalData.is_smiley=this.isSmiley;
  //finalData.survey_name=sessionStorage.getItem('add_survey_name');
  finalData.survey_type="options";
  //finalData.selected_tablets=$('#multipleSelect').val();
  let i=0;
  for(let tabs of this.add_survey.get('selected_tablets').value){
  finalData.selected_tablets[i]=tabs.tablet_id;
  i++;
  }
  if(this.add_survey.get('selected_tablets').value==''){
    finalData.selected_tablets=[];
  }
  finalData.admin_id=sessionStorage.getItem('admin_id');

  if(this.req_wel_screen){
   finalData.welcome_message='';
   finalData.tagline=''; 
  }

  if(this.skip_remark_screen){
    finalData.remark='';
   }
  if(this.survey_all_data_edit==null){
  
  if(this.isSmiley){
    finalData.followup_question='';
    finalData.option_1='';
    finalData.option_2='';
    finalData.option_3='';
    finalData.option_4='';
    finalData.option_5='';
    finalData.option_6='';
    }else{
      finalData.followup_question_positive='';
      finalData.option_1_positive='';
      finalData.option_2_positive='';
      finalData.option_3_positive='';
      finalData.option_4_positive='';
      finalData.option_5_positive='';
      finalData.option_6_positive='';

      finalData.followup_question_neutral='';
      finalData.option_1_neutral='';
      finalData.option_2_neutral='';
      finalData.option_3_neutral='';
      finalData.option_4_neutral='';
      finalData.option_5_neutral='';
      finalData.option_6_neutral='';

      finalData.followup_question_negative='';
      finalData.option_1_negative='';
      finalData.option_2_negative='';
      finalData.option_3_negative='';
      finalData.option_4_negative='';
      finalData.option_5_negative='';
      finalData.option_6_negative='';
    }
  }
  //console.log(JSON.stringify(this.add_survey.value));

  //   if (this.add_survey.invalid) {
  //     return;
  // }
  //console.log($('#multipleSelect').val());
  console.log(this.isSmiley);

  console.log(this.configService.configData);
  for(let i=0;i<this.configService.configData.length;i++){
    if(this.configService.configData[i].status===finalData.status){
    finalData.status_id=this.configService.configData[i].status_id;
    break;
  }
  }

 // console.log(finalData);
  if(this.survey_all_data_edit==null){
    finalData.location_id=sessionStorage.getItem('add_survey_loc_id');
   
    //console.log('in add survey');
    //console.log(this.survey_all_data_edit);
  
    console.log(JSON.stringify(finalData));
    
  this.callAddSurvey=this.adminService.addSurveyData(finalData)
            .subscribe(
                data=>{
                console.log(data);
                if(data.status!=0){   
                this.router.navigate(['home/work-place']);    
                this.toastrService.success('','Survey Added Successfully', {
                  timeOut: 3000,
                  positionClass: 'toast-bottom-right',
                });                       
              }else{
                this.toastrService.error('Server Error','Please try again later', {
                  timeOut: 2000,
                  positionClass: 'toast-bottom-right',
                });
              }        
                },
                error=>{
                    console.log(error);
                    this.toastrService.error('Server Error','Please try again later', {
                      timeOut: 2000,
                      positionClass: 'toast-bottom-right',
                    });
                }
            );
             
          

            }else{
                
              finalData.survey_id=this.survey_all_data_edit.survey_id;
              finalData.location_id=this.survey_all_data_edit.location_id;
              finalData.followup_question_id=this.survey_all_data_edit.followup_question_id;
              finalData.followup_question_positive_id=this.survey_all_data_edit.followup_question_positive_id;
              finalData.followup_question_negative_id=this.survey_all_data_edit.followup_question_negative_id;
              finalData.followup_question_neutral_id=this.survey_all_data_edit.followup_question_neutral_id;

              console.log(JSON.stringify(finalData));
              
              this.callAddSurvey=this.adminService.editSurveyData(finalData)
              .subscribe(
                  data=>{
                  console.log(data);   
                  if(data.status!=0){
                  this.router.navigate(['home/work-place']);  
                  this.toastrService.success('','Survey Updated Successfully', {
                    timeOut: 3000,
                    positionClass: 'toast-bottom-right',
                  });        
                }else{
                  this.toastrService.error('Server Error','Please try again later', {
                    timeOut: 2000,
                    positionClass: 'toast-bottom-right',
                  });
                }                       
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
}

 delay(ms: number) {
  return new Promise( resolve => setTimeout(resolve, ms) );
}


scroll(el: HTMLElement) {
  el.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
}

openModal(id: string) {
  this.modalService.open(id);
  //console.log("clicked under : "+underId);
 // this.modalWorkplaceId=underId;
}

closeModal(id: string) {
  this.modalService.close(id);
}

openNextModal(closeid,openid){
  this.closeModal(closeid)
  this.openModal(openid);
}

checkAndOpenNextModal(closeid,openid){
  if(this.isSmiley){
    this.closeModal(closeid)
    this.openModal(openid);
  }else{
    openid='add-followup-question-option';
    this.closeModal(closeid)
    this.openModal(openid);
  }
}


submitDraft(){
  
  this.isDraft=true;
  this.submitSurveyDataForDraft();

}

openModalForDraft(modal){
  this.openModal(modal);
}

 openNav(navId) {
  document.getElementById(navId).style.width = "100%";
}

openNextNav(closeid,openid){
  this.closeNav(closeid)
  this.openNav(openid);
}

 closeNav(navId) {
  document.getElementById(navId).style.width = "0%";
}

onChangeSurveyQuestionConfirmation(modal){
  if(this.discard_followup){
this.add_survey.get('followup_question').setValue('');
this.add_survey.get('option_1').setValue('');
this.add_survey.get('option_2').setValue('');
this.add_survey.get('option_3').setValue('');
this.add_survey.get('option_4').setValue('');
this.add_survey.get('option_5').setValue('');
this.add_survey.get('option_6').setValue('');
  }else{
    this.add_survey.get('followup_question_positive').setValue('');
    this.add_survey.get('option_1_positive').setValue('');
    this.add_survey.get('option_2_positive').setValue('');
    this.add_survey.get('option_3_positive').setValue('');
    this.add_survey.get('option_4_positive').setValue('');
    this.add_survey.get('option_5_positive').setValue('');
    this.add_survey.get('option_6_positive').setValue('');
    this.add_survey.get('followup_question_neutral').setValue('');
    this.add_survey.get('option_1_neutral').setValue('');
    this.add_survey.get('option_2_neutral').setValue('');
    this.add_survey.get('option_3_neutral').setValue('');
    this.add_survey.get('option_4_neutral').setValue('');
    this.add_survey.get('option_5_neutral').setValue('');
    this.add_survey.get('option_6_neutral').setValue('');
    this.add_survey.get('followup_question_negative').setValue('');
    this.add_survey.get('option_1_negative').setValue('');
    this.add_survey.get('option_2_negative').setValue('');
    this.add_survey.get('option_3_negative').setValue('');
    this.add_survey.get('option_4_negative').setValue('');
    this.add_survey.get('option_5_negative').setValue('');
    this.add_survey.get('option_6_negative').setValue('');   
  }
this.closeModal(modal);
}

submitSurveyDataForDraft(){
  var finalData=this.add_survey.value;
  finalData.admin_id=sessionStorage.getItem('admin_id');
  if(this.add_survey.get('selected_tablets').value==''){
    finalData.selected_tablets=[];
  }
    finalData.status_id=4;
    finalData.location_id=this.location_id;
    if(this.survey_all_data_edit!=null){
      finalData.survey_id=this.survey_all_data_edit.survey_id;
    }else{
    finalData.survey_id=0;
    }

    if(this.isSmiley){
      finalData.followup_question='';
      finalData.option_1='';
      finalData.option_2='';
      finalData.option_3='';
      finalData.option_4='';
      finalData.option_5='';
      finalData.option_6='';
      }else{
        finalData.followup_question_positive='';
        finalData.option_1_positive='';
        finalData.option_2_positive='';
        finalData.option_3_positive='';
        finalData.option_4_positive='';
        finalData.option_5_positive='';
        finalData.option_6_positive='';
  
        finalData.followup_question_neutral='';
        finalData.option_1_neutral='';
        finalData.option_2_neutral='';
        finalData.option_3_neutral='';
        finalData.option_4_neutral='';
        finalData.option_5_neutral='';
        finalData.option_6_neutral='';
  
        finalData.followup_question_negative='';
        finalData.option_1_negative='';
        finalData.option_2_negative='';
        finalData.option_3_negative='';
        finalData.option_4_negative='';
        finalData.option_5_negative='';
        finalData.option_6_negative='';
      }

    console.log(JSON.stringify(finalData));

    console.log("in draft");
    if(this.survey_all_data_edit==null){

                this.callAddSurvey=this.adminService.addNewDraftSurvey(finalData)
                .subscribe(
                    data=>{
                    console.log(data);   
                    this.router.navigate(['home/work-place']);  
                    this.toastrService.success('','Survey Draft Added Successfully', {
                      timeOut: 3000,
                      positionClass: 'toast-bottom-right',
                    });                                 
                    },
                    error=>{
                        console.log(error);
                        this.toastrService.error('Server Error','Please try again later', {
                          timeOut: 2000,
                          positionClass: 'toast-bottom-right',
                        });
                    }
    
                );
                  }else{
                    finalData.survey_id=this.survey_all_data_edit.survey_id;
                    finalData.location_id=this.survey_all_data_edit.location_id;
                    console.log(JSON.stringify(finalData));
                    
                    this.callAddSurvey=this.adminService.editSurveyData(finalData)
                    .subscribe(
                        data=>{
                        console.log(data);   
                        if(data.status!=0){
                        this.router.navigate(['home/work-place']);  
                        this.toastrService.success('','Survey Updated Successfully', {
                          timeOut: 3000,
                          positionClass: 'toast-bottom-right',
                        });        
                      }else{
                        this.toastrService.error('Server Error','Please try again later', {
                          timeOut: 2000,
                          positionClass: 'toast-bottom-right',
                        });
                      }                       
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
}

}
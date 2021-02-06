import { Component, OnInit } from '@angular/core';
import { AdminService } from '../admin.service';
import { FormGroup, FormBuilder, FormArray,FormControl, Validators,FormGroupDirective, NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PlatformLocation } from '@angular/common';
import { ModalService } from '../_modal/modal.service';
import { ConfigService } from '../_services/config.service';

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
  deviceList;
  callGetDeviceList: any;
  add_survey;
  callAddSurvey;
  welcome="hello";
  target4='target4';
  isDraft:boolean;
  surveyDraftId;

  
  constructor(private adminService:AdminService,private formBuilder:FormBuilder,
    private router:Router,private location: PlatformLocation,private modalService:ModalService,
    private configService:ConfigService ) {
      location.onPopState((event) => {
        // ensure that modal is opened
      console.log("back pressed");
      alert('asfasefsdaf');
});
     }


  
  ngOnInit() {
    


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
      welcome_message:['',Validators.required],
      tagline:['',Validators.required],
      followup_question:['',Validators.required],
      followup_question_positive:['',Validators.required],
      followup_question_negative:['',Validators.required],
      followup_question_neutral:['',Validators.required],
      option_1:['',Validators.required],
      option_2:['',Validators.required],
      option_3:['',Validators.required],
      option_4:['',Validators.required],
      option_5:['',Validators.required],
      option_6:['',Validators.required],
      option_1_positive:['',Validators.required],
      option_2_positive:['',Validators.required],
      option_3_positive:['',Validators.required],
      option_4_positive:['',Validators.required],
      option_5_positive:['',Validators.required],
      option_6_positive:['',Validators.required],
      option_1_negative:['',Validators.required],
      option_2_negative:['',Validators.required],
      option_3_negative:['',Validators.required],
      option_4_negative:['',Validators.required],
      option_5_negative:['',Validators.required],
      option_6_negative:['',Validators.required],
      option_1_neutral:['',Validators.required],
      option_2_neutral:['',Validators.required],
      option_3_neutral:['',Validators.required],
      option_4_neutral:['',Validators.required],
      option_5_neutral:['',Validators.required],
      option_6_neutral:['',Validators.required],
      status:['',Validators.required],
      master_question:['',Validators.required],
     // selected_tablets:['',Validators.required],
    });//this.tablet_name="sdfgsdjgasdf";
    this.survey_name=sessionStorage.getItem('add_survey_name');
    this.location_id=sessionStorage.getItem('location_id');
    console.log("location_id"+this.location_id);
    this.getDeviceList(this.myFunction,this);

    

    const component = this;
    $(document).ready(function(){
      // $(".chosen-select").chosen();
       //$("#options").hide();
       //alert(1);
       component.isSmiley=false;
       $("#individual_followup_question_rating_positive").hide();
       $("#individual_followup_question_rating_neutral").hide();
       $("#individual_followup_question_rating_negative").hide();
       $("#common_followup_question").hide();

   });

    $("#5_star").click(function(){
      component.isSmiley=true;
     // component.scroll(component.target4);
      $("#individual_followup_question_rating_positive").show();
      $("#individual_followup_question_rating_neutral").hide();
      $("#individual_followup_question_rating_negative").hide();
      $("#common_followup_question").hide();
  });
   $("#4_star").click(function(){
    component.isSmiley=true;
    $("#individual_followup_question_rating_positive").show();
      $("#individual_followup_question_rating_neutral").hide();
      $("#individual_followup_question_rating_negative").hide();
      $("#common_followup_question").hide();
  });
  $("#3_star").click(function(){
      component.isSmiley=true;
      $("#individual_followup_question_rating_positive").hide();
      $("#individual_followup_question_rating_neutral").show();
      $("#individual_followup_question_rating_negative").hide();
      $("#common_followup_question").hide();
  });
  $("#2_star").click(function(){
      component.isSmiley=true;
      $("#individual_followup_question_rating_positive").hide();
      $("#individual_followup_question_rating_neutral").hide();
      $("#individual_followup_question_rating_negative").show();
      $("#common_followup_question").hide();
  });
   $("#1_star").click(function(){
    component.isSmiley=true;
    $("#individual_followup_question_rating_positive").hide();
      $("#individual_followup_question_rating_neutral").hide();
      $("#individual_followup_question_rating_negative").show();
      $("#common_followup_question").hide();
  });

  $("#add_common_question").click(function(){
    component.isSmiley=false;
    $("#common_followup_question").show();
      $("#individual_followup_question_rating_positive").hide();
      $("#individual_followup_question_rating_neutral").hide();
      $("#individual_followup_question_rating_negative").hide();
  });

    
  }

 


  ngAfterViewInit() {
  }
  
getDeviceList(callback,component){
  var locationdata={"location_id":this.location_id};
  this.callGetDeviceList=this.adminService.getDeviceListForAddSurvey(this.location_id)
            .subscribe(
                data=>{
                    console.log(data);
                    this.deviceList=data;
                    for(let dev of this.deviceList){
                        this.tablet_name=String(dev.tablet_name);
                    }
                    callback(component);
                },
                error=>{
                    console.log(error);
                }

            );
}

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
                  console.log(data);
                    $('#multipleSelect').val(data.selected_tablets);

                  component.add_survey.patchValue(
                    data
                  );
              },
              error=>{
                  console.log(error);
              }

          );
  }
    
},
500);    

}
submitSurveyData(){
  console.log("onsubmit");
  var finalData=this.add_survey.value;
  finalData.is_smiley=this.isSmiley;
  finalData.survey_name=sessionStorage.getItem('add_survey_name');
  finalData.survey_type="options";
  finalData.location_id=sessionStorage.getItem('location_id');
  finalData.selected_tablets=$('#multipleSelect').val();
  finalData.admin_id=sessionStorage.getItem('admin_id');
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

  console.log(JSON.stringify(this.add_survey.value));

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
  if(!this.isDraft){
    if(this.surveyDraftId!=null){
      finalData.survey_id=this.surveyDraftId;
    }else{
    finalData.survey_id=0;
    }
    console.log(JSON.stringify(finalData));
  this.callAddSurvey=this.adminService.addSurveyData(finalData)
            .subscribe(
                data=>{
                console.log(data);   
                this.router.navigate(['home/work-place']);                                 
                },
                error=>{
                    console.log(error);
                }
            );
              }
              else{
                finalData.status_id=4;
                if(this.surveyDraftId!=null){
                  finalData.survey_id=this.surveyDraftId;
                }else{
                finalData.survey_id=0;
                }
                console.log(JSON.stringify(finalData));
                console.log("in draft");
                this.callAddSurvey=this.adminService.addSurveyData(finalData)
                .subscribe(
                    data=>{
                    console.log(data);   
                    this.router.navigate(['home/work-place']);                                 
                    },
                    error=>{
                        console.log(error);
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
  this.submitSurveyData();
}


}

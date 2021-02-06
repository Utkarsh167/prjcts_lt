import { Component, OnInit } from '@angular/core';
import { AdminService } from '../admin.service';
import { ModalService } from '../_modal/modal.service';
import { FormBuilder, FormGroup, Validators, FormGroupDirective } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from "../_services/data.service";
import { ConfigService } from '../_services/config.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-work-place',
  templateUrl: './work-place.component.html',
  styleUrls: ['./work-place.component.css'],
  
})
export class WorkPlaceComponent implements OnInit {
allSurveyData:any;
activeSurveyList=[];
inactiveSurveyList=[];
draftSurveyList=[];
data;
allWorkplaceLocationData;
admin_id:number;
add_workplace : FormGroup;
add_location: FormGroup;
modalWorkplaceId;
add_survey:FormGroup;
surveySize;
location_id: any;
isHome;
duplicate_data:any;
add_duplicate_survey;
locationList=Array();
statusArray;
isSuper;
user_rights;
user_right_json;
onScreen='outer';
status;
update_status_id;
update_survey_id;
update_on_survey;
loc_name;
loading=true;
selectedWp;
hover;
postDataForSurveyList;
defaultShow=false;
Translab1=false;
surveyTypes =["HAPPINESS"];
// ,"NPS","CSAT","CES","THUMBS UP"
selectedType="HAPPINESS";


  constructor(private formBuilder: FormBuilder,private adminService : AdminService,private modalService: ModalService,private router: Router,private dataService: DataService
    ,private configService:ConfigService,private toastrService: ToastrService) {
   }

  ngOnInit() {
     // this.showToaster();
     this.isSuper=sessionStorage.getItem('is_super');
     this.onScreen='outer';
     if(!(this.isSuper=='true')){
    // this.user_rights=JSON.parse(String(sessionStorage.getItem('user_rights')));
    this.user_rights=(sessionStorage.getItem('user_rights'));
    this.user_right_json=JSON.parse(this.user_rights)
     console.log(this.user_right_json);
     }
     console.log(this.isSuper);
    this.admin_id=Number(sessionStorage.getItem('admin_id'));
    sessionStorage.setItem("add_survey_name",null);
 // this.getSurveyData();
  this.statusArray=this.configService.configData;
  console.log(this.statusArray);
  sessionStorage.setItem('isHome',"true");
  sessionStorage.setItem('survey_id','0');
  this.dataService.currentMessage.subscribe(message => this.isHome = message);
    this.dataService.changeMessage('true');
  this.location_id=null;
  this.getWorkPlaceData();
  this.add_workplace =
  this.formBuilder.group({
            wp_name: ['', Validators.required]
        });

        this.add_survey =
        this.formBuilder.group({
            survey_name: ['', Validators.required],
            surveyType:"0"
        });

        this.add_duplicate_survey=this.formBuilder.group({
            location_id:['0',Validators.required],
            survey_name:['',Validators.required]
        })

        console.log("admin_id : "+sessionStorage.getItem('admin_id'));
  

   this.add_location = this.formBuilder.group({
            location_name: ['', Validators.required]
        });

        this.add_survey.controls['survey_name'].disable();


      //  this.selectedSurveyType='NPS';

        }
  

    get wp() { return this.add_workplace.controls;
     }

     get wp_location() { return this.add_location.controls;
        sessionStorage.setItem('noti_resp_id','');


     }

  
     //Not in use
//   getSurveyData(){
//     //   if(this.isSuper=='true'){
//     //       this.location_id=null;
//     //   }else{
//     //       this.location_id=sessionStorage.getItem('location_id');
//     //   }
//     this.onScreen='outer';
//        this.location_id=sessionStorage.getItem('location_id');
//       console.log("location id : "+sessionStorage.getItem('location_id'));
//    this.adminService.getSurveyData(sessionStorage.getItem('client_id'),this.isSuper,this.location_id)
//             .subscribe(
//                 data=>{
//                 console.log(data);
               
//                 this.activeSurveyList=[];
//                 this.inactiveSurveyList=[];
//                 this.draftSurveyList=[];
//                     this.allSurveyData=data;
//                     for(let survey of this.allSurveyData){
//                         if(survey.status_id==1){
//                             this.activeSurveyList.push(survey);
//                         }else  if(survey.status_id==2){
//                             this.inactiveSurveyList.push(survey);
//                         }else  if(survey.status_id==4){
//                             this.draftSurveyList.push(survey);
//                         }
//                     }
//                     this.surveySize=this.allSurveyData.length;
//                     this.loading=false;
//                 },
//                 error=>{
//                     console.log(error);
//                     this.toastrService.error('Server Error','Please try again later', {
//                         timeOut: 2000,
//                         positionClass: 'toast-bottom-right',
//                       });
//                     //
//                 }

//             );
//   }

  //migrated
   getWorkPlaceData(){
       //var admin_id:number=Number(sessionStorage.getItem('admin_id'));
       if(this.isSuper=='true'){
       this.data={"is_super":this.isSuper,"client_id":sessionStorage.getItem('client_id'),"location_id":sessionStorage.getItem('location_id')};
   this.adminService.getWorkplacesAndLocations(this.data)
            .subscribe(
                data=>{
                console.log(data);
                this.loading=false;
                 this.allWorkplaceLocationData=data.result;
                 let i:number=0;
                //  for (let i=0,k=0;i< this.allWorkplaceLocationData.length;i++){
                //      for(let j=0;j<this.allWorkplaceLocationData[i].locations.length;j++){
                //         this.locationList[k].location_id=this.allWorkplaceLocationData[i].locations[j].location_id;
                //         this.locationList[k].location_name=this.allWorkplaceLocationData[i].locations[j].location_name;
                //         k++;
                //      }
                //  }
                var count=0;
                for(let workplace of this.allWorkplaceLocationData){
                    for (let location of workplace.locations){
                        this.selectedWp=workplace.workplace_name;
                        this.loc_name=location.name;
                        this.location_id=location.id;
                        this.getSurveyUnderLocationData(this.selectedWp,this.location_id,this.loc_name);
                        count++;
                        break;
                       //this.locationList.push(location);
                    }
                    break;
                }
                console.log(count);
                 for(let workplace of this.allWorkplaceLocationData){
                     for (let location of workplace.locations){
                        this.locationList.push(location);
                     }
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
        this.data={"is_super":this.isSuper,"location_id":sessionStorage.getItem('location_id')};
        this.adminService.getWorkplacesAndLocations(this.data)
                 .subscribe(
                     data=>{
                     console.log(data);

                      this.allWorkplaceLocationData=data.result;
                      let i:number=0;

                      var count=0;
                      for(let workplace of this.allWorkplaceLocationData){
                          for (let location of workplace.locations){
                              this.selectedWp=workplace.workplace_name;
                              this.loc_name=location.name;
                              this.location_id=location.id;
                              this.getSurveyUnderLocationData(this.selectedWp,this.location_id,this.loc_name);
                              count++;
                              break;
                             //this.locationList.push(location);
                          }
                          break;
                      }
                      console.log(count);
                     
                     //  for (let i=0,k=0;i< this.allWorkplaceLocationData.length;i++){
                     //      for(let j=0;j<this.allWorkplaceLocationData[i].locations.length;j++){
                     //         this.locationList[k].location_id=this.allWorkplaceLocationData[i].locations[j].location_id;
                     //         this.locationList[k].location_name=this.allWorkplaceLocationData[i].locations[j].location_name;
                     //         k++;
                     //      }
                     //  }
                      for(let workplace of this.allWorkplaceLocationData){
                          for (let location of workplace.locations){
                             this.locationList.push(location);
                          }
                      }
                    
     
                     },
                     error=>{
                        this.loading=false;
                         console.log(error);
                         this.toastrService.error('Server Error','Please try again later', {
                            timeOut: 2000,
                            positionClass: 'toast-bottom-right',
                          });
                     }
     
                 );
       }
  }


  //migrated
  getSurveyUnderLocationData(workplace_name,data,loc_name){
     this.selectedWp=workplace_name;
 console.log("location id : "+data+" location_name : "+loc_name);
 this.location_id=data;
 this.loc_name=loc_name;
 this.onScreen='inner';

 sessionStorage.setItem('add_survey_loc_id',data);
   // let formData: FormData = new FormData(); 
    // formData.append('x-api-key','123456'); 
    // var getSurverUnderLocData:any;
    // getSurverUnderLocData.location_id=this.location_id;
    // console.log(getSurverUnderLocData);
    // console.log(this.location_id);

   this.adminService.getSurveyUnderLocationData({ location_id: this.location_id })
            .subscribe(
                data=>{
                console.log(data);
                this.activeSurveyList=[];
                this.inactiveSurveyList=[];
                this.draftSurveyList=[];
                    this.allSurveyData=data.result;
                    for(let survey of this.allSurveyData){
                        if(survey.status_id==1){
                            this.activeSurveyList.push(survey);
                        }else  if(survey.status_id==2){
                            this.inactiveSurveyList.push(survey);
                        }else  if(survey.status_id==4){
                            this.draftSurveyList.push(survey);
                        }
                    }
                    //this.allSurveyData=data;
                 this.loading=false;
                   
                

                },
                error=>{
                    this.loading=false
                    console.log(error);
                    this.toastrService.error('Server Error','Please try again later', {
                        timeOut: 2000,
                        positionClass: 'toast-bottom-right',
                      });
                }

            );
  }


   openModal(id: string) {
        this.modalService.open(id);
        
    }

    closeModal(id: string) {
        this.modalService.close(id);
    }


    //migrated
    onSubmitWp(){
        //this.submitted = true;
       if (this.add_workplace.invalid) {
        // this.toastrService.error('Please fill all data then submit','Incomeplete Data', {
        //     timeOut: 3000,
        //     positionClass: 'toast-bottom-right',
        //   });
            return;
        }

        console.log(this.wp.wp_name.value);
        var admin_id=sessionStorage.getItem('admin_id');

        this.loading=true;
          this.adminService.createWp(this.wp.wp_name.value,admin_id,sessionStorage.getItem('client_id'))
            .subscribe(
                data=>{
                this.loading=false;
                console.log(data);
                this.getWorkPlaceData();
                this.location_id=null;
                this.closeModal("custom-modal-1");
                this.toastrService.success('','Workplace added successfully ', {
                    timeOut: 2000,
                    positionClass: 'toast-bottom-right',
                  });
                 //this.allWorkplaceLocationData=data;
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
        }else  if(this.user_right_json[12]){
            console.log(data);
            this.dataService.currentMessage.subscribe(message => this.isHome = message);
            this.dataService.changeMessage('false');
            sessionStorage.setItem('survey_id', data);
            sessionStorage.setItem('isHome',"false");
            console.log(sessionStorage.getItem('isHome'));
            this.router.navigate(["home/work-place/responses"]);
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


    //migrated
     onSubmitLocationUnderWp(wpId){
        //this.submitted = true;
        console.log(wpId);

       if (this.add_location.invalid) {
        this.toastrService.error('Please fill all data then submit','Incomeplete Data', {
            timeOut: 3000,
            positionClass: 'toast-bottom-right',
          });
            return;
        }

        console.log(this.wp_location.location_name.value);

    //    let formData: FormData = new FormData();
    //      formData.append('name',this.wp_location.location_name.value);
    //      formData.append('workplace_id',wpId);
    //      formData.append('admin_id',sessionStorage.getItem('admin_id'));
         this.loading=true;
        this.adminService.createLocation({name:this.wp_location.location_name.value,workplace_id:wpId,admin_id:sessionStorage.getItem('admin_id')})
            .subscribe(
                data=>{
                    if(this.status!=0){
                this.loading=false;
                console.log(data);
                this.getWorkPlaceData();
                this.closeModal("add-new-location");
                this.toastrService.success('','Location added successfully ', {
                    timeOut: 2000,
                    positionClass: 'toast-bottom-right',
                  });
                }else{
                    this.loading=false;
                    this.closeModal("add-new-location");
                    this.toastrService.error('Server Error','Please try again later', {
                        timeOut: 2000,
                        positionClass: 'toast-bottom-right',
                      });  
                }
                },
                error=>{
                    this.loading=false;
                    this.closeModal("add-new-location");
                    console.log(error);
                    this.toastrService.error('Server Error','Please try again later', {
                        timeOut: 2000,
                        positionClass: 'toast-bottom-right',
                      });
                }

            );

         
    }

    openAddSurveyModel(){
     // this.router.navigate(['home/work-place/add-survey']);     
        this.openModal('add-new-survey');
    }

    openModalForAddNewLocation(modal,workplace_id,formDirective: FormGroupDirective){
            formDirective.resetForm();
            this.add_location.reset();
            this.modalWorkplaceId=workplace_id;
            this.openModal(modal);
    }

    onSubmitAddSurvey(){
      sessionStorage.setItem("add_survey_from_wp_name",this.add_survey.get('survey_name').value);
      this.closeModal('add-new-survey');
      this.router.navigate(['home/work-place/add-survey'])
    }

    //migrated
    editSurvey(survey_id,location_id,duplicate_survey){
        if(duplicate_survey==='true'){

            this.openModal('add-duplicate-survey');
            this.adminService.getSurveyDetails(survey_id)
            .subscribe(
                data=>{
                    console.log(data);
                    if(data.status!=0){
                    this.duplicate_data=data.result;
                    //this.duplicate_data.survey_name=this.duplicate_data.survey_name+' Copy';
                    delete this.duplicate_data['survey_id'];
                    console.log(this.duplicate_data);
                    }else{
                    this.closeModal('add-duplicate-survey');
                        this.loading=false;
                        this.toastrService.error('Server Error','Please try again later', {
                            timeOut: 2000,
                            positionClass: 'toast-bottom-right',
                          });
                    }
                      //$('#multipleSelect').val(data.selected_tablets);                   
                },
                error=>{
                    this.closeModal('add-duplicate-survey');
                    this.loading=false;
                    console.log(error);
                    this.toastrService.error('Server Error','Please try again later', {
                        timeOut: 2000,
                        positionClass: 'toast-bottom-right',
                      });
                }
            );
        }else{
        sessionStorage.setItem('survey_id',survey_id);
        sessionStorage.setItem('edit_survey_loc_id',location_id);
        sessionStorage.setItem('is_edit','true');
        this.router.navigate(['home/work-place/add-survey'])
        }
    }


    //migrated
    onSubmitDuplicateSurvey(){
        //console.log(this.add_duplicate_survey.value);
        if(this.add_duplicate_survey.invalid){
            this.toastrService.error('Please fill all data then submit','Incomeplete Data', {
                timeOut: 3000,
                positionClass: 'toast-bottom-right',
              });
              return;
        }
        if(this.add_duplicate_survey.get('location_id').value==0){
            this.toastrService.error('Please fill all data then submit','Incomeplete Data', {
                timeOut: 3000,
                positionClass: 'toast-bottom-right',
              });
              return; 
        }
        this.duplicate_data.location_id=this.add_duplicate_survey.get('location_id').value;
        this.duplicate_data.survey_name=this.add_duplicate_survey.get('survey_name').value;
        console.log(JSON.stringify(this.duplicate_data));
        this.loading=true;
        this.adminService.addNewDuplicateSurvey(this.duplicate_data)
        .subscribe(
            data=>{
            console.log(data);   
                if(data.status!=0){
            this.getSurveyUnderLocationData(this.selectedWp,this.location_id,this.loc_name);
            this.closeModal('add-duplicate-survey');
            this.toastrService.success('','Survey added successfully ', {
                timeOut: 2000,
                positionClass: 'toast-bottom-right',
              });
            }else{
            this.closeModal('add-duplicate-survey');
            this.loading=false;
            this.toastrService.error('Server Error','Please try again later', {
                timeOut: 2000,
                positionClass: 'toast-bottom-right',
              });
            }
            //this.router.navigate(['home/work-place']);                                 
            },
            error=>{
                console.log(error);
                this.closeModal('add-duplicate-survey');
                this.loading=false;
                this.toastrService.error('Server Error','Please try again later', {
                    timeOut: 2000,
                    positionClass: 'toast-bottom-right',
                  });
            }
        );


    }

    
    onSwitchChange(event,survey_id,onSurvey,modal){
        console.log(event);
        console.log(survey_id);
        this.update_survey_id=survey_id;
        this.update_on_survey=onSurvey;
       // var status_id,status;
         if(event=='true'){
            this.update_status_id=1;
            this.status='enable';

         }else{
             this.update_status_id=4;
            this.status='draft';
         }
         this.openModal(modal);
    }


//migrated
    onStatusChange(modal){
        // var data = new FormData();
        //  data.append("survey_id", this.update_survey_id);
        //  data.append("status_id", this.update_status_id);
        //  console.log(data);
        this.adminService.changeSurveyStatus({survey_id:this.update_survey_id,status_id:this.update_status_id})
        .subscribe(
            data=>{
            console.log(data); 
            if(data.status!=0){ 
            // if(this.update_on_survey=='outerSurvey') {
            //    this.getSurveyUnderLocationData(this.selectedWp,this.location_id,this.loc_name);
            //    this.closeModal('disable-confirmation');
            //    this.toastrService.success('','Survey updated successfully ', {
            //     timeOut: 2000,
            //     positionClass: 'toast-bottom-right',
            //   });
            // }else{
                this.getSurveyUnderLocationData(this.selectedWp,this.location_id,this.loc_name);
               this.closeModal('disable-confirmation');
               this.toastrService.success('','Survey updated successfully ', {
                timeOut: 2000,
                positionClass: 'toast-bottom-right',
              });
           // }
        }else{
            this.loading=false;
            this.toastrService.error('Server Error','Please try again later', {
                timeOut: 2000,
                positionClass: 'toast-bottom-right',
              });
        }
            //this.closeModal('add-duplicate-survey');
            //this.router.navigate(['home/work-place']);                                 
            },
            error=>{
                this.loading=false;
                console.log(error);
                this.toastrService.error('Server Error','Please try again later', {
                    timeOut: 2000,
                    positionClass: 'toast-bottom-right',
                  });
            }
        );
        
    }


    // get f() { return this.add_workplace.controls; }
   
    openWorkplaceModal(modal,formDirective: FormGroupDirective){
        formDirective.resetForm();
        this.add_workplace.reset();
        this.openModal(modal);
    }

    storeSurveyType(surveyType){
        console.log(surveyType);
        if(surveyType!=0){
           // this.defaultShow=true;
            this.add_survey.controls['survey_name'].enable();
        }else{
            //this.defaultShow=true;
            this.add_survey.controls['survey_name'].disable();
        }
    }

   
}

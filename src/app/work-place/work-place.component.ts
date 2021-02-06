import { Component, OnInit } from '@angular/core';
import { AdminService } from '../admin.service';
import { ModalService } from '../_modal/modal.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from "../_services/data.service";



@Component({
  selector: 'app-work-place',
  templateUrl: './work-place.component.html',
  styleUrls: ['./work-place.component.css']
})
export class WorkPlaceComponent implements OnInit {
allSurveyData:any;
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




  constructor(private formBuilder: FormBuilder,private adminService : AdminService,private modalService: ModalService,private router: Router,private dataService: DataService) {
   }

  ngOnInit() {
this.admin_id=Number(sessionStorage.getItem('admin_id'));
  this.getSurveyData();
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
            survey_name: ['', Validators.required]
        });

  

   this.add_location = this.formBuilder.group({
            location_name: ['', Validators.required]
        });

        }
  

    get wp() { return this.add_workplace.controls;
     }

     get wp_location() { return this.add_location.controls;
     }

  
  getSurveyData(){
   this.adminService.getSurveyData(this.admin_id,this.data)
            .subscribe(
                data=>{
                console.log(data);
               
                    this.allSurveyData=data;
                    this.surveySize=this.allSurveyData.length;
                },
                error=>{
                    //
                }

            );
  }

   getWorkPlaceData(){
       var admin_id:number=Number(sessionStorage.getItem('admin_id'));
       this.data={"admin_id":admin_id};
   this.adminService.getWorkplacesAndLocations(this.data)
            .subscribe(
                data=>{
                console.log(data);
                 this.allWorkplaceLocationData=data;
                },
                error=>{
                    console.log(error);
                }

            );
  }

 getSurveyUnderLocationData(data){
 console.log("location id : "+data);
 this.location_id=data;
        sessionStorage.setItem('location_id',data);
   this.adminService.getSurveyUnderLocationData(this.admin_id,data,this.data)
            .subscribe(
                data=>{
                console.log(data);
                    this.allSurveyData=data;
                },
                error=>{
                    console.log(error);
                }

            );
  }


   openModal(id: string) {
        this.modalService.open(id);
        
    }

    closeModal(id: string) {
        this.modalService.close(id);
    }


    onSubmitWp(){
        //this.submitted = true;
       if (this.add_workplace.invalid) {
            return;
        }

        console.log(this.wp.wp_name.value);
        var admin_id=sessionStorage.getItem('admin_id');

          this.adminService.createWp(this.wp.wp_name.value,admin_id,admin_id)
            .subscribe(
                data=>{
                console.log(data);
                this.getWorkPlaceData();
                this.location_id=null;
                this.closeModal("custom-modal-1")
                 //this.allWorkplaceLocationData=data;
                },
                error=>{
                    console.log(error)
                }

            );   
    }


    openSurveyDashboard(data){
    console.log(data);
    this.dataService.currentMessage.subscribe(message => this.isHome = message);
    this.dataService.changeMessage('false');
    sessionStorage.setItem('survey_id', data);
    sessionStorage.setItem('isHome',"false");
    console.log(sessionStorage.getItem('isHome'));
     // this.dataService.sendMessage(data);   
    this.router.navigate(["home/work-place/dashboard"]);
    }


     onSubmitLocationUnderWp(wpId){
        //this.submitted = true;
        console.log(wpId);

       if (this.add_location.invalid) {
            return;
        }

        console.log(this.wp_location.location_name.value);

       let formData: FormData = new FormData();
         formData.append('name',this.wp_location.location_name.value);
         formData.append('workplace_id',wpId);
        this.adminService.createLocation(formData,this.data)
            .subscribe(
                data=>{
                console.log(data);
                this.getWorkPlaceData();
                this.closeModal("add-new-location")
                },
                error=>{
                    console.log(error)
                }

            );

         
    }

    openAddSurveyModel(){
        this.openModal('add-new-survey');
    }

    openModalForAddNewLocation(modal,workplace_id){
            this.openModal(modal);
            this.modalWorkplaceId=workplace_id;
    }

    onSubmitAddSurvey(){
      sessionStorage.setItem("add_survey_name",this.add_survey.get('survey_name').value);
      this.closeModal('add-new-survey');
      this.router.navigate(['home/work-place/add-survey'])
    }

    editSurvey(survey_id){
        sessionStorage.setItem('survey_id',survey_id);
      this.router.navigate(['home/work-place/add-survey'])
    }
}

import { DataService } from "../_services/data.service";
import { Component, OnInit } from '@angular/core';
import { AdminService } from '../admin.service';


@Component({
  selector: 'app-responses',
  templateUrl: './responses.component.html',
  styleUrls: ['./responses.component.css']
})
export class ResponsesComponent implements OnInit {
    message:number;
    allResponses;
    callAllResponses;
    selected:number=0;
    surveyList;
    callResponsesDataBySurveyId;

  constructor(private dataService: DataService,private adminService:AdminService) { 
  }

  ngOnInit() {
   // this.dataService.currentMessage.subscribe(message => this.message = message);
    this.message=Number(sessionStorage.getItem("survey_id"));
     console.log("data from workplace : "+this.message);
     this.getAllResponses(this.message);
     this.selected=this.message;

  }

   getAllResponses(survey_id){
   this.callResponsesDataBySurveyId=this.adminService.getAllResponses(survey_id)
            .subscribe(
                data=>{
                this.allResponses=data;
                console.log(data);
                },
                error=>{
                   console.log(error)
                }

            );
  }


   selectOption(data) {
          //getted from event
          console.log("selected item"+data);
          sessionStorage.setItem("survey_id",data);
          this.message=data;
          this.dataService.changeMessage(data);
          this.getAllResponses(data);
          //this.getGraphData(data,this.identifier);
          //getted from binding
         // console.log(this.number)
        }

}

import { Component, OnInit,Input } from '@angular/core';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, Label } from 'ng2-charts';
import { DataService } from "../_services/data.service";
import { AdminService } from '../admin.service';
import {GraphService} from '../_services/graph.service';
import { first } from 'rxjs/operators';
import { DataObjectService } from "../_services/data-object.service";


@Component({
  selector: 'app-survey-dashboard',
  templateUrl: './survey-dashboard.component.html',
  styleUrls: ['./survey-dashboard.component.css']
})
export class SurveyDashboardComponent implements OnInit {
    message:number;
    callDashboardDataBySurveyId;
    allDashboardData;
    noOfResponses;
    noOfRespondents;
    noOfAreas;
    positiveIndex;
    fiveStarPer;
    fourStarPer;
    threeStarPer;
    twoStarPer;
    oneStarPer;
    fiveStarValue;
    fourStarValue;
    threeStarValue;
    twoStarValue;
    oneStarValue;
    positiveIndexAreaWise;
    objectKeys = Object.keys;
    responses;
    math = Math;
    selectedSurveyName;
    surveyList;
    selected: number = 0;
    fiveStarWithPer;
    fourStarWithPer;
    threeStarWithPer;
    twoStarWithPer;
    oneStarWithPer;
    objectKeysForSurvey = Object.keys;
    identifier;


public lineChartData: ChartDataSets[] = [];
// { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
  public lineChartLabels: Label[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  public lineChartOptions :ChartOptions = {
    responsive: true,
    maintainAspectRatio : false,
  };
  public lineChartColors: Color[] = [
    {
      borderColor: 'black',
      backgroundColor: 'rgba(255,0,0,0.3)',
    },
  ];
  public lineChartLegend = true;
  public lineChartType = 'line';
  public lineChartPlugins = [];


//gauge data
    gaugeType = "full";
    gaugeValue = 28.3;
    guageThickness="10";
    guageSize="270"
  constructor(private dataService : DataService,private adminService : AdminService,private graphService:GraphService,private dataObjectService:DataObjectService) {
}

  ngOnInit() {
      //this.dataService.currentMessage.subscribe(message => this.message = message);
      this.message=Number(sessionStorage.getItem('survey_id'));
      console.log("data from workplace : "+this.message);
      this.getDashBoardData(this.message);
      this.identifier="daily";
      this.getGraphData(this.message,this.identifier);
        }

  getDashBoardData(survey_id){
  console.log("coming here");
   this.callDashboardDataBySurveyId=this.adminService.getDashboardData(survey_id)
            .subscribe(
                data=>{
                console.log(data);
                  this.allDashboardData=data;
                  for(let dashBoardData of this.allDashboardData){
                  //console.log(dashBoardData.noOfResponses);
                  this.noOfResponses=dashBoardData.noOfResponses;
                  this.noOfRespondents=dashBoardData.noOfRespondents;
                  this.noOfAreas=dashBoardData.areas;
                  this.positiveIndex=dashBoardData.fiveStarRatingPercentage+dashBoardData.fourStarRatingPercentage;
                  this.gaugeValue=Math.ceil(this.positiveIndex);
                  this.fiveStarPer=dashBoardData.fiveStarRatingPercentage;
                  this.fourStarPer=dashBoardData.fourStarRatingPercentage;
                  this.threeStarPer=dashBoardData.threeStarRatingPercentage;
                  this.twoStarPer=dashBoardData.twoStarRatingPercentage;
                  this.oneStarPer=dashBoardData.oneStarRatingPercentage;
                
                  this.fiveStarWithPer=this.fiveStarPer+"%";
                  this.fourStarWithPer=this.fourStarPer+"%";
                  this.threeStarWithPer=this.threeStarPer+"%";
                  this.twoStarWithPer=this.twoStarPer+"%";
                  this.oneStarWithPer=this.oneStarPer+"%";

                    this.fiveStarValue=dashBoardData.fiveStarRating;
                  this.fourStarValue=dashBoardData.fourStarRating;
                  this.threeStarValue=dashBoardData.threeStarRating;
                  this.twoStarValue=dashBoardData.twoStarRating;
                  this.oneStarValue=dashBoardData.oneStarRating;
                  this.positiveIndexAreaWise=dashBoardData.positiveIndexAreaWise;
                  this.responses=dashBoardData.responses;
                  this.selectedSurveyName=dashBoardData.selected_survey_name;
                  this.selected=this.message;
                  this.surveyList=dashBoardData.surveyList;
                  this.dataObjectService.setScope(this.surveyList);
                  sessionStorage.setItem('location_id', dashBoardData.locationId);

                  }

                   for(var key in this.positiveIndexAreaWise){
                console.log('key: ' +   + ',  value: ' + this.positiveIndexAreaWise[key]);
                }
                },
                error=>{
                   console.log(error)
                }

            );
  }

         selectOption(data) {
          //getted from event
          console.log("selected item"+data);
          this.message=data;
          sessionStorage.setItem('survey_id', data);

          //this.dataService.changeMessage(data);
          this.getDashBoardData(data);
          this.getGraphData(data,this.identifier);
          //getted from binding
         // console.log(this.number)
        }


 getGraphData(surveyId,identifier) {

      let start_date,end_date,tablet_id;
        this.graphService.getGraphData(surveyId,tablet_id,identifier,start_date,end_date)
            .pipe(first())
            .subscribe(
                data => {


                this.loadBarLineGraph(data);
                          
                },
                error => {
                    console.log(error);
                    //this.alertService.error(error);
                });
    }


    loadDailyGraph(){
    console.log("daily");
    this.identifier="daily";
      this.getGraphData(this.message,this.identifier);
    }

    loadMonthlyGraph(){
    console.log("getLast12MonthsRatingData");
    this.identifier="getLast12MonthsRatingData";
      this.getGraphData(this.message,this.identifier);
    }


loadBarLineGraph(data){
    var dataPack=[], dataPackOneStarRatingPercentage=[], dataPackTwoStarRatingPercentage=[],
                   dataPackThreeStarRatingPercentage=[], dataPackFourStarRatingPercentage=[], 
                   dataPackFiveStarRatingPercentage=[]; 
                   var ratingData = data.dataArray;
                 

                for(let key of ratingData){
                let count =1; var total=0;
                 var OneStarRating=0, TwoStarRating =0, 
                ThreeStarRating=0, FourStarRating=0, FiveStarRating=0;


                for(let val of this.objectKeysForSurvey(key)){
                  console.log("key : "+val+"  Data"+key[val]);

                     total += Number(key[val]);
            if(count==1) {OneStarRating = Number(key[val]);}
            if(count==2) {TwoStarRating = Number(key[val]);}
            if(count==3){ ThreeStarRating = Number(key[val]);}
            if(count==4) {FourStarRating = Number(key[val]);}
            if(count==5) {FiveStarRating = Number(key[val]);}
            count++;
        }
        if(total ==0)
        {
            total=1;
        }


        dataPackOneStarRatingPercentage.push(((OneStarRating/total)*100).toFixed(2));
        dataPackTwoStarRatingPercentage.push(((TwoStarRating/total)*100).toFixed(2));
        dataPackThreeStarRatingPercentage.push(((ThreeStarRating/total)*100).toFixed(2));
        dataPackFourStarRatingPercentage.push(((FourStarRating/total)*100).toFixed(2));
        dataPackFiveStarRatingPercentage.push(((FiveStarRating/total)*100).toFixed(2));
        var avg = (((FourStarRating+FiveStarRating)/total)*100);
        avg = Number(avg.toFixed(2));

      //  var avg = (FourStarRating+FiveStarRating/total)*100;
       // avg = avg.toFixed(2);
        dataPack.push(avg);
                }


                
                    console.log(dataPack);   
                  //  this.lineChartData=[{data:dataPack,label:"Average Over Time"},
                   // {data:dataPackFiveStarRatingPercentage,label:"Five Star Rating Percentage",type:"bar"},
                   //{data:dataPackFourStarRatingPercentage,label:"Four Star Rating Percentage",type:"bar"},
                   //{data:dataPackThreeStarRatingPercentage,label:"Three Star Rating Percentage",type:"bar"},
                  // {data:dataPackTwoStarRatingPercentage,label:"Two Star Rating Percentage",type:"bar"},
                   //{data:dataPackOneStarRatingPercentage,label:"One Star Rating Percentage",type:"bar"}
                   // ];
                   this.lineChartData=[  {
            label: 'Happy Index',
            data: dataPack,
            backgroundColor: '#00ABE2',
            fill: false,
            borderColor: "#80b6f4",
            pointBorderColor: "#80b6f4",
            pointBackgroundColor: "#80b6f4",
            pointHoverBackgroundColor: "#80b6f4",
            pointHoverBorderColor: "#80b6f4",
            pointBorderWidth: 5,
            pointHoverRadius: 1,
            pointHoverBorderWidth: 1,
            pointRadius: 1,
        },
        {
            label:'Five Star Rating Percentage',
            data: dataPackFiveStarRatingPercentage,
            fill:false,
            backgroundColor:'#189150',
            hidden: false,
            type: 'bar',
        },
        {            label:'Four Star Rating Percentage',
            data: dataPackFourStarRatingPercentage,
            fill:false,
            backgroundColor:'#74B78C',
            hidden: false,
            type: 'bar',
        },
         {
            label:'Three Star Rating Percentage',
            data: dataPackThreeStarRatingPercentage,
            fill:false,
            backgroundColor:'#FECE8B',
            hidden: false,
            type: 'bar',
        },
        {
            label:'Two Star Rating Percentage',
            data: dataPackTwoStarRatingPercentage,
            fill:false,
            backgroundColor:'#FF847C',
            hidden: false,
            type: 'bar',
        },
         {
            label:'One Star Rating Percentage',
            data: dataPackOneStarRatingPercentage,
            fill:false,
            backgroundColor:'#E84A5F',
            hidden: false,
            type: 'bar',
}
];

   this.lineChartOptions={
                      legend:{
                        display:false
                    },
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true,
                    max: 100,
                    callback: function (value) { if (Number.isInteger(value)) { return value; } }
                } 
            }]
        },
        tooltips: {
            mode: 'index',
            intersect: false,
        },
        responsive: true,
        maintainAspectRatio: false,
    };

                    this.lineChartLabels=data.labelArray;
    }

}

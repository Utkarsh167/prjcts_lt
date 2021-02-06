import { Component, OnInit,Input } from '@angular/core';
import { ChartDataSets, ChartOptions,ChartType } from 'chart.js';
import { Color, Label,MultiDataSet } from 'ng2-charts';
import { DataService } from "../_services/data.service";
import { AdminService } from '../admin.service';
import {GraphService} from '../_services/graph.service';
import { first } from 'rxjs/operators';
import { DataObjectService } from "../_services/data-object.service";
import {ToastrService} from 'ngx-toastr';
import { Router } from '@angular/router';
import html2canvas from 'html2canvas';  
import * as jspdf from 'jspdf';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';


@Component({
  selector: 'app-survey-dashboard',
  templateUrl: './survey-dashboard.component.html',
  styleUrls: ['./survey-dashboard.component.css']
})
export class SurveyDashboardComponent implements OnInit {
    message;
    callDashboardDataBySurveyId;
    dashBoardData;
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
    selected="0";
    fiveStarWithPer;
    fourStarWithPer;
    threeStarWithPer;
    twoStarWithPer;
    oneStarWithPer;
    objectKeysForSurvey = Object.keys;
    identifier;
    data;
    loading=true;
    loading_linechart=true;
    areaList=new Array();
    doughNutChartOptions:ChartOptions= {
      responsive: true,
      maintainAspectRatio : false,
    };

    month;
    month_start;
    month_end;
    date_start;
    date_end;
    fourStarRatingPer7days;
    fiveStarRatingPer7days;
    chageFromLast7days;
    happy_hour;
    sad_hour;
    happy_day;
    sad_day;
    seven_week_start_date;
    seven_week_end_date;
    totalRating;
public lineChartData: ChartDataSets[] = [];
// { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
  public lineChartLabels: Label[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  public lineChartOptions :ChartOptions = {
    responsive: true,
    maintainAspectRatio : false,
  };
  public lineChartColors: Color[] = [
    {
      borderColor: '#119c4b',
      backgroundColor: 'rgba(255,0,0,0.3)',
    },
  ];
  public lineChartLegend = true;
  public lineChartType = 'line';
  public lineChartPlugins = [];

  public doughnutChartLabels: Label[] = ['1 star', '2 star', '3 star', '4 star', '5 star'];
  public doughnutChartData: MultiDataSet = [
    []
  ];
  public doughnutChartType: ChartType = 'doughnut';
  public doughnutChartPlugins = [pluginDataLabels];

  public doughnutChartColors = [
    {
      backgroundColor: ['#E84A5F','#FF847C','#FECE8B','#74B78C','#189150'  
]
    }
  ];



//gauge data
    gaugeType = "full";
    gaugeValue = 28.3;
    guageThickness="13";
    guageSize="150"
    guageSizeAlt="200"

  constructor(private dataService : DataService,
    private adminService : AdminService,
    private dataObjectService:DataObjectService,private toastrService: ToastrService,
    private router:Router) {
}



  ngOnInit() {
      //this.dataService.currentMessage.subscribe(message => this.message = message);
      this.message=sessionStorage.getItem('survey_id');
      console.log("data from workplace : "+this.message);
      sessionStorage.setItem('is_critical','0');
      this.getDashBoardData(this.message);
      this.identifier="daily";
      this.getGraphData(this.message,this.identifier);
      this.getBestWorstHourOfTheDay(this.message);
      this.getBestWorstDayOfTheWeek(this.message);
      sessionStorage.setItem('task_resp_id','');   
      sessionStorage.setItem('noti_resp_id','');

        }

  getDashBoardData(survey_id){
  console.log("coming here");
   this.callDashboardDataBySurveyId=this.adminService.getDashboardData(survey_id)
            .subscribe(
                data=>{
                console.log(JSON.stringify(data));
                console.log(data);

                  this.dashBoardData=data.result;

                  //console.log(dashBoardData.noOfResponses);
                  this.noOfResponses=this.dashBoardData.noOfResponses;
                  this.noOfRespondents=this.dashBoardData.noOfRespondents;
                  this.noOfAreas=this.dashBoardData.areas;
                  // this.positiveIndex=this.dashBoardData.fiveStarRatingPercentage+this.dashBoardData.fourStarRatingPercentage;
                  this.fiveStarPer=this.dashBoardData.fiveStarRatingPercentage;
                  this.fourStarPer=this.dashBoardData.fourStarRatingPercentage;
                  this.threeStarPer=this.dashBoardData.threeStarRatingPercentage;
                  this.twoStarPer=this.dashBoardData.twoStarRatingPercentage;
                  this.oneStarPer=this.dashBoardData.oneStarRatingPercentage;
                  this.fourStarRatingPer7days=this.dashBoardData.fourStarRatingPercentage7days;
                  this.fiveStarRatingPer7days=this.dashBoardData.fiveStarRatingPercentage7days;
                  this.totalRating=this.dashBoardData.totalRating;

                  this.positiveIndex= Number(this.dashBoardData.fourStarRatingPercentage7days+this.dashBoardData.fiveStarRatingPercentage7days);
                  this.gaugeValue=Math.ceil(this.positiveIndex);                  
                  console.log(this.positiveIndex);

                  this.doughnutChartData = [
                    [this.oneStarPer, this.twoStarPer, this.threeStarPer,this.fourStarPer,this.fiveStarPer],
                  ];
                  
                
                  this.fiveStarWithPer=this.fiveStarPer+"%";
                  this.fourStarWithPer=this.fourStarPer+"%";
                  this.threeStarWithPer=this.threeStarPer+"%";
                  this.twoStarWithPer=this.twoStarPer+"%";
                  this.oneStarWithPer=this.oneStarPer+"%";

                  this.fiveStarValue=this.dashBoardData.fiveStarRating;
                  this.fourStarValue=this.dashBoardData.fourStarRating;
                  this.threeStarValue=this.dashBoardData.threeStarRating;
                  this.twoStarValue=this.dashBoardData.twoStarRating;
                  this.oneStarValue=this.dashBoardData.oneStarRating;
                  this.positiveIndexAreaWise=this.dashBoardData.positiveIndexAreaWise;
                  this.responses=this.dashBoardData.responses;
                  this.selectedSurveyName=this.dashBoardData.selected_survey_name;
                  this.selected=this.message;
                  this.surveyList=this.dashBoardData.surveyList;
                  this.dataObjectService.setScope(this.surveyList);
                  sessionStorage.setItem('selected_loc_id', this.dashBoardData.locationId);

                  this.chageFromLast7days=this.dashBoardData.happiness_change_7days.toFixed(2);
                  //this.chageFromLast7days=this.chageFromLast7days.toFixed(2);

                  console.log(this.chageFromLast7days);
                  if(Number(this.dashBoardData.critical_issue_count)>0){
                    if(sessionStorage.getItem('is_super')!='true'){
                    var user_rights=JSON.parse(String(sessionStorage.getItem('user_rights')));
                    var user_right_json=JSON.parse(user_rights);
                    }
                    var isSuper=sessionStorage.getItem('is_super');
                
                    if(isSuper=='true' || user_right_json[13]){
                    this.showToaster(this.dashBoardData.critical_issue_count);
                    }
                  }

                  

                  console.log(this.positiveIndexAreaWise);

                  this.doughNutChartOptions={
                    legend:{
                      display:false
                  },
                  plugins: {
                    datalabels: {
                      display:false,
                    }
                  },
              responsive: true,
              maintainAspectRatio: false,
              
              };
                   for(var key in this.positiveIndexAreaWise){
                  //   this.areaList.push({"name":key,"value":this.positiveIndexAreaWise[key]});
                console.log('key: ' +   + ',  value: ' + this.positiveIndexAreaWise[key]);
                }
                this.loading=false;
                this.loading_linechart=false;

               // console.log(this.areaList);
                },
                error=>{
                  this.loading=false;
                this.loading_linechart=false;
                   console.log(error);
                   this.toastrService.error('Server Error','Please try again later', {
                    timeOut: 2000,
                    positionClass: 'toast-bottom-right',
                  });
                }

            );
  }

         selectOption(data) {
          //getted from event
          if(data!=0){
            if(this.toastrService.currentlyActive>0){
              this.toastrService.clear();
            }
          console.log("selected item"+ String(data));
          this.message=data;
          sessionStorage.setItem('survey_id', data);

          //this.dataService.changeMessage(data);
          this.getDashBoardData(data);
          this.getGraphData(data,this.identifier);
          this.getBestWorstHourOfTheDay(data);
          this.getBestWorstDayOfTheWeek(data);

          }
          //getted from binding
         // console.log(this.number)
        }


 getGraphData(surveyId,identifier) {

      let start_date=null,end_date=null,tablet_id=null;
        this.adminService.getGraphData(surveyId,tablet_id,identifier,start_date,end_date)
            .subscribe(
                data => {
                this.loadBarLineGraph(data.result);
                this.loading=false;
                this.loading_linechart=false;        
                },
                error => {
                    console.log(error);
                    this.loading=false;
                    this.loading_linechart=false;
                    this.toastrService.error('Server Error','Please try again later', {
                      timeOut: 2000,
                      positionClass: 'toast-bottom-right',
                    });
                    //this.alertService.error(error);
                });
    }


    loadDailyGraph(){
      this.month=false;
    console.log("daily");
    this.identifier="daily";
    this.loading_linechart=true;
      this.getGraphData(this.message,this.identifier);
    }

    loadMonthlyGraph(){
      this.month=true;
    console.log("getLast12MonthsRatingData");
    this.identifier="getLast12MonthsRatingData";
    this.loading_linechart=true;
      this.getGraphData(this.message,this.identifier);
    }


loadBarLineGraph(data){
  this.month_start=data.labelArray[0];
  this.month_end=data.labelArray[data.labelArray.length-1];
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
            backgroundColor: '#04bd51',
            fill: false,
            borderColor: "#00d45b",
            pointBorderColor: "#00d45b",
            pointBackgroundColor: "#00d45b",
            pointHoverBackgroundColor: "#00d45b",
            pointHoverBorderColor: "#00d45b",
            pointBorderWidth: 5,
            pointHoverRadius: 3,
            pointHoverBorderWidth: 1,
            pointRadius: 2,
            datalabels: {
              anchor: 'end',
              align: 'top',
              color:'#00008b',
              formatter: Math.round,
              font: {
                weight: 'bold',
              }
            }
            // lineTension:.6,            
        },
        {
            label:'Five Star Rating Percentage',
            data: dataPackFiveStarRatingPercentage,
            fill:false,
            backgroundColor:'#189150',
            hidden: true,
            type: 'bar',
        },
        {   label:'Four Star Rating Percentage',
            data: dataPackFourStarRatingPercentage,
            fill:false,
            backgroundColor:'#74B78C',
            hidden: true,
            type: 'bar',
        },
         {
            label:'Three Star Rating Percentage',
            data: dataPackThreeStarRatingPercentage,
            fill:false,
            backgroundColor:'#FECE8B',
            hidden: true,
            type: 'bar',
        },
        {
            label:'Two Star Rating Percentage',
            data: dataPackTwoStarRatingPercentage,
            fill:false,
            backgroundColor:'#FF847C',
            hidden: true,
            type: 'bar',
        },
         {
            label:'One Star Rating Percentage',
            data: dataPackOneStarRatingPercentage,
            fill:false,
            backgroundColor:'#E84A5F',
            hidden: true,
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
                    
    

    

    //this.lineChartLabels=data.labelArray;
}


    showToaster(critical_issue_count) {
      this.toastrService.error('Click here to view them','Critical Issues : '+critical_issue_count, {
          timeOut: 10000,
          positionClass: 'toast-bottom-right',
        })
        .onTap
        .pipe()
        .subscribe(() => this.toasterClickedHandler());
    }
     
    toasterClickedHandler() {
      console.log('Toastr clicked');
      // let headers: HttpHeaders = new HttpHeaders();
      //  headers = headers.append('Accept', 'application/x-www-form-urlencoded');
      //  headers = headers.append('x-api-key', '123456');
      //  console.log(headers);
      sessionStorage.setItem('is_critical','1');
      this.router.navigate(['home/work-place/responses']);
      
      // this.adminService.testCodeIgniterAuth(this.data)
      // .subscribe(
      //     data=>{
      //     console.log(data);    
         
      //     },
      //     error=>{
      //         console.log(error);
      //     }
      // );
    }

    ngOnDestroy() {
      this.toastrService.clear();
    }

    public captureScreen()  
      {  
        var data = document.getElementById('contentToConvert');  
        html2canvas(data).then(canvas => {  
          // Few necessary setting options  
          var imgWidth = 208;   
          var pageHeight = 295;    
          var imgHeight = canvas.height * imgWidth / canvas.width;  
          var heightLeft = imgHeight;  
      
          const contentDataURL = canvas.toDataURL('image/png',1.0)  
          let pdf = new jspdf('p', 'pt', [canvas.width, canvas.height]); // A4 size page of PDF  
          var position = 0;  
          console.log(canvas.width+"  "+canvas.height);
          pdf.addImage(contentDataURL, 'PNG', 0, position, canvas.width, canvas.height)  
          pdf.save('MYPdf.pdf'); // Generated PDF   
        });  
      }

      public getBestWorstHourOfTheDay(survey_id){
        var tablet_id=null;
        this.adminService.getBestWorstHourOfTheDay(survey_id,tablet_id)
        .subscribe(
            data=>{
                console.log(data);
                this.happy_hour=data.result.happy;
                this.sad_hour=data.result.sad;
                this.seven_week_start_date=data.result.start_date;
                this.seven_week_end_date=data.result.end_date;

                //this.surveyList=data.result;
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

        public getBestWorstDayOfTheWeek(survey_id){
          var tablet_id=null;
          this.adminService.getBestWorstDayOfTheWeek(survey_id, tablet_id)
          .subscribe(
              data=>{
                  console.log(data);
                  this.happy_day=data.result.happy;
                  this.sad_day=data.result.sad;
                
  
                  // this.surveyList=data.result;
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


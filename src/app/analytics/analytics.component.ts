import { Component, OnInit } from '@angular/core';
import { Color, Label } from 'ng2-charts';
import {DatePipe} from '@angular/common';
import { ChartType, ChartOptions,ChartDataSets } from 'chart.js';
import { SingleDataSet, monkeyPatchChartJsLegend, monkeyPatchChartJsTooltip } from 'ng2-charts';
import { AdminService } from '../admin.service';
import * as moment from 'moment';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit {
callReportsData;
data:any;
locationList;
surveyList;
areaList;
selectedLocId:number=0;
selectedSurveyId:number=0;
objectKeysForSurvey = Object.keys;
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
positiveIndex;
negativeIndex;
callSurveyListForLocation;
startDate;
endDate;
selectedAreaId="";
anaData:any;
selectedArea;

public lineChartData: ChartDataSets[] = [
    { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
  ];
  public lineChartLabels: Label[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  public lineChartOptions : any= {
    legend:{display: false},
    responsive: true,
    maintainAspectRatio : false,
  }
  public lineChartColors: Color[] = [
    {
      borderColor: 'black',
      backgroundColor: 'rgba(255,0,0,0.3)',
    },
  ];
  public lineChartLegend = true;
  public lineChartType = 'line';
  public lineChartPlugins = [];

  //for Date range
  selected: any;
  alwaysShowCalendars: boolean;
  showRangeLabelOnInput: boolean;
  keepCalendarOpeningWithRange: boolean;
 /*  maxDate: moment.Moment;
  minDate: moment.Moment; */
  invalidDates: moment.Moment[] = [moment().add(2, 'days'), moment().add(3, 'days'), moment().add(5, 'days')];
  ranges: any = {
    Today: [moment(), moment()],
    Yesterday: [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
    'This Month': [moment().startOf('month'), moment().endOf('month')],
    'Last Month': [
      moment()
        .subtract(1, 'month')
        .startOf('month'),
      moment()
        .subtract(1, 'month')
        .endOf('month')
    ]
  };

  isInvalidDate = (m: moment.Moment) =>  {
    return this.invalidDates.some(d => d.isSame(m, 'day') )
  }

//PieChart
public pieChartOptions: any = {
    responsive: true,
    backgroundColor: ['#189150', '#74B78C', '#FECE8B', '#FF847C', '#E84A5F']
  }

  //  backgroundColor: ['#189150', '#74B78C', '#FECE8B', '#FF847C', '#E84A5F'],

  public pieChartLabels: Label[] = [['Download', 'Sales'], ['In', 'Store', 'Sales'], 'Mail Sales'];
  public pieChartData: SingleDataSet = [300, 500, 100];
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = false;
  public pieChartPlugins = [];
  public doughnutColors=[
    {
      backgroundColor: [
        '#189150', '#74B78C', '#FECE8B', '#FF847C', '#E84A5F'
    ]
    }
  ];;


    gaugeType = "full";
    gaugePositiveValue;
    gaugeNeutralValue;
    gaugeNegativeValue;

    guageThickness="5";
    guageSize="170"

   public barChartOptions: ChartOptions = {
     };


       public barChartLabels: Label[] ;
        public barChartType: ChartType = 'horizontalBar';
        public barChartTypeTotalResponses: ChartType = 'bar';
       public barChartTypeOptions: (ChartOptions & { annotation: any });
        public barChartLegend = false;
        public barChartPlugins = [];

  public barChartData: ChartDataSets[] = [
    { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
    { data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B' }
  ];

  public barChartSatisfactionData: ChartDataSets[] = [
    { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
    { data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B' }
  ];

  public barChartSatisfactionLabels: Label[] ;


  public barChartSatisfactionOptions: (ChartOptions);


   public barChartNeutralData: ChartDataSets[] = [
    { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
    { data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B' }
  ];

  public barChartNeutralLabels: Label[] ;


  public barChartNeutralOptions: (ChartOptions);



  public barChartPainData: ChartDataSets[] = [
    { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
    { data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B' }
  ];

  public barChartPainLabels: Label[] ;


  public barChartPainOptions: (ChartOptions);


  public barChartAllCombData: ChartDataSets[] = [
    { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
    { data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B' }
  ];

  public barChartAllCombLabels: Label[] ;


  public barChartAllCombOptions: (ChartOptions);


  public barChartAreaData: ChartDataSets[] = [
    { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
    { data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B' }
  ];

  public barChartAreaLabels: Label[] ;


  public barChartAreaOptions: (ChartOptions);



  


  constructor(private adminService: AdminService) { 
  monkeyPatchChartJsTooltip();
    monkeyPatchChartJsLegend();
   /*  this.maxDate = moment().add(2,  'weeks');
    this.minDate = moment().subtract(3, 'days'); */

    this.alwaysShowCalendars = false;
    this.keepCalendarOpeningWithRange = true;
    this.showRangeLabelOnInput = false;
    this.selected = {startDate: moment().subtract(29, 'days'), endDate: moment()};
  }

  ngOnInit() {
                console.log(sessionStorage.getItem("location_id"));
                console.log(sessionStorage.getItem("survey_id"));
                this.selectedLocId=Number(sessionStorage.getItem("location_id"));
                this.selectedSurveyId=Number(sessionStorage.getItem("survey_id"));

                var datePipe = new DatePipe('en-US');     
                this.startDate= datePipe.transform(moment().subtract(29,'days'), 'yyyy-MM-dd');
                this.endDate= datePipe.transform(moment(), 'yyyy-MM-dd');

                console.log(this.startDate+" "+this.endDate);
                this.getReports();


  }

  getReports(){
  console.log("in report");
  this.callReportsData=this.adminService.getReportData(this.selectedLocId,this.selectedSurveyId,this.startDate,this.endDate,"last_month",this.data,this.selectedAreaId,this.data)
            .subscribe(
                data=>{

                  this.anaData=data;
                console.log(this.anaData);

                 this.locationList=this.anaData.locationList;
               /*  this.selectedLocId=Number(sessionStorage.getItem("location_id"));
                this.selectedSurveyId=Number(sessionStorage.getItem("survey_id")); */
                this.surveyList=this.anaData.surveyList;
                this.areaList=this.anaData.areaList;
                this.loadBarLineChartGraph(this.anaData.firstChartData);
                this.loadPieChartGraph(this.anaData);
                this.loadAreaWiseHorizontalBarChart(this.anaData.ratingBasedOnArea);

               for(var key in this.anaData.ratingBasedOnOptions)
                    {
                        if(key === 'location_wise_data_full')
                        {
                        console.log("in location wise");
                        //console.log(response[key]);
                          this.loadBarDataChart('horizontal_bar_chart_all_optionList', this.anaData.ratingBasedOnOptions[key]);
                        }
                        else if(key === 'pain_points'){
                        console.log("in location wise");

                           this.loadBarDataChart('horizontal_bar_chart_pain', this.anaData.ratingBasedOnOptions[key]);
                           // console.log(response[key]);
                        }
                        else if(key === 'neutral_points'){
                        console.log("in location wise");

                           this.loadBarDataChart('horizontal_bar_chart_neutral', this.anaData.ratingBasedOnOptions[key]);
                        //    console.log(response[key]);
                        }
                        else if(key === 'satisfactory_points'){
                        console.log("in location wise");

                            this.loadBarDataChart('horizontal_bar_chart_satisfaction', this.anaData.ratingBasedOnOptions[key]);
                          //  console.log(response[key]);
                        }

                        //console.log(response[key]);
                    }

              
                },
                error=>{
                    console.log(error);
                }

            );
  }



   selectLocationOption(data) {
          //getted from event
          console.log("selected item"+data);
          this.selectedLocId=data;
          sessionStorage.setItem('location_id', data);
          this.getSurveyListForLocation(data);
          this.selectedSurveyId=null;
          this.selectedAreaId="";

          this.clearAllData();
          
          //this.dataService.changeMessage(data);
        /*   this.getSurv(data);
          this.getGraphData(data,this.identifier); */

        }




loadBarLineChartGraph(data){
    var dataPack=[], dataPackOneStarRatingPercentage=[], dataPackTwoStarRatingPercentage=[],
                   dataPackThreeStarRatingPercentage=[], dataPackFourStarRatingPercentage=[], 
                   dataPackFiveStarRatingPercentage=[]; 
                   var ratingData = data.stackedBarDataArray;
                 

                for(let key of ratingData){
                let count =1; var total=0;
                 var OneStarRating=0, TwoStarRating =0, 
                ThreeStarRating=0, FourStarRating=0, FiveStarRating=0;


                for(let val of this.objectKeysForSurvey(key)){
                  //console.log("key : "+val+"  Data"+key[val]);

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
                 
                   this.barChartData=[  {
           label: 'Happy Index',
            data: dataPack,
            /*borderColor: "#660000",
            backgroundColor: "#000"
            ,
            backgroundColor: "#000",
            pointBackgroundColor: "#000",
            pointBorderColor: "#000",
            pointHoverBackgroundColor: "#000",
            pointHoverBorderColor: "#000",
            hoverBorderWidth: 1,
            borderWidth:1,*/
           /* 
            pointBorderColor: "#000",
            pointHoverBackgroundColor: "#000",
            pointHoverBorderColor: "#000",*/
            pointBorderWidth: 5,
            pointBackgroundColor: "#000",
            pointHoverRadius: 1,
            pointHoverBorderWidth: 1,
            pointRadius: 1,
            fill: false,
            borderWidth: 1,
            type:'line',
            showLine: true,
        },
        {

             label: 'Poor',
            data: dataPackOneStarRatingPercentage,
            backgroundColor: "#E84A5F",
          //  hoverBackgroundColor: "#7E57C2",
            hoverBorderWidth: 0
        },
        {      

              label: 'Bad',
            data: dataPackTwoStarRatingPercentage,
            backgroundColor: "#FF847C",
           // hoverBackgroundColor: "#FFCA28",
            hoverBorderWidth: 0
        },
         {
           
               label: 'Average',
            data: dataPackThreeStarRatingPercentage,
            backgroundColor: "#FECE8B",
           // hoverBackgroundColor: "#EF5350",
            hoverBorderWidth: 0
        },
        {

          label: 'Good',
            data: dataPackFourStarRatingPercentage,
            backgroundColor: "#74B78C",
           // hoverBackgroundColor: "#EF5350",
            hoverBorderWidth: 0
        },
         {
            label: 'Excellent',
            data: dataPackFiveStarRatingPercentage,
            backgroundColor: "#189150",
           // hoverBackgroundColor: "#EF5350",
            hoverBorderWidth: 0
}
];

        this.barChartOptions={
        legend: {display: false},
  maintainAspectRatio: false,
  /* cornerRadius: 10, 
  fullCornerRadius: false, 
  stackedRounded: false, */
  tooltips: {
            mode: 'index',
            intersect: false,
        },
    elements: {
    point: {
     // radius: 25,
     // hoverRadius: 35,
      pointStyle: 'rectRounded',

 

    }
  },
  scales: {
    yAxes: [{
      ticks: {
        beginAtZero: true,
        max:100
      },
      gridLines: { display: false },
      stacked: true,
    }],
    xAxes: [{
      ticks: {
        beginAtZero: true
      },
      stacked: true,
      gridLines: { display: false },
    }],
  }
    };

 this.barChartLabels=data.label_array;
    }



    loadPieChartGraph(data){

                  this.fiveStarPer=data.fiveStarRatingPercentage;
                  this.fourStarPer=data.fourStarRatingPercentage;
                  this.threeStarPer=data.threeStarRatingPercentage;
                  this.twoStarPer=data.twoStarRatingPercentage;
                  this.oneStarPer=data.oneStarRatingPercentage;
                  
                  this.fiveStarValue=data.fiveStarRating;
                  this.fourStarValue=data.fourStarRating;
                  this.threeStarValue=data.threeStarRating;
                  this.twoStarValue=data.twoStarRating;
                  this.oneStarValue=data.oneStarRating;


                 this.positiveIndex=data.fiveStarRatingPercentage+data.fourStarRatingPercentage;
                  this.gaugePositiveValue=this.positiveIndex;
                  this.gaugeNeutralValue=data.threeStarRatingPercentage;
                 this.negativeIndex=data.oneStarRatingPercentage+data.twoStarRatingPercentage;
                //  this.gaugeNegativeValue=Math.ceil(this.negativeIndex);
                this.gaugeNegativeValue=this.negativeIndex;

                  this.pieChartLabels=["5 Star", "4 Star", "3 Star", "2 Star", "1 Star"];

                      console.log(this.fiveStarPer);
                  this.pieChartData=[this.fiveStarPer,this.fourStarPer,this.threeStarPer, 
             this.twoStarPer, 
             this.oneStarPer];


    }


    loadBarDataChart(chart_id,data){


            console.log("in bar data chart "+chart_id+"  "+data);
            var label_array = [];
            var ratingData = data;
            var dataPack1=[], dataPack2=[], dataPack3=[], dataPack4=[], dataPack5=[];
 
            var countOfLabel=1;
 
            if(chart_id === 'horizontal_bar_chart_neutral')
            {
                console.log('ratingdata');
                console.log(ratingData);
               // ratingData = ratingData.sort(comparator)
                console.log('ratingdataSorted');
                console.log(ratingData);
            }
 
        var count =1;
        for (var key in ratingData) {
              for(var val in ratingData[key])
              {  
       // generate label array  
        if(countOfLabel===1) label_array.push(val);
        // generate data for the graph
        if(chart_id === 'horizontal_bar_chart_neutral')
        {
            dataPack3.push(ratingData[key][val]);
        }
        else if(chart_id === 'horizontal_bar_chart_pain')
        {
            //console.log('count '+$count+' Data '+ratingData[key][val])
            if(count ===1) dataPack1.push(ratingData[key][val]);
            
            else if(count ===2) dataPack2.push(ratingData[key][val]);
        }
        else if(chart_id === 'horizontal_bar_chart_satisfaction')
        {
            if(count ===1) dataPack4.push(ratingData[key][val]);
            
            else if(count ===2) dataPack5.push(ratingData[key][val]);
        }
        else if(chart_id==='horizontal_bar_chart_all_optionList')
        {

        console.log("inside horizontal bar chart all options");
            // generate label array  
            //if(count===1) label_array.push(val);
 
            // generate data for the graph
            if(count===1) dataPack1.push(ratingData[key][val]);
            if(count===2) dataPack2.push(ratingData[key][val]);
            if(count===3) dataPack3.push(ratingData[key][val]);
            if(count===4) dataPack4.push(ratingData[key][val]);
            if(count===5) dataPack5.push(ratingData[key][val]);
        }
    }
    count++;
 
   if(chart_id === 'horizontal_bar_chart_neutral')
    {
        for(var i =0; i<dataPack3.length; i++)
        {
            dataPack1.push("0");
            dataPack2.push("0");
            dataPack4.push("0");
            dataPack5.push("0");
        }
    }
    else if( chart_id === 'horizontal_bar_chart_pain')
    {
        for(var i =0; i<dataPack1.length; i++)
        {
            dataPack3.push("0");
            dataPack4.push("0");
            dataPack5.push("0");
        }
    }
    else if( chart_id === 'horizontal_bar_chart_satisfaction')
    {
        dataPack1.push("0");
        dataPack2.push("0");
        dataPack3.push("0");
    }
    countOfLabel++;
}
 

console.log("dataPack5 "+dataPack5);
console.log("dataPack4 "+dataPack4);
console.log("dataPack3 "+dataPack3);
console.log("dataPack2 "+dataPack2);
console.log("dataPack1 "+dataPack1);



 if( chart_id === 'horizontal_bar_chart_satisfaction'){
 
  this.barChartSatisfactionOptions=
  {scales: {
      xAxes: [{
          ticks: {
              beginAtZero:true,
              callback: function (value) { if (Number.isInteger(value)) { return value; } },
          },
          stacked: true,
          barPercentage: 0.5
      }],
      yAxes: [{
          stacked: true,
         // barPercentage: 0.2
      }]
  },
  legend:{
      display:false
  },
  responsive: true,
  maintainAspectRatio:true
}


console.log(label_array);
this.barChartSatisfactionLabels=label_array;
this.barChartSatisfactionData= [{
  label: 'Poor',
  data: dataPack1,
  backgroundColor: "#E84A5F"
},
{
  label: 'Bad',
  data: dataPack2,
  backgroundColor: "#FF847C"
},
{
  label: 'Average',
  data: dataPack3,
  backgroundColor: "#FECE8B"
},
{
  label: 'Excellent',
  data: dataPack5,
  backgroundColor: "#189150"
},
{
  label: 'Good',
  data: dataPack4,
  backgroundColor: "#74B78C"
},
]
 }

 else if( chart_id === 'horizontal_bar_chart_neutral'){
 
  this.barChartNeutralOptions={scales: {
      xAxes: [{
          ticks: {
              beginAtZero:true,
              callback: function (value) { if (Number.isInteger(value)) { return value; } },
          },
          stacked: true,
          barPercentage: 0.5
      }],
      yAxes: [{
          stacked: true,
         // barPercentage: 0.2
      }]
  },
  legend:{
      display:false
  },
  responsive: true,
  maintainAspectRatio:true
}


console.log(label_array);
this.barChartNeutralLabels=label_array;
this.barChartNeutralData= [{
  label: 'Poor',
  data: dataPack1,
  backgroundColor: "#E84A5F"
},
{
  label: 'Bad',
  data: dataPack2,
  backgroundColor: "#FF847C"
},
{
  label: 'Average',
  data: dataPack3,
  backgroundColor: "#FECE8B"
},
{
  label: 'Excellent',
  data: dataPack5,
  backgroundColor: "#189150"
},
{
  label: 'Good',
  data: dataPack4,
  backgroundColor: "#74B78C"
},
]
 }

 else if( chart_id === 'horizontal_bar_chart_pain'){
 
  this.barChartPainOptions={scales: {
      xAxes: [{
          ticks: {
              beginAtZero:true,
              callback: function (value) { if (Number.isInteger(value)) { return value; } },
          },
          stacked: true,
          barPercentage: 0.5
      }],
      yAxes: [{
          stacked: true,
         // barPercentage: 0.2
      }]
  },
  legend:{
      display:false
  },
  responsive: true,
  maintainAspectRatio:true
}


console.log(label_array);
this.barChartPainLabels=label_array;
this.barChartPainData= [{
  label: 'Poor',
  data: dataPack1,
  backgroundColor: "#E84A5F"
},
{
  label: 'Bad',
  data: dataPack2,
  backgroundColor: "#FF847C"
},
{
  label: 'Average',
  data: dataPack3,
  backgroundColor: "#FECE8B"
},
{
  label: 'Excellent',
  data: dataPack5,
  backgroundColor: "#189150"
},
{
  label: 'Good',
  data: dataPack4,
  backgroundColor: "#74B78C"
},
]
 }
 else if( chart_id === 'horizontal_bar_chart_all_optionList'){
 
  this.barChartAllCombOptions={scales: {
      xAxes: [{
          ticks: {
              beginAtZero:true,
              callback: function (value) { if (Number.isInteger(value)) { return value; } },
          },
          stacked: true,
          barPercentage: 0.5
      }],
      yAxes: [{
          stacked: true,
         // barPercentage: 0.2
      }]
  },
  legend:{
      display:false
  },
  responsive: true,
  maintainAspectRatio:true
}


console.log(label_array);
this.barChartAllCombLabels=label_array;
this.barChartAllCombData= [{
  label: 'Poor',
  data: dataPack1,
  backgroundColor: "#E84A5F"
},
{
  label: 'Bad',
  data: dataPack2,
  backgroundColor: "#FF847C"
},
{
  label: 'Average',
  data: dataPack3,
  backgroundColor: "#FECE8B"
},
{
  label: 'Excellent',
  data: dataPack5,
  backgroundColor: "#189150"
},
{
  label: 'Good',
  data: dataPack4,
  backgroundColor: "#74B78C"
},
]
 }
 
  
 
// var chart_identifier;
 
// if (horizontalBarChart_allOptionList != undefined)
// {
//     horizontalBarChart_allOptionList.destroy();
// }
 
// if(horizontalBarChart_satisfaction !=undefined)
// {
//     horizontalBarChart_satisfaction.destroy();
// }
 
// if(horizontalBarChart_pain !=undefined){
//     horizontalBarChart_pain.destroy();
// }
 
// if(horizontalBarChart_neutral !=undefined)
// {
//     horizontalBarChart_neutral.destroy();
// }
 
// if(chart_id === 'horizontal_bar_chart_all_optionList')
// {
//     chart_identifier = horizontalBarChart_allOptionList;
// }
// else if(chart_id === 'horizontal_bar_chart_satisfaction')
// {
//     chart_identifier = horizontalBarChart_satisfaction;
// }
// else if(chart_id === 'horizontal_bar_chart_pain')
// {
//     chart_identifier = horizontalBarChart_pain;
// }
// else if(chart_id === 'horizontal_bar_chart_neutral')
// {
//     chart_identifier = horizontalBarChart_neutral;
// }
 

    }

    getSurveyListForLocation(locId){
      this.callSurveyListForLocation=this.adminService.getSurveyListForLocation(locId,this.data)
      .subscribe(
          data=>{
              console.log(data);
              this.surveyList=data;
          },
          error=>{
              console.log(error);
          }

      );
    }


    selectSurveyOption(data){
      console.log("selected survey "+data);
      this.selectedSurveyId=data;
      this.selectedAreaId="";
      sessionStorage.setItem("survey_id",data);
      this.getReports();
    }


    rangeClicked(range) {
      console.log('[rangeClicked] range is : ', range);
    }
    datesUpdated(range) {
      var datePipe = new DatePipe('en-US');
      this.startDate = datePipe.transform(range.startDate._d, 'yyyy-MM-dd');
      this.endDate = datePipe.transform(range.endDate._d, 'yyyy-MM-dd');

      if(this.selectedSurveyId!=null){
        this.getReports();
      }else{
        alert("Select a survey Id First");
      }
      console.log('[datesUpdated] range is : ',  range.startDate._d +"   "+this.startDate+"   "+this.endDate);
    }

    clearAllData(){
      
    }

    selectAreaOption(data){
      console.log(data);
        for(var dataselected in data){
          this.selectedAreaId=dataselected;
          console.log(this.selectedAreaId);
        }

        this.getReports();

    }


    loadAreaWiseHorizontalBarChart(data){
 
      var label_array = [];
      var ratingData = data;
      var dataPack1=[], dataPack2=[], dataPack3=[], dataPack4=[], dataPack5=[];
       
      let count =1;
      for(var key in ratingData)
      {
          for(var val in ratingData[key])
          {
              label_array.push(val);
       
              dataPack1.push([ratingData[key][val].rating1]);
              dataPack2.push([ratingData[key][val].rating2]);
              dataPack3.push([ratingData[key][val].rating3]);
              dataPack4.push([ratingData[key][val].rating4]);
              dataPack5.push([ratingData[key][val].rating5]);
              
          }
          count++;
       
         // break;
      }
       
      console.log("Area wise graph 1 "+dataPack1);
      console.log("Area wise graph 2 "+dataPack2);
      console.log("Area wise graph 3 "+dataPack3);
      console.log("Area wise graph 4 "+dataPack4);
      console.log("Area wise graph 5 "+dataPack5);
       

      this.barChartAreaOptions={ 
        scales: {
          xAxes: [{
              ticks: {
                  beginAtZero:true,
                  callback: function (value) { if (Number.isInteger(value)) { return value; } },
              },
              stacked: true,
              barPercentage: 0.5
          }],
          yAxes: [{
              stacked: true,
             // barPercentage: 0.2
          }]
      },
      legend:{
          display:false
      },
      responsive: true,
      maintainAspectRatio: false,
      }
  
  
  console.log("Horizontal area wise label"+label_array);
  this.barChartAreaLabels=label_array;
  this.barChartAreaData=[{
    label: 'Poor',
    data: dataPack1,
    backgroundColor: "#E84A5F"
},{
    label: 'Bad',
    data: dataPack2,
    backgroundColor: "#FF847C"
},{
    label: 'Average',
    data: dataPack3,
    backgroundColor: "#FECE8B"
},
{
    label: 'Good',
    data: dataPack4,
    backgroundColor: "#74B78C"
},
{
    label: 'Excellent',
    data: dataPack5,
    backgroundColor: "#189150"
}]

      }


      
      
}

import { Component, OnInit } from '@angular/core';
import { Color, Label } from 'ng2-charts';
import {DatePipe} from '@angular/common';
import { ChartType, ChartOptions,ChartDataSets } from 'chart.js';
import { SingleDataSet, monkeyPatchChartJsLegend, monkeyPatchChartJsTooltip } from 'ng2-charts';
import { AdminService } from '../admin.service';
import * as moment from 'moment';
import html2canvas from 'html2canvas';  
import * as jspdf from 'jspdf';  
import { ToastrService } from 'ngx-toastr';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { NONE_TYPE } from '@angular/compiler/src/output/output_ast';

// import * as CanvasJS from 'src/assets/js/canvasjs.min';


const data = {
  chart: {
    caption: "Android Distribution for our app",
    subcaption: "For all users in 2017",
    showpercentvalues: "1",
    defaultcenterlabel: "Android Distribution",
    aligncaptionwithcanvas: "0",
    captionpadding: "0",
    decimals: "1",
    plottooltext:
      "<b>$percentValue</b> of our Android users are on <b>$label</b>",
    centerlabel: "# Users: $value",
    theme: "fusion"
  },
  data: [
    {
      label: "Ice Cream Sandwich",
      value: "1000"
    },
    {
      label: "Jelly Bean",
      value: "5300"
    },
    {
      label: "Kitkat",
      value: "10500"
    },
    {
      label: "Lollipop",
      value: "18900"
    },
    {
      label: "Marshmallow",
      value: "17904"
    }
  ]
};
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
selectedLocId="0";
selectedSurveyId="0";
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
selectedAreaId="0";
anaData:any;
selectedArea="0";
loading=true;
responses;
totalRating;

cnt = 0;
cnt2 = 0;
setInterval = setInterval;
public scale = 0.4;
public repeatHeaders = true;
public lineChartData: ChartDataSets[] = [
  ];
  public lineChartLabels: Label[] = [];
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

  public pieChartLabels: Label[] = [];
  public pieChartData: SingleDataSet = [];
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = false;
  public pieChartPlugins = [];
  public doughnutColors=[
    {
      backgroundColor: [
        '#189150', '#74B78C', '#FECE8B', '#FF847C', '#E84A5F'
    ]
    }
  ];


    gaugeType = "full";
    gaugePositiveValue;
    gaugeNeutralValue;
    gaugeNegativeValue;

    guageThickness="13";
    guageSize="180";
    excellentColor='#189150';
    neutralColor='#FECE8B';
    negativeColor='#E84A5F';


   public barChartOptions: ChartOptions = {
     };


       public barChartLabels: Label[] ;
        public barChartType: ChartType = 'horizontalBar';
        public barChartTypeTotalResponses: ChartType = 'bar';
       public barChartTypeOptions: (ChartOptions & { annotation: any });
        public barChartLegend = true;
        public barChartPlugins = [pluginDataLabels];

  public barChartData: ChartDataSets[] = [
    // { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
    // { data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B' }
  ];

  public barChartSatisfactionData: ChartDataSets[] = [
    // { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
    // { data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B' }
  ];

  public barChartSatisfactionLabels: Label[] ;


  public barChartSatisfactionOptions: (ChartOptions);


   public barChartNeutralData: ChartDataSets[] = [
    // { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
    // { data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B' }
  ];

  public barChartNeutralLabels: Label[] ;


  public barChartNeutralOptions: (ChartOptions);



  public barChartPainData: ChartDataSets[] = [
    // { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
    // { data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B' }
  ];

  public barChartPainLabels: Label[] ;


  public barChartPainOptions: (ChartOptions);


  public barChartAllCombData: ChartDataSets[] = [
    // { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
    // { data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B' }
  ];

  public barChartAllCombLabels: Label[] ;


  public barChartAllCombOptions: (ChartOptions);


  public barChartAreaData: ChartDataSets[] = [
    // { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
    // { data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B' }
  ];

  public barChartAreaLabels: Label[] ;


  public barChartAreaOptions: (ChartOptions);


  //fusion chart testing data

  width = 600;
  height = 400;
  type = "doughnut2d";
  dataFormat = "json";
  dataSource = data;
  pdf_down:Boolean=false;


  


  constructor(private adminService: AdminService,private toastrService:ToastrService) { 
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
//                this.selectedLocId=Number(sessionStorage.getItem("location_id"));
                this.selectedSurveyId=sessionStorage.getItem("survey_id");

                var datePipe = new DatePipe('en-US');     
                this.startDate= datePipe.transform(moment().subtract(29,'days'), 'yyyy-MM-dd');
                this.endDate= datePipe.transform(moment(), 'yyyy-MM-dd');

                console.log(this.startDate+" "+this.endDate);
                this.getReports();
                sessionStorage.setItem('task_resp_id','');  
                sessionStorage.setItem('noti_resp_id','');

                // setTimeout(this.opensnack, 10000, "my text");
                // this.setIntrvl();
               

  }

  getReports(){
  console.log("in report");
  this.callReportsData=this.adminService.getReportData(this.selectedLocId,sessionStorage.getItem('location_id'),this.selectedSurveyId,this.startDate,this.endDate,"last_month",this.data,this.selectedAreaId,this.data)
            .subscribe(
                data=>{

                  console.log(data);

                  this.anaData=data.result;
                console.log(JSON.stringify(this.anaData));

                 this.locationList=this.anaData.locationList;
                // this.selectedLocId=Number(sessionStorage.getItem("selected_loc_id"));
               /* this.selectedSurveyId=Number(sessionStorage.getItem("survey_id")); */
                this.surveyList=this.anaData.surveyList;
                this.areaList=this.anaData.areaList;
                this.loadBarLineChartGraph(this.anaData.firstChartData);
                this.loadPieChartGraph(this.anaData);
                this.loadAreaWiseHorizontalBarChart(this.anaData.ratingBasedOnArea);
                this.selectedLocId=this.anaData.location_id;
                this.responses=this.anaData.responses;


                if(this.anaData.ratingBasedOnOptions){
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
                  }else{
                    this.loadBarDataChart('horizontal_bar_chart_all_optionList', null);
                    this.loadBarDataChart('horizontal_bar_chart_pain', null);
                    this.loadBarDataChart('horizontal_bar_chart_neutral', null);
                    this.loadBarDataChart('horizontal_bar_chart_satisfaction', null);
                  }


                      

                    this.loading=false;
              
                },
                error=>{
                    console.log(error);
                    this.toastrService.error('Server Error','Please try again later', {
                      timeOut: 2000,
                      positionClass: 'toast-bottom-right',
                    });
                    this.loading=false;

                }

            );
  }



   selectLocationOption(data) {
          //getted from event
          console.log("selected item"+data);
          this.selectedLocId=data;
          //sessionStorage.setItem('location_id', data);
          this.getSurveyListForLocation(data);
          this.selectedSurveyId=null;
          this.selectedAreaId="0";
          this.getReports();
          

          this.clearAllData();
          
          //this.dataService.changeMessage(data);
        /*   this.getSurv(data);
          this.getGraphData(data,this.identifier); */

        }




loadBarLineChartGraph(data){
    var dataPack=[], dataPackOneStarRatingPercentage=[], dataPackTwoStarRatingPercentage=[],
                   dataPackThreeStarRatingPercentage=[], dataPackFourStarRatingPercentage=[], 
                   dataPackFiveStarRatingPercentage=[]; 
                   if(data){
                   var ratingData = data.stackedBarDataArray;
                   }else{
                     var ratingData=null;
                   }
                 

                   if(ratingData){                   
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


        // dataPackOneStarRatingPercentage.push(((OneStarRating/total)*100).toFixed(2));
        // dataPackTwoStarRatingPercentage.push(((TwoStarRating/total)*100).toFixed(2));
        // dataPackThreeStarRatingPercentage.push(((ThreeStarRating/total)*100).toFixed(2));
        // dataPackFourStarRatingPercentage.push(((FourStarRating/total)*100).toFixed(2));
        // dataPackFiveStarRatingPercentage.push(((FiveStarRating/total)*100).toFixed(2));
        // var avg = (((FourStarRating+FiveStarRating)/total)*100);
        // avg = Number(avg.toFixed(2));
        dataPackOneStarRatingPercentage.push(((OneStarRating)).toFixed(2));
        dataPackTwoStarRatingPercentage.push(((TwoStarRating)).toFixed(2));
        dataPackThreeStarRatingPercentage.push(((ThreeStarRating)).toFixed(2));
        dataPackFourStarRatingPercentage.push(((FourStarRating)).toFixed(2));
        dataPackFiveStarRatingPercentage.push(((FiveStarRating)).toFixed(2));
         var avg = (((FourStarRating+FiveStarRating)/total)*100);
        //var avg = (((FourStarRating+FiveStarRating)));
        avg = Number(avg.toFixed(2));
        this.loading=false;

        //  var avg = ((FourStarRating+FiveStarRating)/total)*100;
        // avg = Number(avg.toFixed(2));
         dataPack.push(avg);
                }
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
            yAxisID: 'B',
            pointBackgroundColor: "#439ade",
            backgroundColor: "#439ade", 
            pointBorderColor: "#0078d4",
            borderColor: "#439ade",
            pointHoverRadius: 1,
            pointHoverBorderWidth: 1,
            pointRadius: 1,
            fill: false,
            type:'line',
            showLine: true,
            spanGaps: false,
            datalabels: {
              anchor: 'end',
              align: 'top',
              color:'#00008b',
              formatter: Math.round,
              font: {
                weight: 'bold',
              }
            }
        },
        {

             label: 'Poor',
            data: dataPackOneStarRatingPercentage,
            backgroundColor: "#E84A5F",
           hoverBackgroundColor: "#E84A5F",
            hoverBorderWidth: 0,
            datalabels: {
              display:false,
            }
        },
        {      

              label: 'Bad',
            data: dataPackTwoStarRatingPercentage,
            backgroundColor: "#FF847C",
            hoverBackgroundColor: "#FF847C",
            hoverBorderWidth: 0,
            datalabels: {
              display:false,
            }
        },
         {
           
               label: 'Average',
            data: dataPackThreeStarRatingPercentage,
            backgroundColor: "#FECE8B",
            hoverBackgroundColor: "#FECE8B",
            hoverBorderWidth: 0,
            datalabels: {
              display:false,
            }
        },
        {

          label: 'Good',
            data: dataPackFourStarRatingPercentage,
            backgroundColor: "#74B78C",
            hoverBackgroundColor: "#74B78C",
            hoverBorderWidth: 0,
            datalabels: {
              display:false,
            }
        },
         {
            label: 'Excellent',
            data: dataPackFiveStarRatingPercentage,
            backgroundColor: "#189150",
            hoverBackgroundColor: "#189150",
            hoverBorderWidth: 0,
            datalabels: {
              display:false,
            }
}
];

        this.barChartOptions={
        legend: {display: true},
        responsive: true,
        maintainAspectRatio:false,
        
      //   "hover": {
      //     "animationDuration": 0
      // },
      //   "animation": {
      //     "duration": 1,
      //     "onComplete": function () {
      //         var chartInstance = this.chart,
      //         ctx = chartInstance.ctx;

      //         //ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, Chart.defaults.global.defaultFontStyle, Chart.defaults.global.defaultFontFamily);
      //         ctx.textAlign = 'center';
      //         ctx.textBaseline = 'bottom';

      //         this.data.datasets.forEach(function (dataset, i) {
      //             var meta = chartInstance.controller.getDatasetMeta(i);
      //             meta.data.forEach(function (bar, index) {
      //                 var data = dataset.data[index];                            
      //                 ctx.fillText(data, bar._model.x, bar._model.y - 5);
      //             });
      //         });
      //     }
      // },
    
  /* cornerRadius: 10, 
  fullCornerRadius: false, 
  stackedRounded: false, */
  tooltips: {
            mode: 'index',
            intersect: false,
          //   callbacks: {
          //     label: function(tooltipItem) {
          //         return "$" + Number(tooltipItem.yLabel) + " and so worth it !";
          //     }
          // }
        },
    elements: {
    point: {
     // radius: 25,
     // hoverRadius: 35,
      pointStyle: 'rectRounded',
    }
  },
  
//   title: {
//     display: true,
//     text: 'Total Responses',
//     position: 'bottom'
// },
  // plugins: {
  //   datalabels: {
  //     anchor: 'end',
  //     align: 'top',
  //     formatter: Math.round,
  //     font: {
  //       weight: 'bold'
  //     }
  //   }
  // },
  scales: {
    yAxes: [{
      ticks: {
        beginAtZero: true,
      },
      gridLines: { display: false },
      stacked: true,

    },
    {
      id: 'B',
      type: 'linear',
      position: 'right',
      ticks: {
       max: 100,
        min: 0
      },
      gridLines: { display: false },
      stacked: true,
    }
  ],
    xAxes: [{
      ticks: {
        beginAtZero: true
      },
      stacked: true,
      gridLines: { display: false },
    }],
    
  }
    };

    if(data){
 this.barChartLabels=data.label_array;
    }else{
 this.barChartLabels=null;
    }



    }



    loadPieChartGraph(data){

                  this.fiveStarPer=data.fiveStarRatingPercentage;
                  this.fourStarPer=data.fourStarRatingPercentage;
                  this.threeStarPer=data.threeStarRatingPercentage;
                  this.twoStarPer=data.twoStarRatingPercentage;
                  this.oneStarPer=data.oneStarRatingPercentage;
                  this.totalRating=data.totalRating;
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
             this.loading=false;


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
          barPercentage: 0.5,
          // barThickness:20
      }],
      yAxes: [{
          stacked: true,
          barThickness:10,
          // ticks: {mirror: true,
          //   padding:10}
         // barPercentage: 0.2
      }]
  },
  legend:{
      display:false
  },
  responsive: true,
  maintainAspectRatio:true,
  
}


console.log(label_array);
this.barChartSatisfactionLabels=label_array;
this.barChartSatisfactionData= [
//   {
//   label: 'Poor',
//   data: dataPack1,
//   backgroundColor: "#E84A5F",
//   hoverBackgroundColor:"#E84A5F"

// },
// {
//   label: 'Bad',
//   data: dataPack2,
//   backgroundColor: "#FF847C",
//   hoverBackgroundColor:"#FF847C"

// },
// {
//   label: 'Average',
//   data: dataPack3,
//   backgroundColor: "#FECE8B",
//   hoverBackgroundColor:"#FECE8B"

// },
{
  label: 'Excellent',
  data: dataPack5,
  backgroundColor: "#189150",
  hoverBackgroundColor:"#189150"

},
{
  label: 'Good',
  data: dataPack4,
  backgroundColor: "#74B78C",
  hoverBackgroundColor:"#74B78C"

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
          barPercentage: 0.5,
      }],
      yAxes: [{
          stacked: true,
          barThickness:10
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
this.barChartNeutralData= [
//   {
//   label: 'Poor',
//   data: dataPack1,
//   backgroundColor: "#E84A5F",
//   hoverBackgroundColor:"#E84A5F"

// },
// {
//   label: 'Bad',
//   data: dataPack2,
//   backgroundColor: "#FF847C",
//   hoverBackgroundColor:"#FF847C"

// },
{
  label: 'Average',
  data: dataPack3,
  backgroundColor: "#FECE8B",
  hoverBackgroundColor:"#FECE8B"
},
// {
//   label: 'Excellent',
//   data: dataPack5,
//   backgroundColor: "#189150",
//   hoverBackgroundColor:"#189150"
// },
// {
//   label: 'Good',
//   data: dataPack4,
//   backgroundColor: "#74B78C",
//   hoverBackgroundColor:"#74B78C"
// },
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
          barPercentage: 0.5,
      }],
      yAxes: [{
          stacked: true,
          barThickness:10
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
  backgroundColor: "#E84A5F",
  hoverBackgroundColor:"#E84A5F"

},
{
  label: 'Bad',
  data: dataPack2,
  backgroundColor: "#FF847C",
  hoverBackgroundColor:"#FF847C"

},
// {
//   label: 'Average',
//   data: dataPack3,
//   backgroundColor: "#FECE8B",
//   hoverBackgroundColor:"#FECE8B"

// },
// {
//   label: 'Good',
//   data: dataPack4,
//   backgroundColor: "#74B78C",
//   hoverBackgroundColor:"#74B78C"

// },
// {
//   label: 'Excellent',
//   data: dataPack5,
//   backgroundColor: "#189150",
//   hoverBackgroundColor:"#189150"

// },

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
          barPercentage: 0.5,
      }],
      yAxes: [{
          stacked: true,
          barThickness:10
         // barPercentage: 0.2
      }]
  },
  legend:{
      display:false
  },
  responsive: true,
  maintainAspectRatio:false
}


console.log(label_array);
this.barChartAllCombLabels=label_array;
this.barChartAllCombData= [{
  label: 'Poor',
  data: dataPack1,
  backgroundColor: "#E84A5F",
  hoverBackgroundColor:"#E84A5F"
},
{
  label: 'Bad',
  data: dataPack2,
  backgroundColor: "#FF847C",
  hoverBackgroundColor:"#FF847C"

},
{
  label: 'Average',
  data: dataPack3,
  backgroundColor: "#FECE8B",
  hoverBackgroundColor:"#FECE8B"

},
{
  label: 'Excellent',
  data: dataPack5,
  backgroundColor: "#189150",
  hoverBackgroundColor:"#189150"

},
{
  label: 'Good',
  data: dataPack4,
  backgroundColor: "#74B78C",
  hoverBackgroundColor:"#74B78C"

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
      this.callSurveyListForLocation=this.adminService.getSurveyListForLocation(locId,sessionStorage.getItem('location_id'))
      .subscribe(
          data=>{
              console.log(data);
              this.surveyList=data.result;
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


    selectSurveyOption(data){
      if(data!="0"){
      console.log("selected survey "+data);
      this.selectedSurveyId=data;
      this.selectedAreaId="0";
      sessionStorage.setItem("survey_id",data);
      this.getReports();
      }else{
        this.selectedSurveyId=null;
        this.selectedAreaId="0";
        this.getReports();
      }
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
      //this.loadBarLineChartGraph(null);
    }

    selectAreaOption(data){
      console.log(data);
      console.log(this.selectedArea);
      this.selectedAreaId=String(this.selectedArea);
     // this.selectedArea=data;
        // for(var dataselected in data){
        //   this.selectedAreaId=dataselected;
        //   console.log(this.selectedAreaId);
        // }

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
       

      this.barChartAreaOptions={scales: {
          xAxes: [{
              ticks: {
                  beginAtZero:true,
                  callback: function (value) { if (Number.isInteger(value)) { return value; } },
              },
              stacked: true,
              barPercentage: 0.5,
          }],
          yAxes: [{
              stacked: true,
              barThickness:10
             // barPercentage: 0.2
          }]
      },
      legend:{
          display:false
      },
      responsive: true,
      maintainAspectRatio:false
    }
  
  
  console.log("Horizontal area wise label"+label_array);
  this.barChartAreaLabels=label_array;
  this.barChartAreaData=[{
    label: 'Poor',
    data: dataPack1,
    backgroundColor: "#E84A5F",
    hoverBackgroundColor:"#E84A5F"
},{
    label: 'Bad',
    data: dataPack2,
    backgroundColor: "#FF847C",
  hoverBackgroundColor:"#FF847C"

},{
    label: 'Average',
    data: dataPack3,
    backgroundColor: "#FECE8B",
  hoverBackgroundColor:"#FECE8B"

},
{
    label: 'Good',
    data: dataPack4,
    backgroundColor: "#74B78C",
  hoverBackgroundColor:"#74B78C"

},
{
    label: 'Excellent',
    data: dataPack5,
    backgroundColor: "#189150",
  hoverBackgroundColor:"#189150"

}]

      }


      
      public captureScreenOld()  
      {  
        var currentDate;
        var data = document.getElementById('contentToConvert');  
        html2canvas(data).then(canvas => {  
          // Few necessary setting options  
          var imgWidth = 208;   
          var pageHeight = 295;    
          var imgHeight = canvas.height * imgWidth / canvas.width;  
          var heightLeft = imgHeight;  
      
          const contentDataURL = canvas.toDataURL('image/png')  
          let pdf = new jspdf('p', 'mm', 'a4'); // A4 size page of PDF  
          var position = 0;  
          console.log(imgWidth,imgHeight);
          pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
          currentDate = new Date();
          pdf.save('Report'+currentDate+'.pdf'); // Generated PDF   
        });  
      }  


      public captureScreen()  
      {  
        this.pdf_down=true;
        var currentDate;

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
          pdf.addImage(contentDataURL, 'PNG', 0, position, canvas.width, canvas.height) ;
          currentDate = new Date();
          pdf.save('Report '+currentDate+'.pdf'); // Generated PDF   
          this.pdf_down=false;
         // pdf.save('MYPdf.pdf'); // Generated PDF   
        });  
      }  

    

// startGame() {
//   this.cnt = this.cnt + 1;
//   console.log ('Count is ' + this.cnt);
// }

// startGame2() {
//   this.cnt2 = this.cnt2 + 1;
//   console.log ('Count is ' + this.cnt2);
//   this.getReports();
// }

// setIntrvl(){
//   setInterval(() => this.startGame2(),5000);
// }

// opensnack(text: string) : void {
//   console.log(text);
// }

}

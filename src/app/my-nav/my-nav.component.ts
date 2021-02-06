import { Component, OnInit } from '@angular/core';
import {MatMenuModule} from '@angular/material/menu';
import { Router, ActivatedRoute,NavigationEnd } from '@angular/router';
import {AuthenticationService} from '../_services/authentication.service';
import { DataService } from '../_services/data.service';
import { AdminService } from '../admin.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-my-nav',
  templateUrl: './my-nav.component.html',
  styleUrls: ['./my-nav.component.css']
})
export class MyNavComponent implements OnInit {

  current_url;
  breadcrumbList;
  breadcrumbLinksList;
  isHome;
  isSuper;
  isOnline;
  user_rights;
  user_right_json;
  noti_data;
  userName;
  demoList=[];
  constructor(private router: Router,private authenticationService: AuthenticationService,private dataService:DataService,
    private adminService:AdminService,private toastrService : ToastrService) { 
    router.events.subscribe(event => {

      if (event instanceof NavigationEnd ) {
        this.adminService.getNotReadNotification()
            .subscribe(
                data=>{
                console.log(data);
                this.noti_data=data.result;
                if(this.noti_data.length>0){
                  this.isOnline=true;
                }else{
                  this.isOnline=false;
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

        this.current_url=event.url;
        this.breadcrumbList = this.current_url.split('/');
        this.breadcrumbLinksList  = [this.breadcrumbList[0]];

    for(let i=1; i<=this.breadcrumbList.length; i++){
      const link = this.breadcrumbLinksList[i-1] +'/'+ this.breadcrumbList[i]
      this.breadcrumbLinksList.push(link)
    }
        console.log("current url",event.url);// event.url has current url
        // your code will goes here
      }
    });
  
  }

  ngOnInit() {
       // this.href = this.router.url;
       // console.log(this.router.url);

       
        this.isSuper=sessionStorage.getItem('is_super');
        if(!(this.isSuper=='true')){
        this.user_rights=sessionStorage.getItem('user_rights');
        this.user_right_json=JSON.parse(this.user_rights)
        console.log(this.user_right_json);
        }

        console.log(this.isSuper);
        this.isHome=sessionStorage.getItem('isHome');
        console.log("value in nav "+this.isHome);
        this.userName=sessionStorage.getItem('name');
        console.log(sessionStorage.getItem('name'))
        this.dataService.currentMessage.subscribe(message => this.isHome = message);
        //this.dataService.changeMessage('false');

  }

  // ngOnChanges(){
  // console.log("ngOnchanges called");
  // }

  // ngAfterViewInit(){
  // console.log("ngAfterViewInit called");

  // }


  

  //  navigateToHome(){
  //   this.router.navigate(["/"]);
  //  }

   logout(){
    this.authenticationService.logout();
    this.router.navigate(["/login"]);
    this.toastrService.info('Logged out Successfully ','', {
      timeOut: 2000,
      positionClass: 'toast-bottom-right',
    })
   }

   OnViewAll(response_id){
     console.log(response_id);
    this.adminService.clearNotification(response_id)
    .subscribe(
        data=>{
        console.log(data);
        if(data.status!=0){
        this.isOnline=false;
        sessionStorage.setItem('noti_resp_id',response_id);
        this.router.navigate(['/home/work-place/responses']);
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

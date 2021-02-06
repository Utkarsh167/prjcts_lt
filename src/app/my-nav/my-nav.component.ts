import { Component, OnInit } from '@angular/core';
import {MatMenuModule} from '@angular/material/menu';
import { Router, ActivatedRoute,NavigationEnd } from '@angular/router';
import {AuthenticationService} from '../_services/authentication.service';
import { DataService } from '../_services/data.service';


@Component({
  selector: 'app-my-nav',
  templateUrl: './my-nav.component.html',
  styleUrls: ['./my-nav.component.css']
})
export class MyNavComponent implements OnInit {

  current_url;
  breadcrumbList;
  breadcrumbLinksList

public applySpecialClass=true;
isHome;
  constructor(private router: Router,private authenticationService: AuthenticationService,private dataService:DataService) { 
    router.events.subscribe(event => {

      if (event instanceof NavigationEnd ) {
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
        console.log(this.router.url);
        this.isHome=sessionStorage.getItem('isHome');
        console.log("value in nav "+this.isHome);

        this.dataService.currentMessage.subscribe(message => this.isHome = message);
        //this.dataService.changeMessage('false');

       


  }

  ngOnChanges(){
  console.log("ngOnchanges called");
  }

  ngAfterViewInit(){
  console.log("ngAfterViewInit called");

  }


  

   navigateToHome(){
    this.router.navigate(["/"]);
   }

   logout(){
    this.authenticationService.logout();
    this.router.navigate(["/login"]);

   }

}

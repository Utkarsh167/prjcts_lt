import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  name;
  constructor() { }

  ngOnInit() {
  this.name=sessionStorage.getItem('adminType');
  }

}

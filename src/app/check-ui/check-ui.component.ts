import {Component, OnInit, ViewChild} from '@angular/core';


@Component({
  selector: 'app-check-ui',
  templateUrl: './check-ui.component.html',
  styleUrls: ['./check-ui.component.css']
})
export class CheckUiComponent implements OnInit {

  constructor() { }
  step = 0;

  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step++;
  }

  ngOnInit() {
    }

}

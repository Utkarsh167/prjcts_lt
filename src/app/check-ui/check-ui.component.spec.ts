import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckUiComponent } from './check-ui.component';

describe('CheckUiComponent', () => {
  let component: CheckUiComponent;
  let fixture: ComponentFixture<CheckUiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckUiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

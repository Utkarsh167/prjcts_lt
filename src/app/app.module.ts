import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AuthenticationService } from './_services/authentication.service';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ReactiveFormsModule, FormsModule }    from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { WorkPlaceComponent } from './work-place/work-place.component';
import { LogoutComponent } from './logout/logout.component';
import { MyNavComponent } from './my-nav/my-nav.component';
import { MatCardModule } from '@angular/material';
import { AdminService } from './admin.service';
import { DevicesComponent } from './devices/devices.component';
import { AreasComponent } from './areas/areas.component';
import { UsersComponent } from './users/users.component';
import { CheckUiComponent } from './check-ui/check-ui.component';
import { ModalModule } from './_modal/modal.module';
import { SurveyDashboardComponent } from './survey-dashboard/survey-dashboard.component';
import { ChartsModule } from 'ng2-charts';
import { NgxGaugeModule } from 'ngx-gauge';
import { AnalyticsComponent } from './analytics/analytics.component';
import { ResponsesComponent } from './responses/responses.component';
import {DataService} from './_services/data.service'
import {DataObjectService} from './_services/data-object.service'
import {GraphService} from './_services/graph.service'
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { FirstLoginComponent } from './first-login/first-login.component';
import { AddSurveyComponent } from './add-survey/add-survey.component';
import {MatTableModule} from '@angular/material/table'; 
import {A11yModule} from '@angular/cdk/a11y';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {PortalModule} from '@angular/cdk/portal';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {CdkStepperModule} from '@angular/cdk/stepper';
import {CdkTableModule} from '@angular/cdk/table';
import {CdkTreeModule} from '@angular/cdk/tree';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatBadgeModule} from '@angular/material/badge';
import {MatBottomSheetModule} from '@angular/material/bottom-sheet';
import {MatButtonModule} from '@angular/material/button';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatChipsModule} from '@angular/material/chips';
import {MatStepperModule} from '@angular/material/stepper';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatDialogModule} from '@angular/material/dialog';
import {MatDividerModule} from '@angular/material/divider';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatMenuModule} from '@angular/material/menu';
import {MatNativeDateModule, MatRippleModule} from '@angular/material/core';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatRadioModule} from '@angular/material/radio';
import {MatSelectModule} from '@angular/material/select';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatSliderModule} from '@angular/material/slider';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatSortModule} from '@angular/material/sort';
import {MatTabsModule} from '@angular/material/tabs';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatTreeModule} from '@angular/material/tree';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {ConfigService} from './_services/config.service';
import { ShowErrorComponent } from './show-error/show-error.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    WorkPlaceComponent,
    LogoutComponent,
    MyNavComponent,
    DevicesComponent,
    AreasComponent,
    UsersComponent,
    CheckUiComponent,
    SurveyDashboardComponent,
    AnalyticsComponent,
    ResponsesComponent,
    FirstLoginComponent,
    AddSurveyComponent,
    ShowErrorComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    MatCardModule,
    ModalModule,
    ChartsModule,
    NgxGaugeModule,
    MatTableModule,
    A11yModule,
    CdkStepperModule,
    CdkTableModule,
    CdkTreeModule,
    DragDropModule,
    MatAutocompleteModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatChipsModule,
    MatStepperModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatTreeModule,
    PortalModule,
    ScrollingModule,
    BrowserAnimationsModule,
    NgxDaterangepickerMd.forRoot()
  ],
  providers: [AuthenticationService,AdminService,DataService,GraphService,DataObjectService,ConfigService],
  bootstrap: [AppComponent]
})
export class AppModule { }

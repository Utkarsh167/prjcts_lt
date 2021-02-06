import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {LoginComponent} from './login/login.component';
import {SignupComponent} from './signup/signup.component';
import {MyNavComponent} from './my-nav/my-nav.component';
import {WorkPlaceComponent} from './work-place/work-place.component';
import {LogoutComponent} from './logout/logout.component';
import {DevicesComponent} from './devices/devices.component';
import {AreasComponent} from './areas/areas.component';
import {UsersComponent} from './users/users.component';
import {CheckUiComponent} from './check-ui/check-ui.component';
import {SurveyDashboardComponent} from './survey-dashboard/survey-dashboard.component';
import {ResponsesComponent} from './responses/responses.component';
import {AnalyticsComponent} from './analytics/analytics.component';
import { AuthGuard } from './_guards/auth.guard';
import { FirstLoginComponent } from './first-login/first-login.component';
import { AddSurveyComponent } from './add-survey/add-survey.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { TermsAndConditionsComponent } from './terms-and-conditions/terms-and-conditions.component';
import { MyTasksComponent } from './my-tasks/my-tasks.component';
import { AddNewUserComponent } from './add-new-user/add-new-user.component';
import { EmpListComponent } from './emp-list/emp-list.component';
import { ProfileComponent } from './profile/profile.component';
import { SettingsComponent } from './settings/settings.component';
import { WorkplaceListComponent } from './workplace-list/workplace-list.component';
import { LocationListComponent } from './location-list/location-list.component';



const routes: Routes = [
{
path: 'home', component: MyNavComponent,canActivate: [AuthGuard],
        children:[
            { path: '', component: WorkPlaceComponent, canActivate: [AuthGuard]},
          //  { path: 'work-place', component: WorkPlaceComponent, canActivate: [AuthGuard]},
            { path: 'devices', component: DevicesComponent, canActivate: [AuthGuard]},
            { path: 'areas', component: AreasComponent, canActivate: [AuthGuard]},
            { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard],children:[
              { path: 'users', component: UsersComponent, canActivate: [AuthGuard],},
              { path: 'emp-list', component: EmpListComponent, canActivate: [AuthGuard]}, 
              { path: 'location-list', component: LocationListComponent, canActivate: [AuthGuard]},         
              { path: 'workplace-list', component: WorkplaceListComponent, canActivate: [AuthGuard]},         

            ]},
            { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard],},
            { path: 'users/new-user', component: AddNewUserComponent, canActivate: [AuthGuard]},
            { path: 'my-tasks', component: MyTasksComponent, canActivate: [AuthGuard]},
            { path: 'check_ui', component: CheckUiComponent, canActivate: [AuthGuard]},
            { path: 'work-place/dashboard', component: SurveyDashboardComponent, canActivate: [AuthGuard]},
             { path: 'work-place/analytics', component: AnalyticsComponent, canActivate: [AuthGuard]},
              { path: 'work-place/responses', component: ResponsesComponent, canActivate: [AuthGuard]},
              { path: 'work-place/add-survey', component: AddSurveyComponent, canActivate: [AuthGuard]},
              
            ]
            },
{path :'login',component : LoginComponent},
{ path: 'workplace-details', component: FirstLoginComponent},
{path :'signup',component : SignupComponent},
{path :'logout',component : LogoutComponent},
{ path: 'privacy-policy', component: PrivacyPolicyComponent},
{ path: 'terms-and-conditions', component: TermsAndConditionsComponent},
           
{ path: '**', redirectTo: 'home' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

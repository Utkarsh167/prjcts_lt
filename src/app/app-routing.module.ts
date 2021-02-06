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



const routes: Routes = [
{
path: 'home', component: MyNavComponent,canActivate: [AuthGuard],
        children:[
            { path: '', component: WorkPlaceComponent, canActivate: [AuthGuard]},
          //  { path: 'work-place', component: WorkPlaceComponent, canActivate: [AuthGuard]},
            { path: 'devices', component: DevicesComponent, canActivate: [AuthGuard]},
            { path: 'areas', component: AreasComponent, canActivate: [AuthGuard]},
            { path: 'users', component: UsersComponent, canActivate: [AuthGuard]},
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
{ path: '**', redirectTo: 'home' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

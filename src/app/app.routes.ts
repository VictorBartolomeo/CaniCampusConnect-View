import {Routes} from '@angular/router';
import {LandingPageComponent} from './pages/landing-page/landing-page.component';
import {NotFoundComponent} from './pages/not-found/not-found.component';
import {LoginPageComponent} from './pages/login-page/login-page.component';
import {RegisterPageComponent} from './pages/register-page/register-page.component';
import {GeneralConditionsUseComponent} from './pages/general-conditions-use/general-conditions-use.component';
import {DashboardUserPageComponent} from './pages/dashboard-user-page/dashboard-user-page.component';
import {DashboardNavbarComponent} from './components/dashboard-navbar/dashboard-navbar.component';
import {HealthRecordComponent} from './pages/health-record/health-record.component';
import {CourseComponent} from './pages/course/course.component';
import {RegisterCourseComponent} from './pages/register-course/register-course.component';
import {ManageDogsPageComponent} from './pages/manage-dogs-page/manage-dogs-page.component';

export const routes: Routes = [
  {path : "", redirectTo: "home", pathMatch: "full"},
  {path : "dashboard", component: DashboardNavbarComponent,
    children:[
      {path : "user", component : DashboardUserPageComponent, children:[
          {path : "course", component : CourseComponent},
          // {path : "chat", component : ChatComponent}, SOON TO COME - Maybe - Finally Nope
          {path : "health-record", component : HealthRecordComponent}
        ]},
      {path : "manage-dog", component : ManageDogsPageComponent },
      {path : "reserve-course", component : RegisterCourseComponent},
      {path : "user/:id", component : DashboardUserPageComponent},
      {path: "", redirectTo: "user", pathMatch: "full"},
      {path : "**", component : NotFoundComponent}
    ]},
  {path : "home", component : LandingPageComponent},
  {path : "login", component : LoginPageComponent},
  {path : "register", component : RegisterPageComponent},
  {path : "CGU", component : GeneralConditionsUseComponent},
  {path : "**", component : NotFoundComponent}
];

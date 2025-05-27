import {Routes} from '@angular/router';
import {LandingPageComponent} from './pages/landing-page/landing-page.component';
import {NotFoundComponent} from './pages/not-found/not-found.component';
import {LoginPageComponent} from './pages/login-page/login-page.component';
import {RegisterPageComponent} from './pages/owner-related/register-page/register-page.component';
import {GeneralConditionsUseComponent} from './pages/general-conditions-use/general-conditions-use.component';
import {DashboardUserPageComponent} from './pages/owner-related/dashboard-user-page/dashboard-user-page.component';
import {DashboardNavbarComponent} from './components/dashboard-navbar/dashboard-navbar.component';
import {HealthRecordComponent} from './pages/owner-related/health-record/health-record.component';
import {CourseComponent} from './pages/owner-related/course/course.component';
import {RegisterCourseComponent} from './pages/owner-related/register-course/register-course.component';
import {ManageDogsPageComponent} from './pages/owner-related/manage-dogs-page/manage-dogs-page.component';
import {loggedGuard} from './service/logged.guard';
import {SettingsComponent} from './pages/owner-related/settings/settings.component';
import {OwnerProfileComponent} from './pages/owner-related/owner-profile/owner-profile.component';

export const routes: Routes = [
  {path : "", redirectTo: "home", pathMatch: "full"},
  {path : "home", component : LandingPageComponent},
  {path : "login", component : LoginPageComponent},
  {path : "register", component : RegisterPageComponent},
  {path : "dashboard", component: DashboardNavbarComponent, canActivate:[loggedGuard],
    children:[
      {path : "user", component : DashboardUserPageComponent, children:[
          {path : "", redirectTo: "course", pathMatch: "full"},
          {path : "course", component : CourseComponent},
          // {path : "chat", component : ChatComponent}, SOON TO COME - Maybe - Finally Nope
          {path : "health-record", component : HealthRecordComponent, canActivate:[loggedGuard], }

        ]},
      {path : "manage-dog", component : ManageDogsPageComponent },
      {path : "reserve-course", component : RegisterCourseComponent},
      {path : "settings", component : SettingsComponent},
      {path: "owner-profile", component: OwnerProfileComponent, canActivate:[loggedGuard]},
      {path: "", redirectTo: "user", pathMatch: "full"},
      {path : "**", component : NotFoundComponent}
    ]},
  {path : "CGU", component : GeneralConditionsUseComponent},
  {path : "**", component : NotFoundComponent}
];

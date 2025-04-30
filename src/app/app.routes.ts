import { Routes } from '@angular/router';
import {LandingPageComponent} from './pages/landing-page/landing-page.component';
import {NotFoundComponent} from './pages/not-found/not-found.component';
import {LoginPageComponent} from './pages/login-page/login-page.component';
import {RegisterPageComponent} from './pages/register-page/register-page.component';
import {GeneralConditionsUseComponent} from './pages/general-conditions-use/general-conditions-use.component';
import {DashboardUserPageComponent} from './pages/dashboard-user-page/dashboard-user-page.component';
import {DashboardNavbarComponent} from './components/dashboard-navbar/dashboard-navbar.component';

export const routes: Routes = [
  {path : "", redirectTo :"home", pathMatch :"full"},
  {path : "", component: DashboardNavbarComponent,
    children:[
      {path : "dashboard", component : DashboardUserPageComponent},
      {path: "", redirectTo: "dashboard", pathMatch: "full"},
      {path : "**", component : NotFoundComponent}
    ]},
  {path : "home", component : LandingPageComponent},
  {path : "login", component : LoginPageComponent},
  {path : "register", component : RegisterPageComponent},
  {path : "CGU", component : GeneralConditionsUseComponent},
  {path : "**", component : NotFoundComponent}
];

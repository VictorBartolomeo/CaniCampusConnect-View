import { Routes } from '@angular/router';
import {LandingPageComponent} from './pages/landing-page/landing-page.component';
import {NotFoundComponent} from './pages/not-found/not-found.component';
import {LoginPageComponent} from './pages/login-page/login-page.component';
import {RegisterPageComponent} from './pages/register-page/register-page.component';
import {GeneralConditionsUseComponent} from './pages/general-conditions-use/general-conditions-use.component';

export const routes: Routes = [
  {path : "", redirectTo :"home", pathMatch :"full"},
  {path : "home", component : LandingPageComponent},
  {path : "login", component : LoginPageComponent},
  {path : "register", component : RegisterPageComponent},
  {path : "CGU", component : GeneralConditionsUseComponent},
  {path : "**", component : NotFoundComponent}
];

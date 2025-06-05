import {Routes} from '@angular/router';
import {LandingPageComponent} from './pages/landing-page/landing-page.component';
import {NotFoundComponent} from './pages/not-found/not-found.component';
import {LoginPageComponent} from './pages/login-page/login-page.component';
import {RegisterPageComponent} from './pages/owner-related/register-page/register-page.component';
import {GeneralConditionsUseComponent} from './pages/general-conditions-use/general-conditions-use.component';
import {DashboardUserPageComponent} from './pages/owner-related/dashboard-user-page/dashboard-user-page.component';
import {DashboardNavbarComponent} from './components/owner-related/dashboard-navbar/dashboard-navbar.component';
import {HealthRecordComponent} from './pages/owner-related/health-record/health-record.component';
import {CourseComponent} from './pages/owner-related/course/course.component';
import {RegisterCourseComponent} from './pages/owner-related/register-course/register-course.component';
import {ManageDogsPageComponent} from './pages/owner-related/manage-dogs-page/manage-dogs-page.component';
import {loggedGuard} from './service/guards/logged.guard';
import {SettingsComponent} from './pages/owner-related/settings/settings.component';
import {OwnerProfileComponent} from './pages/owner-related/owner-profile/owner-profile.component';
import {
  CoachDashboardNavbarComponent
} from './components/coach-related/coach-dashboard-navbar/coach-dashboard-navbar.component';
import {UnauthorizedComponent} from './pages/unauthorized/unauthorized.component';
import {RoleGuard} from './service/guards/role.guard';
import {CoachDashboardComponent} from './pages/coach-related/coach-dashboard/coach-dashboard.component';
import {CoachCourseComponent} from './pages/coach-related/coach-course/coach-course.component';
import {
  UpcomingCourseTableComponent
} from './components/coach-related/upcoming-course-table/upcoming-course-table.component';
import {CoachCalendarComponent} from './components/coach-related/coach-calendar/coach-calendar.component';
import {CourseManagementComponent} from './pages/coach-related/course-management/course-management.component';
import {CalendarComponent} from './components/owner-related/calendar/calendar.component';

export const routes: Routes = [
  {path: "", redirectTo: "home", pathMatch: "full"},
  {path: "home", component: LandingPageComponent},
  {path: "login", component: LoginPageComponent},
  {path: "register", component: RegisterPageComponent},

  //OWNERS
  {
    path: "dashboard",
    component: DashboardNavbarComponent,
    canActivate: [loggedGuard, RoleGuard],
    data: {authorizedRoles: ['ROLE_OWNER']},
    children: [
      {
        path: "user", component: DashboardUserPageComponent,
        children: [
          {path: "", redirectTo: "course", pathMatch: "full"},
          {path: "course", component: CourseComponent},
          {path: "calendar", component: CalendarComponent},
          // {path : "chat", component : ChatComponent}, SOON TO COME - Maybe - Finally Nope
          {path: "health-record", component: HealthRecordComponent}
        ]
      },
      {path: "manage-dog", component: ManageDogsPageComponent},
      {path: "reserve-course", component: RegisterCourseComponent},
      {path: "settings", component: SettingsComponent},
      {path: "owner-profile", component: OwnerProfileComponent},
      {path: "", redirectTo: "user", pathMatch: "full"},
      {path: "**", component: NotFoundComponent}
    ]
  },

  //COACHS
  {
    path: "coach/dashboard",
    component: CoachDashboardNavbarComponent,
    canActivate: [loggedGuard, RoleGuard],
    data: {authorizedRoles: ['ROLE_COACH']},
    children: [
      {
        path: "general", component: CoachDashboardComponent,
        children: [
          {path: "", redirectTo: "upcoming-course", pathMatch: "full"},
          {path: "upcoming-course", component: UpcomingCourseTableComponent},
          {path: "calendar", component: CoachCalendarComponent}
        ]
      },
      {path: "subscription-management", component: CourseManagementComponent},
      // {path: "settings", component: CoachSettingsComponent},
      {path: "", redirectTo: "general", pathMatch: "full"},
    ]
  },

  {path: 'unauthorized', component: UnauthorizedComponent},
  {path: "CGU", component: GeneralConditionsUseComponent},
  {path: "**", component: NotFoundComponent}
];

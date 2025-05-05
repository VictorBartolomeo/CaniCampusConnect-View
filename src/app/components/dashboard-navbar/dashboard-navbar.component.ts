import {FormsModule} from '@angular/forms';

import {Component} from '@angular/core';

interface Food {
  value: string;
  viewValue: string;
}


@Component({
  selector: 'app-dashboard-navbar',
  templateUrl: './dashboard-navbar.component.html',
  imports: [FormsModule],
  styleUrls: ['./dashboard-navbar.component.scss']
})
export class DashboardNavbarComponent {
  events: string[] = [];
  opened: boolean = false;

  shouldRun = window.location.host;

  foods: Food[] = [
    {value: 'steak-0', viewValue: 'Gros con le teckel'},
    {value: 'pizza-1', viewValue: 'Marcel le Teckel'},
    {value: 'tacos-2', viewValue: 'Maurice le Spitz'},
  ];

}

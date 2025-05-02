import {MatButtonModule} from '@angular/material/button';
import {FormsModule} from '@angular/forms';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatIcon} from '@angular/material/icon';
import {Component} from '@angular/core';
import {MatFormField, MatLabel} from '@angular/material/input';
import {MatSelect} from '@angular/material/select';
import {MatOption} from '@angular/material/core';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatDivider} from '@angular/material/divider';
import {RouterOutlet} from '@angular/router';

interface Food {
  value: string;
  viewValue: string;
}


@Component({
  selector: 'app-dashboard-navbar',
  templateUrl: './dashboard-navbar.component.html',
  imports: [MatSidenavModule, MatCheckboxModule, FormsModule, MatButtonModule, MatIcon, MatLabel, MatSelect, MatOption, MatFormField, MatMenuTrigger, MatMenu, MatMenuItem, MatDivider, RouterOutlet],
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

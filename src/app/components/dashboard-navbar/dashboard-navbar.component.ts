import {Component} from '@angular/core';
import {MatFormField, MatLabel} from '@angular/material/input';
import {MatSelect} from '@angular/material/select';
import {MatOption} from '@angular/material/core';

@Component({
  selector: 'app-dashboard-navbar',
  imports: [
    MatLabel,
    MatSelect,
    MatSelect,
    MatOption,
    MatFormField
  ],
  templateUrl: './dashboard-navbar.component.html',
  styleUrl: './dashboard-navbar.component.scss'
})
export class DashboardNavbarComponent {
  selected = 'option2';
}

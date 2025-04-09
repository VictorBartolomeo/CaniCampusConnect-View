import {Component} from '@angular/core';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-landing-navbar',
  imports: [MatMenuModule, MatButtonModule, RouterLink, RouterLinkActive, MatIconModule
  ],
  templateUrl: './landing-navbar.component.html',
  styleUrl: './landing-navbar.component.scss'
})
export class LandingNavbarComponent {

}

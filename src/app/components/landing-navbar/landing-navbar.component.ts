import {Component, OnInit} from '@angular/core';
import {MenuItem} from 'primeng/api';
import {Ripple} from 'primeng/ripple';
import {Badge} from 'primeng/badge';
import {Menubar} from 'primeng/menubar';
import {NgClass, NgOptimizedImage} from '@angular/common';
import {Button} from 'primeng/button';
import {TieredMenuModule} from 'primeng/tieredmenu';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-landing-navbar',
  imports: [RouterLink, Ripple, Badge, Menubar, NgClass, NgOptimizedImage, Button, TieredMenuModule],
  templateUrl: './landing-navbar.component.html',
  styleUrl: './landing-navbar.component.scss'
})
export class LandingNavbarComponent implements OnInit {
  items: MenuItem[] | undefined;

  ngOnInit() {
    this
      .items = [
      {
        label: 'Accueil',
        icon: 'pi pi-home',
        route : "/home/#Accueil"
      },
      {
        label: "À propos",
        icon: 'pi pi-info-circle',
        route : "#À propos"
      },
      {
        label: 'Nos cours',
        icon: 'pi pi-graduation-cap',
        route : "#Nos cours"
      },
      {
        label: 'Coachs',
        icon: 'pi pi-users',
        route : "#Contact"
      },
      {
        label: 'Contact',
        icon: 'pi pi-phone',
        route : "#Contact"
      }
    ]
  }
}

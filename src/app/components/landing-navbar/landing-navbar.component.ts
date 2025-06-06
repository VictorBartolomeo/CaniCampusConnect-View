import { Component, OnInit, AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import { Ripple } from 'primeng/ripple';
import { Badge } from 'primeng/badge';
import { Menubar } from 'primeng/menubar';
import {NgClass, NgOptimizedImage, UpperCasePipe} from '@angular/common';
import { Button } from 'primeng/button';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { MenuItem } from 'primeng/api';
import { LayoutService } from '../../service/layout.service';
import {StyleClass} from 'primeng/styleclass';

@Component({
  selector: 'app-landing-navbar',
  imports: [RouterLink, Ripple, Badge, Menubar, NgClass, NgOptimizedImage, Button, TieredMenuModule, StyleClass, UpperCasePipe, RouterOutlet],
  templateUrl: './landing-navbar.component.html',
  styleUrl: './landing-navbar.component.scss'
})
export class LandingNavbarComponent implements OnInit, AfterViewInit, OnDestroy {
  items: MenuItem[] | undefined;

  constructor(
    private elementRef: ElementRef,
    private layoutService: LayoutService
  ) {}

  ngOnInit() {
    this.items = [
      {
        label: 'Accueil',
        icon: 'pi pi-home',
        route: "/home/#Accueil"
      },
      {
        label: "À propos",
        icon: 'pi pi-info-circle',
        route: "#À propos"
      },
      {
        label: 'Nos cours',
        icon: 'pi pi-graduation-cap',
        route: "#Nos cours"
      },
      {
        label: 'Coachs',
        icon: 'pi pi-users',
        route: "#Contact"
      },
      {
        label: 'Contact',
        icon: 'pi pi-phone',
        route: "#Contact"
      }
    ];
  }


  ngAfterViewInit() {
    setTimeout(() => {
      // ✅ Mesurer seulement le p-menubar, pas tout le composant
      const menubar = this.elementRef.nativeElement.querySelector('p-menubar');
      const height = menubar ? menubar.offsetHeight : 85; // fallback à 85px
      this.layoutService.setNavbarHeight(height);
      console.log('Navbar height set to:', height); // Devrait maintenant être ~85px
    }, 0);
  }

  ngOnDestroy() {
    this.layoutService.setNavbarHeight(0);
  }
}

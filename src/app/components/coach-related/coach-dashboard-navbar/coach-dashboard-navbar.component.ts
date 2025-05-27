import { Component } from '@angular/core';
import {AsyncPipe} from "@angular/common";
import {Avatar} from "primeng/avatar";
import {Button} from "primeng/button";
import {MegaMenu} from "primeng/megamenu";
import {Menu} from "primeng/menu";
import {PrimeTemplate} from "primeng/api";
import {Ripple} from "primeng/ripple";
import {RouterOutlet} from "@angular/router";
import {Select} from "primeng/select";

@Component({
  selector: 'app-coach-dashboard-navbar',
    imports: [
        AsyncPipe,
        Avatar,
        Button,
        MegaMenu,
        Menu,
        PrimeTemplate,
        Ripple,
        RouterOutlet,
        Select
    ],
  templateUrl: './coach-dashboard-navbar.component.html',
  styleUrl: './coach-dashboard-navbar.component.scss'
})
export class CoachDashboardNavbarComponent {

}

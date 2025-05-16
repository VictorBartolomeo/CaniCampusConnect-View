import { Component } from '@angular/core';
import {UserSettingsComponent} from '../../components/owner-settings/owner-settings.component';

@Component({
  selector: 'app-settings',
  imports: [
    UserSettingsComponent
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {

}

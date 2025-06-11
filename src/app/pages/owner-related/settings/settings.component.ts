import { Component } from '@angular/core';
import {OwnerSettingsComponent} from '../../../components/owner-related/owner-settings/owner-settings.component';
import {PasswordFormComponent} from '../../../components/owner-related/password-form/password-form.component';
import {Toast} from 'primeng/toast';
import {MessageService} from 'primeng/api';
import {UserService} from '../../../service/user.service';

@Component({
  selector: 'app-settings',
  imports: [
    OwnerSettingsComponent,
    PasswordFormComponent,
    Toast
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  providers: [MessageService]
})
export class SettingsComponent {

  protected readonly UserService = UserService;
}

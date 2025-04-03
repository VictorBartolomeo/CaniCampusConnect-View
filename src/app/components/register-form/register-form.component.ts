import {Component, signal} from '@angular/core';
import {MatFormField, MatInput, MatLabel, MatSuffix} from "@angular/material/input";
import {RouterLink} from "@angular/router";
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatCheckbox} from '@angular/material/checkbox';
import {NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-register-form',
  imports: [
    MatButton,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatLabel,
    MatSuffix,
    RouterLink,
    MatCheckbox,
    NgOptimizedImage
  ],
  templateUrl: './register-form.component.html',
  styleUrl: './register-form.component.scss'
})
export class RegisterFormComponent {
  hide = signal(true);

  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }
}

import {Component, signal} from '@angular/core';
import {RouterLink} from "@angular/router";
import {NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-register-form',
  imports: [
    RouterLink,
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

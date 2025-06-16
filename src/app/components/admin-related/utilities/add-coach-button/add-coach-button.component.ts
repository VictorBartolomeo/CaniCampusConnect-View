import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-add-coach-button',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule
  ],
  templateUrl: './add-coach-button.component.html',
  styleUrl: './add-coach-button.component.scss'
})
export class AddCoachButtonComponent {
  @Output() addCoachRequest = new EventEmitter<void>();

  /**
   * Emit an event to request adding a new coach
   */
  requestAddCoach(): void {
    this.addCoachRequest.emit();
  }
}

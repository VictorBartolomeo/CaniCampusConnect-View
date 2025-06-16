import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-delete-coach-button',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TooltipModule
  ],
  templateUrl: './delete-coach-button.component.html',
  styleUrl: './delete-coach-button.component.scss'
})
export class DeleteCoachButtonComponent {
  @Input() coach: any;
  @Input() small: boolean = false;
  @Output() deleteCoach = new EventEmitter<any>();

  /**
   * Emit an event to delete the coach
   */
  onDeleteCoach(): void {
    this.deleteCoach.emit(this.coach);
  }
}

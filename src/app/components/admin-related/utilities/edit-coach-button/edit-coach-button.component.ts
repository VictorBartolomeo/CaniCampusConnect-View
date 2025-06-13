import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-edit-coach-button',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TooltipModule
  ],
  templateUrl: './edit-coach-button.component.html',
  styleUrl: './edit-coach-button.component.scss'
})
export class EditCoachButtonComponent {
  @Input() coach: any;
  @Input() small: boolean = false;
  @Output() editCoach = new EventEmitter<any>();

  /**
   * Emit an event to edit the coach
   */
  onEditCoach(): void {
    this.editCoach.emit(this.coach);
  }
}

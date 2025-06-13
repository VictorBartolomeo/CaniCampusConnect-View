import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { EditCoachButtonComponent } from '../utilities/edit-coach-button/edit-coach-button.component';

@Component({
  selector: 'app-coach-card',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    BadgeModule,
    ButtonModule,
    EditCoachButtonComponent
  ],
  templateUrl: './coach-card.component.html',
  styleUrl: './coach-card.component.scss'
})
export class CoachCardComponent {
  @Input() coach: any = null;
  @Output() editCoach = new EventEmitter<any>();

  /**
   * Emit an event to edit the coach
   */
  onEditCoach(): void {
    this.editCoach.emit(this.coach);
  }
}

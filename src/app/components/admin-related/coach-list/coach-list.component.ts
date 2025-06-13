import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { AddCoachButtonComponent } from '../utilities/add-coach-button/add-coach-button.component';
import { EditCoachButtonComponent } from '../utilities/edit-coach-button/edit-coach-button.component';

@Component({
  selector: 'app-coach-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TooltipModule,
    AddCoachButtonComponent,
    EditCoachButtonComponent
  ],
  templateUrl: './coach-list.component.html',
  styleUrl: './coach-list.component.scss'
})
export class CoachListComponent {
  @Input() coaches: any[] = [];
  @Input() loading: boolean = false;

  @Output() coachSelected = new EventEmitter<any>();
  @Output() coachEdit = new EventEmitter<any>();
  @Output() addCoachRequest = new EventEmitter<void>();

  /**
   * Emit an event to view coach details
   * @param coach The coach to view
   */
  viewCoachDetails(coach: any): void {
    this.coachSelected.emit(coach);
  }

  /**
   * Emit an event to edit a coach
   * @param coach The coach to edit
   */
  editCoach(coach: any): void {
    this.coachEdit.emit(coach);
  }

  /**
   * Emit an event to request adding a new coach
   */
  requestAddCoach(): void {
    this.addCoachRequest.emit();
  }
}

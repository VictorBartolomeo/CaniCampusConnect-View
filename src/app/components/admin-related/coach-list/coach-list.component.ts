import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { AddCoachButtonComponent } from '../utilities/add-coach-button/add-coach-button.component';
import { EditCoachButtonComponent } from '../utilities/edit-coach-button/edit-coach-button.component';
import { DeleteCoachButtonComponent } from '../utilities/delete-coach-button/delete-coach-button.component';
import { DeleteCoachDialogComponent } from '../delete-coach-dialog/delete-coach-dialog.component';

@Component({
  selector: 'app-coach-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TooltipModule,
    AddCoachButtonComponent,
    EditCoachButtonComponent,
    DeleteCoachButtonComponent,
    DeleteCoachDialogComponent
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
  @Output() coachDelete = new EventEmitter<any>();

  // Properties for delete confirmation dialog
  deleteDialogVisible: boolean = false;
  coachToDelete: any = null;

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

  /**
   * Show the delete confirmation dialog
   * @param coach The coach to delete
   */
  showDeleteDialog(coach: any): void {
    this.coachToDelete = coach;
    this.deleteDialogVisible = true;
  }

  /**
   * Handle the confirmation of coach deletion
   * @param coach The coach to delete
   */
  onConfirmDelete(coach: any): void {
    this.coachDelete.emit(coach);
  }
}

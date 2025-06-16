import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-delete-coach-dialog',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule
  ],
  templateUrl: './delete-coach-dialog.component.html',
  styleUrl: './delete-coach-dialog.component.scss'
})
export class DeleteCoachDialogComponent {
  @Input() coach: any = null;
  @Input() visible: boolean = false;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() confirmDelete = new EventEmitter<any>();

  /**
   * Close the dialog
   */
  closeDialog(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  /**
   * Confirm the deletion of the coach
   */
  confirmDeletion(): void {
    if (this.coach) {
      this.confirmDelete.emit(this.coach);
      this.closeDialog();
    }
  }
}

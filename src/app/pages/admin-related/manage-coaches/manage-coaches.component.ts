import {Component, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  CoachRegisterFormComponent
} from '../../../components/admin-related/coach-register-form/coach-register-form.component';
import {CoachResponse} from '../../../service/coach.service';
import {TableModule} from 'primeng/table';
import {ButtonModule} from 'primeng/button';
import {DialogModule} from 'primeng/dialog';
import {TooltipModule} from 'primeng/tooltip';
import {CardModule} from 'primeng/card';
import {BadgeModule} from 'primeng/badge';
import {CoachListComponent} from '../../../components/admin-related/coach-list/coach-list.component';
import {CoachEditFormComponent} from '../../../components/admin-related/coach-edit-form/coach-edit-form.component';
import {CoachCardComponent} from '../../../components/admin-related/coach-card/coach-card.component';
import {AdminService} from '../../../service/admin.service';
import {AddCoachButtonComponent} from '../../../components/admin-related/utilities/add-coach-button/add-coach-button.component';
import {EditCoachButtonComponent} from '../../../components/admin-related/utilities/edit-coach-button/edit-coach-button.component';

@Component({
  selector: 'app-manage-coaches',
  standalone: true,
  imports: [
    CommonModule,
    CoachRegisterFormComponent,
    CoachListComponent,
    CoachEditFormComponent,
    CoachCardComponent,
    AddCoachButtonComponent,
    EditCoachButtonComponent,
    TableModule,
    ButtonModule,
    DialogModule,
    TooltipModule,
    CardModule,
    BadgeModule
  ],
  templateUrl: './manage-coaches.component.html',
  styleUrl: './manage-coaches.component.scss'
})
export class ManageCoachesComponent implements OnInit {
  coaches: any[] = [];
  loading: boolean = true;
  selectedCoach: any = null;
  editFormVisible: boolean = false;
  coachToEdit: any = null;

  @ViewChild(CoachRegisterFormComponent) coachForm!: CoachRegisterFormComponent;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadCoaches();

    // Subscribe to coaches observable
    this.adminService.coaches$.subscribe(coaches => {
      this.coaches = coaches;
    });
  }

  loadCoaches() {
    this.loading = true;
    console.log('Loading coaches...');
    this.adminService.loadCoaches().subscribe({
      next: () => {
        console.log('Coaches loaded successfully');
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading coaches:', error);
        this.loading = false;
      }
    });
  }

  showAddCoachDialog() {
    if (this.coachForm) {
      this.coachForm.showDialog();
    }
  }

  showCoachDetails(coach: any) {
    this.selectedCoach = coach;
    // No longer opening the modal dialog, just selecting the coach for the card
  }

  /**
   * Show the edit form for a coach
   * @param coach The coach to edit
   */
  editCoach(coach: any) {
    this.coachToEdit = coach;
    this.editFormVisible = true;
  }

  /**
   * Handle coach updated event
   * @param updatedCoach The updated coach
   */
  onCoachUpdated(updatedCoach: any) {
    // The AdminService will handle updating the coaches array
    // We just need to update the selected coach if it was the one that was updated
    if (this.selectedCoach && this.selectedCoach.id === updatedCoach.id) {
      this.selectedCoach = updatedCoach;
    }
  }

  /**
   * Handle coach added event
   * @param newCoach The newly added coach
   */
  onCoachAdded(newCoach: any) {
    // The AdminService will handle adding the coach to the coaches array
    console.log('Coach added:', newCoach);
  }
}

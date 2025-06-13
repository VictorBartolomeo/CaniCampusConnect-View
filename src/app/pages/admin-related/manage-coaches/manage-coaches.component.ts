import {Component, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  CoachRegisterFormComponent
} from '../../../components/admin-related/coach-register-form/coach-register-form.component';
import {CoachResponse, CoachService} from '../../../service/coach.service';
import {TableModule} from 'primeng/table';
import {ButtonModule} from 'primeng/button';
import {DialogModule} from 'primeng/dialog';
import {TooltipModule} from 'primeng/tooltip';
import {CardModule} from 'primeng/card';
import {BadgeModule} from 'primeng/badge';
import {CoachListComponent} from '../../../components/admin-related/coach-list/coach-list.component';
import {CoachEditFormComponent} from '../../../components/admin-related/coach-edit-form/coach-edit-form.component';

@Component({
  selector: 'app-manage-coaches',
  standalone: true,
  imports: [
    CommonModule,
    CoachRegisterFormComponent,
    CoachListComponent,
    CoachEditFormComponent,
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
  detailsVisible: boolean = false;
  editFormVisible: boolean = false;
  coachToEdit: any = null;

  @ViewChild(CoachRegisterFormComponent) coachForm!: CoachRegisterFormComponent;

  constructor(private coachService: CoachService) {}

  ngOnInit() {
    this.loadCoaches();
  }

  loadCoaches() {
    this.loading = true;
    console.log('Loading coaches...');
    this.coachService.getAllCoaches().subscribe({
      next: (response: any[] | CoachResponse) => {
        console.log('API response received:', response);

        // Handle different possible response formats
        if (Array.isArray(response)) {
          // Response is already an array
          this.coaches = response;
        } else if (response && typeof response === 'object') {
          // Response might be wrapped in an object
          if (Array.isArray(response.data)) {
            this.coaches = response.data;
          } else if (Array.isArray(response.content)) {
            this.coaches = response.content;
          } else if (Array.isArray(response.coaches)) {
            this.coaches = response.coaches;
          } else {
            // If we can't find an array property, try to convert the object to an array
            const possibleArray = Object.values(response).find(val => Array.isArray(val));
            if (possibleArray) {
              this.coaches = possibleArray;
            } else {
              console.error('Could not extract coaches array from response:', response);
              this.coaches = [];
            }
          }
        } else {
          console.error('Unexpected response format:', response);
          this.coaches = [];
        }

        console.log('Processed coaches array:', this.coaches);
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
    this.detailsVisible = true;
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
    // Find and update the coach in the array
    const index = this.coaches.findIndex(c => c.id === updatedCoach.id);
    if (index !== -1) {
      this.coaches[index] = updatedCoach;
    }

    // If this was the selected coach, update it
    if (this.selectedCoach && this.selectedCoach.id === updatedCoach.id) {
      this.selectedCoach = updatedCoach;
    }
  }
}

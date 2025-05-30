@Component({
  selector: 'app-coach-subscription-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    MultiSelectModule,
    BadgeModule,
    ConfirmDialogModule,
    ToastModule,
    ProgressSpinnerModule,
    CardModule,
    TagModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './coach-subscription-table.component.html',
  styleUrls: ['./coach-subscription-table.component.scss']
})
export class CoachSubscriptionTableComponent implements OnInit, OnDestroy {
  coursesWithPendingRegistrations: CourseWithPendingRegistrations[] = [];
  filteredCourses: CourseWithPendingRegistrations[] = [];
  loading = false;
  updatingRegistration = false;
  selectedCourseTypes: CourseType[] = [];
  availableCourseTypes: CourseType[] = [];
  // ✅ Array pour stocker les éléments expandés
  expandedRows: CourseWithPendingRegistrations[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private registrationService: RegistrationService,
    private authStateService: AuthStateService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadPendingRegistrations();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPendingRegistrations(): void {
    const coachId = this.authStateService.getUserId();
    if (!coachId) {
      this.showError('Erreur', 'Impossible de récupérer l\'identifiant du coach');
      return;
    }

    this.loading = true;
    this.registrationService.getPendingRegistrations(coachId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (registrations: Registration[]) => {
          this.processRegistrations(registrations);
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Erreur lors du chargement des registrations:', error);
          this.showError('Erreur', 'Impossible de charger les demandes d\'inscription');
          this.loading = false;
        }
      });
  }

  private processRegistrations(registrations: Registration[]): void {
    const courseMap = new Map<number, CourseWithPendingRegistrations>();

    registrations.forEach(registration => {
      const courseId = registration.course.id;

      if (!courseMap.has(courseId)) {
        courseMap.set(courseId, {
          course: registration.course,
          pendingRegistrations: [],
          pendingCount: 0
        });
      }

      const courseData = courseMap.get(courseId)!;
      courseData.pendingRegistrations.push(registration);
      courseData.pendingCount++;
    });

    this.coursesWithPendingRegistrations = Array.from(courseMap.values())
      .sort((a, b) => new Date(a.course.startDatetime).getTime() - new Date(b.course.startDatetime).getTime());

    this.filteredCourses = [...this.coursesWithPendingRegistrations];
    this.extractCourseTypes();
  }

  private extractCourseTypes(): void {
    const typesSet = new Set<string>();
    this.coursesWithPendingRegistrations.forEach(item => {
      typesSet.add(JSON.stringify(item.course.courseType));
    });

    this.availableCourseTypes = Array.from(typesSet)
      .map(typeStr => JSON.parse(typeStr) as CourseType);
  }

  applyFilters(): void {
    this.filteredCourses = this.coursesWithPendingRegistrations.filter(item => {
      if (this.selectedCourseTypes.length > 0) {
        const hasSelectedType = this.selectedCourseTypes.some(
          selectedType => selectedType.id === item.course.courseType.id
        );
        if (!hasSelectedType) return false;
      }
      return true;
    });
  }

  clearFilters(): void {
    this.selectedCourseTypes = [];
    this.filteredCourses = [...this.coursesWithPendingRegistrations];
  }

  // ✅ Méthode simplifiée pour l'expansion
  toggleRow(courseData: CourseWithPendingRegistrations): void {
    const index = this.expandedRows.findIndex(row => row.course.id === courseData.course.id);

    if (index >= 0) {
      // Ligne déjà expandée, on la retire
      this.expandedRows.splice(index, 1);
    } else {
      // Ligne pas expandée, on l'ajoute
      this.expandedRows.push(courseData);
    }

    console.log('Expanded rows:', this.expandedRows.map(r => r.course.title));
  }

  isRowExpanded(courseData: CourseWithPendingRegistrations): boolean {
    return this.expandedRows.some(row => row.course.id === courseData.course.id);
  }

  updateRegistrationStatus(registration: Registration, newStatus: 'CONFIRMED' | 'REJECTED'): void {
    const actionText = newStatus === 'CONFIRMED' ? 'confirmer' : 'rejeter';
    const message = `Êtes-vous sûr de vouloir ${actionText} l'inscription de ${registration.dog.name} ?`;

    this.confirmationService.confirm({
      message,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      accept: () => {
        this.performStatusUpdate(registration, newStatus);
      }
    });
  }

  private performStatusUpdate(registration: Registration, newStatus: 'CONFIRMED' | 'REJECTED'): void {
    this.updatingRegistration = true;

    this.registrationService.updateRegistrationStatus(registration.id, newStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedRegistration: Registration) => {
          const actionText = newStatus === 'CONFIRMED' ? 'confirmée' : 'rejetée';
          this.showSuccess('Succès', `L'inscription de ${registration.dog.name} a été ${actionText}`);
          this.loadPendingRegistrations();
          this.updatingRegistration = false;
        },
        error: (error: any) => {
          console.error('Erreur lors de la mise à jour:', error);
          this.showError('Erreur', 'Impossible de mettre à jour le statut de l\'inscription');
          this.updatingRegistration = false;
        }
      });
  }

  formatDate(dateString: string | Date): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusSeverity(status: string): "info" | "success" | "warn" | "danger" | "secondary" | "contrast" {
    switch (status) {
      case 'PENDING': return 'warn';
      case 'CONFIRMED': return 'success';
      case 'REJECTED': return 'danger';
      default: return 'info';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING': return 'En attente';
      case 'CONFIRMED': return 'Confirmé';
      case 'REJECTED': return 'Rejeté';
      default: return status;
    }
  }

  private showSuccess(summary: string, detail: string): void {
    this.messageService.add({
      severity: 'success',
      summary,
      detail,
      life: 3000
    });
  }

  private showError(summary: string, detail: string): void {
    this.messageService.add({
      severity: 'error',
      summary,
      detail,
      life: 5000
    });
  }
}

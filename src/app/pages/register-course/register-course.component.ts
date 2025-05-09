import {Component, inject, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {TableModule} from 'primeng/table';
import {ConfirmationService, FilterService, MessageService} from 'primeng/api'; // Ajout de FilterMatchMode
import {InputTextModule} from 'primeng/inputtext';
import {CommonModule} from '@angular/common'; // Pour les pipes date/currency etc.
import {Course} from '../../models/course';
import {Dog} from '../../models/dog';
import {Toast} from 'primeng/toast';
import {ConfirmPopupModule} from 'primeng/confirmpopup';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {faEye, faPaw} from '@fortawesome/free-solid-svg-icons';
import {Dialog} from 'primeng/dialog';

@Component({
  selector: 'app-register-course',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    InputTextModule,
    Toast,
    ConfirmPopupModule,
    FaIconComponent,
    Dialog,
  ],
  templateUrl: './register-course.component.html',
  styleUrl: './register-course.component.scss',
  providers: [ConfirmationService, MessageService, FilterService],
})
export class RegisterCourseComponent implements OnInit {
  http = inject(HttpClient);
  courses: Course[] = [];
  dogs: Dog[] = [];
  dialogVisible: boolean = false;
  selectedCourseForDialog: Course | null = null;


  ngOnInit() {
    this.http.get<Course[]>('http://localhost:8080/courses').subscribe({
      next: (courses) => {
        this.courses = courses;
        console.log(courses);
      },
      error: (error) => {
        console.error('Error fetching courses:', error);
      },
    });
    this.http.get<Dog[]>('http://localhost:8080/owner/3/dogs').subscribe({
      next: (dogs) => {
        this.dogs = dogs;
        console.log(dogs);
      },
      error: (error) => {
        console.error('Error fetching courses:', error);
      },
    });
  }

  //POPUP CONFIRM
  constructor(private readonly confirmationService: ConfirmationService, private readonly messageService: MessageService) {
  }

  showCourseDialog(course: Course) {
    this.selectedCourseForDialog = course;
    this.dialogVisible = true;
  }

  confirm(course: Course,event: Event) {
    this.selectedCourseForDialog=course;
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Inscrire ' + this.dogs[0].name + ' au cours de ' + course.title + ' ?',
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        icon: 'pi pi-times',
        label: 'Annuler',
        outlined: true,
      },
      acceptButtonProps: {
        icon: 'pi pi-check',
        label: 'Confirmer',
      },

      accept: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Confirmé !',
          detail: 'Votre demande d\'inscription a bien été envoyée',
          life: 1500,
        });
      },
      reject: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Annulé !',
          detail: 'Action annulée',
          life: 1500,
        });
      },
    });
  }

  //MODALE
  visible: boolean = false;

  protected readonly faPaw = faPaw;
  protected readonly faEye = faEye;


}

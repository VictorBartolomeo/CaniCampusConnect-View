import {Component, inject, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Dog} from '../../models/dog';
import {TableModule} from 'primeng/table';
import {DatePipe, NgClass} from '@angular/common';


@Component({
  selector: 'app-vaccination-table',
  imports: [
    TableModule,
    DatePipe,
    NgClass,
  ],
  standalone: true,
  templateUrl: './vaccination-table.component.html',
  styleUrl: './vaccination-table.component.scss'
})


export class VaccinationTableComponent implements OnInit {
  http = inject(HttpClient)
  dogs: Dog[] = [];

  ngOnInit() {
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

  calculateReminderDate(vaccinationDate: Date | string, renewDelayInMonths: number): Date {
    const date = new Date(vaccinationDate);
    date.setMonth(date.getMonth() + renewDelayInMonths);
    return date;
  }

  isReminderSoon(reminderDate: Date | string): boolean {
    if (!reminderDate) return false;

    const now = new Date();
    const reminder = new Date(reminderDate);
    const diffInDays = Math.floor((reminder.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffInDays <= 30 && diffInDays >= 0;
  }

  isReminderOverdue(reminderDate: Date | string): boolean {
    if (!reminderDate) return false;

    const now = new Date();
    const reminder = new Date(reminderDate);
    return reminder < now;
  }


}

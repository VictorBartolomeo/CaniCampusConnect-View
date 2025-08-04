import {Component, inject, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Dog} from '../../../models/dog';
import {TableModule} from 'primeng/table';
import {CardModule} from 'primeng/card';
import {DatePipe, NgClass} from '@angular/common';
import {Vaccination} from '../../../models/vaccination';

import {Subscription} from 'rxjs';

import {DogService} from '../../../service/dog.service';


@Component({
  selector: 'app-vaccination-table',
  imports: [
    TableModule,
    DatePipe,
    NgClass,
    CardModule,
  ],
  standalone: true,
  templateUrl: './vaccination-table.component.html',
  styleUrl: './vaccination-table.component.scss'
})


export class VaccinationTableComponent implements OnInit {
  currentDog: Dog | null = null;
  vaccinations: Vaccination[] = [];
  private subscription!: Subscription;

  constructor(
    private dogService: DogService
  ) {
  }

  ngOnInit() {
    this.subscription = this.dogService.activeDog$.subscribe(dog => {
      if (dog) {
        this.currentDog = dog;

        this.vaccinations = dog.vaccinations || [];
        console.log('Vaccinations mises à jour:', this.vaccinations);
      } else {
        this.vaccinations = [];
      }
    });
  }


  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
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

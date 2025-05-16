import {Component, OnInit} from '@angular/core';
import {Card} from 'primeng/card';
import {Button} from 'primeng/button';
import {Dog} from '../../models/dog';
import {differenceInMonths, differenceInYears} from 'date-fns';
import {Input} from '@angular/core';
import {Subscription} from 'rxjs';
import {DogService} from '../../service/dog.service';

@Component({
  selector: 'app-dog-summary',
  imports: [
    Card,
    Button
  ],
  templateUrl: './dog-summary.component.html',
  styleUrl: './dog-summary.component.scss'
})


export class DogSummaryComponent implements OnInit {
  @Input() dog: Dog | null = null;
  private subscription!: Subscription;

  constructor(private dogService: DogService) {
  }

  ngOnInit() {
    this.subscription = this.dogService.activeDog$.subscribe(dog => {
      this.dog = dog;
      console.log('Dog summary updated for dog:', dog?.name);
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }


  getDogAge(birthDate: string | Date | undefined): string | null {
    if (birthDate === undefined || birthDate === null) {
      return null;
    }
    const birth = new Date(birthDate);

    if (isNaN(birth.getTime())) {
      console.error('Invalid birth date provided to getDogAge:', birthDate);
      return null;
    }

    const now = new Date();
    const years = differenceInYears(now, birth);

    if (years < 1) {
      const months = differenceInMonths(now, birth);
      if (months <= 0) {
        return "Nouveau-né";
      }
      return `${months} mois`;
    } else {
      return `${years} an(s)`;
    }
  }

}

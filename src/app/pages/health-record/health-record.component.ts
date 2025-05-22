import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Dog} from '../../models/dog';
import {CommonModule} from '@angular/common';
import {ChartModule} from 'primeng/chart';
import {FormsModule} from '@angular/forms';
import {WeightChartComponent} from '../../components/weight-chart/weight-chart.component';
import {VaccinationTableComponent} from '../../components/vaccination-table/vaccination-table.component';
import {VeterinaryVisitsComponent} from '../../components/veterinary-visits/veterinary-visits.component';
import {DogService} from '../../service/dog.service';
import {Subscription} from 'rxjs';


@Component({
  selector: 'app-health-record',
  standalone: true,
  imports: [CommonModule, ChartModule, FormsModule, WeightChartComponent, VaccinationTableComponent, VeterinaryVisitsComponent
  ],
  templateUrl: './health-record.component.html',
  styleUrl: './health-record.component.scss'
})
export class HealthRecordComponent implements OnInit, OnDestroy{

  currentDog: Dog | null = null;
  private subscription!: Subscription;

  constructor(private dogService: DogService) {}

  ngOnInit() {
    // S'abonner aux changements du chien actif
    this.subscription = this.dogService.activeDog$.subscribe(dog => {
      this.currentDog = dog;
      console.log('Health record updated for dog:', dog?.name);
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

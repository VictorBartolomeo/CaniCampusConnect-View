import {Component, OnInit} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {UIChart} from "primeng/chart";
import {Dog} from '../../../models/dog';
import {Subscription} from 'rxjs';
import {DogService} from '../../../service/dog.service';

@Component({
  selector: 'app-weight-chart',
  imports: [
    ReactiveFormsModule,
    UIChart,
    FormsModule
  ],
  templateUrl: './weight-chart.component.html',
  styleUrl: './weight-chart.component.scss'
})
export class WeightChartComponent implements OnInit {
  selectedDog: Dog | null = null;
  weightChartData: any;
  weightChartOptions: any;
  private subscription!: Subscription;

  constructor(private dogService: DogService) {
  }

  ngOnInit() {
    this.subscription = this.dogService.activeDog$.subscribe(dog => {
      if (dog) {
        this.selectedDog = dog;
        this.createWeightChart();
        console.log('Données de poids mises à jour pour:', dog.name);
      } else {
        this.selectedDog = null;
        this.weightChartData = null;
      }
    });

    this.setupChartOptions();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  setupChartOptions() {
    this.weightChartOptions = {
      plugins: {
        legend: {
          labels: {
            color: "#1B2140"         }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#1B2140'
          },
          grid: {
            color: '#1B2140'
          }
        },
        y: {
          ticks: {
            color: '#1B2140'
          },
          grid: {
            color: '#1B2140'
          },
          title: {
            display: true,
            text: 'Poids (kg)'
          }
        }
      }
    };
  }


  createWeightChart() {
    if (!this.selectedDog || !this.selectedDog.dogWeights || this.selectedDog.dogWeights.length === 0) {
      console.error('Aucune donnée de poids disponible pour ce chien');
      return;
    }

    const sortedWeights = [...this.selectedDog.dogWeights].sort((a, b) => {
      return new Date(a.measurementDate).getTime() - new Date(b.measurementDate).getTime();
    });

    const labels = sortedWeights.map(record => {
      const date = new Date(record.measurementDate);
      return date.toLocaleDateString();
    });

    const weightValues = sortedWeights.map(record => record.weightValue);

    this.weightChartData = {
      labels: labels,
      datasets: [
        {
          label: `${this.selectedDog.name || 'votre chien'}`,
          data: weightValues,
          fill: false,
          borderColor: '#1B2140',
          tension: 0.4
        }
      ]
    };

    console.log('Chart data prepared:', this.weightChartData);
  }
}

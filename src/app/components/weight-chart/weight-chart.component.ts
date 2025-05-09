import {Component, inject, OnInit} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {UIChart} from "primeng/chart";
import {Dog} from '../../models/dog';
import {HttpClient} from '@angular/common/http';

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
export class WeightChartComponent implements OnInit{
  dogs: Dog[] = [];
  selectedDog?: Dog;
  weightChartData: any;
  weightChartOptions: any;

  http = inject(HttpClient);

  ngOnInit() {
    this.http.get<Dog[]>('http://localhost:8080/owner/3/dogs').subscribe({
      next: (dogs) => {
        this.dogs = dogs;
        console.log('Dogs received:', dogs);

        if (dogs.length > 0) {
          console.log('First dog dogWeights:', dogs[0].dogWeights);
          this.selectedDog = dogs[0];
          this.createWeightChart();
        }
      },
      error: (error) => {
        console.error('Error fetching dogs:', error);
      },
    });

    this.setupChartOptions();
  }

  setupChartOptions() {
    this.weightChartOptions = {
      plugins: {
        legend: {
          labels: {
            color: '#495057'
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#495057'
          },
          grid: {
            color: '#ebedef'
          }
        },
        y: {
          ticks: {
            color: '#495057'
          },
          grid: {
            color: '#ebedef'
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
          borderColor: '#42A5F5',
          tension: 0.4
        }
      ]
    };

    console.log('Chart data prepared:', this.weightChartData);
  }
}

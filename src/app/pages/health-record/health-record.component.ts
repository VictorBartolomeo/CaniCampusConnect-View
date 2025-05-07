import {Component, inject, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Dog} from '../../models/dog';
import {CommonModule} from '@angular/common';
import {ChartModule} from 'primeng/chart';
import {FormsModule} from '@angular/forms';
import {WeightChartComponent} from '../../components/weight-chart/weight-chart.component';


@Component({
  selector: 'app-health-record',
  standalone: true,
  imports: [CommonModule, ChartModule, FormsModule, WeightChartComponent
  ],
  templateUrl: './health-record.component.html',
  styleUrl: './health-record.component.scss'
})
export class HealthRecordComponent {


}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';
import { ProgressBarModule } from 'primeng/progressbar';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-business-intelligence',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ChartModule,
    TableModule,
    ButtonModule,
    TooltipModule,
    BadgeModule,
    ProgressBarModule,
    DividerModule
  ],
  templateUrl: './business-intelligence.component.html',
  styleUrl: './business-intelligence.component.scss'
})
export class BusinessIntelligenceComponent implements OnInit {
  // Charts data
  userGrowthData: any;
  coursePopularityData: any;
  revenueData: any;
  registrationTrendsData: any;

  // Statistics
  totalUsers: number = 0;
  totalCourses: number = 0;
  totalRegistrations: number = 0;
  totalRevenue: number = 0;

  // Loading state
  loading: boolean = true;

  // Chart options
  chartOptions: any = {
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
        }
      }
    },
    animation: {
      duration: 1000
    },
    responsive: true,
    maintainAspectRatio: false
  };

  constructor() {}

  ngOnInit() {
    this.loadStatistics();
    this.initCharts();
  }

  loadStatistics() {
    // In a real application, these would be loaded from an API
    // For now, we'll use mock data
    setTimeout(() => {
      this.totalUsers = 256;
      this.totalCourses = 48;
      this.totalRegistrations = 384;
      this.totalRevenue = 12500;
      this.loading = false;
    }, 1000);
  }

  initCharts() {
    // User growth chart (line chart)
    this.userGrowthData = {
      labels: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet'],
      datasets: [
        {
          label: 'Nouveaux utilisateurs',
          data: [28, 35, 42, 56, 63, 75, 89],
          fill: false,
          borderColor: '#42A5F5',
          tension: 0.4
        },
        {
          label: 'Utilisateurs actifs',
          data: [65, 72, 86, 95, 110, 132, 150],
          fill: false,
          borderColor: '#66BB6A',
          tension: 0.4
        }
      ]
    };

    // Course popularity (bar chart)
    this.coursePopularityData = {
      labels: ['Chiots', 'Obéissance', 'Agility', 'Comportement', 'Socialisation'],
      datasets: [
        {
          label: 'Inscriptions',
          data: [65, 59, 80, 45, 56],
          backgroundColor: '#42A5F5'
        }
      ]
    };

    // Revenue analytics (line chart)
    this.revenueData = {
      labels: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet'],
      datasets: [
        {
          label: 'Revenus (€)',
          data: [1200, 1500, 1800, 2100, 2400, 2700, 3000],
          fill: true,
          backgroundColor: 'rgba(102, 187, 106, 0.2)',
          borderColor: '#66BB6A',
          tension: 0.4
        }
      ]
    };

    // Registration trends (pie chart)
    this.registrationTrendsData = {
      labels: ['Chiots', 'Adultes', 'Seniors'],
      datasets: [
        {
          data: [45, 35, 20],
          backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726']
        }
      ]
    };
  }

  // Helper method to format currency
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
  }
}

import {ApplicationConfig, importProvidersFrom, LOCALE_ID, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {providePrimeNG} from 'primeng/config';
import Aura from '@primeng/themes/aura';

import {routes} from './app.routes';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {provideAnimations} from '@angular/platform-browser/animations';
import {CalendarModule, DateAdapter} from 'angular-calendar';
import {adapterFactory} from 'angular-calendar/date-adapters/date-fns';
import {jwtInterceptor} from './service/jwt.interceptor';
import {ConfirmationService, MessageService} from 'primeng/api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    {provide: LOCALE_ID, useValue: 'fr-FR'},
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.my-app-dark'}
      },
      translation: {
        dayNames: [
          "Dimanche",
          "Lundi",
          "Mardi",
          "Mercredi",
          "Jeudi",
          "Vendredi",
          "Samedi",
        ],
        dayNamesShort: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
        dayNamesMin: ["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"],
        monthNames: [
          "Janvier",
          "Février",
          "Mars",
          "Avril",
          "Mai",
          "Juin",
          "Juillet",
          "Août",
          "Septembre",
          "Octobre",
          "Novembre",
          "Décembre",
        ],
        monthNamesShort: [
          "Jan",
          "Fév",
          "Mar",
          "Avr",
          "Mai",
          "Jun",
          "Jul",
          "Aoû",
          "Sep",
          "Oct",
          "Nov",
          "Déc",
        ],
        today: "Aujourd'hui",
        clear: "Effacer",
        weekHeader: "Sem",
        firstDayOfWeek: 1, // Lundi = 1, Dimanche = 0
      }
    }),
    provideAnimations(),
    MessageService,
    ConfirmationService,
    importProvidersFrom(
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    })),
  ]
};

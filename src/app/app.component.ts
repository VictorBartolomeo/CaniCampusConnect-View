import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PrimeNG } from 'primeng/config';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import {NotificationService} from './service/notifications.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule],
  providers: [MessageService, NotificationService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'CaniCampusConnect';
  apiUrl = 'http://localhost:8080';

  private primeng = inject(PrimeNG);

  ngOnInit() {
    this.primeng.ripple.set(true);
    this.calculateViewportHeight();
    window.addEventListener('resize', this.calculateViewportHeight);
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.calculateViewportHeight);
  }

  private calculateViewportHeight = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }
}

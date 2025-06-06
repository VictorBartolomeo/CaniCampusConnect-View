import {Component, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {PrimeNG} from 'primeng/config';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'CaniCampusConnect';
  apiUrl = 'http://localhost:8080';


  constructor(private primeng: PrimeNG) {
  }

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


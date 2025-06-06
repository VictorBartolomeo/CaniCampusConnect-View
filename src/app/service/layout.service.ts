import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private navbarHeightSubject = new BehaviorSubject<number>(0);
  public navbarHeight$ = this.navbarHeightSubject.asObservable();

  private dashboardNavHeightSubject = new BehaviorSubject<number>(0);
  public dashboardNavHeight$ = this.dashboardNavHeightSubject.asObservable();

  constructor() {
    this.updateViewportHeight();
    window.addEventListener('resize', () => this.updateViewportHeight());
  }

  setNavbarHeight(height: number) {
    this.navbarHeightSubject.next(height);
    document.documentElement.style.setProperty('--navbar-height', `${height}px`);
    console.log('Navbar height set to:', height); // Debug
  }

  setDashboardNavHeight(height: number) {
    this.dashboardNavHeightSubject.next(height);
    document.documentElement.style.setProperty('--dashboard-navbar-height', `${height}px`);
    console.log('Dashboard navbar height set to:', height); // Debug
  }

  getAvailableHeight(navbarType: 'landing' | 'dashboard' = 'landing'): number {
    const viewportHeight = window.innerHeight;
    const navbarHeight = navbarType === 'landing'
      ? this.navbarHeightSubject.value
      : this.dashboardNavHeightSubject.value;
    return viewportHeight - navbarHeight;
  }

  private updateViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }
}

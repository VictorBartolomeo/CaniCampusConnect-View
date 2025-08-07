import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  // État d'authentification
  private connectedSubject = new BehaviorSubject<boolean>(false);
  public connected$ = this.connectedSubject.asObservable();

  // ID de l'utilisateur
  private userIdSubject = new BehaviorSubject<number | null>(null);
  public userId$ = this.userIdSubject.asObservable();

  // Rôle de l'utilisateur
  private roleSubject = new BehaviorSubject<string | null>(null);
  public role$ = this.roleSubject.asObservable();

  // Getters
  isConnected(): boolean {
    return this.connectedSubject.getValue();
  }

  getUserId(): number | null {
    return this.userIdSubject.getValue();
  }

  getRole(): string | null {
    return this.roleSubject.getValue();
  }

  // Setters
  setConnected(connected: boolean): void {
    this.connectedSubject.next(connected);
  }

  setUserId(userId: number | null): void {
    this.userIdSubject.next(userId);
  }

  setRole(role: string | null): void {
    this.roleSubject.next(role);
  }

  clearState(): void {
    this.connectedSubject.next(false);
    this.userIdSubject.next(null);
    this.roleSubject.next(null);
  }
}

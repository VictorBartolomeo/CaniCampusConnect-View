import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private messageService = inject(MessageService);

  showSuccess(summary: string, detail: string): void {
    this.messageService.add({
      severity: 'success',
      summary,
      detail,
      life: 3000,
      closable:true
    });
  }

  showError(summary: string, detail: string): void {
    this.messageService.add({
      severity: 'error',
      summary,
      detail,
      life: 5000,
      closable:true
    });
  }

  showWarning(summary: string, detail: string): void {
    this.messageService.add({
      severity: 'warn',
      summary,
      detail,
      life: 4000,
      closable:true
    });
  }

  showInfo(summary: string, detail: string): void {
    this.messageService.add({
      severity: 'info',
      summary,
      detail,
      life: 3000,
      closable:true
    });
  }
}

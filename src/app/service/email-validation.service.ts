
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface EmailValidationResponse {
  message?: string;
  error?: string;
  code: 'INVALID_TOKEN' | 'ACTIVATION_FAILED' | 'VALIDATION_SUCCESS' | 'INTERNAL_ERROR';
  tokenStatus?: 'VALID' | 'EXPIRED' | 'USED';
}

@Injectable({
  providedIn: 'root'
})
export class EmailValidationService {
  private apiUrl = 'http://localhost:8080';
  private http = inject(HttpClient);

  /**
   * Resend a validation email for an account
   * @param email The email to resend the validation email to
   * @returns Observable with the response
   */
  resendValidationEmail(email: string): Observable<any> {
    const url = `${this.apiUrl}/resend-validation-email?email=${encodeURIComponent(email)}`;

    return this.http.post(url, {}).pipe(
      map(response => {
        console.log('Resend validation email response:', response);
        return {
          success: true,
          message: (response as any).message || 'Email de validation renvoyé avec succès',
          code: (response as any).code || 'EMAIL_RESENT',
          ...response
        };
      }),
      catchError(error => {
        console.error('Error resending validation email:', error);

        // Extract error information from the response if available
        if (error.error) {
          // Throw error with the backend message so it can be caught properly
          return throwError(() => ({
            success: false,
            message: error.error.error || 'Une erreur est survenue lors de l\'envoi de l\'email de validation',
            code: error.error.code || 'INTERNAL_ERROR',
            status: error.status
          }));
        }

        return throwError(() => ({
          success: false,
          message: 'Une erreur est survenue lors de l\'envoi de l\'email de validation',
          code: 'INTERNAL_ERROR',
          status: error.status
        }));
      })
    );
  }

  /**
   * Validates an email using a token
   * @param token The validation token
   * @param email The email to validate
   * @returns Observable with the validation response
   */
  validateEmail(token: string, email: string): Observable<EmailValidationResponse> {
    const url = `${this.apiUrl}/validate-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

    return this.http.get<EmailValidationResponse>(url).pipe(
      map(response => {
        console.log('Email validation response:', response);

        // Determine token status based on response
        if (response.code === 'VALIDATION_SUCCESS') {
          response.tokenStatus = 'VALID';
        } else if (response.code === 'INVALID_TOKEN') {
          // Check error message to determine if token is expired or used
          if (response.error && response.error.toLowerCase().includes('expiré')) {
            response.tokenStatus = 'EXPIRED';
          } else if (response.error && response.error.toLowerCase().includes('déjà utilisé')) {
            response.tokenStatus = 'USED';
          } else {
            // Default to EXPIRED if we can't determine
            response.tokenStatus = 'EXPIRED';
          }
        }

        return response;
      }),
      catchError(error => {
        console.error('Error validating email:', error);

        // Extract the error response if available
        if (error.error && error.error.code) {
          const errorResponse = error.error as EmailValidationResponse;

          // Determine token status based on error response
          if (errorResponse.code === 'INVALID_TOKEN') {
            if (errorResponse.error && errorResponse.error.toLowerCase().includes('expiré')) {
              errorResponse.tokenStatus = 'EXPIRED';
            } else if (errorResponse.error && errorResponse.error.toLowerCase().includes('déjà utilisé')) {
              errorResponse.tokenStatus = 'USED';
            } else {
              // Default to EXPIRED if we can't determine
              errorResponse.tokenStatus = 'EXPIRED';
            }
          }

          return new Observable<EmailValidationResponse>(observer => {
            observer.next(errorResponse);
            observer.complete();
          });
        }

        // Default error response
        return new Observable<EmailValidationResponse>(observer => {
          observer.next({
            error: 'Une erreur est survenue lors de la validation de l\'email',
            code: 'INTERNAL_ERROR',
            tokenStatus: undefined
          });
          observer.complete();
        });
      })
    );
  }
}

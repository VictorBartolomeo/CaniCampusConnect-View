
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const jwt = authService.getToken();

  if (jwt) {
    const clone = req.clone({
      setHeaders: {
        Authorization: `Bearer ${jwt}`
      }
    });
    return next(clone);
  }
  return next(req);
};

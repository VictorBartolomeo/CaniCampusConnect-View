import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {AuthService} from '../auth.service';

export const loggedGuard: CanActivateFn = (route, state) => {

  const auth = inject(AuthService)
  const router: Router = inject(Router);

  if (auth.connected) {
    return true;
  }


  return router.parseUrl('/login')
};

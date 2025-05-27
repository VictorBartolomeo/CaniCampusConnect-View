import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import {AuthService} from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const authorizedRoles = route.data['authorizedRoles'] as Array<string>;
    const currentRole = this.authService.role;

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }

    if (currentRole && authorizedRoles && authorizedRoles.some(role => role === currentRole)) {
      return true;
    } else {
      this.router.navigate(['/unauthorized']);
      return false;
    }
  }
}

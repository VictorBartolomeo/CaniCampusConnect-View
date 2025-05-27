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
    const currentRole = this.authService.role; // Utilise le getter de AuthService

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']); // Redirige vers login si non authentifié
      return false;
    }

    if (currentRole && authorizedRoles && authorizedRoles.some(role => role === currentRole)) {
      return true;
    } else {
      // Rediriger vers une page "non autorisé" ou une page par défaut
      this.router.navigate(['/unauthorized']); // Créez cette page si elle n'existe pas
      return false;
    }
  }
}

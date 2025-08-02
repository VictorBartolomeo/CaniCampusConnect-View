import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { RoleGuard } from './role.guard';
import { AuthService } from '../auth.service';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated'], {
      role: 'ROLE_ADMIN'
    });
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        RoleGuard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    guard = TestBed.inject(RoleGuard);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access when user is authenticated and has authorized role', () => {
    authService.isAuthenticated.and.returnValue(true);
    Object.defineProperty(authService, 'role', { value: 'ROLE_ADMIN' });

    const route = { data: { authorizedRoles: ['ROLE_ADMIN'] } } as unknown as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    const result = guard.canActivate(route, state);

    expect(result).toBe(true);
  });

  it('should redirect to login when user is not authenticated', () => {
    authService.isAuthenticated.and.returnValue(false);

    const route = { data: { authorizedRoles: ['ROLE_ADMIN'] } } as unknown as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    const result = guard.canActivate(route, state);

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should redirect to unauthorized when user does not have required role', () => {
    authService.isAuthenticated.and.returnValue(true);
    Object.defineProperty(authService, 'role', { value: 'ROLE_USER' });

    const route = { data: { authorizedRoles: ['ROLE_ADMIN'] } } as unknown as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    const result = guard.canActivate(route, state);

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/unauthorized']);
  });
});
